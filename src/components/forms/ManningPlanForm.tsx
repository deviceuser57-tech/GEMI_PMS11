import React, { useState } from 'react';
import { BaseRecord, ManningPlanData, Department } from '../../types/pms';
import { Users, CheckCircle, ShieldAlert, Printer } from 'lucide-react';

interface ManningPlanFormProps {
  initialRecord?: BaseRecord;
  availableRoles: BaseRecord[];
  onSave: (record: BaseRecord) => void;
  onCancel: () => void;
  isArabic: boolean;
}

export const ManningPlanForm: React.FC<ManningPlanFormProps> = ({
  initialRecord,
  availableRoles,
  onSave,
  onCancel,
  isArabic
}) => {
  const initialData: Partial<ManningPlanData> = initialRecord?.data || {};

  const [scenario, setScenario] = useState<ManningPlanData['scenario']>(initialData.scenario || 'Pipelay Mode');
  const [shift, setShift] = useState<ManningPlanData['shift']>(initialData.shift || 'Total POB');
  const [roleId, setRoleId] = useState(initialData.role_id || (availableRoles[0]?.rid || 'ROLE-01'));
  const [requiredPersons, setRequiredPersons] = useState(initialData.required_persons ?? 6);
  const [assignedPersons, setAssignedPersons] = useState(initialData.assigned_persons ?? 6);
  const [authority, setAuthority] = useState(initialData.approving_authority || 'Egyptian Maritime Safety Authority (EMSA)');
  const [approvalStatus, setApprovalStatus] = useState<ManningPlanData['approval_status']>(initialData.approval_status || 'Approved');

  const hasDeficit = assignedPersons < requiredPersons;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRole = availableRoles.find(r => r.rid === roleId);
    const rid = initialRecord?.rid || `MAN-${Math.floor(100 + Math.random() * 900)}`;

    const effectiveStatus = hasDeficit ? 'Non-Compliant' : approvalStatus === 'Approved' ? 'Compliant' : 'In Progress';

    const record: BaseRecord = {
      id: initialRecord?.id || `rec-${Date.now()}`,
      rid,
      entity: 'manning_plan',
      title: `${selectedRole?.title || 'Watchkeeping Role'} (${scenario})`,
      description: `Minimum safe manning requirements for ${scenario} under ${authority}`,
      wps_id: 'WPS-23',
      department: (selectedRole?.department as Department) || 'Marine',
      status: effectiveStatus,
      owner: 'Barge Master & Marine HR',
      created_at: initialRecord?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      data: {
        scenario,
        shift,
        role_id: roleId,
        role_name: selectedRole?.title || 'Marine Specialist',
        required_persons: Number(requiredPersons),
        assigned_persons: Number(assignedPersons),
        approving_authority: authority,
        approval_status: hasDeficit ? 'Deficit' : approvalStatus
      } as ManningPlanData
    };

    onSave(record);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-sm">
      <div className="bg-slate-900/80 p-4 rounded-xl border border-blue-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-base">
              {isArabic ? 'خطة الحد الأدنى الآمن للمانينج (Manning Plan)' : 'Minimum Safe Manning Requirement Form'}
            </h3>
            <p className="text-xs text-slate-400">
              {isArabic ? 'تحديد الأعداد الإلزامية حسب كل نمط تشغيلي وفق اشتراطات سلطة العلم والعميل' : 'Specify mandatory headcounts per operational mode approved by Flag Administration'}
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs rounded-full bg-blue-950 text-blue-300 border border-blue-800">
          WPS-23 Manning
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'النمط التشغيلي (Operational Scenario) *' : 'Operational Scenario *'}
          </label>
          <select
            value={scenario}
            onChange={e => setScenario(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:border-blue-500"
          >
            <option value="Pipelay Mode">{isArabic ? 'مد الأنابيب بالبحر (Pipelay Mode)' : 'Pipelay Mode'}</option>
            <option value="Transit Mode">{isArabic ? 'الإبحار والقطر البحري (Transit Mode)' : 'Transit Mode'}</option>
            <option value="Anchored / Standby">{isArabic ? 'الرسو والميناء (Anchored / Standby)' : 'Anchored / Standby'}</option>
            <option value="Diving Campaign">{isArabic ? 'حملة الغوص العميق (Diving Campaign)' : 'Diving Campaign'}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'الوردية / التوزيع (Shift)' : 'Shift Coverage'}
          </label>
          <select
            value={shift}
            onChange={e => setShift(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:border-blue-500"
          >
            <option value="Total POB">{isArabic ? 'إجمالي الأفراد على المتن (Total POB)' : 'Total POB'}</option>
            <option value="Day Shift">{isArabic ? 'وردية النهار (Day Shift 12h)' : 'Day Shift'}</option>
            <option value="Night Shift">{isArabic ? 'وردية الليل (Night Shift 12h)' : 'Night Shift'}</option>
            <option value="24h Joint">{isArabic ? 'مشترك على مدار 24 ساعة' : '24h Joint'}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'الرتبة / التخصص المطلوب *' : 'Role / Rank Required *'}
          </label>
          <select
            value={roleId}
            onChange={e => setRoleId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:border-blue-500"
          >
            {availableRoles.map(role => (
              <option key={role.rid} value={role.rid}>
                {role.rid} - {role.title} ({role.department})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'سلطة الاعتماد المرجعية' : 'Approving Authority Basis'}
          </label>
          <input
            type="text"
            value={authority}
            onChange={e => setAuthority(e.target.value)}
            placeholder="Egyptian Maritime Safety Authority / Flag Administration"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'العدد المطلوب المعتمد (Required Minimum) *' : 'Mandatory Required Headcount *'}
          </label>
          <input
            type="number"
            min={1}
            value={requiredPersons}
            onChange={e => setRequiredPersons(parseInt(e.target.value) || 1)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'العدد الفعلي الحالي (Assigned Headcount) *' : 'Currently Assigned Headcount *'}
          </label>
          <input
            type="number"
            min={0}
            value={assignedPersons}
            onChange={e => setAssignedPersons(parseInt(e.target.value) || 0)}
            className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-slate-100 font-mono text-sm ${
              hasDeficit ? 'border-rose-500 bg-rose-950/20' : 'border-slate-700'
            }`}
          />
        </div>
      </div>

      {/* Deficit warning banner */}
      {hasDeficit ? (
        <div className="bg-rose-950/60 border border-rose-600 p-3 rounded-lg flex items-center gap-3 text-rose-300 text-xs">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <p className="font-semibold">
              {isArabic ? 'عجز في الحد الأدنى الآمن للمانينج!' : 'Safe Manning Deficit Detected!'}
            </p>
            <p className="text-[11px] text-rose-300/80">
              {isArabic
                ? `العدد الفعلي (${assignedPersons}) أقل من المطلوب (${requiredPersons}). سيتم وسم السجل بعدم المطابقة وإيقاف إغلاق البوابة حتى تعيين الأفراد المتبقين.`
                : `Assigned headcount (${assignedPersons}) is below mandatory minimum (${requiredPersons}). Blocking Gate signoff.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/50 border border-emerald-600/60 p-3 rounded-lg flex items-center gap-2 text-emerald-300 text-xs">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {isArabic ? 'العدد المخصص يطابق أو يفوق النصاب الإلزامي بنجاح.' : 'Assigned headcount meets mandatory minimum requirements.'}
          </span>
        </div>
      )}

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
            <span>{isArabic ? 'حفظ خطة المانينج' : 'Save Manning Plan'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
