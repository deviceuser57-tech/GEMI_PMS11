import React, { useState } from 'react';
import { BaseRecord, DependencyData } from '../../types/pms';
import { GitBranch, Activity, ArrowRight, Plus, Search, ShieldAlert, CheckCircle } from 'lucide-react';

interface ExecutionDependenciesViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onOpenNewRecord: (entity?: any) => void;
  onSelectRecord: (record: BaseRecord) => void;
}

export const ExecutionDependenciesView: React.FC<ExecutionDependenciesViewProps> = ({
  records,
  isArabic,
  onOpenNewRecord,
  onSelectRecord
}) => {
  const [activeTab, setActiveTab] = useState<'dependencies' | 'execution'>('dependencies');
  const [searchQuery, setSearchQuery] = useState('');
  const [criticalOnly, setCriticalOnly] = useState(false);

  const dependencies = records.filter(r => r.entity === 'dependency');
  const executionTasks = records.filter(r => r.entity === 'execution' || r.entity === 'task');

  const filteredDeps = dependencies.filter(d => {
    const data: DependencyData = d.data as any;
    if (criticalOnly && !data.is_critical_path) return false;
    const matchesSearch =
      d.rid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (data.predecessor_id && data.predecessor_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (data.successor_id && data.successor_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (data.rationale && data.rationale.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              NETWORK LOGIC TRACK
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-purple-400" />
              <span>{isArabic ? 'شبكة الاعتماديات والمهام التنفيذية (Dependencies & Execution)' : 'Dependencies Precedence & Execution Tasks'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'متابعة الـ 612 رابط اعتمادية تتابعية (FS, SS, FF) والـ 317 مهمة ميدانية لمنع كسر التتابع المنطقي وإغلاق البوابات دون اكتمال سابقاتها.'
              : 'Managing the 612 dependency logic links (Finish-to-Start, Lag days) and 317 field execution tasks.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenNewRecord('dependency')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>{isArabic ? 'ربط اعتمادية جديدة +' : '+ Add Dependency'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('dependencies')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'dependencies'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>{isArabic ? 'شبكة الاعتماديات والمسار الحرج (612 رابط)' : 'Dependencies & Critical Path (612)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('execution')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'execution'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{isArabic ? 'المهام التنفيذية الميدانية (317 مهمة)' : 'Execution & Field Tasks (317)'}</span>
        </button>
      </div>

      {/* TAB 1: DEPENDENCIES */}
      {activeTab === 'dependencies' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'بحث برمز السابق، اللاحق، أو التبرير...' : 'Search predecessor, successor, rationale...'}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-200"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <input
                type="checkbox"
                checked={criticalOnly}
                onChange={e => setCriticalOnly(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-purple-500 focus:ring-0"
              />
              <span>{isArabic ? 'المسار الحرج فقط (Critical Path)' : 'Critical Path Only'}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeps.map(dep => {
              const data: DependencyData = dep.data as any;
              return (
                <div
                  key={dep.id}
                  onClick={() => onSelectRecord(dep)}
                  className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-4 rounded-xl cursor-pointer transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-purple-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {dep.rid}
                    </span>
                    {data.is_critical_path && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        Critical Path
                      </span>
                    )}
                  </div>

                  {/* Visual Node Flow */}
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2 text-xs">
                    <div className="text-center flex-1">
                      <span className="font-mono font-bold text-cyan-400 block">{data.predecessor_id}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{data.predecessor_title || 'Previous'}</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-mono font-bold text-purple-400">{data.relationship_type}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-400 my-0.5" />
                      <span className="text-[9px] text-slate-500">+{data.lag_days}d</span>
                    </div>

                    <div className="text-center flex-1">
                      <span className="font-mono font-bold text-emerald-400 block">{data.successor_id}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{data.successor_title || 'Next'}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    {data.rationale}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{isArabic ? 'التصنيف:' : 'Class:'} {data.dependency_class}</span>
                    <span className="text-emerald-400 font-semibold">{dep.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: EXECUTION TASKS */}
      {activeTab === 'execution' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-100">
              {isArabic ? 'سجل المهام التنفيذية الميدانية (317 مهمة)' : 'Field Execution Tasks Register'}
            </h4>
            <button
              onClick={() => onOpenNewRecord('task')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              + {isArabic ? 'إضافة مهمة ميدانية' : 'New Task'}
            </button>
          </div>

          <div className="space-y-2">
            {executionTasks.map(task => (
              <div
                key={task.id}
                onClick={() => onSelectRecord(task)}
                className="p-3 bg-slate-900 hover:bg-slate-800/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {task.rid}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-200">{task.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {task.wps_id ? `[${task.wps_id}]` : ''} {task.department} • {task.owner}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{task.due_date || 'Due soon'}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
