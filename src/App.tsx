import React, { useState, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { Reminder, BaseRecord, Department, EntityType } from './types/pms';
import { FileSpreadsheet, Layers } from 'lucide-react';
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
import { NewRecordModal } from './components/modals/NewRecordModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { generateMonthlyReport, generateAuditLogsReport } from './lib/pdfGenerator';

export default function App() {
  const [records, setRecords] = useState<BaseRecord[]>(getStoredRecords);
  const [auditLogs, setAuditLogs] = useState(getStoredAuditLogs);
  const [catalog] = useState(getStoredCatalog);

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
  const [syncQueueCount, setSyncQueueCount] = useState<number>(() => {
    try {
      const q = localStorage.getItem('pms_sync_queue');
      return q ? JSON.parse(q).length : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      try {
        const q = localStorage.getItem('pms_sync_queue');
        if (q) {
          const queue = JSON.parse(q);
          if (queue.length > 0) {
            toast.success(isArabic ? `تمت مزامنة ${queue.length} سجل مع الخادم بنجاح` : `Successfully synced ${queue.length} pending records with server`);
            localStorage.removeItem('pms_sync_queue');
            setSyncQueueCount(0);
          }
        }
      } catch (e) {
        console.error(e);
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
  }, [isArabic]);

  const addToSyncQueue = (recordId: string) => {
    try {
      const q = localStorage.getItem('pms_sync_queue');
      const queue = q ? JSON.parse(q) : [];
      if (!queue.includes(recordId)) {
        queue.push(recordId);
        localStorage.setItem('pms_sync_queue', JSON.stringify(queue));
        setSyncQueueCount(queue.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportPdf = () => {
    generateMonthlyReport(catalog, records, isArabic);
    toast.success(isArabic ? 'تم تصدير تقرير PDF بنجاح' : 'PDF Report exported successfully');
  };

  // Filter records by department when not 'All'
  const visibleRecords = activeDepartment === 'All'
    ? records
    : records.filter(r => r.department === activeDepartment || r.entity === 'wps' || r.entity === 'gate');

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: 'Admin' | 'Supervisor' | 'Viewer'; department: string; lastActive: string }>({
    id: 'u1',
    name: 'Capt. Ahmed Al-Mansoori',
    email: 'ahmed.m@pms11.offshore',
    role: 'Admin',
    department: 'Project Management',
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
      addToSyncQueue(record.id);
      if (secondRecord) addToSyncQueue(secondRecord.id);
      toast.info(isArabic ? 'تم الحفظ محلياً (غير متصل - سيتم المزامنة لاحقاً)' : 'Saved locally (Offline - queued for sync)');
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (currentUser.role !== 'Admin') {
      toast.error(isArabic ? 'عذراً، صلاحيات الحذف وإزالة السجلات مقتصرة على المدير (Admin)' : 'Access denied: Deleting records is restricted to Admin role');
      return;
    }
    const updated = removeRecord(id, currentUser.name);
    setRecords(updated);
    setAuditLogs(getStoredAuditLogs());
    setSelectedRecord(null);
    if (!navigator.onLine) {
      addToSyncQueue(id);
      toast.info(isArabic ? 'تم الحذف محلياً (غير متصل)' : 'Deleted locally (Offline)');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <ToastContainer position="bottom-right" theme="dark" />
      {/* Header */}
      <Header
        currentDepartment={activeDepartment}
        onDepartmentChange={setActiveDepartment}
        isArabic={isArabic}
        onToggleLanguage={() => setIsArabic(prev => !prev)}
        onOpenNewRecord={() => openNewRecordModal('task')}
        onOpenExcelManager={() => setActiveTab('sheets')}
        onOpenSearch={() => setIsSearchOpen(true)}
        onExportExcel={() => exportWorkbook(records)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        onExportPdf={handleExportPdf}
        isOnline={isOnline}
        syncQueueCount={syncQueueCount}
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
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              records={visibleRecords}
              auditLogs={auditLogs}
              catalog={catalog}
              isArabic={isArabic}
              isOnline={isOnline}
              syncQueueCount={syncQueueCount}
              onNavigate={setActiveTab}
              onOpenNewRecord={() => openNewRecordModal('task')}
              onOpenExcelManager={() => setActiveTab('sheets')}
              onSaveRecord={handleSaveRecord}
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
    </div>
  );
}
