import React, { useState } from 'react';
import { BaseRecord, EntityType, Department, RecordStatus } from '../../types/pms';
import { Layers, CheckCircle } from 'lucide-react';

interface GenericRecordFormProps {
  initialRecord?: BaseRecord;
  defaultEntity?: EntityType;
  availableWps: BaseRecord[];
  onSave: (record: BaseRecord) => void;
  onCancel: () => void;
  isArabic: boolean;
}

export const GenericRecordForm: React.FC<GenericRecordFormProps> = ({
  initialRecord,
  defaultEntity = 'task',
  availableWps,
  onSave,
  onCancel,
  isArabic
}) => {
  const [rid, setRid] = useState(initialRecord?.rid || '');
  const [entity, setEntity] = useState<EntityType>(initialRecord?.entity || defaultEntity);
  const [title, setTitle] = useState(initialRecord?.title || '');
  const [description, setDescription] = useState(initialRecord?.description || '');
  const [wpsId, setWpsId] = useState(initialRecord?.wps_id || 'WPS-01');
  const [department, setDepartment] = useState<Department>(initialRecord?.department || 'Marine');
  const [status, setStatus] = useState<RecordStatus>(initialRecord?.status || 'Draft');
  const [owner, setOwner] = useState(initialRecord?.owner || 'Superintendent');
  const [dueDate, setDueDate] = useState(initialRecord?.due_date || '');
  const [currency, setCurrency] = useState(initialRecord?.data?.currency || 'USD');
  const [costAmount, setCostAmount] = useState(initialRecord?.data?.cost_amount || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRid = rid.trim() || `${entity.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const record: BaseRecord = {
      id: initialRecord?.id || `rec-${Date.now()}`,
      rid: finalRid,
      entity,
      title,
      description,
      wps_id: wpsId,
      department,
      status,
      owner,
      due_date: dueDate || undefined,
      created_at: initialRecord?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      data: { ...initialRecord?.data, currency, cost_amount: Number(costAmount) }
    };

    onSave(record);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-base">
              {initialRecord
                ? isArabic ? `تعديل السجل [${initialRecord.rid}]` : `Edit Record [${initialRecord.rid}]`
                : isArabic ? 'إضافة سجل تشغيلي جديد' : 'New Operational Record'}
            </h3>
            <p className="text-xs text-slate-400">
              {isArabic ? 'إدخال البيانات الرسمية لحلقات الإغلاق وحزم العمل' : 'Enter official operational and closure loop data'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            {isArabic ? 'نوع الكيان (Entity Type) *' : 'Entity Type *'}
          </label>
          <select
            value={entity}
            onChange={e => setEntity(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
          >
            <option value="task">{isArabic ? 'مهمة ميدانية (Task)' : 'Task'}</option>
            <option value="execution">{isArabic ? 'مهمة تنفيذية (Execution)' : 'Execution'}</option>
            <option value="rule">{isArabic ? 'قاعدة اشتراطية (Rule)' : 'Rule'}</option>
            <option value="gate">{isArabic ? 'بوابة إغلاق (Gate)' : 'Gate'}</option>
            <option value="gap">{isArabic ? 'فجوة / عدم مطابقة (Finding / GAP)' : 'Finding / GAP'}</option>
            <option value="wps">{isArabic ? 'حزمة عمل (WPS)' : 'Work Package (WPS)'}</option>
            <option value="deliverable">{isArabic ? 'مخرج معتمد (Deliverable)' : 'Deliverable'}</option>
            <option value="evidence">{isArabic ? 'دليل ثبوتي (Evidence)' : 'Evidence'}</option>
            <option value="risk">{isArabic ? 'خطر تشغيلي (Risk)' : 'Risk'}</option>
            <option value="source">{isArabic ? 'مرجع تشريعي (Source)' : 'Source'}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            {isArabic ? 'معرف السجل (Record ID - RID)' : 'Record ID (RID)'}
          </label>
          <input
            type="text"
            value={rid}
            onChange={e => setRid(e.target.value)}
            placeholder="e.g. T-042 / R-089 / GATE-2 (Auto if empty)"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm font-mono"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            {isArabic ? 'عنوان السجل (Record Title) *' : 'Title *'}
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title or description of the operational requirement"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            {isArabic ? 'الوصف والتفاصيل الهندسية' : 'Description & Scope'}
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            {isArabic ? 'حزمة العمل التابعة (Work Package)' : 'Work Package (WPS)'}
          </label>
          <select
            value={wpsId}
            onChange={e => setWpsId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
          >
            {availableWps.map(w => (
              <option key={w.rid} value={w.rid}>
                {w.rid}: {w.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            {isArabic ? 'القسم المسؤول (Department)' : 'Department'}
          </label>
          <select
            value={department}
            onChange={e => setDepartment(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
          >
            <option value="Marine">Marine</option>
            <option value="Technical & Maintenance">Technical & Maintenance</option>
            <option value="HSE & Safety">HSE & Safety</option>
            <option value="Diving Operations">Diving Operations</option>
            <option value="Pipelay Operations">Pipelay Operations</option>
            <option value="Catering & Accommodation">Catering & Accommodation</option>
            <option value="Aviation & Helideck">Aviation & Helideck</option>
            <option value="QA/QC">QA/QC</option>
            <option value="Project Management">Project Management</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            {isArabic ? 'الحالة التشغيلية (Status)' : 'Status'}
          </label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
          >
            <option value="OPEN">OPEN / مفتوحة</option>
            <option value="In Progress">In Progress / قيد التنفيذ</option>
            <option value="Under Review">Under Review / قيد المراجعة</option>
            <option value="Compliant">Compliant / Pass (مطابقة)</option>
            <option value="Approved">Approved / معتمدة</option>
            <option value="Verified">Verified / محققة</option>
            <option value="Non-Compliant">Non-Compliant / Fail</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Closed">Closed / مغلقة</option>
            <option value="Draft">Draft / مسودة</option>
          </select>
        </div>

        {entity === 'wps' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {isArabic ? 'العملة (Currency)' : 'Currency'}
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="EGP">EGP</option>
                  <option value="SAR">SAR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {isArabic ? 'القيمة التقديرية (Amount)' : 'Cost Amount'}
                </label>
                <input
                  type="number"
                  value={costAmount}
                  onChange={e => setCostAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
                />
              </div>
            </>
        )}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            {isArabic ? 'المسؤول المباشر (Owner)' : 'Owner'}
          </label>
          <input
            type="text"
            value={owner}
            onChange={e => setOwner(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            {isArabic ? 'تاريخ الاستحقاق (Due Date)' : 'Due Date'}
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium"
        >
          {isArabic ? 'إلغاء' : 'Cancel'}
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md shadow-cyan-600/20 flex items-center gap-1.5"
        >
          <CheckCircle className="w-4 h-4" />
          {isArabic ? 'حفظ السجل' : 'Save Record'}
        </button>
      </div>
    </form>
  );
};
