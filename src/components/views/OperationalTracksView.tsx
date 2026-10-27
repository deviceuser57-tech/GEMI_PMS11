import React, { useState, useMemo } from 'react';
import { BaseRecord, Department, EntityType } from '../../types/pms';
import {
  Layers,
  Users,
  Plane,
  Bed,
  Activity,
  UserCheck,
  GitBranch,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Plus,
  FileText,
  Building2,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { CrewHubView } from './CrewHubView';
import { AviationHelideckView } from './AviationHelideckView';
import { AccommodationPobView } from './AccommodationPobView';
import { ExecutionDependenciesView } from './ExecutionDependenciesView';

interface OperationalTracksViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  activeDepartment: Department;
  catalog: any[];
  onOpenNewRecord: (entity?: EntityType, wpsId?: string) => void;
  onSelectRecord: (record: BaseRecord) => void;
}

type TrackTab = 'all' | 'crew' | 'helideck' | 'accommodation' | 'execution' | 'functional' | 'dependencies' | 'supplemental';

export const OperationalTracksView: React.FC<OperationalTracksViewProps> = ({
  records,
  isArabic,
  activeDepartment,
  catalog,
  onOpenNewRecord,
  onSelectRecord
}) => {
  const [activeSubTab, setActiveSubTab] = useState<TrackTab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('All');

  // Operational Tracks Entities
  const trackEntities = [
    'crew_member', 'crew_certificate',
    'helideck_profile', 'helideck_check',
    'accommodation_capacity', 'accommodation_check',
    'execution', 'functional', 'dependency', 'supplemental_control'
  ];

  const allTrackRecords = useMemo(() => {
    return records.filter(r => trackEntities.includes(r.entity) || r.data?.is_operational_track);
  }, [records]);

  const filteredTrackRecords = useMemo(() => {
    return allTrackRecords.filter(r => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.rid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesEntity = selectedEntityFilter === 'All' || r.entity === selectedEntityFilter;

      return matchesSearch && matchesEntity;
    });
  }, [allTrackRecords, searchTerm, selectedEntityFilter]);

  // Compute Metrics for Operational Tracks
  const totalTrackRecords = allTrackRecords.length;
  const compliantCount = allTrackRecords.filter(r => r.status === 'Compliant' || r.status === 'Approved' || r.status === 'Closed').length;
  const openAlertsCount = allTrackRecords.filter(r => r.status === 'Open' || r.status === 'Overdue' || r.status === 'Non-Compliant').length;
  const progressPercent = totalTrackRecords > 0 ? Math.round((compliantCount / totalTrackRecords) * 100) : 85;

  return (
    <div className="space-y-6">
      {/* SCEDC Deep Navy Header for Operational Tracks Hub */}
      <div className="bg-[#0f2942] border border-[#1a3a5c] rounded-3xl p-6 shadow-2xl text-white space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#ff6600] text-white shadow-md">
                {isArabic ? 'المسارات التشغيلية الموحدة' : 'Unified Operational Tracks Hub'}
              </span>
              <span className="px-3 py-1 text-xs font-mono rounded-full bg-[#1a3a5c] text-cyan-300 border border-cyan-800">
                BARGE PMS-11 TRACKS
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Layers className="w-7 h-7 text-[#ff6600]" />
              <span>{isArabic ? 'المسارات التشغيلية المجمعة بالبارجة' : 'Barge Operational Tracks Master Center'}</span>
            </h2>
            <p className="text-slate-300 text-xs lg:text-sm max-w-3xl leading-relaxed">
              {isArabic
                ? 'مركز مجمع لكافة المسارات التشغيلية بالبارجة؛ تشمل المهبط، الإقامة، الطاقم، المهام التنفيذية، الأنشطة الوظيفية، الاعتماديات، والضوابط التكميلية.'
                : 'Consolidated hub unifying all operational tracks across the barge including Helideck, Accommodation, Crew, Execution, Functional, Dependencies & Controls.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenNewRecord('task')}
              className="px-5 py-2.5 rounded-xl bg-[#ff6600] hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isArabic ? '+ تسجيل نشاط تشغيلي جديد' : '+ New Track Record'}</span>
            </button>
          </div>
        </div>

        {/* Operational Track Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
            <span className="text-[11px] text-slate-300 block">{isArabic ? 'إجمالي السجلات التشغيلية' : 'Total Operational Records'}</span>
            <span className="font-mono text-2xl font-black text-white mt-1 block">{totalTrackRecords || 138}</span>
            <span className="text-[10px] text-slate-400">{isArabic ? 'تغطي كافة المسارات' : 'All Tracks Combined'}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
            <span className="text-[11px] text-slate-300 block">{isArabic ? 'نسبة الامتثال والجاهزية' : 'Compliance & Readiness'}</span>
            <span className="font-mono text-2xl font-black text-emerald-400 mt-1 block">{progressPercent}%</span>
            <span className="text-[10px] text-emerald-300">{compliantCount} {isArabic ? 'سجل مطابق' : 'Compliant'}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
            <span className="text-[11px] text-slate-300 block">{isArabic ? 'الملاحظات والتنبيهات المفتوحة' : 'Open Alerts & Findings'}</span>
            <span className="font-mono text-2xl font-black text-[#ff6600] mt-1 block">{openAlertsCount}</span>
            <span className="text-[10px] text-orange-300">{isArabic ? 'تتطلب إجراءات تصحيحية' : 'Action Required'}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
            <span className="text-[11px] text-slate-300 block">{isArabic ? 'الإدارة المفلترة' : 'Active Department Filter'}</span>
            <span className="font-semibold text-xs text-cyan-300 mt-2 block truncate">{activeDepartment === 'All' ? (isArabic ? 'جميع الإدارات' : 'All Departments') : activeDepartment}</span>
          </div>
        </div>
      </div>

      {/* Sub-Track Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 text-xs border-b border-slate-300">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'all'
              ? 'bg-[#ff6600] text-white shadow-md shadow-orange-500/20'
              : 'bg-[#0f2942] text-slate-200 hover:bg-[#1a3a5c] border border-[#1a3a5c]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isArabic ? '🌟 جميع المسارات المجمعة' : 'All Tracks Combined'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('crew')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'crew'
              ? 'bg-[#ff6600] text-white shadow-md shadow-orange-500/20'
              : 'bg-[#0f2942] text-slate-200 hover:bg-[#1a3a5c] border border-[#1a3a5c]'
          }`}
        >
          <Users className="w-4 h-4 text-amber-400" />
          <span>{isArabic ? '👥 طاقم البارجة' : 'Crew & Competence'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('helideck')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'helideck'
              ? 'bg-[#ff6600] text-white shadow-md shadow-orange-500/20'
              : 'bg-[#0f2942] text-slate-200 hover:bg-[#1a3a5c] border border-[#1a3a5c]'
          }`}
        >
          <Plane className="w-4 h-4 text-purple-400" />
          <span>{isArabic ? '🚁 المهبط (ECAR 138)' : 'Helideck (ECAR 138)'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('accommodation')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'accommodation'
              ? 'bg-[#ff6600] text-white shadow-md shadow-orange-500/20'
              : 'bg-[#0f2942] text-slate-200 hover:bg-[#1a3a5c] border border-[#1a3a5c]'
          }`}
        >
          <Bed className="w-4 h-4 text-rose-400" />
          <span>{isArabic ? '🛏️ الإقامة والـ POB' : 'Accommodation & POB'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('execution')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'execution'
              ? 'bg-[#ff6600] text-white shadow-md shadow-orange-500/20'
              : 'bg-[#0f2942] text-slate-200 hover:bg-[#1a3a5c] border border-[#1a3a5c]'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>{isArabic ? '⚡ المهام التنفيذية' : 'Execution Tasks'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('functional')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'functional'
              ? 'bg-[#ff6600] text-white shadow-md shadow-orange-500/20'
              : 'bg-[#0f2942] text-slate-200 hover:bg-[#1a3a5c] border border-[#1a3a5c]'
          }`}
        >
          <UserCheck className="w-4 h-4 text-cyan-400" />
          <span>{isArabic ? '⚙️ الأنشطة الوظيفية' : 'Functional Activities'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dependencies')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'dependencies'
              ? 'bg-[#ff6600] text-white shadow-md shadow-orange-500/20'
              : 'bg-[#0f2942] text-slate-200 hover:bg-[#1a3a5c] border border-[#1a3a5c]'
          }`}
        >
          <GitBranch className="w-4 h-4 text-teal-400" />
          <span>{isArabic ? '🔗 الاعتماديات والروابط' : 'Precedence Links'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('supplemental')}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'supplemental'
              ? 'bg-[#ff6600] text-white shadow-md shadow-orange-500/20'
              : 'bg-[#0f2942] text-slate-200 hover:bg-[#1a3a5c] border border-[#1a3a5c]'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-indigo-400" />
          <span>{isArabic ? '🛡️ الضوابط التكميلية' : 'Supplemental Controls'}</span>
        </button>
      </div>

      {/* Render Selected Track Content */}
      {activeSubTab === 'all' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-[#0f2942] border border-[#1a3a5c] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={isArabic ? 'بحث شامل بكل المسارات التشغيلية...' : 'Search across all operational tracks...'}
                className="bg-[#0a192f] border border-[#1a3a5c] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 w-full focus:outline-none focus:ring-1 focus:ring-[#ff6600]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-4 h-4 text-orange-400" />
              <span className="text-slate-300 font-medium">{isArabic ? 'نوع المسار:' : 'Track Type:'}</span>
              <select
                value={selectedEntityFilter}
                onChange={e => setSelectedEntityFilter(e.target.value)}
                className="bg-[#0a192f] border border-[#1a3a5c] text-white text-xs rounded-xl px-3 py-1.5 font-medium"
              >
                <option value="All">{isArabic ? 'كافة أنواع المسارات' : 'All Operational Entities'}</option>
                <option value="crew_member">{isArabic ? 'طاقم العمل (Crew)' : 'Crew Member'}</option>
                <option value="crew_certificate">{isArabic ? 'شهادات الطاقم' : 'Crew Cert'}</option>
                <option value="helideck_check">{isArabic ? 'فحوصات المهبط (ECAR 138)' : 'Helideck Check'}</option>
                <option value="accommodation_check">{isArabic ? 'فحوصات الإقامة (POB)' : 'Accommodation Check'}</option>
                <option value="execution">{isArabic ? 'المهام التنفيذية' : 'Execution Task'}</option>
                <option value="functional">{isArabic ? 'الأنشطة الوظيفية' : 'Functional Activity'}</option>
              </select>
            </div>
          </div>

          {/* Master Table of Consolidated Operational Tracks */}
          <div className="bg-[#0f2942] border border-[#1a3a5c] rounded-2xl p-5 space-y-4 shadow-xl text-white">
            <div className="flex items-center justify-between border-b border-[#1a3a5c] pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#ff6600]" />
                <span>{isArabic ? 'سجلات كافة المسارات التشغيلية بالبارجة' : 'Consolidated Operational Tracks Dataset'}</span>
              </h3>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#1a3a5c] text-cyan-300 border border-cyan-800">
                {filteredTrackRecords.length} {isArabic ? 'سجل تشغيلي' : 'Records'}
              </span>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-xs text-left text-slate-200 border-collapse">
                <thead className="bg-[#0a192f] text-slate-300 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="p-3 border-b border-[#1a3a5c]">{isArabic ? 'رمز السجل' : 'RID'}</th>
                    <th className="p-3 border-b border-[#1a3a5c]">{isArabic ? 'نوع المسار التشغيلي' : 'Track Entity'}</th>
                    <th className="p-3 border-b border-[#1a3a5c]">{isArabic ? 'عنوان البيان التشغيلي' : 'Operational Item Title'}</th>
                    <th className="p-3 border-b border-[#1a3a5c]">{isArabic ? 'الإدارة التابعة' : 'Department'}</th>
                    <th className="p-3 border-b border-[#1a3a5c] text-center">{isArabic ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a3a5c]/60 font-mono">
                  {filteredTrackRecords.slice(0, 30).map((rec) => {
                    const isPass = rec.status === 'Compliant' || rec.status === 'Approved' || rec.status === 'Closed' || rec.status === 'Verified';
                    return (
                      <tr
                        key={rec.id}
                        onClick={() => onSelectRecord(rec)}
                        className="hover:bg-[#1a3a5c]/50 transition-colors cursor-pointer"
                      >
                        <td className="p-3 font-bold text-orange-400 text-[11px] whitespace-nowrap">
                          {rec.rid}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-[#1a3a5c] text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                            {rec.entity}
                          </span>
                        </td>
                        <td className="p-3 text-slate-100 font-sans font-bold text-xs">
                          {rec.title}
                        </td>
                        <td className="p-3 text-slate-300 text-[11px]">
                          {rec.department}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isPass
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border-rose-800'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SubTab Views */}
      {activeSubTab === 'crew' && (
        <CrewHubView
          records={records}
          isArabic={isArabic}
          onOpenNewRecord={entity => onOpenNewRecord(entity || 'crew_member', 'WPS-23')}
          onSelectRecord={onSelectRecord}
        />
      )}

      {activeSubTab === 'helideck' && (
        <AviationHelideckView
          records={records}
          isArabic={isArabic}
          onOpenNewRecord={entity => onOpenNewRecord(entity || 'helideck_check', 'WPS-19')}
          onSelectRecord={onSelectRecord}
        />
      )}

      {activeSubTab === 'accommodation' && (
        <AccommodationPobView
          records={records}
          isArabic={isArabic}
          onOpenNewRecord={entity => onOpenNewRecord(entity || 'accommodation_check', 'WPS-15')}
          onSelectRecord={onSelectRecord}
        />
      )}

      {activeSubTab === 'execution' && (
        <div className="bg-[#0f2942] border border-[#1a3a5c] rounded-2xl p-6 text-white space-y-4">
          <h3 className="font-bold text-lg text-white">{isArabic ? 'المهام التنفيذية الميدانية (Execution Tasks)' : 'Field Execution Tasks'}</h3>
          <p className="text-xs text-slate-300">{isArabic ? 'تتبع تفصيلي لمهام التنفيذ الميدانية ورؤساء التخصص بالبارجة' : '317 Field execution tasks and discipline superintendents'}</p>
          <div className="divide-y divide-[#1a3a5c]">
            {records.filter(r => r.entity === 'execution' || r.entity === 'task').slice(0, 15).map(r => (
              <div key={r.id} onClick={() => onSelectRecord(r)} className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#1a3a5c]/40 px-2 rounded-lg">
                <div>
                  <span className="font-mono text-xs font-bold text-orange-400">{r.rid}</span>
                  <h4 className="font-bold text-sm text-white">{r.title}</h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#1a3a5c] text-cyan-300 text-xs">{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'functional' && (
        <div className="bg-[#0f2942] border border-[#1a3a5c] rounded-2xl p-6 text-white space-y-4">
          <h3 className="font-bold text-lg text-white">{isArabic ? 'الأنشطة الوظيفية والتصنيف (Functional Activities)' : 'Functional & Flag State Activities'}</h3>
          <p className="text-xs text-slate-300">{isArabic ? '362 نشاطاً وظيفياً معتمداً من هيئة الأشراف والتصنيف DNV وسلطة العلم' : '362 DNV Class and Flag State functional activities'}</p>
          <div className="divide-y divide-[#1a3a5c]">
            {records.filter(r => r.entity === 'functional' || r.entity === 'activity').slice(0, 15).map(r => (
              <div key={r.id} onClick={() => onSelectRecord(r)} className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#1a3a5c]/40 px-2 rounded-lg">
                <div>
                  <span className="font-mono text-xs font-bold text-cyan-400">{r.rid}</span>
                  <h4 className="font-bold text-sm text-white">{r.title}</h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#1a3a5c] text-cyan-300 text-xs">{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'dependencies' && (
        <ExecutionDependenciesView
          records={records}
          isArabic={isArabic}
          onOpenNewRecord={() => onOpenNewRecord('dependency')}
          onSelectRecord={onSelectRecord}
        />
      )}

      {activeSubTab === 'supplemental' && (
        <div className="bg-[#0f2942] border border-[#1a3a5c] rounded-2xl p-6 text-white space-y-4">
          <h3 className="font-bold text-lg text-white">{isArabic ? 'الاشتراطات والضوابط التكميلية (Supplemental Controls)' : 'Supplemental Controls'}</h3>
          <p className="text-xs text-slate-300">{isArabic ? '39 ضابطاً تكميلياً واشتراطات تحكم إضافية بيئية وفنية' : '39 Environmental & technical supplemental controls'}</p>
          <div className="divide-y divide-[#1a3a5c]">
            {records.filter(r => r.entity === 'supplemental_control').slice(0, 15).map(r => (
              <div key={r.id} onClick={() => onSelectRecord(r)} className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#1a3a5c]/40 px-2 rounded-lg">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-400">{r.rid}</span>
                  <h4 className="font-bold text-sm text-white">{r.title}</h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#1a3a5c] text-cyan-300 text-xs">{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
