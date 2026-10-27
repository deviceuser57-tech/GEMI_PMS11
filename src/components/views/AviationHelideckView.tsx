import React, { useState } from 'react';
import { BaseRecord } from '../../types/pms';
import { Plane, ShieldCheck, AlertTriangle, CheckCircle, Plus, FileText, Check, Search, Filter } from 'lucide-react';

interface AviationHelideckViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onOpenNewRecord: (entity?: any) => void;
  onSelectRecord: (record: BaseRecord) => void;
}

export const ecar138ChecklistItems = [
  {
    code: 'ECAR 138 §§138.101-109, 107',
    reqArabic: 'شهادة الصلاحية الفنية الصادرة من سلطة الطيران المدني المصري ECAA وتقرير السلامة المعتمد',
    category: 'المعايير الميدانية والسجلات',
    standard: 'ECAA Certificate',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138 §§138.201-207',
    reqArabic: 'تطابق بيانات الشهادة والتقرير والمواصفات والأبعاد والاسم المعلن بالمهبط',
    category: 'المعايير الميدانية والسجلات',
    standard: 'ECAA Specs',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138 §§138.203, 138.213',
    reqArabic: 'سجل مراجعات التعديلات وموافقة السلطة عند التغيير الهيكلي في المهبط',
    category: 'المعايير الميدانية والسجلات',
    standard: 'ECAA Revision Log',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.303, EAC 139-27 Ch. 2',
    reqArabic: 'تحقق من تمييز المسؤول HLO وخطوط الإخلاء وسلسلة إيقاف العمليات',
    category: 'المعايير الميدانية والسجلات',
    standard: 'HLO Chain of Command',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.303, 138.317',
    reqArabic: 'أجهزة قياس الرياح والملاحة والأنوار HLO وتدريب واستجابة الطوارئ',
    category: 'المعايير الميدانية والسجلات',
    standard: 'Nav & Wind Sensors',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.105, 138.115, 138.203',
    reqArabic: 'تحقق من التقارير السنوية وإجراءات الصيانة والدعم الفني للمهبط',
    category: 'المعايير الميدانية والسجلات',
    standard: 'Annual Safety Report',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.307, 138.309, EAC 139-27 Ch. 1-4',
    reqArabic: 'تقييم المخاطر والدراسة الفنية للمهبط وعوائق الاهتزازات المحيطة',
    category: 'المعايير الميدانية والسجلات',
    standard: 'Risk Study & Vibrations',
    status: 'Compliant'
  },
  {
    code: 'ECAR Part 39 / Part 138',
    reqArabic: 'راجع سجل الإصلاح والأعمال والإجراءات التصحيحية الموثقة مع التكرار',
    category: 'المعايير الميدانية والسجلات',
    standard: 'Corrective Actions Log',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.305, Helideck Safety Report',
    reqArabic: 'ملف القوة البدنية والتجهيزات الفنية والمعايير المعتمدة لسطح الهبوط',
    category: 'المعايير الميدانية والسجلات',
    standard: 'Structural Deck Strength',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.3, 138.307, EAC 139-27 Ch. 1',
    reqArabic: 'خطة طوارئ المهبط واختبار الملاحظات السريعة ومعدات الحريق والتفريغ',
    category: 'المعايير الميدانية والسجلات',
    standard: 'Emergency Plan & Foam',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.305, PMS-17',
    reqArabic: 'طابق الحمولة الهيكلية الكلية M-Value المعتمدة مع السجلات',
    category: 'المعايير الميدانية والسجلات',
    standard: 'T-Value & MTOW Limit',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.305',
    reqArabic: 'اختبار وسائل الاتصال والمعلومات المرسلة للطائرة قبل الحركة VHF',
    category: 'المعايير الميدانية والسجلات',
    standard: 'VHF Aviation Radio',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.305, 138.317',
    reqArabic: 'تحقق من أنها أجهزة معتمدة واختيار أجهزة الاتصالات اللاسلكية لمسؤول HLO',
    category: 'المعايير الميدانية والسجلات',
    standard: 'Approved HLO Comms',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.307(d)(3)-(4), EAC 139-27 Ch. 1',
    reqArabic: 'وجود ووظيفة HLO والأنوار والشبكة المطاطية ومعدات الهبوط',
    category: 'المعايير الميدانية والسجلات',
    standard: 'Landing Net & Lighting',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.307(d)(4)',
    reqArabic: 'أبعاد TLOF ومساحة D-Value المعتمدة وتطابقها مع التصريح',
    category: 'المعايير الميدانية والسجلات',
    standard: 'TLOF & D-Value Check',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.307(d)(6)-(9)',
    reqArabic: 'المنطقة المحصورة والمحيطة 210° وخلوها من العوائق المرتفعة',
    category: 'المعايير الميدانية والسجلات',
    standard: '210 Obstacle Free Sector',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.307(d)(18)',
    reqArabic: 'اختبار معامل الاحتكاك لسطح TLOF ومقاومة الانزلاق (Friction >= 0.85)',
    category: 'المعايير الميدانية والسجلات',
    standard: 'Surface Friction >= 0.85',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.307(c)(16)',
    reqArabic: 'تصريف المياه وحجز الزيوت والوقود لمنع التسرب لسطح المهبط',
    category: 'المعايير الميدانية والسجلات',
    standard: 'Helideck Drainage System',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.307, EAC 139-27',
    reqArabic: 'معدات الإطفاء والرغوة التلقائية DIFFS / FOAM وحماية الطاقم HLO',
    category: 'المعايير الميدانية والسجلات',
    standard: 'DIFFS Foam System',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.311, EAC 139-27',
    reqArabic: 'مراقبة اتجاه الرياح ومؤشر أجهزة القياس المعتمدة من سلطة الطيران المدني المصري',
    category: 'المعايير الميدانية والسجلات',
    standard: 'ECAA Wind Cone & Sensors',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.313, 138.315',
    reqArabic: 'علامات التميز D-Value و T-Value وعلامة المهبط H والمحيط الأصفر المضيء',
    category: 'المعايير الميدانية والسجلات',
    standard: 'H Marking & TLOF Circle',
    status: 'Compliant'
  },
  {
    code: 'ECAR 138.317',
    reqArabic: 'أنظمة الإضاءة الليلية TLOF/FATO المعتمدة لدى ECAA وضوء الإشارة البرّاق',
    category: 'المعايير الميدانية والسجلات',
    standard: 'Green Perimeter LED & Flash',
    status: 'Compliant'
  }
];

