import React, { useState } from 'react';
import { BaseRecord } from '../../types/pms';
import { AlertTriangle, Plus, Search, CheckCircle, Clock, ShieldAlert, ArrowRight } from 'lucide-react';

interface FindingsCapaViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onOpenNewRecord: (entity?: any) => void;
  onSelectRecord: (record: BaseRecord) => void;
  onUpdateStatus: (id: string, newStatus: any) => void;
}

export const FindingsCapaView: React.FC<FindingsCapaViewProps> = ({
  records,
  isArabic,
  onOpenNewRecord,
  onSelectRecord,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const gaps = records.filter(r => r.entity === 'gap');

  const filteredGaps = gaps.filter(g => {
    const sev = g.data?.severity || 'Medium';
    if (filterSeverity !== 'all' && sev.toLowerCase() !== filterSeverity.toLowerCase()) {
      return false;
    }
    const matchesSearch =
      g.rid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (g.data?.root_cause && g.data.root_cause.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              AUDIT & QUALITY ASSURANCE
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>{isArabic ? 'سجل الفجوات وإجراءات التصحيح (Findings & CAPA)' : 'Findings & Corrective Actions Tracker (CAPA)'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'متابعة الملاحظات الفنية وعدم المطابقة، الأسباب الجذرية، وخطط المعالجة المرتبطة بإغلاق البوابات.'
              : 'Managing technical non-conformities, root cause analysis, and corrective/preventive action signoffs.'}
          </p>
        </div>

        <button
          onClick={() => onOpenNewRecord('gap')}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>{isArabic ? 'تسجيل فجوة جديدة +' : '+ Raise Finding'}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'بحث برمز الفجوة، السبب الجذري، أو الإجراء...' : 'Search finding, root cause, or action...'}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">{isArabic ? 'الشدة:' : 'Severity:'}</span>
          {['all', 'critical', 'high', 'medium'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg border capitalize transition-all ${
                filterSeverity === sev
                  ? 'bg-rose-950 text-rose-200 border-rose-700 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {sev === 'all' ? (isArabic ? 'الكل' : 'All') : sev}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredGaps.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs italic">
            {isArabic ? 'لا توجد فجوات مطابقة للبحث المحدد.' : 'No findings found matching criteria.'}
          </div>
        ) : (
          filteredGaps.map(gap => {
            const isClosed = gap.status === 'Closed';
            const severity = gap.data?.severity || 'High';
            return (
              <div
                key={gap.id}
                className={`bg-slate-900 border rounded-2xl p-5 space-y-4 transition-all ${
                  isClosed ? 'border-slate-800 opacity-70' : 'border-rose-900/60 hover:border-rose-500/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-rose-400 px-2.5 py-0.5 rounded bg-slate-950 border border-rose-800">
                      {gap.rid}
                    </span>
                    <h3 className="font-bold text-white text-sm">{gap.title}</h3>
                    {gap.wps_id && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {gap.wps_id}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        severity === 'Critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}
                    >
                      {severity} Severity
                    </span>
                    <select
                      value={gap.status}
                      onChange={e => onUpdateStatus(gap.id, e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs text-slate-300">{gap.description}</p>

                {/* Root Cause & Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-rose-400 block mb-1">
                      {isArabic ? 'السبب الجذري (Root Cause):' : 'Root Cause Statement:'}
                    </span>
                    <p className="text-slate-300 text-[11px]">{gap.data?.root_cause || 'Under investigation'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 block mb-1">
                      {isArabic ? 'الإجراء التصحيحي (Corrective Action):' : 'Corrective Action:'}
                    </span>
                    <p className="text-slate-300 text-[11px]">{gap.data?.corrective_action || 'Planned'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 block mb-1">
                      {isArabic ? 'الإجراء الوقائي (Preventive Action):' : 'Preventive Action:'}
                    </span>
                    <p className="text-slate-300 text-[11px]">{gap.data?.preventive_action || 'In progress'}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                  <div>
                    <span>{isArabic ? 'المسؤول المباشر:' : 'Action Party:'} </span>
                    <span className="text-slate-200 font-medium">{gap.data?.action_party || gap.owner}</span>
                    <span className="mx-2">•</span>
                    <span>{isArabic ? 'بوابة الإغلاق:' : 'Gate:'} </span>
                    <span className="text-cyan-400 font-mono">{gap.data?.closure_gate || 'GATE-1'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400">
                      {isArabic ? 'تاريخ الاستحقاق:' : 'Due:'} {gap.due_date || 'ASAP'}
                    </span>
                    <button
                      onClick={() => onSelectRecord(gap)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                    >
                      {isArabic ? 'تفاصيل كاملة' : 'Full Details'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
