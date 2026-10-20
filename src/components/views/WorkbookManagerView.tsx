import React, { useState } from 'react';
import { WorkbookSheetInfo, BaseRecord } from '../../types/pms';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Search,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { parseWorkbookFile, exportWorkbook, generateSampleWorkbookTemplate, ImportSummary } from '../../lib/excelParser';

interface WorkbookManagerViewProps {
  catalog: WorkbookSheetInfo[];
  records: BaseRecord[];
  isArabic: boolean;
  onImportRecords: (newRecords: BaseRecord[]) => void;
  onResetData: () => void;
  onSelectSheet?: (sheetName: string) => void;
}

export const WorkbookManagerView: React.FC<WorkbookManagerViewProps> = ({
  catalog,
  records,
  isArabic,
  onImportRecords,
  onResetData,
  onSelectSheet
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Core Operational' | 'Specialized Operations' | 'Governance & Relations'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);

  const filteredCatalog = catalog.filter(sheet => {
    const matchesCat = selectedCategory === 'All' || sheet.category === selectedCategory;
    const matchesSearch =
      sheet.sheetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sheet.arabicName.includes(searchQuery) ||
      sheet.description.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsParsing(true);
    setImportSummary(null);

    try {
      const summary = await parseWorkbookFile(file);
      setImportSummary(summary);
    } catch (err: any) {
      alert(`Error parsing workbook: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleApplyImport = () => {
    if (!importSummary || importSummary.newRecords.length === 0) return;
    onImportRecords(importSummary.newRecords);
    alert(isArabic ? `تم استيراد ${importSummary.newRecords.length} سجلاً بنجاح من الشيتات المحددة!` : `Successfully imported ${importSummary.newRecords.length} records into system!`);
    setImportSummary(null);
  };

  const coreCount = catalog.filter(s => s.category === 'Core Operational').length;
  const specCount = catalog.filter(s => s.category === 'Specialized Operations').length;
  const govCount = catalog.filter(s => s.category === 'Governance & Relations').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              EXCEL / XLSM ENGINE
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>{isArabic ? 'إدارة واستيراد ملف MASTER_WORKBOOK (40 شيت عمل)' : '40-Worksheets Manager & Excel Importer'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'معمارية الـ 40 شيت عمل من ملف MASTER_WORKBOOK_Rev.03_EXECUTIVE.xlsm مع دعم الاستيراد المباشر وقراءة الشيتات التشغيلية الجديدة.'
              : 'Architecture of the 40 worksheets from MASTER_WORKBOOK_Rev.03_EXECUTIVE.xlsm with incremental parsing & schema validation.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportWorkbook(records)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>{isArabic ? 'تصدير كامل الـ 40 شيت (XLSX)' : 'Export Full Workbook'}</span>
          </button>

          <button
            onClick={generateSampleWorkbookTemplate}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{isArabic ? 'تحميل نموذج Excel فارغ' : 'Download Template'}</span>
          </button>

          <button
            onClick={onResetData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs"
            title="Reset to default seed data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Uploader Dropzone Card */}
      <div className="relative border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-6 bg-slate-900/60 backdrop-blur-sm transition-all group">
        <input
          type="file"
          accept=".xlsx,.xlsm,.xls"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">
              {isArabic ? 'اسحب وأفلت ملف MASTER_WORKBOOK_Rev.03_EXECUTIVE.xlsm هنا' : 'Drag & Drop MASTER_WORKBOOK_Rev.03_EXECUTIVE.xlsm here'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isArabic
                ? 'يدعم ملفات .xlsm و .xlsx وقراءة الشيتات الـ 40 وتحويلها إلى سجلات ونماذج تفاعلية فورية'
                : 'Supports .xlsm and .xlsx workbooks. Automatically detects all 40 sheets and maps them to operational entities.'}
            </p>
          </div>
          <span className="px-3 py-1 text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {isParsing ? (isArabic ? 'جاري الفحص والقراءة...' : 'Parsing workbook...') : (isArabic ? 'أو انقر لاختيار الملف من جهازك' : 'Or click to browse file')}
          </span>
        </div>
      </div>

      {/* Import Preview Banner */}
      {importSummary && (
        <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-5 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">
                  {isArabic ? 'تم فحص وقراءة الملف بنجاح!' : 'Workbook Parsed Successfully!'}
                </h4>
                <p className="text-xs text-slate-300 font-mono">
                  {importSummary.fileName} • {importSummary.sheetsFound.length} {isArabic ? 'شيت تم التعرف عليها' : 'sheets identified'} • {importSummary.totalRowsParsed} {isArabic ? 'صفاً' : 'rows'}
                </p>
              </div>
            </div>

            <button
              onClick={handleApplyImport}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isArabic ? `تطبيق ودمج (${importSummary.newRecords.length} سجل)` : `Apply & Merge (${importSummary.newRecords.length} Records)`}</span>
            </button>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            <p className="font-semibold text-slate-300">{isArabic ? 'الشيتات المكتشفة في الملف:' : 'Detected Sheets in Workbook:'}</p>
            <div className="flex flex-wrap gap-1.5">
              {importSummary.sheetsFound.map(s => (
                <span key={s} className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-700 text-[11px] font-mono">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 40-Sheet Catalog Architecture Summary */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>{isArabic ? 'خريطة الشيتات الـ 40 وتصنيفها التفصيلي' : '40-Worksheets Catalog & Classification Map'}</span>
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                selectedCategory === 'All'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {isArabic ? 'الكل' : 'All'} (40)
            </button>
            <button
              onClick={() => setSelectedCategory('Core Operational')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                selectedCategory === 'Core Operational'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {isArabic ? 'النواة الأساسية' : 'Core'} ({coreCount})
            </button>
            <button
              onClick={() => setSelectedCategory('Specialized Operations')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                selectedCategory === 'Specialized Operations'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              ⭐ {isArabic ? 'المسارات التخصصية' : 'Specialized Tracks'} ({specCount})
            </button>
            <button
              onClick={() => setSelectedCategory('Governance & Relations')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                selectedCategory === 'Governance & Relations'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {isArabic ? 'الحوكمة والمرجعيات' : 'Governance & Rel'} ({govCount})
            </button>
          </div>
        </div>

        {/* 40 Sheets Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">{isArabic ? 'اسم الشيت في الإكسيل' : 'Sheet Name in Excel'}</th>
                  <th className="px-4 py-3">{isArabic ? 'الاسم الوظيفي العربي' : 'Functional Scope (Arabic)'}</th>
                  <th className="px-4 py-3">{isArabic ? 'التصنيف' : 'Category'}</th>
                  <th className="px-4 py-3">{isArabic ? 'الكيان البرمجي' : 'Target Entity'}</th>
                  <th className="px-4 py-3">{isArabic ? 'الوصف الهندسي' : 'Engineering Description'}</th>
                  <th className="px-4 py-3 text-right">{isArabic ? 'الإجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredCatalog.map(sheet => {
                  const isSpecial = sheet.category === 'Specialized Operations';
                  return (
                    <tr
                      key={sheet.sheetName}
                      onClick={() => onSelectSheet && onSelectSheet(sheet.sheetName)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-white flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{sheet.sheetName}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-200">
                        {sheet.arabicName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSpecial
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : sheet.category === 'Core Operational'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                              : 'bg-purple-950 text-purple-300 border border-purple-800'
                          }`}
                        >
                          {sheet.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-cyan-300">
                        {sheet.targetEntity || 'System / Reference'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {sheet.description}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSheet && onSelectSheet(sheet.sheetName);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-800 text-emerald-300 border border-emerald-900 hover:border-emerald-700 flex items-center gap-1.5 transition-all text-xs font-semibold"
                        >
                          <span>{isArabic ? 'تصفح السجلات' : 'Browse Records'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
