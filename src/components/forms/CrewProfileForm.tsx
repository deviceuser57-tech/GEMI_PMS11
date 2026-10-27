import React, { useState } from 'react';
import { BaseRecord, CrewMemberData, CrewCertificateData, Department } from '../../types/pms';
import { User, Award, Calendar, FileText, Upload, AlertTriangle, CheckCircle, ShieldCheck, Printer } from 'lucide-react';

interface CrewProfileFormProps {
  initialRecord?: BaseRecord;
  availableRoles: BaseRecord[];
  onSave: (memberRecord: BaseRecord, certRecord?: BaseRecord) => void;
  onCancel: () => void;
  isArabic: boolean;
}

export const CrewProfileForm: React.FC<CrewProfileFormProps> = ({
  initialRecord,
  availableRoles,
  onSave,
  onCancel,
  isArabic
}) => {
  const initialData: Partial<CrewMemberData> = initialRecord?.data || {};

  const [fullName, setFullName] = useState(initialData.full_name || initialRecord?.title || '');
  const [nationalId, setNationalId] = useState(initialData.national_id_or_passport || '');
  const [roleId, setRoleId] = useState(initialData.role_id || (availableRoles[0]?.rid || 'ROLE-01'));
  const [scenario, setScenario] = useState<CrewMemberData['scenario']>(initialData.scenario || 'Pipelay Mode');
  const [shift, setShift] = useState<CrewMemberData['shift']>(initialData.shift || 'Day Shift (12h)');
  const [cabinNumber, setCabinNumber] = useState(initialData.cabin_number || 'C-10');
  const [bloodType, setBloodType] = useState(initialData.blood_type || 'O+');
  const [emergencyStation, setEmergencyStation] = useState(initialData.emergency_station || 'Lifeboat Station 1');
  const [deploymentApproval, setDeploymentApproval] = useState<CrewMemberData['deployment_approval']>(initialData.deployment_approval || 'Approved');

  // Certificate sub-form
  const [includeCert, setIncludeCert] = useState(true);
  const [certType, setCertType] = useState('STCW II/2 Master Mariner');
  const [certNumber, setCertNumber] = useState('');
  const [issuer, setIssuer] = useState('Egyptian Maritime Safety Authority');
  const [issueDate, setIssueDate] = useState('2024-01-15');
  const [expiryDate, setExpiryDate] = useState('2027-01-15');
  const [fileName, setFileName] = useState('');

  // Calculate certificate expiry badge
  const calculateDaysRemaining = (expStr: string) => {
    if (!expStr) return 999;
    const diff = new Date(expStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = calculateDaysRemaining(expiryDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRole = availableRoles.find(r => r.rid === roleId);
    const rid = initialRecord?.rid || `CRW-${Math.floor(100 + Math.random() * 900)}`;

    const memberRecord: BaseRecord = {
      id: initialRecord?.id || `rec-${Date.now()}`,
      rid,
      entity: 'crew_member',
      title: `${fullName} - ${selectedRole?.title?.split('-')[0] || 'Crew Member'}`,
      description: `Offshore Crew Member registered for ${scenario} (${shift})`,
      wps_id: 'WPS-23',
      department: (selectedRole?.department as Department) || 'Marine',
      status: deploymentApproval === 'Approved' ? 'Approved' : 'Pending Verification',
      owner: fullName,
      created_at: initialRecord?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      data: {
        full_name: fullName,
        national_id_or_passport: nationalId,
        role_id: roleId,
        role_title: selectedRole?.title || 'Marine Specialist',
        scenario,
        shift,
        is_available: true,
        deployment_approval: deploymentApproval,
        familiarization_status: 'Completed',
        cabin_number: cabinNumber,
        blood_type: bloodType,
        emergency_station: emergencyStation
      }
    };

    let certRecord: BaseRecord | undefined;
    if (includeCert && certNumber) {
      certRecord = {
        id: `rec-cert-${Date.now()}`,
        rid: `CERT-${Math.floor(100 + Math.random() * 900)}`,
        entity: 'crew_certificate',
        title: `${certType} - ${fullName}`,
        description: `Official Marine Competency Certificate for ${fullName}`,
        wps_id: 'WPS-23',
        department: (selectedRole?.department as Department) || 'Marine',
        status: daysRemaining < 0 ? 'Non-Compliant' : 'Compliant',
        expiry_date: expiryDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        data: {
          crew_id: rid,
          crew_name: fullName,
          certificate_type: certType,
          certificate_number: certNumber,
          issuer,
          issue_date: issueDate,
          expiry_date: expiryDate,
          verification_status: 'Verified',
          verified_by: 'Marine Operations Lead',
          document_name: fileName || `${fullName.replace(/\s+/g, '_')}_Certificate.pdf`
        } as CrewCertificateData
      };
    }

    onSave(memberRecord, certRecord);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm">
      {/* Header Info */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-base">
              {isArabic ? 'سجل عضو الطاقم والشهادات المهنية (WPS-23)' : 'Crew Member Profile & Competence Cert (WPS-23)'}
            </h3>
            <p className="text-xs text-slate-400">
              {isArabic ? 'إدارة بيانات البحار/الفني وتوثيق الصلاحيات والفحوصات الطبية' : 'Manage offshore crew personnel, qualifications, and validity tracking'}
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/50">
          WPS-23 Personnel
        </span>
      </div>

      {/* Member Main Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'الاسم الكامل *' : 'Full Name *'}
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Capt. Ahmed Mansour / Eng. Tarek Fathy"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'الرقم القومي / جواز السفر' : 'Passport / National ID'}
          </label>
          <input
            type="text"
            value={nationalId}
            onChange={e => setNationalId(e.target.value)}
            placeholder="EGY-P8834912 / GBR-78210398"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'الرتبة / الدور الوظيفي الحرج (Crew Role) *' : 'Assigned Critical Role *'}
          </label>
          <select
            value={roleId}
            onChange={e => setRoleId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 text-sm"
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
            {isArabic ? 'سيناريو التشغيل المخصص' : 'Operational Scenario'}
          </label>
          <select
            value={scenario}
            onChange={e => setScenario(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 text-sm"
          >
            <option value="Pipelay Mode">{isArabic ? 'نمط مد الأنابيب (Pipelay Mode)' : 'Pipelay Mode'}</option>
            <option value="Transit Mode">{isArabic ? 'نمط الإبحار والقطر (Transit Mode)' : 'Transit Mode'}</option>
            <option value="Anchored / Standby">{isArabic ? 'الرسو والانتظار (Anchored / Standby)' : 'Anchored / Standby'}</option>
            <option value="Diving Campaign">{isArabic ? 'حملة الغوص العميق (Diving Campaign)' : 'Diving Campaign'}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'الوردية التشغيلية (Shift)' : 'Operational Shift'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['Day Shift (12h)', 'Night Shift (12h)', '24h On-Call', 'Rotational'] as const).map(sh => (
              <button
                type="button"
                key={sh}
                onClick={() => setShift(sh)}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                  shift === sh
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {sh}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'حالة موافقة النزول والتعيين' : 'Deployment Approval'}
          </label>
          <select
            value={deploymentApproval}
            onChange={e => setDeploymentApproval(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 text-sm"
          >
            <option value="Approved">{isArabic ? 'معتمد للعمل (Approved)' : 'Approved'}</option>
            <option value="Pending Review">{isArabic ? 'قيد المراجعة (Pending Review)' : 'Pending Review'}</option>
            <option value="Conditional">{isArabic ? 'موافقة مشروطة (Conditional)' : 'Conditional'}</option>
            <option value="Rejected">{isArabic ? 'مرفوض (Rejected)' : 'Rejected'}</option>
          </select>
        </div>
      </div>

      {/* Cabin, Blood type, Muster station */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">{isArabic ? 'رقم الكابينة (Cabin)' : 'Cabin No.'}</label>
          <input
            type="text"
            value={cabinNumber}
            onChange={e => setCabinNumber(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">{isArabic ? 'فصيلة الدم' : 'Blood Type'}</label>
          <select
            value={bloodType}
            onChange={e => setBloodType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
          >
            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">{isArabic ? 'محطة الطوارئ وقارب النجاة' : 'Emergency Muster Station'}</label>
          <input
            type="text"
            value={emergencyStation}
            onChange={e => setEmergencyStation(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200"
          />
        </div>
      </div>

      {/* Certificate Attached Sub-Section */}
      <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h4 className="font-semibold text-slate-200 text-sm">
              {isArabic ? 'إرفاق شهادة الكفاءة البحرية (Competency Certificate)' : 'Primary Certificate & Expiry Alert'}
            </h4>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={includeCert}
              onChange={e => setIncludeCert(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
            />
            {isArabic ? 'تضمين شهادة معتمدة' : 'Attach Certificate'}
          </label>
        </div>

        {includeCert && (
          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {isArabic ? 'نوع الشهادة (Certificate Type)' : 'Certificate Type'}
                </label>
                <select
                  value={certType}
                  onChange={e => setCertType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs"
                >
                  <option value="STCW II/2 Master Mariner">STCW II/2 Master Mariner</option>
                  <option value="STCW III/2 Chief Engineer">STCW III/2 Chief Engineer</option>
                  <option value="OPITO BOSIET with EBS / HUET">OPITO BOSIET with EBS / HUET</option>
                  <option value="IMCA Bell Diving Supervisor">IMCA Bell Diving Supervisor (D014)</option>
                  <option value="OPITO Helideck Landing Officer (HLO)">OPITO Helideck Landing Officer (HLO)</option>
                  <option value="Offshore Medic & ATLS">Offshore Medic & ATLS Life Support</option>
                  <option value="OGUK Medical Fitness offshore">OGUK Medical Fitness offshore</option>
                  <option value="GMDSS General Operator Certificate">GMDSS General Operator Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {isArabic ? 'رقم الشهادة المعتمد *' : 'Certificate Number *'}
                </label>
                <input
                  type="text"
                  required={includeCert}
                  value={certNumber}
                  onChange={e => setCertNumber(e.target.value)}
                  placeholder="e.g. EGY-COC-2024-8901 / OPITO-9921"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {isArabic ? 'جهة الإصدار المعتمدة' : 'Issuing Authority'}
                </label>
                <input
                  type="text"
                  value={issuer}
                  onChange={e => setIssuer(e.target.value)}
                  placeholder="Egyptian Maritime Safety Authority / DNV / OPITO"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {isArabic ? 'تاريخ الإصدار' : 'Issue Date'}
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {isArabic ? 'تاريخ الانتهاء (Expiry Date) *' : 'Expiry Date *'}
                </label>
                <input
                  type="date"
                  required={includeCert}
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs font-mono"
                />
              </div>

              {/* Dynamic Expiry Alert Display */}
              <div className="flex flex-col justify-end">
                <div
                  className={`p-2.5 rounded-lg border flex items-center gap-2 text-xs font-medium ${
                    daysRemaining < 0
                      ? 'bg-rose-950/60 border-rose-600 text-rose-300'
                      : daysRemaining <= 30
                      ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                      : daysRemaining <= 60
                      ? 'bg-yellow-950/40 border-yellow-600 text-yellow-300'
                      : 'bg-emerald-950/50 border-emerald-600 text-emerald-300'
                  }`}
                >
                  {daysRemaining < 0 ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{isArabic ? `منتهية الصلاحية منذ ${Math.abs(daysRemaining)} يوماً!` : `EXPIRED (${Math.abs(daysRemaining)} days ago)`}</span>
                    </>
                  ) : daysRemaining <= 30 ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{isArabic ? `تنبيه حرج: تنتهي خلال ${daysRemaining} يوماً` : `CRITICAL: Expires in ${daysRemaining} days`}</span>
                    </>
                  ) : daysRemaining <= 60 ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span>{isArabic ? `تنبيه مبكر: تنتهي خلال ${daysRemaining} يوماً` : `Early Alert: Expires in ${daysRemaining} days`}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{isArabic ? `سارية ومطابقة (${daysRemaining} يوماً متبقية)` : `Valid & Compliant (${daysRemaining} days remaining)`}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Document Upload Simulation */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {isArabic ? 'رفع الوثيقة الثبوتية (Evidence PDF / Scan)' : 'Upload Certificate Document (Evidence PDF / Scan)'}
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-slate-950 border border-dashed border-slate-600 hover:border-cyan-400 rounded-lg text-xs text-slate-300 transition-all">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>{isArabic ? 'اختر ملف الوثيقة...' : 'Choose file...'}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setFileName(e.target.files[0].name);
                      }
                    }}
                  />
                </label>
                {fileName ? (
                  <span className="text-xs text-cyan-400 flex items-center gap-1 font-mono">
                    <FileText className="w-3.5 h-3.5" /> {fileName}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 italic">
                    {isArabic ? 'لم يتم تحديد ملف (سيتم ربط المستند كدليل رسمي)' : 'No file chosen (will link to evidence store)'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
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
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            {isArabic ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isArabic ? 'حفظ بيانات الطاقم والشهادة' : 'Save Crew & Certificate'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
