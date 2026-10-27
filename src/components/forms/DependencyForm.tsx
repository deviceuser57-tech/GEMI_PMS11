import React, { useState } from 'react';
import { BaseRecord, DependencyData, DependencyType, Department } from '../../types/pms';
import { GitBranch, CheckCircle, ArrowRight, ShieldCheck, Printer } from 'lucide-react';

interface DependencyFormProps {
  initialRecord?: BaseRecord;
  availableRecords: BaseRecord[];
  onSave: (record: BaseRecord) => void;
  onCancel: () => void;
  isArabic: boolean;
}

export const DependencyForm: React.FC<DependencyFormProps> = ({
  initialRecord,
  availableRecords,
  onSave,
  onCancel,
  isArabic
}) => {
  const initialData: Partial<DependencyData> = initialRecord?.data || {};

  const [predecessorId, setPredecessorId] = useState(initialData.predecessor_id || 'GATE-0');
  const [successorId, setSuccessorId] = useState(initialData.successor_id || 'GATE-1');
  const [relationshipType, setRelationshipType] = useState<DependencyType>(
    initialData.relationship_type || 'Finish-to-Start'
  );
  const [lagDays, setLagDays] = useState(initialData.lag_days ?? 0);
  const [dependencyClass, setDependencyClass] = useState<DependencyData['dependency_class']>(
    initialData.dependency_class || 'Regulatory'
  );
  const [rationale, setRationale] = useState(
    initialData.rationale ||
      'Strict logical and statutory sequence required to prevent premature operational risk.'
  );
  const [isCriticalPath, setIsCriticalPath] = useState(initialData.is_critical_path ?? true);

  const predRecord = availableRecords.find(r => r.rid === predecessorId);
  const succRecord = availableRecords.find(r => r.rid === successorId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rid = initialRecord?.rid || `DEP-${Math.floor(100 + Math.random() * 900)}`;

    const title = `${predecessorId} -> ${successorId} (${relationshipType})`;

    const record: BaseRecord = {
      id: initialRecord?.id || `rec-dep-${Date.now()}`,
      rid,
      entity: 'dependency',
      title,
      description: rationale,
      department: (predRecord?.department || 'Project Management') as Department,
      status: 'Compliant',
      owner: 'Lead Planner & Technical Lead',
      created_at: initialRecord?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      data: {
        predecessor_id: predecessorId,
        successor_id: successorId,
        predecessor_title: predRecord?.title || predecessorId,
        successor_title: succRecord?.title || successorId,
        relationship_type: relationshipType,
        lag_days: Number(lagDays),
        dependency_class: dependencyClass,
        rationale,
        is_critical_path: isCriticalPath
      } as DependencyData
    };

    onSave(record);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-sm">
      <div className="bg-slate-900/80 p-4 rounded-xl border border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-base">
              {isArabic ? 'رابط الاعتمادية والمسار الحرج (Dependencies Linker)' : 'Precedence & Critical Path Linker'}
            </h3>
            <p className="text-xs text-slate-400">
              {isArabic
                ? 'ربط السجلات تتابعياً (FS, SS, FF) لمنع غلق البوابات والمهام دون اكتمال سابقاتها'
                : 'Define predecessor/successor sequencing logic and lag days across 612 dependency rules'}
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs rounded-full bg-purple-950 text-purple-300 border border-purple-800">
          612 Dependencies Network
        </span>
      </div>

      {/* Visual Connection Card */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex-1 bg-slate-950 p-2.5 rounded-lg border border-slate-700">
          <span className="text-[10px] text-slate-400 block mb-0.5">{isArabic ? 'المهمة / البوابة السابقة (Predecessor)' : 'Predecessor (Source)'}</span>
          <span className="font-bold text-cyan-400 font-mono">{predecessorId}</span>
          <p className="text-slate-300 truncate text-[11px] mt-0.5">{predRecord?.title || 'Selected record'}</p>
        </div>

        <div className="flex flex-col items-center justify-center px-2">
          <span className="text-[10px] font-mono text-purple-400 font-bold mb-1">{relationshipType}</span>
          <div className="flex items-center gap-1 text-slate-500">
            <div className="w-6 h-0.5 bg-purple-500/40" />
            <ArrowRight className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1">+{lagDays} {isArabic ? 'أيام تأخير' : 'Lag Days'}</span>
        </div>

        <div className="flex-1 bg-slate-950 p-2.5 rounded-lg border border-slate-700">
          <span className="text-[10px] text-slate-400 block mb-0.5">{isArabic ? 'المهمة / البوابة اللاحقة (Successor)' : 'Successor (Target)'}</span>
          <span className="font-bold text-emerald-400 font-mono">{successorId}</span>
          <p className="text-slate-300 truncate text-[11px] mt-0.5">{succRecord?.title || 'Selected record'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'السجل السابق (Predecessor Record) *' : 'Predecessor Record *'}
          </label>
          <select
            value={predecessorId}
            onChange={e => setPredecessorId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:border-purple-500 font-mono"
          >
            {availableRecords.map(r => (
              <option key={r.rid} value={r.rid}>
                [{r.rid}] {r.title} ({r.entity})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'السجل اللاحق (Successor Record) *' : 'Successor Record *'}
          </label>
          <select
            value={successorId}
            onChange={e => setSuccessorId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:border-purple-500 font-mono"
          >
            {availableRecords.map(r => (
              <option key={r.rid} value={r.rid}>
                [{r.rid}] {r.title} ({r.entity})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'نوع العلاقة التتابعية (Dependency Type) *' : 'Relationship Type *'}
          </label>
          <select
            value={relationshipType}
            onChange={e => setRelationshipType(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:border-purple-500"
          >
            <option value="Finish-to-Start">Finish-to-Start (FS) - انتهاء السابق قبل بدء اللاحق</option>
            <option value="Start-to-Start">Start-to-Start (SS) - تزامن البدء معاً</option>
            <option value="Finish-to-Finish">Finish-to-Finish (FF) - تزامن الانتهاء معاً</option>
            <option value="Start-to-Finish">Start-to-Finish (SF)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'فترة التأخير (Lag Days)' : 'Lag Days (Delay)'}
          </label>
          <input
            type="number"
            min={0}
            value={lagDays}
            onChange={e => setLagDays(parseInt(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'تصنيف الاعتمادية (Dependency Class)' : 'Dependency Class'}
          </label>
          <select
            value={dependencyClass}
            onChange={e => setDependencyClass(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:border-purple-500"
          >
            <option value="Regulatory">{isArabic ? 'تنظيمي / تشريعي إلزامي (Regulatory)' : 'Regulatory'}</option>
            <option value="Safety Critical">{isArabic ? 'حرج للسلامة البحرية (Safety Critical)' : 'Safety Critical'}</option>
            <option value="Operational">{isArabic ? 'تشغيلي ميداني (Operational)' : 'Operational'}</option>
            <option value="Logical">{isArabic ? 'منطقي هندسي (Logical)' : 'Logical'}</option>
          </select>
        </div>

        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-700 w-full">
            <input
              type="checkbox"
              checked={isCriticalPath}
              onChange={e => setIsCriticalPath(e.target.checked)}
              className="rounded bg-slate-950 border-slate-600 text-purple-500 focus:ring-0"
            />
            <span className="font-semibold text-purple-300">
              {isArabic ? 'يقع على المسار الحرج (Critical Path Link)' : 'Critical Path Link'}
            </span>
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'التبرير الفني والمنطقي للرابط (Technical Rationale) *' : 'Technical Rationale *'}
          </label>
          <textarea
            rows={2}
            required
            value={rationale}
            onChange={e => setRationale(e.target.value)}
            placeholder="Explain why this successor cannot proceed without predecessor completion..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:border-purple-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800 no-print">
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg border border-amber-800/80 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>{isArabic ? 'طباعة النموذج' : 'Print Form'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium"
          >
            {isArabic ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isArabic ? 'حفظ رابط الاعتمادية' : 'Save Precedence Link'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
