import React, { useState } from 'react';
import { BaseRecord, WorkbookSheetInfo, EntityType, Department } from '../../types/pms';
import { getStoredRecords, saveAllRecords } from '../../lib/storage';
import { ALL_DEPARTMENTS } from '../../lib/rbac';
import { toast } from 'react-toastify';
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
  ChevronRight,
  CheckSquare,
  Square,
  X
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
  const [urgencyFilter, setUrgencyFilter] = useState<'All' | 'Due Today' | 'Overdue'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [isBulkDeptModalOpen, setIsBulkDeptModalOpen] = useState(false);
  const [bulkStatusValue, setBulkStatusValue] = useState('Closed');
  const [bulkDeptValue, setBulkDeptValue] = useState<Department>('Marine');

  const handleBulkStatusSubmit = () => {
    const allRecords = getStoredRecords();
    const updated = allRecords.map(r => {
      if (selectedIds.has(r.id)) {
        return { ...r, status: bulkStatusValue as any, updated_at: new Date().toISOString() };
      }
      return r;
    });
    saveAllRecords(updated);
    setSelectedIds(new Set());
    setIsBulkStatusModalOpen(false);
    toast.success(isArabic ? 'تم تحديث حالة السجلات المحددة بنجاح' : 'Bulk status updated successfully');
    window.location.reload();
  };

  const handleBulkDeptSubmit = () => {
    const allRecords = getStoredRecords();
    const updated = allRecords.map(r => {
      if (selectedIds.has(r.id)) {
        return { ...r, department: bulkDeptValue, updated_at: new Date().toISOString() };
      }
      return r;
    });
    saveAllRecords(updated);
    setSelectedIds(new Set());
    setIsBulkDeptModalOpen(false);
    toast.success(isArabic ? 'تم تعيين القسم الإداري للسجلات المحددة بنجاح' : 'Bulk department assigned successfully');
    window.location.reload();
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedRecords.map(r => r.id)));
    }
  };

  const toggleSelectRecord = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const applyBulkAction = (action: 'archive' | 'status') => {
    // Implementation for bulk action ...
    console.log(`Action: ${action}, IDs:`, Array.from(selectedIds));
    setSelectedIds(new Set());
    alert(isArabic ? 'تم تطبيق الإجراء الجماعي بنجاح' : 'Bulk action applied successfully');
  };

  const containerRef = useGsapPageReveal<HTMLDivElement>([activeSheet, currentPage, statusFilter, urgencyFilter]);

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

    let matchesUrgency = true;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (urgencyFilter === 'Due Today') {
      matchesUrgency = Boolean(r.due_date && r.due_date.startsWith(todayStr));
    } else if (urgencyFilter === 'Overdue') {
      matchesUrgency = Boolean(r.due_date && new Date(r.due_date) < now && r.status !== 'Closed' && r.status !== 'Compliant');
    }

    const matchesSearch =
      r.rid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesUrgency && matchesSearch;
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

        {/* Visual Progress Bar for Sheet Completion */}
        <div className="pt-3 border-t border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              {isArabic ? 'نسبة الإنجاز والإغلاق للشيت (Closed Ratio):' : 'Sheet Closure Completion Ratio:'}
            </span>
            <span className="font-mono font-bold text-cyan-400">
              {sheetRecords.filter(r => r.status === 'Closed' || r.status === 'Compliant' || r.status === 'Approved' || r.status === 'Verified').length} / {sheetRecords.length} ({sheetRecords.length > 0 ? Math.round((sheetRecords.filter(r => r.status === 'Closed' || r.status === 'Compliant' || r.status === 'Approved' || r.status === 'Verified').length / sheetRecords.length) * 100) : 0}%)
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-[#ff6600] to-emerald-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${sheetRecords.length > 0 ? Math.round((sheetRecords.filter(r => r.status === 'Closed' || r.status === 'Compliant' || r.status === 'Approved' || r.status === 'Verified').length / sheetRecords.length) * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedIds.size > 0 && (
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/80 p-3 rounded-xl border border-cyan-500/40">
             <span className="text-cyan-300 font-bold flex items-center gap-1.5">
               <span>✓</span>
               <span>{selectedIds.size} {isArabic ? 'سجل محدد للتعديل الجماعي' : 'records selected for bulk action'}</span>
             </span>
             <div className="flex items-center gap-2">
               <button onClick={() => setIsBulkStatusModalOpen(true)} className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-lg font-bold">
                 {isArabic ? 'تحديث الحالة جماعياً...' : 'Bulk Status Update'}
               </button>
               <button onClick={() => setIsBulkDeptModalOpen(true)} className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-lg font-bold">
                 {isArabic ? 'تعيين الإدارة جماعياً...' : 'Bulk Department Assign'}
               </button>
               <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg">
                 {isArabic ? 'إلغاء التحديد' : 'Clear Selection'}
               </button>
             </div>
          </div>
        )}

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

      {/* Floating Filter Bar */}
      <div className="sticky top-16 z-20 bg-slate-900/95 backdrop-blur border border-cyan-500/30 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-cyan-400 font-bold flex items-center gap-1.5">
            <Filter className="w-4 h-4" />
            <span>{isArabic ? 'شريط الفلترة العائم:' : 'Floating Filter Bar:'}</span>
          </span>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] px-2 font-medium">{isArabic ? 'الحالة:' : 'Status:'}</span>
            {['All', 'OPEN', 'In Progress', 'Compliant', 'Closed'].map(st => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-[#ff6600] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {st === 'All' ? (isArabic ? 'الكل' : 'All') : st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] px-2 font-medium">{isArabic ? 'الإلحاح:' : 'Urgency:'}</span>
            {[
              { id: 'All', labelAr: 'الكل', labelEn: 'All' },
              { id: 'Due Today', labelAr: 'مستحق اليوم', labelEn: 'Due Today' },
              { id: 'Overdue', labelAr: 'متأخر', labelEn: 'Overdue' }
            ].map(urg => (
              <button
                key={urg.id}
                onClick={() => {
                  setUrgencyFilter(urg.id as any);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  urgencyFilter === urg.id
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {isArabic ? urg.labelAr : urg.labelEn}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>{isArabic ? 'النتائج المصفاة:' : 'Filtered Results:'}</span>
          <span className="text-cyan-400 font-bold">{filteredRecords.length}</span>
          <span>/ {sheetRecords.length}</span>
        </div>
      </div>

      {/* Main Data Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">
                    <button onClick={toggleSelectAll} className="text-white hover:text-cyan-400">
                        {selectedIds.size === paginatedRecords.length && paginatedRecords.length > 0 ? <CheckSquare className="w-4 h-4"/> : <Square className="w-4 h-4"/>}
                    </button>
                </th>
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
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400 italic">
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
                    <td className="px-4 py-3">
                        <button onClick={(e) => { e.stopPropagation(); toggleSelectRecord(record.id); }} className="text-white hover:text-cyan-400">
                            {selectedIds.has(record.id) ? <CheckSquare className="w-4 h-4"/> : <Square className="w-4 h-4"/>}
                        </button>
                    </td>
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

      {/* Bulk Status Update Modal */}
      {isBulkStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">{isArabic ? 'تحديث الحالة جماعياً' : 'Bulk Status Update'}</h3>
              <button onClick={() => setIsBulkStatusModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-300">
              {isArabic ? `سيتم تطبيق الحالة الجديدة على عدد (${selectedIds.size}) سجل.` : `Applying new status to ${selectedIds.size} selected records.`}
            </p>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">{isArabic ? 'الحالة المستهدفة:' : 'Target Status:'}</label>
              <select
                value={bulkStatusValue}
                onChange={e => setBulkStatusValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-bold"
              >
                <option value="Closed">Closed (مغلق)</option>
                <option value="Compliant">Compliant (مطابق)</option>
                <option value="Approved">Approved (معتمد)</option>
                <option value="In Progress">In Progress (قيد التنفيذ)</option>
                <option value="OPEN">OPEN (مفتوح)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsBulkStatusModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-bold">
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={handleBulkStatusSubmit} className="px-4 py-2 rounded-xl bg-[#ff6600] text-xs text-white font-bold">
                {isArabic ? 'تأكيد التحديث الجماعي' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Department Assignment Modal */}
      {isBulkDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">{isArabic ? 'تعيين القسم الإداري جماعياً' : 'Bulk Department Assignment'}</h3>
              <button onClick={() => setIsBulkDeptModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-300">
              {isArabic ? `سيتم تعيين القسم الإداري لـ (${selectedIds.size}) سجل.` : `Assigning department to ${selectedIds.size} selected records.`}
            </p>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">{isArabic ? 'القسم المستهدف:' : 'Target Department:'}</label>
              <select
                value={bulkDeptValue}
                onChange={e => setBulkDeptValue(e.target.value as Department)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-bold"
              >
                {ALL_DEPARTMENTS.filter(d => d !== 'All').map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsBulkDeptModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-bold">
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={handleBulkDeptSubmit} className="px-4 py-2 rounded-xl bg-[#ff6600] text-xs text-white font-bold">
                {isArabic ? 'تأكيد التعيين الجماعي' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