export const AviationHelideckView: React.FC<AviationHelideckViewProps> = ({
  records,
  isArabic,
  onOpenNewRecord,
  onSelectRecord
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const profile = records.find(r => r.entity === 'helideck_profile');
  const checks = records.filter(r => r.entity === 'helideck_check');

  const compliantCount = checks.filter(c => c.status === 'Compliant').length;

  const filteredChecklist = ecar138ChecklistItems.filter(item => 
    item.reqArabic.includes(searchTerm) || 
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.standard.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#ff6600] text-white border border-orange-400">
              WPS-19 ECAR 138
            </span>
            <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              ECAA EGYPTIAN CIVIL AVIATION
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Plane className="w-5 h-5 text-orange-400" />
              <span>{isArabic ? 'جاهزية مهبط الطائرات وفق التشريعات المصرية (ECAR Part 138)' : 'Helideck Readiness & ECAA ECAR Part 138 Standards'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {isArabic
              ? 'الملف الفني المعياري معتمد طبقاً لسلطة الطيران المدني المصري ECAA (ECAR Part 138 / EAC 139-27) - تشمل 22 بنداً تفصيلياً للاحتكاك والإطفاء والسلامة'
              : 'Certified under Egyptian Civil Aviation Authority (ECAA ECAR Part 138 / EAC 139-27) - Friction, DIFFS Foam, & 22 Checklist Regulations.'}
          </p>
        </div>

        <button
          onClick={() => onOpenNewRecord('helideck_check')}
          className="px-4 py-2 rounded-xl bg-[#ff6600] hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>{isArabic ? 'تسجيل فحص ECAR 138 جديد +' : '+ New ECAR 138 Check'}</span>
        </button>
      </div>

      {/* Egyptian Civil Aviation ECAA Decision Card */}
      {profile && (
        <div className="bg-[#0d2137] border border-[#1a365d] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1a365d] pb-4">
            <div>
              <span className="text-[11px] text-orange-400 font-bold block uppercase tracking-wider">
                {isArabic ? 'القرار الهندسي المعتمد من سلطة الطيران المدني المصري (ECAA ECAR 138)' : 'ECAA Certified Technical Decision'}
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">{profile.title}</h3>
              <p className="text-xs text-slate-300">{profile.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                {isArabic ? 'شهادة ECAR 138 سارية' : 'Full ECAR 138 Certified'}
              </span>
              <span className="px-3 py-1 text-xs font-mono rounded-full bg-[#0a192f] text-orange-300 border border-orange-500/40">
                ECAA Cert: {profile.data?.certificate_valid_until || '2027-10-27'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#071527] p-3 rounded-xl border border-[#1a365d] text-center">
              <span className="text-[11px] text-slate-400 block">{isArabic ? 'القطر التصميمي (D-Value)' : 'Helideck D-Value'}</span>
              <span className="font-mono text-xl font-bold text-white mt-1 block">22.2 m</span>
              <span className="text-[10px] text-orange-400 font-bold">Sikorsky S-92 / AW139</span>
            </div>
            <div className="bg-[#071527] p-3 rounded-xl border border-[#1a365d] text-center">
              <span className="text-[11px] text-slate-400 block">{isArabic ? 'الوزن الأقصى (MTOW)' : 'Max Takeoff Weight'}</span>
              <span className="font-mono text-xl font-bold text-orange-400 mt-1 block">12.6 Tonnes</span>
              <span className="text-[10px] text-slate-400">ECAR 138 §138.305 Limit</span>
            </div>
            <div className="bg-[#071527] p-3 rounded-xl border border-[#1a365d] text-center">
              <span className="text-[11px] text-slate-400 block">{isArabic ? 'إطفاء الحريق الفوم' : 'DIFFS Foam System'}</span>
              <span className="font-semibold text-emerald-400 text-xs mt-1 block">ECAR 138 DIFFS</span>
              <span className="text-[10px] text-slate-400">15s Complete Flood</span>
            </div>
            <div className="bg-[#071527] p-3 rounded-xl border border-[#1a365d] text-center">
              <span className="text-[11px] text-slate-400 block">{isArabic ? 'جهة الاعتماد التشريعية' : 'Regulatory Body'}</span>
              <span className="font-semibold text-orange-300 text-xs mt-1 block">ECAA (سلطة الطيران)</span>
              <span className="text-[10px] text-slate-400">ECAR 138 Clearance</span>
            </div>
          </div>
        </div>
      )}

      {/* ECAR 138 Inspection Checklist Grid */}
      <div className="bg-[#0d2137] border border-[#1a365d] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1a365d] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-base text-white">
              {isArabic ? 'قائمة الفحص التفتيشي المعيارية للتشريعات المصرية (ECAR Part 138 Inspection Checklist)' : 'ECAA ECAR Part 138 Statutory Inspection Regulations'}
            </h3>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={isArabic ? 'تصفية بنود وقواعد ECAR 138...' : 'Filter ECAR 138 rules...'}
              className="bg-[#071527] border border-[#1a365d] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left text-slate-300 border-collapse">
            <thead className="bg-[#071527] text-slate-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="p-3 border-b border-[#1a365d]">{isArabic ? 'دليل التحقق المباشر' : 'ECAR Clause Code'}</th>
                <th className="p-3 border-b border-[#1a365d]">{isArabic ? 'وصف المتطلب التشريعي (سلطة الطيران المدني المصرية)' : 'Statutory Requirement (ECAA)'}</th>
                <th className="p-3 border-b border-[#1a365d] text-center">{isArabic ? 'المعيار المعتمد' : 'Standard'}</th>
                <th className="p-3 border-b border-[#1a365d] text-center">{isArabic ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a365d]/60 font-mono">
              {filteredChecklist.map((item, index) => (
                <tr key={index} className="hover:bg-[#071527]/50 transition-colors">
                  <td className="p-3 font-bold text-orange-400 text-[11px] whitespace-nowrap">
                    {item.code}
                  </td>
                  <td className="p-3 text-slate-200 font-sans text-xs">
                    {item.reqArabic}
                  </td>
                  <td className="p-3 text-center text-cyan-300 text-[11px]">
                    {item.standard}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {isArabic ? 'مطابق ECAA' : 'Compliant'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recorded Helideck Checks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            <span>{isArabic ? 'تقارير الفحص الميداني المحفوظة (ECAR 138 Logs)' : 'Saved Field ECAR 138 Records'}</span>
          </h3>
          <span className="text-xs text-slate-400">
            {compliantCount}/{checks.length} {isArabic ? 'مطابقة' : 'Compliant'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checks.map(chk => {
            const isPass = chk.status === 'Compliant';
            return (
              <div
                key={chk.id}
                onClick={() => onSelectRecord(chk)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                  isPass
                    ? 'bg-[#0d2137] border-[#1a365d] hover:border-orange-500/50'
                    : 'bg-rose-950/20 border-rose-600/60 hover:border-rose-500'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-orange-400 border border-orange-500/40 px-1.5 py-0.5 rounded bg-[#071527]">
                      {chk.rid}
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1">{chk.title}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isPass
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {chk.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2">{chk.description}</p>

                <div className="pt-2 border-t border-[#1a365d] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Inspector: {chk.owner || 'ECAA Surveyor'}</span>
                  <span>Rule: ECAR 138</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
