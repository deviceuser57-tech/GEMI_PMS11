import React, { useState, useMemo } from 'react';
import { BaseRecord, Department, EntityType, RecordStatus } from '../../types/pms';
import { FileText, Filter, Download, Search, CheckCircle2, AlertTriangle, Calendar, Layers, CheckSquare, Square } from 'lucide-react';
import { useGsapPageReveal } from '../../lib/animations';

interface SmartReportsViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onSelectRecord: (record: BaseRecord) => void;
}

export const SmartReportsView: React.FC<SmartReportsViewProps> = ({
  records,
  isArabic,
  onSelectRecord
}) => {
  const containerRef = useGsapPageReveal<HTMLDivElement>();

  const departments: Department[] = [
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

  const entityTypes: EntityType[] = [
    'wps', 'rule', 'task', 'activity', 'deliverable', 'gate', 'gap', 
    'acceptance', 'evidence', 'risk', 'crew_member', 'crew_certificate',
    'helideck_check', 'accommodation_check', 'dependency', 'daily_log'
  ];

  const statuses: RecordStatus[] = [
    'OPEN', 'In Progress', 'Under Review', 'Compliant', 'Approved', 
    'Verified', 'Non-Compliant', 'Closed', 'Draft'
  ];

  // Multi-select filter states
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const toggleSelection = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  // Filtered records based on multi-select criteria
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedDepartments.length > 0 && !selectedDepartments.includes(r.department)) return false;
      if (selectedEntities.length > 0 && !selectedEntities.includes(r.entity)) return false;
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(r.status)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesRid = r.rid.toLowerCase().includes(q);
        const matchesDesc = r.description?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesRid && !matchesDesc) return false;
      }

      if (startDate && r.created_at && r.created_at.split('T')[0] < startDate) return false;
      if (endDate && r.created_at && r.created_at.split('T')[0] > endDate) return false;

      return true;
    });
  }, [records, selectedDepartments, selectedEntities, selectedStatuses, searchQuery, startDate, endDate]);

  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const compliant = filteredRecords.filter(r => r.status === 'Compliant' || r.status === 'Approved' || r.status === 'Closed' || r.status === 'Verified').length;
    const open = filteredRecords.filter(r => r.status === 'OPEN' || r.status === 'Open' || r.status === 'Non-Compliant').length;
    const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;
    return { total, compliant, open, complianceRate };
  }, [filteredRecords]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Entity', 'Title', 'Department', 'Status', 'Owner', 'Created Date'];
    const rows = filteredRecords.map(r => [
      r.rid,
      r.entity,
      `"${r.title.replace(/"/g, '""')}"`,
      r.department,
      r.status,
      r.owner || '',
      r.created_at.split('T')[0]
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_report_pms11_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-900 via-slate-950 to-cyan-950 border border-teal-500/30 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {isArabic ? 'نظام التقارير الذكية متعددة الفلاتر' : 'Advanced Multi-Select Reporting Engine'}
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              {isArabic ? 'تقارير مخصصة بفلاتر متعددة الاختيارات' : 'Custom Multi-Select Filterable Reports'}
            </h2>
            <p className="text-slate-300 text-xs lg:text-sm max-w-2xl leading-relaxed">
              {isArabic
                ? 'استخرج تقارير دقيقة عبر اختيار عدة أقسام، كيانات، وحالات تشغيلية في نفس الوقت مع التصدير الفوري.'
                : 'Generate tailored operational reports by selecting multiple departments, entity types, and statuses simultaneously.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-teal-600/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isArabic ? 'تصدير النتائج (CSV)' : 'Export Filtered CSV'}</span>
            </button>
          </div>
        </div>
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter Toolbar Card with Multi-Select Checkboxes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-teal-400" />
            <span>{isArabic ? 'فلاتر متعددة الاختيارات (Multi-Select Filters)' : 'Multi-Select Report Filters'}</span>
          </h3>
          <button
            onClick={() => {
              setSelectedDepartments([]);
              setSelectedEntities([]);
              setSelectedStatuses([]);
              setSearchQuery('');
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs text-teal-400 hover:text-teal-300 font-medium underline"
          >
            {isArabic ? 'إعادة ضبط كافة الفلاتر' : 'Reset All Filters'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Departments Multi-Select */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-teal-300 block mb-2">
              {isArabic ? 'الأقسام (اختر عدة أقسام):' : 'Departments (Multi-select):'}
            </span>
            <div className="max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              {departments.map(d => {
                const isSelected = selectedDepartments.includes(d);
                return (
                  <div
                    key={d}
                    onClick={() => toggleSelection(selectedDepartments, setSelectedDepartments, d)}
                    className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white p-1 rounded hover:bg-slate-900"
                  >
                    {isSelected ? <CheckSquare className="w-4 h-4 text-teal-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                    <span className="truncate">{d}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Entity Types Multi-Select */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-teal-300 block mb-2">
              {isArabic ? 'الكيانات / الشيتات (اختر متعدد):' : 'Entity Types (Multi-select):'}
            </span>
            <div className="max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              {entityTypes.map(e => {
                const isSelected = selectedEntities.includes(e);
                return (
                  <div
                    key={e}
                    onClick={() => toggleSelection(selectedEntities, setSelectedEntities, e)}
                    className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white p-1 rounded hover:bg-slate-900 font-mono"
                  >
                    {isSelected ? <CheckSquare className="w-4 h-4 text-teal-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                    <span className="truncate">{e}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statuses Multi-Select */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-teal-300 block mb-2">
              {isArabic ? 'الحالات (اختر متعدد):' : 'Statuses (Multi-select):'}
            </span>
            <div className="max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              {statuses.map(s => {
                const isSelected = selectedStatuses.includes(s);
                return (
                  <div
                    key={s}
                    onClick={() => toggleSelection(selectedStatuses, setSelectedStatuses, s)}
                    className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white p-1 rounded hover:bg-slate-900"
                  >
                    {isSelected ? <CheckSquare className="w-4 h-4 text-teal-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                    <span className="truncate">{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Additional Filters: Search & Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {isArabic ? 'بحث حر (كلمة مفتاحية أو RID)' : 'Search Keyword / RID'}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="e.g. WPS-01, Crane..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {isArabic ? 'من تاريخ (Start Date)' : 'Start Date'}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {isArabic ? 'إلى تاريخ (End Date)' : 'End Date'}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs"
            />
          </div>
        </div>

        {/* Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">{isArabic ? 'إجمالي السجلات المصفاة' : 'Filtered Results'}</span>
            <span className="text-xl font-bold text-white font-mono">{stats.total}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-teal-500/40">
            <span className="text-[11px] text-teal-400 block font-semibold">{isArabic ? 'نسبة الامتثال والإنجاز' : 'Compliance Rate'}</span>
            <span className="text-xl font-bold text-teal-300 font-mono">{stats.complianceRate}%</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/40">
            <span className="text-[11px] text-emerald-400 block font-semibold">{isArabic ? 'المكتملة / المقبولة' : 'Compliant / Closed'}</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">{stats.compliant}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/40">
            <span className="text-[11px] text-rose-400 block font-semibold">{isArabic ? 'المفتوحة / الحرجة' : 'Open / Issues'}</span>
            <span className="text-xl font-bold text-rose-400 font-mono">{stats.open}</span>
          </div>
        </div>
      </div>

      {/* Results Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>{isArabic ? `نتائج التقرير الذكي (${filteredRecords.length} سجل)` : `Smart Report Results (${filteredRecords.length} records)`}</span>
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3 font-semibold">RID</th>
                <th className="py-3 px-3 font-semibold">{isArabic ? 'الكيان' : 'Entity'}</th>
                <th className="py-3 px-3 font-semibold">{isArabic ? 'العنوان' : 'Title'}</th>
                <th className="py-3 px-3 font-semibold">{isArabic ? 'القسم' : 'Department'}</th>
                <th className="py-3 px-3 font-semibold">{isArabic ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-3 font-semibold">{isArabic ? 'المسؤول' : 'Owner'}</th>
                <th className="py-3 px-3 font-semibold">{isArabic ? 'تاريخ الإنشاء' : 'Created'}</th>
                <th className="py-3 px-3 font-semibold text-right">{isArabic ? 'إجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    {isArabic ? 'لا توجد سجلات تطابق معايير الفلترة المتعددة المحددة.' : 'No records match the selected multi-select filter criteria.'}
                  </td>
                </tr>
              ) : (
                filteredRecords.slice(0, 50).map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-mono text-teal-400 font-bold">{r.rid}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{r.entity}</td>
                    <td className="py-3 px-3 text-slate-200 font-medium max-w-xs truncate">{r.title}</td>
                    <td className="py-3 px-3 text-slate-300">{r.department}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Compliant' || r.status === 'Approved' || r.status === 'Closed' || r.status === 'Verified'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : r.status === 'OPEN' || r.status === 'Open' || r.status === 'Non-Compliant'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-teal-950 text-teal-300 border border-teal-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{r.owner || '—'}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{r.created_at.split('T')[0]}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectRecord(r)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-[11px] transition-colors"
                      >
                        {isArabic ? 'تفاصيل' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredRecords.length > 50 && (
          <p className="text-center text-xs text-slate-400 pt-2">
            {isArabic ? `يتم عرض أول 50 سجلاً من أصل ${filteredRecords.length}` : `Showing first 50 of ${filteredRecords.length} records`}
          </p>
        )}
      </div>
    </div>
  );
};
