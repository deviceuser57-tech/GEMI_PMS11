import React, { useState } from 'react';
import { BaseRecord, InspectionCheckData, Department } from '../../types/pms';
import { CheckCircle, AlertTriangle, ClipboardCheck, ShieldAlert, FileText, Printer } from 'lucide-react';

interface InspectionCheckFormProps {
  initialRecord?: BaseRecord;
  defaultFacility?: 'Helideck' | 'Accommodation';
  onSave: (record: BaseRecord, capaRecord?: BaseRecord) => void;
  onCancel: () => void;
  isArabic: boolean;
}

export const InspectionCheckForm: React.FC<InspectionCheckFormProps> = ({
  initialRecord,
  defaultFacility = 'Helideck',
  onSave,
  onCancel,
  isArabic
}) => {
  const initialData: Partial<InspectionCheckData> = initialRecord?.data || {};

  const [facilityArea, setFacilityArea] = useState<'Helideck' | 'Accommodation'>(
    initialData.facility_area === 'Accommodation' ? 'Accommodation' : 'Helideck'
  );
  const [controlItem, setControlItem] = useState(initialData.control_item || initialRecord?.title || '');
  const [governingRule, setGoverningRule] = useState(
    initialData.source_rule_id || (facilityArea === 'Helideck' ? 'R-048' : 'R-055')
  );
  const [criteria, setCriteria] = useState(
    initialData.criteria_statement || 'Periodic test in accordance with safety codes and operational manual.'
  );
  const [inspectionStatus, setInspectionStatus] = useState<InspectionCheckData['inspection_status']>(
    initialData.inspection_status || 'Compliant'
  );
  const [inspector, setInspector] = useState(initialData.inspector || 'Safety Superintendent');
  const [inspectionDate, setInspectionDate] = useState(
    initialData.inspection_date || new Date().toISOString().split('T')[0]
  );
  const [nextDue, setNextDue] = useState(
    initialData.next_inspection_due ||
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(initialData.findings_notes || '');

  // Auto-triggered CAPA Fields when Non-Compliant
  const isNonCompliant = inspectionStatus === 'Non-Compliant';
  const [capaSeverity, setCapaSeverity] = useState<'High' | 'Medium' | 'Critical'>('High');
  const [rootCause, setRootCause] = useState(
    'Wear and tear due to aggressive offshore marine environment.'
  );
  const [correctiveAction, setCorrectiveAction] = useState(
    'Procure replacement parts and perform physical rectifying test within 7 days.'
  );
  const [preventiveAction, setPreventiveAction] = useState(
    'Update PMS inspection frequency and increase visual check log.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isHeli = facilityArea === 'Helideck';
    const entity = isHeli ? 'helideck_check' : 'accommodation_check';
    const wpsId = isHeli ? 'WPS-19' : 'WPS-15';
    const dept: Department = isHeli ? 'Aviation & Helideck' : 'Catering & Accommodation';
    const rid = initialRecord?.rid || `${isHeli ? 'HEL-CHK' : 'ACC-CHK'}-${Math.floor(100 + Math.random() * 900)}`;

    let capaRecord: BaseRecord | undefined;
    let assignedCapaId: string | undefined;

    if (isNonCompliant) {
      assignedCapaId = `GAP-${Math.floor(100 + Math.random() * 900)}`;
      capaRecord = {
        id: `rec-gap-${Date.now()}`,
        rid: assignedCapaId,
        entity: 'gap',
        title: `CAPA: ${controlItem} Non-Compliance`,
        description: `Automated finding generated from ${rid} (${facilityArea}): ${notes || criteria}`,
        wps_id: wpsId,
        department: dept,
        status: 'In Progress',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        owner: inspector,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        data: {
          severity: capaSeverity,
          source_check_id: rid,
          root_cause: rootCause,
          corrective_action: correctiveAction,
          preventive_action: preventiveAction,
          action_party: inspector,
          closure_gate: 'GATE-1'
        }
      };
    }

    const checkRecord: BaseRecord = {
      id: initialRecord?.id || `rec-chk-${Date.now()}`,
      rid,
      entity,
      title: controlItem,
      description: criteria,
      wps_id: wpsId,
      department: dept,
      status: inspectionStatus === 'Compliant' ? 'Compliant' : 'Non-Compliant',
      due_date: nextDue,
      owner: inspector,
      created_at: initialRecord?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      data: {
        control_item: controlItem,
        facility_area: facilityArea,
        source_rule_id: governingRule,
        criteria_statement: criteria,
        inspection_status: inspectionStatus,
        inspector,
        inspection_date: inspectionDate,
        next_inspection_due: nextDue,
        evidence_attached: true,
        corrective_action_needed: isNonCompliant,
        capa_id: assignedCapaId,
        findings_notes: notes
      } as InspectionCheckData
    };

    onSave(checkRecord, capaRecord);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-sm">
      <div className="bg-slate-900/80 p-4 rounded-xl border border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-base">
              {isArabic ? 'نموذج تفتيش المهبط والإعاشة (Inspection Check)' : 'Facility Inspection & Compliance Check'}
            </h3>
            <p className="text-xs text-slate-400">
              {isArabic
                ? 'فحوصات ECAR 138 للمهبط (WPS-19 / سلطة الطيران ECAA) أو معايير MLC 2006 للإقامة (WPS-15)'
                : 'Helideck ECAR 138 (WPS-19 ECAA) or Accommodation MLC 2006 (WPS-15) inspection check'}
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {facilityArea === 'Helideck' ? 'WPS-19 Aviation' : 'WPS-15 Accommodation'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'القطاع / المنشأة المفحوصة *' : 'Facility Area *'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setFacilityArea('Helideck');
                setGoverningRule('R-048');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                facilityArea === 'Helideck'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              🚁 {isArabic ? 'مهبط الطائرات (WPS-19 ECAR 138)' : 'Helideck (WPS-19 ECAR 138)'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFacilityArea('Accommodation');
                setGoverningRule('R-055');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                facilityArea === 'Accommodation'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              🛏️ {isArabic ? 'الإقامة والإعاشة (WPS-15)' : 'Accommodation (WPS-15)'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'القاعدة التشريعية الحاكمة (Governing Rule)' : 'Governing Rule'}
          </label>
          <select
            value={governingRule}
            onChange={e => setGoverningRule(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:border-amber-500"
          >
            {facilityArea === 'Helideck' ? (
              <>
                <option value="R-048">R-048: Helideck Friction & Physical Nets (ECAR 138 / ECAA)</option>
                <option value="R-049">R-049: DIFFS Foam Fire Fighting System Discharge</option>
                <option value="R-050">R-050: Helideck Lighting & Obstacle Marking</option>
                <option value="R-051">R-051: Aviation Refueling & Grounding Integrity</option>
              </>
            ) : (
              <>
                <option value="R-055">R-055: Accommodation Health & MLC 2006 Standards</option>
                <option value="R-056">R-056: Potable Water Distribution & Legionella Control</option>
                <option value="R-057">R-057: Galley Hygiene & Deep-Freeze HACCP</option>
                <option value="R-058">R-058: Sewage & Blackwater Treatment Unit (MARPOL IV)</option>
              </>
            )}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'بند التفتيش والتحكم (Inspection Item / Control Item) *' : 'Inspection Control Item *'}
          </label>
          <input
            type="text"
            required
            value={controlItem}
            onChange={e => setControlItem(e.target.value)}
            placeholder={
              facilityArea === 'Helideck'
                ? 'e.g. Helideck Friction Test (>0.85) / Safety Nets Drop Test'
                : 'e.g. HVAC Air Balancing Test / Galley Freezer Temperature (-18°C)'
            }
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:border-amber-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'معيار القبول والاشتراطات الهندسية (Criteria)' : 'Acceptance Criteria'}
          </label>
          <textarea
            rows={2}
            value={criteria}
            onChange={e => setCriteria(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'نتيجة الفحص والمعاينة (Inspection Result) *' : 'Inspection Result *'}
          </label>
          <select
            value={inspectionStatus}
            onChange={e => setInspectionStatus(e.target.value as any)}
            className={`w-full border rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
              inspectionStatus === 'Compliant'
                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                : inspectionStatus === 'Non-Compliant'
                ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                : 'bg-amber-950/60 border-amber-600 text-amber-300'
            }`}
          >
            <option value="Compliant">✓ {isArabic ? 'مطابق ومعتمد (Compliant / Pass)' : 'Compliant / Pass'}</option>
            <option value="Non-Compliant">✕ {isArabic ? 'غير مطابق - يستوجب تصحيح (Non-Compliant / Fail)' : 'Non-Compliant / Fail'}</option>
            <option value="Pending Inspection">⏳ {isArabic ? 'قيد التفتيش والمعاينة (Pending)' : 'Pending Inspection'}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'المفتش / جهة الفحص' : 'Inspector / Surveyor'}
          </label>
          <input
            type="text"
            value={inspector}
            onChange={e => setInspector(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'تاريخ التفتيش الفعلي' : 'Inspection Date'}
          </label>
          <input
            type="date"
            value={inspectionDate}
            onChange={e => setInspectionDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {isArabic ? 'تاريخ الفحص الدوري القادم' : 'Next Inspection Due'}
          </label>
          <input
            type="date"
            value={nextDue}
            onChange={e => setNextDue(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
          />
        </div>
      </div>

      {/* AUTOMATIC CAPA TRIGGER PANEL WHEN NON-COMPLIANT */}
      {isNonCompliant && (
        <div className="border-2 border-rose-600/70 bg-rose-950/30 rounded-xl p-4 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-rose-200 text-sm flex items-center gap-2">
                <span>{isArabic ? 'تنبيه: تم تفعيل خطة التصحيح التلقائية (Automated CAPA Generator)' : 'Automated Finding & CAPA Generation Triggered'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-900 text-rose-200 border border-rose-600">
                  {isArabic ? 'إلزامي لإغلاق البوابة' : 'Gate Blocking'}
                </span>
              </h4>
              <p className="text-xs text-rose-300/80">
                {isArabic
                  ? 'نظراً لاختيار "غير مطابق"، سيتم تلقائياً إنشاء سجل فجوة في Findings & CAPA وربطه بـ GATE-1'
                  : 'Since result is Non-Compliant, a linked CAPA record will be automatically created in Findings & CAPA.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-rose-200 mb-1">
                {isArabic ? 'درجة الخطورة (Severity)' : 'Severity Level'}
              </label>
              <select
                value={capaSeverity}
                onChange={e => setCapaSeverity(e.target.value as any)}
                className="w-full bg-slate-900 border border-rose-700 rounded-lg px-3 py-2 text-rose-100 text-xs"
              >
                <option value="Critical">{isArabic ? 'حرجة جداً (Critical)' : 'Critical'}</option>
                <option value="High">{isArabic ? 'عالية (High)' : 'High'}</option>
                <option value="Medium">{isArabic ? 'متوسطة (Medium)' : 'Medium'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-rose-200 mb-1">
                {isArabic ? 'السبب الجذري للملاحظة (Root Cause)' : 'Root Cause Statement'}
              </label>
              <input
                type="text"
                value={rootCause}
                onChange={e => setRootCause(e.target.value)}
                className="w-full bg-slate-900 border border-rose-700 rounded-lg px-3 py-2 text-rose-100 text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-rose-200 mb-1">
                {isArabic ? 'الإجراء التصحيحي الفوري (Corrective Action)' : 'Immediate Corrective Action'}
              </label>
              <input
                type="text"
                value={correctiveAction}
                onChange={e => setCorrectiveAction(e.target.value)}
                className="w-full bg-slate-900 border border-rose-700 rounded-lg px-3 py-2 text-rose-100 text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-rose-200 mb-1">
                {isArabic ? 'الإجراء الوقائي طويل المدى (Preventive Action)' : 'Long-term Preventive Action'}
              </label>
              <input
                type="text"
                value={preventiveAction}
                onChange={e => setPreventiveAction(e.target.value)}
                className="w-full bg-slate-900 border border-rose-700 rounded-lg px-3 py-2 text-rose-100 text-xs"
              />
            </div>
          </div>
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
            <span>{isArabic ? 'حفظ نتيجة الفحص والتفتيش' : 'Save Inspection Check'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
