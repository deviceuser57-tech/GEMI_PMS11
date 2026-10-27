import React, { useState } from 'react';
import { BaseRecord, Department } from '../../types/pms';
import {
  Boxes,
  Users,
  Plane,
  Bed,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  FileCheck2,
  BookmarkCheck,
  Plus,
  Search,
  TrendingUp,
  BarChart3,
  Sparkles,
  Calendar
} from 'lucide-react';
import { VarianceComparisonWidget } from '../widgets/VarianceComparisonWidget';
import { calculateVarianceMetric } from '../../lib/varianceCalculator';

interface WpsViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  activeDepartment: Department;
  onOpenNewRecord: (defaultEntity?: any, defaultWps?: string) => void;
  onSelectRecord: (record: BaseRecord) => void;
}

export const WpsView: React.FC<WpsViewProps> = ({
  records,
  isArabic,
  activeDepartment,
  onOpenNewRecord,
  onSelectRecord
}) => {
  const [selectedWpsRid, setSelectedWpsRid] = useState<string>('WPS-23');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [specialTab, setSpecialTab] = useState<'overview' | 'variance' | 'specialized' | 'rules' | 'evidence'>('variance');

  // Filter WPS records (Strictly 24 Work Packages)
  const allWps = records.filter(r => r.entity === 'wps');
  const filteredWps = allWps.filter(w => {
    const matchesDept = activeDepartment === 'All' || w.department === activeDepartment;
    const matchesStatus = statusFilter === 'All' || w.status === statusFilter || (statusFilter === 'OPEN' && (w.status === 'OPEN' || w.status === 'Open'));
    const matchesSearch =
      w.rid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesStatus && matchesSearch;
  });

  const currentWps = allWps.find(w => w.rid === selectedWpsRid) || allWps[0];

  // Records linked to current WPS
  const linkedRecords = records.filter(r => r.wps_id === selectedWpsRid);
  const linkedRules = records.filter(r => r.entity === 'rule' && r.wps_id === selectedWpsRid);
  const linkedEvidence = records.filter(r => r.entity === 'evidence' && r.wps_id === selectedWpsRid);

  // Specialized records
  const crewRoles = records.filter(r => r.entity === 'crew_role');
  const crewMembers = records.filter(r => r.entity === 'crew_member');
  const manningPlans = records.filter(r => r.entity === 'manning_plan');
  const helideckChecks = records.filter(r => r.entity === 'helideck_check');
  const helideckProfile = records.find(r => r.entity === 'helideck_profile');
  const accomChecks = records.filter(r => r.entity === 'accommodation_check');
  const accomCapacity = records.find(r => r.entity === 'accommodation_capacity');

  // Calculate Planned vs Actual for current WPS
  const currentActualRate = currentWps?.data?.completion_rate ?? (currentWps?.status === 'Approved' ? 100 : currentWps?.status === 'Compliant' ? 95 : 78);
  const currentPlannedRate = 88;

  return (
    <div className="space-y-6">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              24 PACKAGES
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-cyan-400" />
              <span>{isArabic ? 'سجل حزم العمل التشغيلية وتحليل الانحراف (WPS Planned vs Actual)' : 'Work Packages Register & Planned vs Actual Analyzer'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'متابعة حزم العمل الـ 24 المعتمدة ومقارنة المستهدف المخطط مقابل الإنجاز الفعلي ونسبة الانحراف (Variance).'
              : 'Management & variance comparison of 24 work packages with Planned Target vs Actual Status metrics.'}
          </p>
        </div>

        <button
          onClick={() => onOpenNewRecord('wps')}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 self-start shadow-md shadow-cyan-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isArabic ? 'إضافة حزمة عمل +' : '+ Add Work Package'}</span>
        </button>
      </div>

      {/* Main Grid: Left List (WPS items), Right Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: WPS List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isArabic ? 'بحث برمز الحزمة أو الاسم...' : 'Search by WPS or name...'}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Status Filter Bar for WPS */}
          <div className="flex flex-wrap items-center gap-1 text-[11px] pt-1">
            <span className="text-slate-400 text-[10px] mr-1">{isArabic ? 'الحالة:' : 'Status:'}</span>
            {['All', 'OPEN', 'In Progress', 'Compliant', 'Approved'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded-lg border text-[10px] transition-all cursor-pointer ${
                  statusFilter === st
                    ? st === 'OPEN'
                      ? 'bg-amber-950 text-amber-300 border-amber-500 font-bold'
                      : 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {st === 'All' ? (isArabic ? 'الكل' : 'All') : st === 'OPEN' ? (isArabic ? 'OPEN (مفتوحة)' : 'OPEN') : st}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {filteredWps.map(w => {
              const isSelected = w.rid === selectedWpsRid;
              const isSpecial = w.rid === 'WPS-23' || w.rid === 'WPS-19' || w.rid === 'WPS-15';
              const isOpenStatus = w.status === 'OPEN' || w.status === 'Open';

              const actRate = w.data?.completion_rate ?? (w.status === 'Approved' ? 100 : w.status === 'Compliant' ? 95 : 78);
              const planRate = 88;
              const v = calculateVarianceMetric(planRate, actRate);

              return (
                <div
                  key={w.id}
                  onClick={() => {
                    setSelectedWpsRid(w.rid);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/70 border-cyan-500/60 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                        {w.rid}
                      </span>
                      {isSpecial && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                          ⭐ {isArabic ? 'تخصصي' : 'Specialized'}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border ${v.badgeClass}`}
                    >
                      {v.variancePercent >= 0 ? `+${v.variancePercent}%` : `${v.variancePercent}%`}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-200 line-clamp-1">{w.title}</p>
                  
                  {/* Progress Bar Layer */}
                  <div className="mt-2 w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800 relative">
                    <div className="bg-amber-400 h-full w-0.5 absolute z-10" style={{ left: '88%' }} />
                    <div className={`h-full bg-gradient-to-r ${v.progressClass}`} style={{ width: `${actRate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Inspector & Planned vs Actual Analyzer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          {currentWps ? (
            <>
              {/* Header of selected WPS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                      {currentWps.rid}
                    </span>
                    <span className="text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {currentWps.department}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{currentWps.title}</h3>
                  <p className="text-xs text-slate-300 max-w-xl">{currentWps.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectRecord(currentWps)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200"
                  >
                    {isArabic ? 'تعديل الحزمة' : 'Edit Package'}
                  </button>
                  <button
                    onClick={() => onOpenNewRecord('task', currentWps.rid)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'مهمة جديدة' : 'Add Task'}</span>
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
                <button
                  onClick={() => setSpecialTab('variance')}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    specialTab === 'variance'
                      ? 'bg-gradient-to-r from-amber-950 to-cyan-950 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isArabic ? 'مقارنة المخطط والفعلي (Variance Analyzer)' : 'Planned vs Actual Variance'}</span>
                </button>

                {currentWps.rid === 'WPS-23' && (
                  <button
                    onClick={() => setSpecialTab('specialized')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      specialTab === 'specialized'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تبويب الطاقم (Crew & Manning)' : 'Crew Plan Tab'}</span>
                  </button>
                )}

                {currentWps.rid === 'WPS-19' && (
                  <button
                    onClick={() => setSpecialTab('specialized')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      specialTab === 'specialized'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Plane className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تبويب المهبط (Helideck ECAR 138)' : 'Helideck ECAR 138 Tab'}</span>
                  </button>
                )}

                {currentWps.rid === 'WPS-15' && (
                  <button
                    onClick={() => setSpecialTab('specialized')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      specialTab === 'specialized'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Bed className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تبويب الإقامة (Accommodation)' : 'Accommodation Tab'}</span>
                  </button>
                )}

                <button
                  onClick={() => setSpecialTab('overview')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    specialTab === 'overview'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isArabic ? 'المهام الميدانية' : 'Field Tasks'} ({linkedRecords.length})
                </button>
              </div>

              {/* TAB CONTENT: PLANNED VS ACTUAL VARIANCE ANALYZER */}
              {specialTab === 'variance' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <VarianceComparisonWidget
                    title={isArabic ? `مؤشر انحراف الجاهزية لحزمة [${currentWps.rid}]` : `Completion Variance for [${currentWps.rid}]`}
                    subtitle={currentWps.title}
                    plannedPercent={currentPlannedRate}
                    actualPercent={currentActualRate}
                    plannedDate="2026-11-15"
                    actualDate="2026-11-22"
                    isArabic={isArabic}
                  />

                  {/* 24-Package Planned vs Actual Comparison Matrix */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      <span>{isArabic ? 'مصفوفة انحراف الـ 24 حزمة (24 Work Packages Comparison Matrix)' : '24 Work Packages Variance Comparison Matrix'}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {allWps.map(w => {
                        const act = w.data?.completion_rate ?? (w.status === 'Approved' ? 100 : w.status === 'Compliant' ? 95 : 78);
                        const plan = 88;
                        const calc = calculateVarianceMetric(plan, act);

                        return (
                          <div key={w.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-black text-cyan-300">[{w.rid}]</span>
                              <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${calc.badgeClass}`}>
                                {isArabic ? calc.statusLabelArabic : calc.statusLabelEnglish}
                              </span>
                            </div>

                            <p className="font-bold text-white truncate">{w.title}</p>

                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 relative">
                              <div className="bg-amber-400 h-full w-0.5 absolute z-10" style={{ left: '88%' }} />
                              <div className={`h-full bg-gradient-to-r ${calc.progressClass}`} style={{ width: `${act}%` }} />
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                              <span>Act: <strong className="text-cyan-300">{act}%</strong></span>
                              <span>Plan: <strong className="text-amber-400">{plan}%</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* OVERVIEW TAB */}
              {specialTab === 'overview' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-100">
                      {isArabic ? 'السجلات والمهام التنفيذية التابعة' : 'Field Execution & Tasks'}
                    </h4>
                    <span className="text-xs text-slate-400">{linkedRecords.length} {isArabic ? 'سجل' : 'records'}</span>
                  </div>

                  {linkedRecords.length === 0 ? (
                    <div className="text-center py-10 bg-slate-950 rounded-xl border border-dashed border-slate-800">
                      <p className="text-xs text-slate-400">
                        {isArabic ? 'لا توجد مهام إضافية مسجلة مباشرة لهذه الحزمة.' : 'No additional records linked yet.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {linkedRecords.map(r => (
                        <div
                          key={r.id}
                          onClick={() => onSelectRecord(r)}
                          className="p-3 bg-slate-950 hover:bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-[10px] font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                              {r.rid}
                            </span>
                            <span className="font-semibold text-slate-200">{r.title}</span>
                          </div>
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-400 text-xs italic">{isArabic ? 'اختر حزمة عمل لعرض تفاصيلها' : 'Select a work package to view details'}</p>
          )}
        </div>
      </div>
    </div>
  );
};
