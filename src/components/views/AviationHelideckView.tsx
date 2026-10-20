import React from 'react';
import { BaseRecord } from '../../types/pms';
import { Plane, ShieldCheck, AlertTriangle, CheckCircle, Plus } from 'lucide-react';

interface AviationHelideckViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onOpenNewRecord: (entity?: any) => void;
  onSelectRecord: (record: BaseRecord) => void;
}

export const AviationHelideckView: React.FC<AviationHelideckViewProps> = ({
  records,
  isArabic,
  onOpenNewRecord,
  onSelectRecord
}) => {
  const profile = records.find(r => r.entity === 'helideck_profile');
  const checks = records.filter(r => r.entity === 'helideck_check');

  const compliantCount = checks.filter(c => c.status === 'Compliant').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              WPS-19 TRACK
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Plane className="w-5 h-5 text-amber-400" />
              <span>{isArabic ? 'جاهزية مهبط الطائرات والإخلاء الطبي (CAP 437)' : 'Helideck Profile & 10 Periodic Checks (CAP 437)'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'الملف الفني الهندسي لمهبط البارجة، فحوصات الاحتكاك، شباك الأمان، إطفاء الفوم DIFFS، والـ 10 اشتراطات دورية'
              : 'Technical profile, helicopter MTOW limits, D-value, DIFFS fire fighting, and 10 periodic inspection checks.'}
          </p>
        </div>

        <button
          onClick={() => onOpenNewRecord('helideck_check')}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>{isArabic ? 'تسجيل فحص تفتيشي للمهبط +' : '+ New Helideck Check'}</span>
        </button>
      </div>

      {/* Engineering Decision Card */}
      {profile && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-amber-400 font-bold block uppercase tracking-wider">
                {isArabic ? 'القرار الهندسي المعتمد (Decision Type)' : 'Approved Technical Decision'}
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">{profile.title}</h3>
              <p className="text-xs text-slate-400">{profile.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                {profile.data?.decision_type}
              </span>
              <span className="px-3 py-1 text-xs font-mono rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Valid: {profile.data?.certificate_valid_until}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block">{isArabic ? 'القطر التصميمي (D-Value)' : 'Helideck D-Value'}</span>
              <span className="font-mono text-xl font-bold text-white mt-1 block">22.2 m</span>
              <span className="text-[10px] text-slate-500">Sikorsky S-92 Compliant</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block">{isArabic ? 'الوزن الأقصى (MTOW)' : 'Max Takeoff Weight'}</span>
              <span className="font-mono text-xl font-bold text-amber-400 mt-1 block">12.6 Tonnes</span>
              <span className="text-[10px] text-slate-500">Heavy Offshore Rotorcraft</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block">{isArabic ? 'إطفاء الحريق' : 'Foam System'}</span>
              <span className="font-semibold text-emerald-400 text-xs mt-1 block">DIFFS Integrated</span>
              <span className="text-[10px] text-slate-500">15s Complete Deck Flood</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block">{isArabic ? 'الهيئة المعتمدة' : 'Certification Body'}</span>
              <span className="font-semibold text-slate-200 text-xs mt-1 block">HCA / CAA</span>
              <span className="text-[10px] text-slate-500">Level 1 Clearance</span>
            </div>
          </div>
        </div>
      )}

      {/* 10 Periodic Inspection Checks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>{isArabic ? 'الفحوصات التفتيشية الـ 10 الدورية لمهبط الطائرات' : 'The 10 Periodic Helideck Inspection Checks'}</span>
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
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    : 'bg-rose-950/20 border-rose-600/60 hover:border-rose-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {chk.rid}
                    </span>
                    <span className="font-bold text-slate-200 text-xs">{chk.title}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isPass
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                    }`}
                  >
                    {chk.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{chk.description}</p>

                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isArabic ? 'المعيار الهندسي:' : 'Criteria:'}</span>
                    <span className="text-slate-300 font-mono text-[10px]">{chk.data?.criteria_statement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isArabic ? 'المفتش والتاريخ:' : 'Inspector & Date:'}</span>
                    <span className="text-slate-300">{chk.data?.inspector} • {chk.data?.inspection_date}</span>
                  </div>
                </div>

                {chk.data?.capa_id && (
                  <div className="p-2 bg-rose-950/50 rounded-lg border border-rose-700/60 flex items-center justify-between text-xs text-rose-300">
                    <span className="font-semibold">⚠️ {isArabic ? 'فجوة مفتوحة:' : 'Open Finding:'} {chk.data.capa_id}</span>
                    <span className="text-[10px]">{chk.data.findings_notes}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
