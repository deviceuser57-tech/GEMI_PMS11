import React from 'react';
import { BaseRecord } from '../../types/pms';
import { Bed, ShieldCheck, CheckCircle, Plus, Users, HeartPulse, Sparkles } from 'lucide-react';

interface AccommodationPobViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onOpenNewRecord: (entity?: any) => void;
  onSelectRecord: (record: BaseRecord) => void;
}

export const AccommodationPobView: React.FC<AccommodationPobViewProps> = ({
  records,
  isArabic,
  onOpenNewRecord,
  onSelectRecord
}) => {
  const capacity = records.find(r => r.entity === 'accommodation_capacity');
  const checks = records.filter(r => r.entity === 'accommodation_check');

  const totalBerths = capacity?.data?.total_certified_berths || 250;
  const pobLimit = capacity?.data?.pob_limit || 245;
  const currentPob = capacity?.data?.allocated_berths || 228;
  const availableBeds = pobLimit - currentPob;
  const utilization = Math.round((currentPob / pobLimit) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              WPS-15 TRACK
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bed className="w-5 h-5 text-blue-400" />
              <span>{isArabic ? 'خطة الطاقة الاستيعابية POB وفحوصات الإعاشة (MLC 2006)' : 'Accommodation Capacity & 10 MLC 2006 Checks'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'متابعة سعة الأسِرّة المعتمدة (250 سريراً)، حد الـ POB المسموح به، فحوصات التكييف HVAC، مياه الشرب، ومطابقة معاهدة العمل البحري.'
              : 'Certified 250 berths, maximum POB allowance, HVAC differential pressure, potable water Legionella testing, and MLC 2006 Title 3 standards.'}
          </p>
        </div>

        <button
          onClick={() => onOpenNewRecord('accommodation_check')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>{isArabic ? 'تسجيل فحص إعاشة / مياه +' : '+ New Accom Check'}</span>
        </button>
      </div>

      {/* POB Live Capacity Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-blue-400 font-bold block uppercase tracking-wider">
              {isArabic ? 'الخطة الاستيعابية للأفراد على المتن' : 'Certified POB Allocation Plan'}
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {capacity?.title || 'PMS-11 Accommodation Capacity Plan'}
            </h3>
            <p className="text-xs text-slate-400">
              {capacity?.data?.approval_reference || 'MLC 2006 Compliance Certificate'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-mono rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              {currentPob} / {pobLimit} POB ({utilization}%)
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>{isArabic ? 'نسبة الإشغال الفعلية:' : 'Occupancy Rate:'}</span>
            <span className="font-mono font-bold text-white">{utilization}%</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">{isArabic ? 'الأسِرّة المعتمدة' : 'Total Berths'}</span>
            <span className="font-mono text-2xl font-bold text-white mt-1 block">{totalBerths}</span>
            <span className="text-[10px] text-slate-500">Class Approved</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">{isArabic ? 'الحد الأقصى POB' : 'Max Safe POB'}</span>
            <span className="font-mono text-2xl font-bold text-cyan-400 mt-1 block">{pobLimit}</span>
            <span className="text-[10px] text-slate-500">Lifeboat 150% Rule</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">{isArabic ? 'الشاغر المتاح' : 'Available Beds'}</span>
            <span className="font-mono text-2xl font-bold text-emerald-400 mt-1 block">{availableBeds}</span>
            <span className="text-[10px] text-emerald-400/80">Available</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">{isArabic ? 'المستشفى والعزل' : 'Hospital & Quarantine'}</span>
            <span className="font-mono text-xl font-bold text-amber-400 mt-1 block">4 + 2</span>
            <span className="text-[10px] text-slate-500">Dedicated isolation</span>
          </div>
        </div>
      </div>

      {/* 10 Living Quarters & Hygiene Checks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>{isArabic ? 'فحوصات الإقامة والراحة الـ 10 (معايير MLC 2006)' : '10 Living Quarters & Environmental Checks'}</span>
          </h3>
          <span className="text-xs text-slate-400">
            {checks.filter(c => c.status === 'Compliant').length}/{checks.length} {isArabic ? 'مطابقة' : 'Compliant'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checks.map(chk => (
            <div
              key={chk.id}
              onClick={() => onSelectRecord(chk)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {chk.rid}
                  </span>
                  <span className="font-bold text-slate-200 text-xs">{chk.title}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {chk.status}
                </span>
              </div>

              <p className="text-xs text-slate-400">{chk.description}</p>

              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isArabic ? 'المعيار الصحي:' : 'Criteria:'}</span>
                  <span className="text-slate-300 font-mono text-[10px]">{chk.data?.criteria_statement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isArabic ? 'المفتش والتاريخ:' : 'Inspector & Date:'}</span>
                  <span className="text-slate-300">{chk.data?.inspector} • {chk.data?.inspection_date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
