import React from 'react';
import { Department } from '../types/pms';
import {
  Anchor,
  Search,
  Plus,
  FileSpreadsheet,
  Globe,
  Download,
  AlertCircle,
  ShieldCheck,
  Bell,
  FileText,
  QrCode,
  Scan,
  UserCheck,
  Shield,
  Building2,
  Database,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { UserProfile } from '../lib/rbac';

interface HeaderProps {
  currentDepartment: Department;
  onDepartmentChange: (dept: Department) => void;
  currentUserProfile?: UserProfile;
  onOpenUserProfileModal?: () => void;
  onOpenLoginModal?: () => void;
  isArabic: boolean;
  onToggleLanguage: () => void;
  onOpenNewRecord: () => void;
  onOpenExcelManager: () => void;
  onOpenSearch: () => void;
  onExportExcel: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onExportPdf: () => void;
  onOpenQrScanner?: () => void;
  onOpenSyncQueueModal?: () => void;
  isOnline: boolean;
  syncQueueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentDepartment,
  onDepartmentChange,
  currentUserProfile,
  onOpenUserProfileModal,
  onOpenLoginModal,
  isArabic,
  onToggleLanguage,
  onOpenNewRecord,
  onOpenExcelManager,
  onOpenSearch,
  onExportExcel,
  onOpenNotifications,
  unreadNotificationsCount,
  onExportPdf,
  onOpenQrScanner,
  onOpenSyncQueueModal,
  isOnline,
  syncQueueCount
}) => {
  const departments: Department[] = [
    'All',
    'Marine',
    'Technical & Maintenance',
    'HSE & Safety',
    'Diving Operations',
    'Pipelay Operations',
    'Catering & Accommodation',
    'Aviation & Helideck',
    'QA/QC',
    'Project Management'
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0d2137]/95 backdrop-blur-md border-b border-[#1a365d] px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-3">
        {/* Barge Identity & Branding */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff6600] to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <Anchor className="w-5 h-5" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0d2137]" title="Online & Operational" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base lg:text-lg tracking-tight text-white flex items-center gap-1.5">
                <span>PMS-11</span>
                <span className="text-white font-bold text-xs px-2 py-0.5 rounded bg-[#ff6600] border border-orange-400">
                  CLOSURE LOOP
                </span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                <ShieldCheck className="w-3 h-3" />
                {isArabic ? 'بوابة 1: نشطة' : 'GATE-1 ACTIVE'}
              </span>
              <button
                type="button"
                onClick={onOpenSyncQueueModal}
                className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border transition-all cursor-pointer ${
                  isOnline
                    ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                    : 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-800 animate-pulse'
                }`}
                title={isArabic ? 'عرض سجل وتفاصيل المزامنة دون اتصال' : 'View Offline Sync Queue & Retry'}
              >
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span>{isOnline ? (isArabic ? 'متصل (Online)' : 'Online') : (isArabic ? `غير متصل - مزامنة (${syncQueueCount})` : `Offline - Sync (${syncQueueCount})`)}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {isArabic
                ? 'مركز القيادة والتحكم لمنظومة الـ 40 شيت عمل وحزم العمل والسلامة البحرية'
                : 'Executive Command Center • 40 Worksheets Integration • Rev.03'}
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Quick Search trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-xs transition-all shadow-inner"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">{isArabic ? 'بحث شامل بالسجلات والشهادات...' : 'Search records, certs, rules...'}</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono">
              Ctrl+K
            </kbd>
          </button>

          {/* User Profile & Department Access Trigger (RBAC) */}
          {currentUserProfile && onOpenUserProfileModal && (
            <button
              onClick={onOpenLoginModal || onOpenUserProfileModal}
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950/90 border border-cyan-800 hover:border-cyan-500 text-xs text-slate-200 transition-all shadow-md group"
              title={isArabic ? 'تغيير الشخصية الوظيفية وصلاحيات الإدارات' : 'Change Persona & Department Scope'}
            >
              <div className={`w-6 h-6 rounded-lg ${currentUserProfile.avatarColor} text-white font-bold flex items-center justify-center text-[10px]`}>
                {currentUserProfile.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden lg:block">
                <div className="font-bold text-white text-[11px] leading-tight flex items-center gap-1">
                  <span>{isArabic ? currentUserProfile.nameArabic : currentUserProfile.name}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {currentUserProfile.role === 'Admin' ? 'Admin' : currentUserProfile.primaryDepartment}
                  </span>
                </div>
                <div className="text-[10px] text-cyan-400 font-medium">
                  {currentUserProfile.primaryDepartment === 'All'
                    ? (isArabic ? 'عرض شامل لكافة الإدارات' : 'Global Executive Access')
                    : (isArabic
                        ? `الإدارة: ${currentUserProfile.primaryDepartment} ${currentUserProfile.assistingDepartments?.length ? `(+${currentUserProfile.assistingDepartments.length} معاونة)` : ''}`
                        : `Dept: ${currentUserProfile.primaryDepartment} ${currentUserProfile.assistingDepartments?.length ? `(+${currentUserProfile.assistingDepartments.length})` : ''}`)}
                </div>
              </div>
              <UserCheck className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform ml-1" />
            </button>
          )}

          {/* Quick Department View Filter */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-[10px] text-slate-400 px-1 font-medium">
              {isArabic ? 'تصفية:' : 'Filter:'}
            </span>
            <select
              value={currentDepartment}
              onChange={e => onDepartmentChange(e.target.value as Department)}
              className="bg-slate-900 text-slate-200 text-xs rounded border-none px-2 py-0.5 focus:ring-1 focus:ring-cyan-500 font-medium"
            >
              {departments.map(d => (
                <option key={d} value={d}>
                  {d === 'All' ? (isArabic ? 'جميع الأقسام' : 'All Departments') : d}
                </option>
              ))}
            </select>
          </div>

          {/* Excel / 40-Sheets Importer */}
          <button
            onClick={onOpenExcelManager}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all shadow-sm"
            title="Import/Export 40 Sheets Excel / XLSM"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline">{isArabic ? 'إدارة الـ 40 شيت' : '40 Sheets Manager'}</span>
          </button>

          {/* PDF Export Button */}
          <button
            onClick={onExportPdf}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5"
            title="Export Professional PDF Report"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span className="hidden md:inline">{isArabic ? 'تصدير PDF' : 'PDF Report'}</span>
          </button>

          {/* QR Rig Tag Scanner Button */}
          {onOpenQrScanner && (
            <button
              onClick={onOpenQrScanner}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Scan Rig Tag / QR Code"
            >
              <Scan className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">{isArabic ? 'ماسح الـ QR' : 'Scan Tag'}</span>
            </button>
          )}

          {/* Offline Sync Queue Trigger */}
          {onOpenSyncQueueModal && (
            <button
              onClick={onOpenSyncQueueModal}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
              title={isArabic ? 'سجل عمليات المزامنة دون اتصال' : 'Offline Sync Queue'}
            >
              <Database className={`w-4 h-4 ${syncQueueCount > 0 ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`} />
              {syncQueueCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-500 text-slate-950 font-mono">
                  {syncQueueCount}
                </span>
              )}
            </button>
          )}

          {/* Notification Center Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all"
            title="Notification Center"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500 text-white animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Export Button */}
          <button
            onClick={onExportExcel}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all"
            title="Export full Excel workbook"
          >
            <Download className="w-4 h-4 text-cyan-400 sm:inline" />
            <span className="hidden sm:inline sm:mr-1">{isArabic ? 'تصدير' : 'Export'}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300 transition-all"
            title="Switch Language / تبديل اللغة"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isArabic ? 'English' : 'عربي'}</span>
          </button>

          {/* New Record Button */}
          <button
            onClick={onOpenNewRecord}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isArabic ? 'سجل جديد +' : '+ New Record'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
