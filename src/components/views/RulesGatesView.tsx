import React, { useState } from 'react';
import { BaseRecord } from '../../types/pms';
import { BookmarkCheck, ShieldCheck, CheckCircle2, Clock, Plus, Search } from 'lucide-react';

interface RulesGatesViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onOpenNewRecord: (entity?: any) => void;
  onSelectRecord: (record: BaseRecord) => void;
}

export const RulesGatesView: React.FC<RulesGatesViewProps> = ({
  records,
  isArabic,
  onOpenNewRecord,
  onSelectRecord
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'gates'>('rules');
  const [searchQuery, setSearchQuery] = useState('');

  const rules = records.filter(r => r.entity === 'rule');
  const gates = records
    .filter(r => r.entity === 'gate')
    .sort((a, b) => (a.data?.gate_number ?? 0) - (b.data?.gate_number ?? 0));

  const filteredRules = rules.filter(r => {
    return (
      r.rid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.wps_id && r.wps_id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              COMPLIANCE & GOVERNANCE
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-emerald-400" />
              <span>{isArabic ? 'سجل القواعد (89 قاعدة) وبوابات الإغلاق' : 'Rules Register (89 Rules) & Closure Gates'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'مصفوفة الاشتراطات الهندسية البحرية الـ 89 وبوابات الجاهزية التشغيلية GATE-0 إلى GATE-5.'
              : 'The 89 statutory marine engineering rules mapped to work packages and milestone readiness gates.'}
          </p>
        </div>

        <button
          onClick={() => onOpenNewRecord(activeTab === 'rules' ? 'rule' : 'gate')}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'rules' ? (isArabic ? 'إضافة قاعدة جديدة +' : '+ New Rule') : (isArabic ? 'إضافة بوابة +' : '+ New Gate')}</span>
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'rules'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>{isArabic ? 'سجل القواعد الـ 89 (Rules)' : '89 Rules Register'} ({rules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gates')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'gates'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isArabic ? 'بوابات الإغلاق (GATE 0 إلى 5)' : 'Milestone Gates (0-5)'} ({gates.length})</span>
        </button>
      </div>

      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isArabic ? 'بحث برقم القاعدة أو حزمة العمل...' : 'Search by rule RID or package...'}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRules.map(rule => (
              <div
                key={rule.id}
                onClick={() => onSelectRecord(rule)}
                className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl cursor-pointer transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {rule.rid}
                    </span>
                    {rule.wps_id && (
                      <span className="font-mono text-[10px] text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                        {rule.wps_id}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      rule.status === 'Compliant'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {rule.status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-200 text-xs">{rule.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">{rule.description}</p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{isArabic ? 'القسم:' : 'Dept:'} {rule.department}</span>
                  <span className="text-cyan-400 font-mono">
                    {rule.data?.closure_gate ? `Closes at ${rule.data.closure_gate}` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'gates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gates.map(gate => {
              const readiness = gate.data?.readiness_score ?? (gate.status === 'Approved' ? 100 : 70);
              return (
                <div
                  key={gate.id}
                  onClick={() => onSelectRecord(gate)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-4 ${
                    gate.status === 'Approved'
                      ? 'bg-slate-900 border-emerald-600/50 shadow-md'
                      : gate.status === 'In Progress'
                      ? 'bg-slate-900 border-cyan-500/60 shadow-md'
                      : 'bg-slate-950 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-extrabold text-cyan-300 px-2 py-0.5 rounded bg-slate-950 border border-slate-700">
                      {gate.rid}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        gate.status === 'Approved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : gate.status === 'In Progress'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-slate-900 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {gate.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm">{gate.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{gate.description}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{isArabic ? 'نسبة الجاهزية التشغيلية:' : 'Readiness Score:'}</span>
                      <span className="font-mono font-bold text-white">{readiness}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          gate.status === 'Approved' ? 'bg-emerald-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${readiness}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                    <span>{gate.data?.approved_by || 'Pending Signoff'}</span>
                    <span className="font-mono text-slate-400">{gate.due_date || 'Target'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
