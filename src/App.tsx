import React, { useState, useEffect, useMemo } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { Reminder, BaseRecord, Department, EntityType } from './types/pms';
import { FileSpreadsheet, Layers, ShieldAlert, Building2, UserCheck, Eye } from 'lucide-react';
import {
  getStoredRecords,
  getStoredAuditLogs,
  getStoredCatalog,
  upsertRecord,
  removeRecord,
  saveAllRecords,
  computeDashboardMetrics,
  resetSystemData,
  checkAndArchiveRecords
} from './lib/storage';
import { exportWorkbook } from './lib/excelParser';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { UserProfileModal } from './components/modals/UserProfileModal';
import { SyncQueueModal } from './components/modals/SyncQueueModal';
import { getStoredUserProfile, saveUserProfile, filterRecordsForUser, UserProfile } from './lib/rbac';
import { SyncQueueItem, getStoredSyncQueue, addSyncQueueItem, clearSyncQueue } from './lib/syncQueue';
import { DashboardView } from './components/views/DashboardView';
import { WpsView } from './components/views/WpsView';
import { CrewHubView } from './components/views/CrewHubView';
import { AviationHelideckView } from './components/views/AviationHelideckView';
import { AccommodationPobView } from './components/views/AccommodationPobView';
import { ExecutionDependenciesView } from './components/views/ExecutionDependenciesView';
import { RulesGatesView } from './components/views/RulesGatesView';
import { FindingsCapaView } from './components/views/FindingsCapaView';
import { EvidenceVaultView } from './components/views/EvidenceVaultView';
import { StatutorySourcesView } from './components/views/StatutorySourcesView';
import { WorkbookManagerView } from './components/views/WorkbookManagerView';
import { SheetBrowserView } from './components/views/SheetBrowserView';
import { AuditTrailView } from './components/views/AuditTrailView';
import { RecordDetailModal } from './components/modals/RecordDetailModal';
import { RiskMatrixView } from './components/views/RiskMatrixView';
import { GanttTimelineView } from './components/views/GanttTimelineView';
import { SmartReportsView } from './components/views/SmartReportsView';
import { DependencyGraphView } from './components/views/DependencyGraphView';
import { AdminConsoleView } from './components/views/AdminConsoleView';
import { ComplexityMatrixView } from './components/views/ComplexityMatrixView';
import { CalendarView } from './components/views/CalendarView';
import { DeckPlanView } from './components/views/DeckPlanView';
import { CommunicationHubView } from './components/views/CommunicationHubView';
import { OrchestrationView } from './components/views/OrchestrationView';
import { DocumentRepositoryView } from './components/views/DocumentRepositoryView';
import { WpsMindmapView } from './components/views/WpsMindmapView';
import { OperationalTracksView } from './components/views/OperationalTracksView';
import { getStoredMessages, saveMessages } from './lib/orchestratorEngine';
import { ChatMessage } from './types/pms';
import { NewRecordModal } from './components/modals/NewRecordModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { LoginModal } from './components/modals/LoginModal';
import { QRCodeModal } from './components/modals/QRCodeModal';
import { QRScannerModal } from './components/modals/QRScannerModal';
import { MessageSquare } from 'lucide-react';
import { generateMonthlyReport, generateAuditLogsReport } from './lib/pdfGenerator';

