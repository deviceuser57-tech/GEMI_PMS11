import React, { useState } from 'react';
import { BaseRecord, WorkbookSheetInfo, EntityType } from '../../types/pms';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Download,
  Filter,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useGsapPageReveal } from '../../lib/animations';
import * as XLSX from 'xlsx';

interface SheetBrowserViewProps {
  catalog: WorkbookSheetInfo[];
  records: BaseRecord[];
  isArabic: boolean;
  selectedSheetName?: string;
  onOpenNewRecord: (entity?: EntityType, defaultWps?: string) => void;
  onSelectRecord: (record: BaseRecord) => void;
}

export const SheetBrowserView: React.FC<SheetBrowserViewProps> = ({
  catalog,
  records,
  isArabic,
  selectedSheetName = 'WPS',
  onOpenNewRecord,
  onSelectRecord
}) => {
  const [activeSheet, setActiveSheet] = useState<string>(selectedSheetName);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const containerRef = useGsapPageReveal<HTMLDivElement>([activeSheet, currentPage, statusFilter]);

  // Keep activeSheet in sync with navigation from sidebar or workbook manager
  React.useEffect(() => {
    if (selectedSheetName) {
      setActiveSheet(selectedSheetName);
      setCurrentPage(1);
      setSearchQuery('');
    }
  }, [selectedSheetName]);

  const currentSheetInfo =
    catalog.find(s => s.sheetName.toLowerCase() === activeSheet.toLowerCase()) ||
    catalog.find(s => s.sheetName === 'WPS') ||
    catalog[0];

  // Map sheet to entity type
  const targetEntity = currentSheetInfo.targetEntity;

  // Filter records belonging to this sheet
  const sheetRecords = records.filter(r => {
    if (!targetEntity) return false;
    return r.entity === targetEntity;
  });

  const filteredRecords = sheetRecords.filter(r => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesSearch =
      r.rid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportSingleSheet = () => {
    const wb = XLSX.utils.book_new();
    const rows = filteredRecords.map(r => ({
      RID: r.rid,
      Title: r.title,
      Description: r.description || '',
      Department: r.department,
      Status: r.status,
      WPS_ID: r.wps_id || '',
      Due_Date: r.due_date || '',
      Expiry_Date: r.expiry_date || '',
      ...r.data
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, currentSheetInfo.sheetName);
    XLSX.writeFile(wb, `${currentSheetInfo.sheetName}_Export.xlsx`);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header with Sheet Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                SHEET {catalog.findIndex(s => s.sheetName === currentSheetInfo.sheetName) + 1} OF 40
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
                {currentSheetInfo.category}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
              <span>{currentSheetInfo.sheetName}</span>
              <span className="text-slate-400 font-normal text-base">({currentSheetInfo.arabicName})</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {currentSheetInfo.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportSingleSheet}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>{isArabic ? 'تصدير هذا الشيت (XLSX)' : 'Export Sheet'}</span>
            </button>

            {targetEntity && (
              <button
                onClick={() => onOpenNewRecord(targetEntity)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{isArabic ? `إضافة سجل في ${currentSheetInfo.sheetName} +` : `+ Add to ${currentSheetInfo.sheetName}`}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Dropdown / Quick Switcher for ALL 40 sheets */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">{isArabic ? 'انتقال سريع للشيت:' : 'Switch Sheet:'}</span>
            <select
              value={activeSheet}
              onChange={e => {
                setActiveSheet(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-bold focus:border-cyan-500"
            >
              {catalog.map((s, idx) => (
                <option key={s.sheetName} value={s.sheetName}>
                  #{idx + 1}: {s.sheetName} - {s.arabicName} ({s.recordCount} {isArabic ? 'سجل' : 'records'})
                </option>
              ))}
            </select>
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            {isArabic ? 'إجمالي السجلات الحالية في النظام لهذا الشيت:' : 'Current Live Records in System:'}{' '}
            <strong className="text-emerald-400 font-bold text-xs">{sheetRecords.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={isArabic ? 'بحث برمز السجل، العنوان، أو التفاصيل...' : 'Search RID, title, or description...'}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">{isArabic ? 'الحالة:' : 'Status:'}</span>
          {['All', 'OPEN', 'In Progress', 'Compliant', 'Approved', 'Verified', 'Closed', 'Non-Compliant'].map(st => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                statusFilter === st
                  ? st === 'OPEN'
                    ? 'bg-amber-950 text-amber-300 border-amber-500 font-bold'
                    : 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {st === 'All' ? (isArabic ? 'الكل' : 'All') : st === 'OPEN' ? (isArabic ? 'OPEN (مفتوحة)' : 'OPEN') : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Data Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">{isArabic ? 'المعرف (RID)' : 'Record ID'}</th>
                <th className="px-4 py-3">{isArabic ? 'العنوان / الوصف' : 'Title & Scope'}</th>
                <th className="px-4 py-3">{isArabic ? 'حزمة العمل' : 'WPS'}</th>
                <th className="px-4 py-3">{isArabic ? 'القسم المسؤول' : 'Department'}</th>
                <th className="px-4 py-3">{isArabic ? 'الحالة التشغيلية' : 'Status'}</th>
                <th className="px-4 py-3">{isArabic ? 'الموعد / الانتهاء' : 'Due / Expiry'}</th>
                <th className="px-4 py-3">{isArabic ? 'المرفقات' : 'Attachments'}</th>
                <th className="px-4 py-3 text-right">{isArabic ? 'الإجراء' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400 italic">
                    {isArabic ? 'لا توجد سجلات مطابقة للشيت أو الفلتر المحدد.' : 'No records found matching criteria.'}
                  </td>
                </tr>
              ) : (
                paginatedRecords.map(record => (
                  <tr
                    key={record.id}
                    onClick={() => onSelectRecord(record)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {record.rid}
                    </td>
                    <td className="px-4 py-3 max-w-xs sm:max-w-md">
                      <p className="font-semibold text-slate-200 truncate">{record.title}</p>
                      {record.description && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{record.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-300">
                      {record.wps_id ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300">
                          {record.wps_id}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                      {record.department}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          record.status === 'OPEN' || record.status === 'Open'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500 font-extrabold'
                            : record.status === 'Compliant' || record.status === 'Approved' || record.status === 'Verified'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : record.status === 'Non-Compliant'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {record.expiry_date || record.due_date || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-bold">
                        {record.attachments?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectRecord(record);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                      >
                        {isArabic ? 'معاينة' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              {isArabic ? 'الصفحة' : 'Page'} <strong className="text-white">{currentPage}</strong> {isArabic ? 'من' : 'of'}{' '}
              <strong className="text-white">{totalPages}</strong> ({filteredRecords.length} {isArabic ? 'سجل إجمالي' : 'total items'})
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-200 hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-200 hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
