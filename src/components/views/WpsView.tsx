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
  Search
} from 'lucide-react';

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
  const [specialTab, setSpecialTab] = useState<'overview' | 'specialized' | 'rules' | 'evidence'>('specialized');

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
  const linkedGaps = records.filter(r => r.entity === 'gap' && r.wps_id === selectedWpsRid);

  // Specialized records
  const crewRoles = records.filter(r => r.entity === 'crew_role');
  const crewMembers = records.filter(r => r.entity === 'crew_member');
  const manningPlans = records.filter(r => r.entity === 'manning_plan');
  const helideckChecks = records.filter(r => r.entity === 'helideck_check');
  const helideckProfile = records.find(r => r.entity === 'helideck_profile');
  const accomChecks = records.filter(r => r.entity === 'accommodation_check');
  const accomCapacity = records.find(r => r.entity === 'accommodation_capacity');

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
              <span>{isArabic ? 'سجل حزم العمل التشغيلية (WPS-01 إلى WPS-24)' : 'Work Packages Register (WPS-01 to WPS-24)'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'متابعة حزم العمل الـ 24 المعتمدة وحلقات إغلاقها، مع دعم الحالة OPEN وحالات الإغلاق، وتبويبات تفصيلية لحزم WPS-23 (الطاقم) و WPS-19 (المهبط) و WPS-15 (الإقامة).'
              : 'Detailed management of the 24 barge work packages with OPEN & closure statuses, plus deep inspection tabs for WPS-23, WPS-19, and WPS-15.'}
          </p>
        </div>

        <button
          onClick={() => onOpenNewRecord('wps')}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 self-start shadow-md shadow-cyan-600/20"
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
                className={`px-2 py-0.5 rounded-lg border text-[10px] transition-all ${
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

              return (
                <div
                  key={w.id}
                  onClick={() => {
                    setSelectedWpsRid(w.rid);
                    setSpecialTab(isSpecial ? 'specialized' : 'overview');
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
                          ⭐ {isArabic ? 'مسار تخصصي' : 'Specialized'}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOpenStatus
                          ? 'bg-amber-950 text-amber-300 border border-amber-500 font-extrabold'
                          : w.status === 'Compliant' || w.status === 'Approved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-200 line-clamp-1">{w.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{w.department}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Inspector */}
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
                {currentWps.rid === 'WPS-23' && (
                  <button
                    onClick={() => setSpecialTab('specialized')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                      specialTab === 'specialized'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تبويب الطاقم والمانينج (Crew & Manning)' : 'Crew & Manning Plan Tab'}</span>
                  </button>
                )}

                {currentWps.rid === 'WPS-19' && (
                  <button
                    onClick={() => setSpecialTab('specialized')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                      specialTab === 'specialized'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Plane className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تبويب مهبط الطائرات (Helideck CAP 437)' : 'Helideck & CAP 437 Tab'}</span>
                  </button>
                )}

                {currentWps.rid === 'WPS-15' && (
                  <button
                    onClick={() => setSpecialTab('specialized')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                      specialTab === 'specialized'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Bed className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'تبويب الإقامة والـ POB (Accommodation)' : 'Accommodation & POB Tab'}</span>
                  </button>
                )}

                <button
                  onClick={() => setSpecialTab('overview')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    specialTab === 'overview'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isArabic ? 'نظرة عامة والمهام الميدانية' : 'Overview & Field Tasks'} ({linkedRecords.length})
                </button>

                <button
                  onClick={() => setSpecialTab('rules')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    specialTab === 'rules'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isArabic ? 'القواعد المرتبطة' : 'Governing Rules'} ({linkedRules.length})
                </button>

                <button
                  onClick={() => setSpecialTab('evidence')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    specialTab === 'evidence'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isArabic ? 'الأدلة الثبوتية' : 'Evidence Documents'} ({linkedEvidence.length})
                </button>
              </div>

              {/* TAB CONTENT: SPECIALIZED WPS-23 (CREW & MANNING) */}
              {specialTab === 'specialized' && currentWps.rid === 'WPS-23' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Manning Plan Subsection */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span>{isArabic ? 'خطة الحد الأدنى الآمن للمانينج (Manning Plan)' : 'Minimum Safe Manning Requirements'}</span>
                      </h4>
                      <button
                        onClick={() => onOpenNewRecord('manning_plan')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        + {isArabic ? 'إضافة سيناريو مانينج' : 'Add Manning Scenario'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {manningPlans.map(plan => (
                        <div
                          key={plan.id}
                          className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{plan.title}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px]">
                              {plan.data?.approval_status || 'Approved'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>{isArabic ? 'العدد المطلوب / الفعلي:' : 'Req / Assigned:'}</span>
                            <span className="font-mono font-bold text-white">
                              {plan.data?.required_persons} / {plan.data?.assigned_persons}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 italic">
                            {plan.data?.approving_authority}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Critical Crew Roles */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-100">
                        {isArabic ? 'الرتب البحرية الحرجة (Critical Roles)' : 'Critical Safety Marine Roles'}
                      </h4>
                      <span className="text-xs text-slate-400">{crewRoles.length} {isArabic ? 'رتب مسجلة' : 'roles registered'}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {crewRoles.map(role => (
                        <div key={role.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="font-mono text-[10px] text-cyan-400 font-bold block">{role.rid}</span>
                            <p className="font-semibold text-slate-200">{role.title}</p>
                            <p className="text-[10px] text-slate-400">{role.data?.approved_role_basis}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                            {role.data?.applicability || 'Mandatory'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Crew Onboard Sample */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-100">
                        {isArabic ? 'سجل الطاقم المعين على المتن (Crew Register)' : 'Crew Members Onboard'}
                      </h4>
                      <button
                        onClick={() => onOpenNewRecord('crew_member')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        + {isArabic ? 'تسجيل فرد جديد' : 'Register Member'}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {crewMembers.map(m => (
                        <div
                          key={m.id}
                          className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center font-bold text-xs">
                              {m.title.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-200">{m.title}</p>
                              <p className="text-[10px] text-slate-400">
                                {m.data?.scenario} • {m.data?.shift} • Cabin {m.data?.cabin_number}
                              </p>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold text-[10px]">
                            {m.data?.deployment_approval || 'Approved'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: SPECIALIZED WPS-19 (HELIDECK CAP 437) */}
              {specialTab === 'specialized' && currentWps.rid === 'WPS-19' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Helideck Profile Card */}
                  {helideckProfile && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">
                          {helideckProfile.title}
                        </span>
                        <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                          {helideckProfile.data?.decision_type}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">D-Value</span>
                          <span className="font-mono font-bold text-white text-sm">{helideckProfile.data?.d_value} m</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">MTOW Limit</span>
                          <span className="font-mono font-bold text-white text-sm">{helideckProfile.data?.mtow_tonnes} t</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Foam System</span>
                          <span className="font-semibold text-amber-300 text-xs">DIFFS Automated</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Cert Body</span>
                          <span className="font-semibold text-slate-200 text-xs">HCA / CAA</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 10 Inspection Checks List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        <Plane className="w-4 h-4 text-amber-400" />
                        <span>{isArabic ? 'الفحوصات التفتيشية الدورية للمهبط (10 فحوصات)' : '10 Periodic Helideck Inspection Checks'}</span>
                      </h4>
                      <button
                        onClick={() => onOpenNewRecord('helideck_check')}
                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        + {isArabic ? 'إجراء فحص جديد' : 'New Helideck Check'}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {helideckChecks.map(chk => (
                        <div
                          key={chk.id}
                          className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                            chk.status === 'Compliant'
                              ? 'bg-slate-950 border-slate-800'
                              : 'bg-rose-950/20 border-rose-600/50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-cyan-400">{chk.rid}</span>
                              <span className="font-semibold text-slate-200">{chk.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{chk.description}</p>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              {chk.data?.inspector} • {chk.data?.inspection_date}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {chk.data?.capa_id && (
                              <span className="px-2 py-0.5 text-[10px] rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                                {chk.data.capa_id} Raised
                              </span>
                            )}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                chk.status === 'Compliant'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}
                            >
                              {chk.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: SPECIALIZED WPS-15 (ACCOMMODATION & POB) */}
              {specialTab === 'specialized' && currentWps.rid === 'WPS-15' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Capacity plan summary */}
                  {accomCapacity && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">
                          {accomCapacity.title}
                        </span>
                        <span className="text-xs text-blue-300 font-mono">
                          {accomCapacity.data?.approval_reference}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Total Certified</span>
                          <span className="font-mono font-bold text-white text-sm">250 Berths</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Max POB Limit</span>
                          <span className="font-mono font-bold text-white text-sm">245 Persons</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Hospital Beds</span>
                          <span className="font-mono font-bold text-emerald-400 text-sm">4 Beds</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Isolation Quarantine</span>
                          <span className="font-mono font-bold text-cyan-400 text-sm">2 Rooms</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 10 Checks List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        <Bed className="w-4 h-4 text-blue-400" />
                        <span>{isArabic ? 'فحوصات الإقامة والراحة (10 فحوصات MLC 2006)' : '10 Living Quarters & Hygiene Checks'}</span>
                      </h4>
                      <button
                        onClick={() => onOpenNewRecord('accommodation_check')}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        + {isArabic ? 'إجراء فحص إعاشة' : 'New Accom Check'}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {accomChecks.map(chk => (
                        <div
                          key={chk.id}
                          className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-blue-400">{chk.rid}</span>
                              <span className="font-semibold text-slate-200">{chk.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{chk.description}</p>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              {chk.data?.inspector} • {chk.data?.inspection_date}
                            </span>
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {chk.status}
                          </span>
                        </div>
                      ))}
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

              {/* RULES TAB */}
              {specialTab === 'rules' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-100">
                      {isArabic ? 'القواعد والاشتراطات الهندسية المرتبطة بالحزمة' : 'Governing Rules Linked to this WPS'}
                    </h4>
                  </div>
                  {linkedRules.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center italic">
                      {isArabic ? 'لا توجد قواعد مرتبطة مسجلة.' : 'No rules directly mapped.'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {linkedRules.map(rule => (
                        <div
                          key={rule.id}
                          className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] font-bold text-emerald-400">{rule.rid}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                              {rule.status}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-200">{rule.title}</p>
                          <p className="text-[11px] text-slate-400">{rule.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* EVIDENCE TAB */}
              {specialTab === 'evidence' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-100">
                      {isArabic ? 'الشهادات والأدلة والتقارير الفنية' : 'Certificates & Evidence Documents'}
                    </h4>
                  </div>
                  {linkedEvidence.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center italic">
                      {isArabic ? 'لا توجد أدلة مرفوعة لهذه الحزمة بعد.' : 'No evidence uploaded yet.'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {linkedEvidence.map(ev => (
                        <div
                          key={ev.id}
                          className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                              <FileCheck2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-200">{ev.title}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {ev.data?.file_name} • {ev.data?.issuing_body}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                            Verified Seal
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