export default function App() {
  const [records, setRecords] = useState<BaseRecord[]>(getStoredRecords);
  const [auditLogs, setAuditLogs] = useState(getStoredAuditLogs);
  const [catalog] = useState(getStoredCatalog);
  const [messages, setMessages] = useState<ChatMessage[]>(getStoredMessages);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedSheetForBrowser, setSelectedSheetForBrowser] = useState<string>('WPS');
  const [sheetSubTab, setSheetSubTab] = useState<'browser' | 'manager'>('browser');
  const [activeDepartment, setActiveDepartment] = useState<Department>('All');
  const [isArabic, setIsArabic] = useState<boolean>(true);

  // Modals state
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [newRecordDefaultEntity, setNewRecordDefaultEntity] = useState<EntityType>('task');
  const [newRecordDefaultWps, setNewRecordDefaultWps] = useState<string | undefined>(undefined);
  const [editingRecord, setEditingRecord] = useState<BaseRecord | undefined>(undefined);

  const [selectedRecord, setSelectedRecord] = useState<BaseRecord | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [qrModalRecord, setQrModalRecord] = useState<BaseRecord | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);

  // Check URL query parameters for direct QR deep linking (?recordId=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recId = params.get('recordId');
    if (recId) {
      const found = records.find(r => r.rid.toUpperCase() === recId.toUpperCase() || r.id === recId);
      if (found) {
        setSelectedRecord(found);
      }
    }
  }, [records]);

  // Message Handlers
  const handleSendMessage = (msgData: Omit<ChatMessage, 'id' | 'timestamp' | 'is_read'>) => {
    const newMsg: ChatMessage = {
      ...msgData,
      id: `MSG-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
      is_read: false
    };
    const updated = [newMsg, ...messages];
    setMessages(updated);
    saveMessages(updated);
  };

  const handleMarkMessageRead = (id: string) => {
    const updated = messages.map(m => m.id === id ? { ...m, is_read: true } : m);
    setMessages(updated);
    saveMessages(updated);
  };

  // Sync RTL / LTR
  useEffect(() => {
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = isArabic ? 'ar' : 'en';
  }, [isArabic]);

  // Global key listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Run auto-archiving on mount
  useEffect(() => {
      setRecords(checkAndArchiveRecords(records));
  }, []);

  // Compute live executive metrics
  const metrics = computeDashboardMetrics(records);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const unreadNotificationsCount = records.filter(r => {
    if (r.entity === 'crew_certificate' && r.expiry_date) {
      const exp = new Date(r.expiry_date);
      if (exp < now || exp <= in30Days) return true;
    }
    if (r.due_date && r.status !== 'Closed' && r.status !== 'Compliant' && r.status !== 'Approved') {
      if (new Date(r.due_date) < now) return true;
    }
    if ((r.entity === 'gap' || r.entity === 'risk') && r.status !== 'Closed' && (r.data?.severity === 'Critical' || r.data?.severity === 'High')) {
      return true;
    }
    return false;
  }).length;

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(getStoredSyncQueue);
  const [isSyncQueueOpen, setIsSyncQueueOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (syncQueue.length > 0) {
        toast.info(
          isArabic
            ? `استعادة الاتصال بالإنترنت! توجد ${syncQueue.length} عملية بانتظار المزامنة`
            : `Internet connection restored! ${syncQueue.length} pending operations in queue`
        );
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning(isArabic ? 'انقطع الاتصال بالإنترنت - يتم حفظ التغييرات محلياً للمزامنة لاحقاً' : 'Connection lost - changes saved locally for later sync');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isArabic, syncQueue.length]);

  const addToSyncQueue = (
    rec: BaseRecord,
    action: SyncQueueItem['action'] = 'UPDATE'
  ) => {
    const updated = addSyncQueueItem({
      recordId: rec.id,
      recordRid: rec.rid,
      action,
      entity: rec.entity,
      title: rec.title,
      department: rec.department
    });
    setSyncQueue(updated);
  };

  const handleExportPdf = () => {
    generateMonthlyReport(catalog, records, isArabic);
    toast.success(isArabic ? 'تم تصدير تقرير PDF بنجاح' : 'PDF Report exported successfully');
  };

  // User Profile & RBAC Department Access Control State
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>(getStoredUserProfile);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const handleSelectUserProfile = (profile: UserProfile) => {
    setCurrentUserProfile(profile);
    saveUserProfile(profile);
    if (profile.primaryDepartment !== 'All') {
      setActiveDepartment(profile.primaryDepartment);
    } else {
      setActiveDepartment('All');
    }
    toast.info(
      isArabic
        ? `تم الدخول بنجاح كـ: ${profile.nameArabic} (${profile.primaryDepartment === 'All' ? 'جميع الإدارات' : profile.primaryDepartment})`
        : `Logged in as: ${profile.name} (${profile.primaryDepartment})`
    );
  };

  // Filter records dynamically based on active user profile & assisting departments & header filter
  const visibleRecords = useMemo(() => {
    return filterRecordsForUser(records, currentUserProfile, activeDepartment);
  }, [records, currentUserProfile, activeDepartment]);

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: 'Admin' | 'Supervisor' | 'Viewer'; department: string; lastActive: string }>({
    id: currentUserProfile.id,
    name: currentUserProfile.name,
    email: `${currentUserProfile.id}@pms11.offshore`,
    role: currentUserProfile.role === 'Admin' ? 'Admin' : 'Supervisor',
    department: currentUserProfile.primaryDepartment,
    lastActive: 'Just now'
  });

  // Handlers
  const handleSaveRecord = (record: BaseRecord, secondRecord?: BaseRecord) => {
    let updated = upsertRecord(record, currentUser.name);
    if (secondRecord) {
      updated = upsertRecord(secondRecord, currentUser.name);
    }
    setRecords(updated);
    setAuditLogs(getStoredAuditLogs());
    if (!navigator.onLine) {
      addToSyncQueue(record, 'CREATE');
      if (secondRecord) addToSyncQueue(secondRecord, 'CREATE');
      toast.info(isArabic ? 'تم الحفظ محلياً (غير متصل - تم إضافته لطابور المزامنة)' : 'Saved locally (Offline - queued for sync)');
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (currentUser.role !== 'Admin') {
      toast.error(isArabic ? 'عذراً، صلاحيات الحذف وإزالة السجلات مقتصرة على المدير (Admin)' : 'Access denied: Deleting records is restricted to Admin role');
      return;
    }
    const target = records.find(r => r.id === id);
    const updated = removeRecord(id, currentUser.name);
    setRecords(updated);
    setAuditLogs(getStoredAuditLogs());
    setSelectedRecord(null);
    if (!navigator.onLine && target) {
      addToSyncQueue(target, 'DELETE');
      toast.info(isArabic ? 'تم الحذف محلياً (غير متصل - مضاف لطابور المزامنة)' : 'Deleted locally (Offline - added to sync queue)');
    }
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    const target = records.find(r => r.id === id);
    if (!target) return;
    const updatedRecord: BaseRecord = { ...target, status: newStatus };
    const updatedList = upsertRecord(updatedRecord, 'Superintendent');
    setRecords(updatedList);
    setAuditLogs(getStoredAuditLogs());
    if (selectedRecord?.id === id) {
      setSelectedRecord(updatedRecord);
    }
    if (!navigator.onLine) {
      addToSyncQueue(updatedRecord, 'STATUS_CHANGE');
    }
  };

  const handleImportRecords = (newRecords: BaseRecord[]) => {
    const merged = [...records];
    newRecords.forEach(nr => {
      const idx = merged.findIndex(r => r.rid === nr.rid);
      if (idx >= 0) {
        merged[idx] = { ...merged[idx], ...nr, updated_at: new Date().toISOString() };
      } else {
        merged.unshift(nr);
      }
    });

    saveAllRecords(merged);
    setRecords(merged);
    setAuditLogs(getStoredAuditLogs());
  };

  const handleResetData = () => {
    if (confirm(isArabic ? 'هل تريد استعادة البيانات الافتراضية لمنظومة الـ 40 شيت بالكامل؟' : 'Reset system to default 40-sheets seed dataset?')) {
      resetSystemData();
      setRecords(getStoredRecords());
      setAuditLogs(getStoredAuditLogs());
    }
  };

  const openNewRecordModal = (entity: EntityType = 'task', wpsId?: string) => {
    setEditingRecord(undefined);
    setNewRecordDefaultEntity(entity);
    setNewRecordDefaultWps(wpsId);
    setIsNewRecordOpen(true);
  };

  const openEditRecordModal = (record: BaseRecord) => {
    setEditingRecord(record);
    setSelectedRecord(null);
    setIsNewRecordOpen(true);
  };

  const availableRoles = records.filter(r => r.entity === 'crew_role');
  const availableWps = records.filter(r => r.entity === 'wps');

  const navigateToSheet = (sheetName: string) => {
    setSelectedSheetForBrowser(sheetName);
    setActiveTab('sheets');
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800 flex flex-col font-sans">
      <ToastContainer position="bottom-right" theme="dark" />
      {/* Header */}
      <Header
        currentDepartment={activeDepartment}
        onDepartmentChange={setActiveDepartment}
        currentUserProfile={currentUserProfile}
        onOpenUserProfileModal={() => setIsUserProfileModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        isArabic={isArabic}
        onToggleLanguage={() => setIsArabic(prev => !prev)}
        onOpenNewRecord={() => openNewRecordModal('task')}
        onOpenExcelManager={() => setActiveTab('sheets')}
        onOpenSearch={() => setIsSearchOpen(true)}
        onExportExcel={() => exportWorkbook(records)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        onExportPdf={handleExportPdf}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        onOpenSyncQueueModal={() => setIsSyncQueueOpen(true)}
        isOnline={isOnline}
        syncQueueCount={syncQueue.length}
      />

      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'execution') setSelectedSheetForBrowser('Execution');
            else if (tab === 'functional') setSelectedSheetForBrowser('Functional');
            else if (tab === 'supplemental') setSelectedSheetForBrowser('Supplemental_Controls');
            else if (tab === 'activities') setSelectedSheetForBrowser('Activities');
            else if (tab === 'tasks') setSelectedSheetForBrowser('Tasks');
            else if (tab === 'deliverables') setSelectedSheetForBrowser('Deliverables');
            else if (tab === 'acceptance') setSelectedSheetForBrowser('Acceptance');
            else if (tab === 'risks') setSelectedSheetForBrowser('Risks');
            else if (tab === 'responsibilities') setSelectedSheetForBrowser('Responsibilities');
          }}
          isArabic={isArabic}
          counts={{
            openGaps: metrics.openGapsCount,
            crewAlerts: metrics.crewCertificatesExpiring30Days + metrics.crewCertificatesExpired,
            pendingChecks: metrics.helideckTotalChecks - metrics.helideckCompliantChecks
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto space-y-4">
          {/* Active Department Scope Notification Banner */}
          {currentUserProfile.primaryDepartment !== 'All' && (
            <div className="bg-gradient-to-r from-slate-900 via-cyan-950/80 to-slate-900 border border-cyan-800/80 rounded-xl p-3 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-900/60 text-cyan-300 border border-cyan-700/80">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>
                      {isArabic
                        ? `العرض المقيد حسب الإدارة: ${currentUserProfile.primaryDepartment}`
                        : `Department Restricted View: ${currentUserProfile.primaryDepartment}`}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                      {isArabic ? currentUserProfile.nameArabic : currentUserProfile.name}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    {isArabic
                      ? `يتم عرض المهام والأنشطة الخاصة بـ (${currentUserProfile.primaryDepartment}) ${
                          currentUserProfile.assistingDepartments?.length
                            ? `بالإضافة للإدارات المعاونة: [${currentUserProfile.assistingDepartments.join(' ، ')}]`
                            : ''
                        }`
                      : `Filtering items for ${currentUserProfile.primaryDepartment} ${
                          currentUserProfile.assistingDepartments?.length
                            ? `+ Assisting: [${currentUserProfile.assistingDepartments.join(', ')}]`
                            : ''
                        }`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono text-[11px] bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                  <span className="text-slate-400">{isArabic ? 'السجلات المعروضة:' : 'Visible:'} </span>
                  <span className="text-cyan-400 font-bold">{visibleRecords.length}</span>
                  <span className="text-slate-500"> / {records.length}</span>
                </div>
                <button
                  onClick={() => setIsUserProfileModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow"
                >
                  {isArabic ? 'تغيير الإدارة / الصلاحيات' : 'Change Scope'}
                </button>
              </div>
            </div>
          )}
          {activeTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              records={visibleRecords}
              auditLogs={auditLogs}
              catalog={catalog}
              isArabic={isArabic}
              isOnline={isOnline}
              syncQueueCount={syncQueue.length}
              onNavigate={setActiveTab}
              onOpenNewRecord={() => openNewRecordModal('task')}
              onOpenExcelManager={() => setActiveTab('sheets')}
              onSaveRecord={handleSaveRecord}
            />
          )}

          {activeTab === 'operational_tracks' && (
            <OperationalTracksView
              records={visibleRecords}
              isArabic={isArabic}
              activeDepartment={activeDepartment}
              catalog={catalog}
              onOpenNewRecord={(entity, wps) => openNewRecordModal(entity, wps)}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'sheets' && (
            <div className="space-y-4">
              {/* Dual Subtab Switcher: Browser vs Workbook Manager */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
                <button
                  onClick={() => setSheetSubTab('browser')}
                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    sheetSubTab === 'browser'
                      ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                  <span>{isArabic ? 'متصفح السجلات والبحث (40 شيت عمل)' : '40-Sheets Record Browser'}</span>
                </button>

                <button
                  onClick={() => setSheetSubTab('manager')}
                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    sheetSubTab === 'manager'
                      ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>{isArabic ? 'كتالوج ومستورد الإكسيل الشامل (Excel Importer & Catalog)' : 'Excel Importer & 40-Sheet Catalog'}</span>
                </button>
              </div>

              {sheetSubTab === 'browser' ? (
                <SheetBrowserView
                  key={selectedSheetForBrowser}
                  catalog={catalog}
                  records={records}
                  isArabic={isArabic}
                  selectedSheetName={selectedSheetForBrowser}
                  onOpenNewRecord={(entity, wps) => openNewRecordModal(entity, wps)}
                  onSelectRecord={setSelectedRecord}
                />
              ) : (
                <WorkbookManagerView
                  catalog={catalog}
                  records={records}
                  isArabic={isArabic}
                  onImportRecords={handleImportRecords}
                  onResetData={handleResetData}
                  onSelectSheet={(sheet) => {
                    setSelectedSheetForBrowser(sheet);
                    setSheetSubTab('browser');
                  }}
                />
              )}
            </div>
          )}

          {activeTab === 'wps' && (
            <WpsView
              records={visibleRecords}
              isArabic={isArabic}
              activeDepartment={activeDepartment}
              onOpenNewRecord={(entity, wps) => openNewRecordModal(entity, wps)}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'crew' && (
            <CrewHubView
              records={visibleRecords}
              isArabic={isArabic}
              onOpenNewRecord={entity => openNewRecordModal(entity || 'crew_member', 'WPS-23')}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'helideck' && (
            <AviationHelideckView
              records={visibleRecords}
              isArabic={isArabic}
              onOpenNewRecord={entity => openNewRecordModal(entity || 'helideck_check', 'WPS-19')}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'accommodation' && (
            <AccommodationPobView
              records={visibleRecords}
              isArabic={isArabic}
              onOpenNewRecord={entity => openNewRecordModal(entity || 'accommodation_check', 'WPS-15')}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'execution' && (
            <SheetBrowserView
              key="Execution"
              catalog={catalog}
              records={records}
              isArabic={isArabic}
              selectedSheetName="Execution"
              onOpenNewRecord={(entity, wps) => openNewRecordModal(entity || 'execution', wps)}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'functional' && (
            <SheetBrowserView
              key="Functional"
              catalog={catalog}
              records={records}
              isArabic={isArabic}
              selectedSheetName="Functional"
              onOpenNewRecord={(entity, wps) => openNewRecordModal(entity || 'functional', wps)}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'dependencies' && (
            <ExecutionDependenciesView
              records={visibleRecords}
              isArabic={isArabic}
              onOpenNewRecord={entity => openNewRecordModal('dependency')}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'supplemental' && (
            <SheetBrowserView
              key="Supplemental_Controls"
              catalog={catalog}
              records={records}
              isArabic={isArabic}
              selectedSheetName="Supplemental_Controls"
              onOpenNewRecord={(entity, wps) => openNewRecordModal(entity || 'supplemental_control', wps)}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'rules' && (
            <RulesGatesView
              records={visibleRecords}
              isArabic={isArabic}
              onOpenNewRecord={entity => openNewRecordModal(entity || 'rule')}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'activities' && (
            <SheetBrowserView
              key="Activities"
              catalog={catalog}
              records={records}
              isArabic={isArabic}
              selectedSheetName="Activities"
              onOpenNewRecord={(entity, wps) => openNewRecordModal(entity || 'activity', wps)}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'tasks' && (
            <SheetBrowserView
              key="Tasks"
              catalog={catalog}
              records={records}
              isArabic={isArabic}
              selectedSheetName="Tasks"
              onOpenNewRecord={(entity, wps) => openNewRecordModal(entity || 'task', wps)}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'deliverables' && (
            <SheetBrowserView
              key="Deliverables"
              catalog={catalog}
              records={records}
              isArabic={isArabic}
              selectedSheetName="Deliverables"
              onOpenNewRecord={(entity, wps) => openNewRecordModal(entity || 'deliverable', wps)}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'acceptance' && (
            <SheetBrowserView
              key="Acceptance"
              catalog={catalog}
              records={records}
              isArabic={isArabic}
              selectedSheetName="Acceptance"
              onOpenNewRecord={(entity, wps) => openNewRecordModal(entity || 'acceptance', wps)}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'gates' && (
            <RulesGatesView
              records={visibleRecords}
              isArabic={isArabic}
              onOpenNewRecord={entity => openNewRecordModal('gate')}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'gaps' && (
            <FindingsCapaView
              records={visibleRecords}
              isArabic={isArabic}
              onOpenNewRecord={entity => openNewRecordModal('gap')}
              onSelectRecord={setSelectedRecord}
              onUpdateStatus={handleStatusChange}
            />
          )}

          {activeTab === 'evidence' && (
            <EvidenceVaultView
              records={visibleRecords}
              isArabic={isArabic}
              onOpenNewRecord={entity => openNewRecordModal('evidence')}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'risks' && (
            <SheetBrowserView
              key="Risks"
              catalog={catalog}
              records={records}
              isArabic={isArabic}
              selectedSheetName="Risks"
              onOpenNewRecord={(entity, wps) => openNewRecordModal(entity || 'risk', wps)}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'risk_matrix' && (
            <RiskMatrixView
              records={records}
              isArabic={isArabic}
              onUpdateRisk={(id, data) => handleSaveRecord({ id, data } as BaseRecord)}
            />
          )}

          {activeTab === 'gantt' && (
            <GanttTimelineView
              records={records}
              isArabic={isArabic}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'smart_reports' && (
            <SmartReportsView
              records={records}
              isArabic={isArabic}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'dependency_graph' && (
            <DependencyGraphView
              records={records}
              isArabic={isArabic}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'wps_complexity' && (
            <ComplexityMatrixView
              records={records}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              records={records}
              isArabic={isArabic}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'deck_plan' && (
            <DeckPlanView
              records={records}
              isArabic={isArabic}
              onSelectRecord={setSelectedRecord}
              onShowQrModal={(rec) => setQrModalRecord(rec)}
              onUpdateRecord={handleSaveRecord}
            />
          )}

          {activeTab === 'wps_mindmap' && (
            <WpsMindmapView
              records={records}
              isArabic={isArabic}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'orchestration' && (
            <OrchestrationView
              records={records}
              currentUser={currentUser}
              isArabic={isArabic}
              onSelectRecord={setSelectedRecord}
              onSaveRecord={handleSaveRecord}
              onUpdateRecordStatus={handleStatusChange}
            />
          )}

          {activeTab === 'communication_hub' && (
            <CommunicationHubView
              records={records}
              messages={messages}
              onSendMessage={handleSendMessage}
              onMarkRead={handleMarkMessageRead}
              onSelectRecord={setSelectedRecord}
              currentUser={{
                name: currentUser.name,
                role: currentUser.role,
                department: (currentUser.department || 'Marine') as Department
              }}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'document_repository' && (
            <DocumentRepositoryView
              isArabic={isArabic}
              currentUser={{
                name: currentUser.name,
                role: currentUser.role,
                department: currentUser.department
              }}
              onNavigateToOrchestrator={() => {
                setActiveTab('orchestration');
              }}
            />
          )}

          {activeTab === 'admin_console' && (
            <AdminConsoleView
              currentUser={currentUser}
              onSwitchUser={setCurrentUser}
              records={records}
              auditLogs={auditLogs}
              isArabic={isArabic}
              onResetSystemData={handleResetData}
            />
          )}

          {activeTab === 'responsibilities' && (
            <SheetBrowserView
              key="Responsibilities"
              catalog={catalog}
              records={records}
              isArabic={isArabic}
              selectedSheetName="Responsibilities"
              onOpenNewRecord={(entity, wps) => openNewRecordModal(entity || 'responsibility', wps)}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'sources' && (
            <StatutorySourcesView
              records={visibleRecords}
              isArabic={isArabic}
              onOpenNewRecord={entity => openNewRecordModal('source')}
              onSelectRecord={setSelectedRecord}
            />
          )}

          {activeTab === 'audit' && (
            <AuditTrailView
              logs={auditLogs}
              isArabic={isArabic}
            />
          )}
        </main>
      </div>

      {/* Record Detail Modal */}
      <RecordDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onEdit={openEditRecordModal}
        onDelete={handleDeleteRecord}
        onStatusChange={handleStatusChange}
        onShowQrModal={(rec) => setQrModalRecord(rec)}
        isArabic={isArabic}
      />

      {/* QR Code Asset Tag Badge Modal */}
      <QRCodeModal
        record={qrModalRecord}
        onClose={() => setQrModalRecord(null)}
        isArabic={isArabic}
      />

      {/* QR Scanner / Tag Lookup Modal */}
      <QRScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        records={records}
        onSelectRecord={setSelectedRecord}
        isArabic={isArabic}
      />

      {/* New / Edit Record Modal */}
      <NewRecordModal
        isOpen={isNewRecordOpen}
        onClose={() => {
          setIsNewRecordOpen(false);
          setEditingRecord(undefined);
        }}
        defaultEntity={newRecordDefaultEntity}
        defaultWps={newRecordDefaultWps}
        initialRecord={editingRecord}
        availableRoles={availableRoles}
        availableWps={availableWps}
        allRecords={records}
        onSave={handleSaveRecord}
        isArabic={isArabic}
      />

      {/* Global Search Ctrl+K Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        records={records}
        onSelectRecord={setSelectedRecord}
        isArabic={isArabic}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        records={records}
        isArabic={isArabic}
        onSelectRecord={setSelectedRecord}
      />

      {/* User Profile & Department Access Control (RBAC) Modal */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        currentUser={currentUserProfile}
        onSelectUser={handleSelectUserProfile}
        isArabic={isArabic}
      />

      {/* Login & Department Access Selection Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUserProfile}
        onLogin={handleSelectUserProfile}
        isArabic={isArabic}
      />

      {/* Offline Sync Operations Queue Modal */}
      <SyncQueueModal
        isOpen={isSyncQueueOpen}
        onClose={() => setIsSyncQueueOpen(false)}
        syncQueue={syncQueue}
        onUpdateQueue={setSyncQueue}
        isOnline={isOnline}
        isArabic={isArabic}
      />

      {/* Floating Orange Assistant Button matching reference image_7e8f4996.png */}
      <button
        onClick={() => setActiveTab('communication_hub')}
        className="fixed bottom-6 left-6 z-40 bg-[#ff6600] hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 border border-orange-400"
        title={isArabic ? 'مساعد الخدمات والاتصالات' : 'Services Assistant & Comms Hub'}
      >
        <MessageSquare className="w-5 h-5 text-white" />
        <span className="text-sm font-bold">{isArabic ? 'مساعد الخدمات' : 'Services Assistant'}</span>
      </button>
    </div>
  );
}
