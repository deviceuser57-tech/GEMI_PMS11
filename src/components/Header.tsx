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
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  currentDepartment: Department;
  onDepartmentChange: (dept: Department) => void;
  isArabic: boolean;
  onToggleLanguage: () => void;
  onOpenNewRecord: () => void;
  onOpenExcelManager: () => void;
  onOpenSearch: () => void;
  onExportExcel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDepartment,
  onDepartmentChange,
  isArabic,
  onToggleLanguage,
  onOpenNewRecord,
  onOpenExcelManager,
  onOpenSearch,
  onExportExcel
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
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-3">
        {/* Barge Identity & Branding */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Anchor className="w-5 h-5" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" title="Online & Operational" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base lg:text-lg tracking-tight text-white flex items-center gap-1.5">
                <span>PMS-11</span>
                <span className="text-cyan-400 font-semibold text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
                  CLOSURE LOOP
                </span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                <ShieldCheck className="w-3 h-3" />
                {isArabic ? 'بوابة 1: نشطة' : 'GATE-1 ACTIVE'}
              </span>
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

          {/* Department Filter (Department RLS) */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-[11px] text-slate-400 px-1 font-medium">
              {isArabic ? 'القسم:' : 'Dept:'}
            </span>
            <select
              value={currentDepartment}
              onChange={e => onDepartmentChange(e.target.value as Department)}
              className="bg-slate-900 text-slate-200 text-xs rounded border-none px-2 py-1 focus:ring-1 focus:ring-cyan-500 font-medium"
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
