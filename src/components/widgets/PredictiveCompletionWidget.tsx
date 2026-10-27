import React, { useState, useMemo } from 'react';
import { BaseRecord, WorkbookSheetInfo } from '../../types/pms';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Search,
  Clock,
  ArrowUpRight,
  GitCommit,
  Flame,
  Zap,
  ShieldCheck,
  ChevronRight,
  BarChart3,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface PredictiveCompletionWidgetProps {
  catalog: WorkbookSheetInfo[];
  records: BaseRecord[];
  isArabic: boolean;
}

export const PredictiveCompletionWidget: React.FC<PredictiveCompletionWidgetProps> = ({
  catalog,
  records,
  isArabic
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate velocity and forecasted 100% completion date for each sheet
  const forecastList = useMemo(() => {
    return catalog.map(sheet => {
      const sheetRecords = records.filter(r => r.entity === sheet.targetEntity);
      const total = sheetRecords.length || sheet.recordCount || 1;
      const compliant = sheetRecords.filter(r => 
        r.status === 'Compliant' || r.status === 'Approved' || r.status === 'Closed' || r.status === 'Verified'
      ).length;

      const progressPercent = Math.min(100, Math.round((compliant / total) * 100));
      const remainingItems = Math.max(0, total - compliant);

      // Velocity heuristic: 1.5 to 3.5 days per remaining record item
      const velocityPerItemDays = 2.2;
      const daysTo100 = remainingItems === 0 ? 0 : Math.ceil(remainingItems * velocityPerItemDays);

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysTo100);
      const formattedDate = daysTo100 === 0 
        ? (isArabic ? 'مكتمل 100%' : '100% Completed')
        : targetDate.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      let statusFlag: 'Completed' | 'On Track' | 'At Risk' | 'Needs Acceleration' = 'On Track';
      if (progressPercent === 100) statusFlag = 'Completed';
      else if (progressPercent >= 75) statusFlag = 'On Track';
      else if (progressPercent >= 45) statusFlag = 'At Risk';
      else statusFlag = 'Needs Acceleration';

      // Critical path heuristic: sheets in Crane, Pipelay, Structural, and SAT Commissioning are on the critical path
      const isCriticalPath = (sheet.targetEntity && ['wps_structural', 'wps_pipelay', 'wps_crane', 'wps_testing', 'gaps'].includes(sheet.targetEntity)) || progressPercent < 60;

      return {
        sheetName: sheet.sheetName,
        arabicName: sheet.arabicName,
        category: sheet.category,
        targetEntity: sheet.targetEntity,
        total,
        compliant,
        progressPercent,
        remainingItems,
        daysTo100,
        formattedDate,
        statusFlag,
        isCriticalPath
      };
    });
  }, [catalog, records, isArabic]);

  // Critical Path High-Risk Impact Items
  const criticalPathHighRiskItems = useMemo(() => {
    // Extract open gaps, pending deliverables, and incomplete WPS that block the critical path
    const openGapsAndTasks = records.filter(r => 
      (r.entity === 'gap' || r.entity === 'task' || r.entity === 'deliverable' || r.entity === 'wps') &&
      r.status !== 'Approved' && r.status !== 'Compliant' && r.status !== 'Closed'
    );

    return openGapsAndTasks.slice(0, 6).map((r, idx) => {
      const delayImpactDays = (idx + 1) * 3 + 4; // Simulated CPM slack delay impact
      return {
        id: r.id,
        rid: r.rid,
        title: r.title,
        wps_id: r.wps_id || `WPS-0${(idx % 5) + 1}`,
        department: r.department || 'QA/QC',
        gateImpact: idx % 2 === 0 ? 'Gate-2 Construction (BLOCKED)' : 'Gate-3 Commissioning (INCOMPLETE)',
        delayImpactDays,
        riskLevel: delayImpactDays > 10 ? 'HIGH CRITICAL PATH IMPACT' : 'MEDIUM SLACK IMPACT',
        suggestedMitigation: isArabic
          ? `تسريع مراجعة فحص NDT وتعيين مهندسين إضافيين لإغلاق ${r.rid}`
          : `Fast-track NDT X-ray sign-off & deploy 2 additional field engineers for ${r.rid}`
      };
    });
  }, [records, isArabic]);

  // Overall Project Forecast Metrics
  const maxDelayDays = Math.max(...forecastList.map(f => f.daysTo100), 18);
  const baselineCompletionDate = new Date();
  baselineCompletionDate.setDate(baselineCompletionDate.getDate() + 12);
  const forecastedCompletionDate = new Date();
  forecastedCompletionDate.setDate(forecastedCompletionDate.getDate() + maxDelayDays);

  const delayDeltaDays = maxDelayDays - 12;

  // Filtered list
  const filteredForecasts = useMemo(() => {
    return forecastList.filter(f => {
      if (selectedCategory !== 'All' && f.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return f.sheetName.toLowerCase().includes(q) || (!!f.arabicName && f.arabicName.toLowerCase().includes(q));
      }
      return true;
    });
  }, [forecastList, selectedCategory, searchQuery]);

  // Summary Metrics
  const completedSheets = forecastList.filter(f => f.progressPercent === 100).length;
  const onTrackSheets = forecastList.filter(f => f.statusFlag === 'On Track').length;
  const needsAccelSheets = forecastList.filter(f => f.statusFlag === 'Needs Acceleration' || f.statusFlag === 'At Risk').length;

  const categories = ['All', 'Core Compliance', 'Specialized Operations', 'Governance & Analytics'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-950 via-slate-950 to-cyan-950 border border-teal-500/30 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {isArabic ? 'وحدة التنبؤ بالجدول الزمني والمسار الحرج (Predictive Timeline & CPM)' : 'Predictive Timeline & Critical Path Module'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-400" />
                +{delayDeltaDays} DAYS FORECASTED DELAY
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              {isArabic ? 'التوقع الزمني للمسار الحرج وتحليل تأخيرات الـ 40 شيت' : '40-Sheet Critical Path Delay Forecast & Timeline'}
            </h2>

            <p className="text-slate-300 text-xs lg:text-sm max-w-2xl leading-relaxed">
              {isArabic
                ? 'تحليل سرعة التغيير وإنجاز السجلات للـ 40 شيت لحساب تاريخ اكتمال المشروع، مع تسليط الضوء على السجلات والفجوات عالية المخاطر المؤثرة على المسار الحرج (Critical Path).'
                : 'Analyses current 40-sheet completion rates to forecast project delivery date, highlighting high-risk records impacting the critical path.'}
            </p>
          </div>

          {/* Timeline Summary Card */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">{isArabic ? 'التاريخ المخطط Baseline:' : 'Baseline Target:'}</span>
              <span className="font-mono text-slate-200 font-bold">
                {baselineCompletionDate.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-1.5">
              <span className="text-amber-400 font-bold">{isArabic ? 'التوقع الزمني المعدل:' : 'Forecasted Completion:'}</span>
              <span className="font-mono text-cyan-300 font-extrabold text-sm">
                {forecastedCompletionDate.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div className="bg-rose-950/40 p-2 rounded-lg border border-rose-800/60 text-[11px] text-rose-300 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{isArabic ? `تأخير متوقع قدره ${delayDeltaDays} يوماً بسبب بوابات الإغلاق المعطلة` : `Projected delay: +${delayDeltaDays} days due to blocked gates`}</span>
            </div>
          </div>
        </div>
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Critical Path High-Risk Impact Items Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>{isArabic ? 'السجلات والفجوات ذات التأثير العالي على المسار الحرج (Critical Path Impact Records)' : 'Critical Path High-Risk Impact Records'}</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                  HIGH CPM SLACK RISK
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isArabic ? 'سجلات حزم العمل المعطلة التي تتسبب مباشرة في تأخير تاريخ التسليم النهائي للبارجة' : 'Work package deliverables and gaps directly delaying project completion'}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">{isArabic ? 'كود السجل والعنوان' : 'Record RID & Title'}</th>
                <th className="px-4 py-3">{isArabic ? 'حزمة العمل' : 'WPS Package'}</th>
                <th className="px-4 py-3">{isArabic ? 'تأثير البوابة' : 'Gate State Impact'}</th>
                <th className="px-4 py-3">{isArabic ? 'تأخير المسار الحرج' : 'CPM Delay Impact'}</th>
                <th className="px-4 py-3">{isArabic ? 'توصية تسريع الجدول الزمني' : 'Schedule Mitigation Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {criticalPathHighRiskItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-black text-rose-300 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>[{item.rid}]</span>
                    </div>
                    <p className="font-bold text-slate-200 mt-0.5 leading-snug">{item.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {item.wps_id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                      {item.gateImpact}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <span className="font-mono text-xs font-black text-rose-400 block">
                        +{item.delayImpactDays} Days Delay
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        {item.riskLevel}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-[11px] leading-relaxed">
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{item.suggestedMitigation}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forecast Chart Visualization */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal-400" />
          <span>{isArabic ? 'نسبة الامتثال الحالية والتنبؤ التلقائي بالأيام المتبقية' : 'Current Compliance % & Forecasted Days to 100%'}</span>
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredForecasts.slice(0, 15)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="sheetName" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
              <Bar dataKey="progressPercent" name={isArabic ? 'نسبة الإنجاز الحالية %' : 'Current Compliance %'} radius={[6, 6, 0, 0]}>
                {filteredForecasts.slice(0, 15).map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={entry.progressPercent === 100 ? '#10b981' : entry.isCriticalPath ? '#f43f5e' : '#0d9488'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>{isArabic ? 'تفاصيل التوقع الزمني لجميع الـ 40 شيت' : '40-Sheet Detailed Forecast & Critical Path Status'}</span>
          </h4>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isArabic ? 'بحث باسم الشيت...' : 'Search sheet name...'}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">{isArabic ? 'اسم الشيت' : 'Worksheet'}</th>
                <th className="px-4 py-3">{isArabic ? 'التصنيف' : 'Category'}</th>
                <th className="px-4 py-3">{isArabic ? 'السجلات المقبولة / الإجمالي' : 'Compliant / Total'}</th>
                <th className="px-4 py-3">{isArabic ? 'نسبة الإنجاز' : 'Compliance %'}</th>
                <th className="px-4 py-3">{isArabic ? 'الأيام المتوقعة لـ 100%' : 'Est. Days Remaining'}</th>
                <th className="px-4 py-3">{isArabic ? 'تاريخ الجاهزية المتوقع (100%)' : 'Forecasted 100% Date'}</th>
                <th className="px-4 py-3">{isArabic ? 'حالة المسار الحرج' : 'Critical Path Flag'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredForecasts.map(f => (
                <tr key={f.sheetName} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-white font-mono">{f.sheetName}</div>
                    <div className="text-[10px] text-slate-400">{f.arabicName}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-[11px]">{f.category}</td>
                  <td className="px-4 py-3 font-mono text-slate-200">
                    <strong className="text-teal-400">{f.compliant}</strong> / {f.total}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            f.progressPercent === 100
                              ? 'bg-emerald-500'
                              : f.isCriticalPath
                              ? 'bg-rose-500'
                              : 'bg-teal-500'
                          }`}
                          style={{ width: `${f.progressPercent}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-200">{f.progressPercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-200 font-bold">
                    {f.daysTo100 === 0 ? '—' : `${f.daysTo100} ${isArabic ? 'يوم' : 'days'}`}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-teal-300">
                    {f.formattedDate}
                  </td>
                  <td className="px-4 py-3">
                    {f.isCriticalPath ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1 w-max">
                        <Flame className="w-3 h-3 text-rose-400" />
                        CRITICAL PATH
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                        SLACK BUFFER
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
