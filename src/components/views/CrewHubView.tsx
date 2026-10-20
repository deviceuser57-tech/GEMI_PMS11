import React, { useState } from 'react';
import { BaseRecord, CrewCertificateData } from '../../types/pms';
import {
  Users,
  Award,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Calendar,
  FileText,
  Search,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  ShieldAlert
} from 'lucide-react';
import { useGsapPageReveal } from '../../lib/animations';

interface CrewHubViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onOpenNewRecord: (entity?: any) => void;
  onSelectRecord: (record: BaseRecord) => void;
}

export const CrewHubView: React.FC<CrewHubViewProps> = ({
  records,
  isArabic,
  onOpenNewRecord,
  onSelectRecord
}) => {
  const containerRef = useGsapPageReveal<HTMLDivElement>();
  const [activeSubTab, setActiveSubTab] = useState<'certificates' | 'register' | 'manning' | 'roles'>('certificates');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExpiry, setFilterExpiry] = useState<'all' | 'critical' | 'expired'>('all');

  const crewMembers = records.filter(r => r.entity === 'crew_member');
  const crewCertificates = records.filter(r => r.entity === 'crew_certificate');
  const manningPlans = records.filter(r => r.entity === 'manning_plan');
  const crewRoles = records.filter(r => r.entity === 'crew_role');

  const now = new Date();

  const getDaysRemaining = (expStr?: string) => {
    if (!expStr) return 999;
    const diff = new Date(expStr).getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Helper to determine the worst cert status for a crew member
  const getCrewMemberCertAlert = (crewId: string, crewRid: string, crewName: string) => {
    const memberCerts = crewCertificates.filter(
      c => c.data?.crew_id === crewRid || c.data?.crew_id === crewId || (c.data?.crew_name && c.data.crew_name === crewName)
    );

    let hasExpired = false;
    let hasCritical = false;
    let minDays = 999;

    memberCerts.forEach(c => {
      const days = getDaysRemaining(c.expiry_date);
      if (days < minDays) minDays = days;
      if (days < 0) hasExpired = true;
      else if (days <= 30) hasCritical = true;
    });

    return { hasExpired, hasCritical, minDays, certCount: memberCerts.length };
  };

  const filteredCerts = crewCertificates.filter(c => {
    const days = getDaysRemaining(c.expiry_date);
    if (filterExpiry === 'critical') return days <= 30 && days >= 0;
    if (filterExpiry === 'expired') return days < 0;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.data?.certificate_number && c.data.certificate_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.data?.issuer && c.data.issuer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.data?.crew_name && c.data.crew_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const filteredMembers = crewMembers.filter(m => {
    const alertInfo = getCrewMemberCertAlert(m.id, m.rid, m.data?.full_name || m.title);
    if (filterExpiry === 'critical') return alertInfo.hasCritical;
    if (filterExpiry === 'expired') return alertInfo.hasExpired;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.rid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.data?.role_title && m.data.role_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.data?.full_name && m.data.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const totalExpiredCerts = crewCertificates.filter(c => getDaysRemaining(c.expiry_date) < 0).length;
  const totalCriticalCerts = crewCertificates.filter(c => { const d = getDaysRemaining(c.expiry_date); return d <= 30 && d >= 0; }).length;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              WPS-23 TRACK
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>{isArabic ? 'منظومة كفاءة وتعيين الطاقم والمانينج والشهادات' : 'Crew Competence & Marine Manning Hub'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'متابعة الرتب البحرية الـ 12، سجل الطاقم، شهادات STCW/IMCA، كشف الحد الأدنى الآمن وتلوين التنبيهات (أصفر < 30 يوماً، أحمر منتهية).'
              : 'Managing 12 critical roles, crew manifest, STCW/IMCA certifications, safe manning baseline, and automated expiry alert matrix.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenNewRecord('crew_member')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>{isArabic ? 'تسجيل فرد طاقم / شهادة +' : '+ Register Crew & Cert'}</span>
          </button>
        </div>
      </div>

      {/* Critical Expiry Alert Banners if any exist */}
      {(totalExpiredCerts > 0 || totalCriticalCerts > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {totalExpiredCerts > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border-2 border-rose-600 text-rose-200 flex items-center justify-between gap-3 shadow-lg shadow-rose-950/50">
              <div className="flex items-center gap-2.5">
                <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
                <div>
                  <h4 className="font-bold text-xs">
                    {isArabic ? `تنبيه حرج: يوجد ${totalExpiredCerts} شهادات منتهية الصلاحية!` : `CRITICAL ALERT: ${totalExpiredCerts} Expired Certificates!`}
                  </h4>
                  <p className="text-[11px] text-rose-300/80">
                    {isArabic ? 'تم تلوين صفوف الأفراد المتأثرين باللون الأحمر مع إيقاف تصريح النزول للعمل.' : 'Affected crew rows highlighted in RED. Deployment clearance blocked.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setFilterExpiry('expired'); setActiveSubTab('certificates'); }}
                className="px-2.5 py-1 rounded bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold shrink-0 border border-rose-500"
              >
                {isArabic ? 'فلترة المنتهية' : 'Show Expired'}
              </button>
            </div>
          )}

          {totalCriticalCerts > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-950/80 border-2 border-amber-500 text-amber-200 flex items-center justify-between gap-3 shadow-lg shadow-amber-950/40">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
                <div>
                  <h4 className="font-bold text-xs">
                    {isArabic ? `تنبيه استباقي: ${totalCriticalCerts} شهادات تنتهي خلال أقل من 30 يوماً!` : `EARLY WARNING: ${totalCriticalCerts} Certificates Expiring < 30 Days!`}
                  </h4>
                  <p className="text-[11px] text-amber-300/80">
                    {isArabic ? 'تم تلوين صفوف الأفراد باللون الأصفر لاتخاذ إجراءات التجديد الفوري.' : 'Affected crew rows highlighted in YELLOW for urgent renewal.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setFilterExpiry('critical'); setActiveSubTab('certificates'); }}
                className="px-2.5 py-1 rounded bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold shrink-0 border border-amber-400"
              >
                {isArabic ? 'فلترة < 30 يوماً' : 'Show <30d'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div
          onClick={() => { setActiveSubTab('register'); setFilterExpiry('all'); }}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl cursor-pointer transition-all"
        >
          <span className="text-[11px] text-slate-400 block">{isArabic ? 'إجمالي الطاقم المعين' : 'Total Registered Crew'}</span>
          <span className="font-mono text-2xl font-bold text-white mt-1 block">{crewMembers.length}</span>
          <span className="text-[10px] text-emerald-400">{isArabic ? '100% مستوفين التعارف بالسلامة' : '100% Safety Familiarized'}</span>
        </div>

        <div
          onClick={() => { setActiveSubTab('certificates'); setFilterExpiry('all'); }}
          className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-3.5 rounded-xl cursor-pointer transition-all"
        >
          <span className="text-[11px] text-slate-400 block">{isArabic ? 'شهادات الكفاءة المسجلة' : 'Registered Certificates'}</span>
          <span className="font-mono text-2xl font-bold text-cyan-400 mt-1 block">{crewCertificates.length}</span>
          <span className="text-[10px] text-slate-400">STCW / IMCA / OPITO</span>
        </div>

        <div
          onClick={() => { setActiveSubTab('certificates'); setFilterExpiry('critical'); }}
          className="bg-amber-950/40 border border-amber-500/60 hover:border-amber-400 p-3.5 rounded-xl cursor-pointer transition-all shadow-sm"
        >
          <span className="text-[11px] text-amber-300 block font-semibold">{isArabic ? 'تنبيه: تنتهي خلال 30 يوماً (أصفر)' : 'Expiring < 30 Days (Yellow)'}</span>
          <span className="font-mono text-2xl font-bold text-amber-400 mt-1 block">{totalCriticalCerts}</span>
          <span className="text-[10px] text-amber-300/80">{isArabic ? 'تستوجب التجديد الفوري' : 'Urgent renewal required'}</span>
        </div>

        <div
          onClick={() => { setActiveSubTab('certificates'); setFilterExpiry('expired'); }}
          className="bg-rose-950/40 border border-rose-500/60 hover:border-rose-400 p-3.5 rounded-xl cursor-pointer transition-all shadow-sm"
        >
          <span className="text-[11px] text-rose-300 block font-semibold">{isArabic ? 'منتهية الصلاحية (أحمر)' : 'Expired Certificates (Red)'}</span>
          <span className="font-mono text-2xl font-bold text-rose-400 mt-1 block">{totalExpiredCerts}</span>
          <span className="text-[10px] text-rose-300/80">{isArabic ? 'إيقاف النزول للعمل' : 'Blocks deployment'}</span>
        </div>
      </div>

      {/* Sub Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveSubTab('certificates')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
            activeSubTab === 'certificates'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>{isArabic ? 'مصفوفة الشهادات والتنبيهات الملونة' : 'Certificates & Expiry Matrix'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('register')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
            activeSubTab === 'register'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{isArabic ? 'سجل الأفراد الفعلي (تلوين الأفراد)' : 'Crew Manifest'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('manning')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
            activeSubTab === 'manning'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isArabic ? 'خطة المانينج (12 خطة لتوزيع الطاقم)' : 'Manning Plans (12)'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('roles')}
          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
            activeSubTab === 'roles'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{isArabic ? 'الرتب الـ 12 والاشتراطات الـ 23' : '12 Roles & 23 Req'}</span>
        </button>
      </div>

      {/* TAB 1: CERTIFICATES MATRIX WITH YELLOW/RED ROW COLORING */}
      {activeSubTab === 'certificates' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'بحث بالاسم، رقم الشهادة، جهة الإصدار...' : 'Search cert number, issuer, name...'}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-200"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setFilterExpiry('all')}
                className={`px-2.5 py-1 rounded-lg border ${
                  filterExpiry === 'all' ? 'bg-slate-800 text-white border-slate-600' : 'text-slate-400 border-slate-800'
                }`}
              >
                {isArabic ? 'الكل' : 'All'}
              </button>
              <button
                onClick={() => setFilterExpiry('critical')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                  filterExpiry === 'critical' ? 'bg-amber-950 text-amber-200 border-amber-500 font-bold' : 'text-slate-400 border-slate-800'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{isArabic ? '< 30 يوم (أصفر)' : '< 30 Days (Yellow)'}</span>
              </button>
              <button
                onClick={() => setFilterExpiry('expired')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                  filterExpiry === 'expired' ? 'bg-rose-950 text-rose-200 border-rose-500 font-bold' : 'text-slate-400 border-slate-800'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>{isArabic ? 'منتهية الصلاحية (أحمر)' : 'Expired (Red)'}</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">{isArabic ? 'الرمز والمعرف' : 'RID'}</th>
                    <th className="px-4 py-3">{isArabic ? 'نوع الشهادة' : 'Certificate Type'}</th>
                    <th className="px-4 py-3">{isArabic ? 'حامل الشهادة' : 'Holder (Crew Member)'}</th>
                    <th className="px-4 py-3">{isArabic ? 'رقم الشهادة والجهة' : 'Cert No & Issuer'}</th>
                    <th className="px-4 py-3">{isArabic ? 'تاريخ الانتهاء' : 'Expiry Date'}</th>
                    <th className="px-4 py-3">{isArabic ? 'حالة الصلاحية والتنبيه' : 'Validity Alert Status'}</th>
                    <th className="px-4 py-3 text-right">{isArabic ? 'الإجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredCerts.map(cert => {
                    const days = getDaysRemaining(cert.expiry_date);
                    const isExpired = days < 0;
                    const isCritical = days >= 0 && days <= 30;

                    // Row Coloring Rule as requested:
                    // Expired -> RED row
                    // <30 Days -> YELLOW row
                    // Normal -> standard row
                    const rowClass = isExpired
                      ? 'bg-rose-950/60 hover:bg-rose-900/60 border-l-4 border-l-rose-500 text-rose-100 font-medium'
                      : isCritical
                      ? 'bg-amber-950/50 hover:bg-amber-900/50 border-l-4 border-l-amber-500 text-amber-100 font-medium'
                      : 'hover:bg-slate-800/40 text-slate-300';

                    return (
                      <tr key={cert.id} className={`transition-colors ${rowClass}`}>
                        <td className="px-4 py-3 font-mono font-bold whitespace-nowrap">
                          {isExpired ? (
                            <span className="text-rose-400 flex items-center gap-1">
                              <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                              {cert.rid}
                            </span>
                          ) : isCritical ? (
                            <span className="text-amber-300 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              {cert.rid}
                            </span>
                          ) : (
                            <span className="text-cyan-400">{cert.rid}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-white">{cert.title.split('-')[0]}</p>
                          <p className="text-[10px] text-slate-400">{cert.data?.issuer}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold whitespace-nowrap">
                          {cert.data?.crew_name || cert.title.split('-')[1] || 'Crew Member'}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap">
                          <div>{cert.data?.certificate_number}</div>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold whitespace-nowrap">
                          {cert.expiry_date || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1.5 shadow-sm ${
                              isExpired
                                ? 'bg-rose-600 text-white animate-pulse'
                                : isCritical
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {isExpired ? (
                              <>
                                <AlertOctagon className="w-3.5 h-3.5" />
                                <span>{isArabic ? `منتهية منذ ${Math.abs(days)} يوماً!` : `EXPIRED (${Math.abs(days)}d ago)`}</span>
                              </>
                            ) : isCritical ? (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>{isArabic ? `تنبيه: متبقي ${days} يوماً` : `CRITICAL: ${days}d left`}</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>{isArabic ? `سارية (${days} يوماً)` : `Valid (${days}d left)`}</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => onSelectRecord(cert)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                          >
                            {isArabic ? 'معاينة' : 'Inspect'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREW REGISTER WITH COLORING PER MEMBER CERTIFICATE STATUS */}
      {activeSubTab === 'register' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>{isArabic ? 'سجل الأفراد الفعلي على المتن ومطابقة الشهادات' : 'Crew Manifest & Certificate Compliance Tracker'}</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isArabic
                  ? 'يتم تلوين صفوف الأفراد الذين لديهم شهادات ستنتهي خلال أقل من 30 يوماً باللون الأصفر، والشهادات منتهية الصلاحية باللون الأحمر مع أيقونة تحذيرية.'
                  : 'Personnel rows with certificates expiring in < 30 days are highlighted YELLOW, and expired in RED with warning icons.'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                {filteredMembers.length} {isArabic ? 'فرد مسجل' : 'crew members'}
              </span>
              <button
                onClick={() => setFilterExpiry('all')}
                className={`px-2.5 py-1 rounded-lg border ${
                  filterExpiry === 'all' ? 'bg-slate-800 text-white border-slate-600' : 'text-slate-400 border-slate-800'
                }`}
              >
                {isArabic ? 'الكل' : 'All'}
              </button>
              <button
                onClick={() => setFilterExpiry('critical')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                  filterExpiry === 'critical' ? 'bg-amber-950 text-amber-200 border-amber-500 font-bold' : 'text-slate-400 border-slate-800'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{isArabic ? '< 30 يوم (أصفر)' : '< 30 Days (Yellow)'}</span>
              </button>
              <button
                onClick={() => setFilterExpiry('expired')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                  filterExpiry === 'expired' ? 'bg-rose-950 text-rose-200 border-rose-500 font-bold' : 'text-slate-400 border-slate-800'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>{isArabic ? 'منتهية (أحمر)' : 'Expired (Red)'}</span>
              </button>
            </div>
          </div>

          {/* Master Personnel Table with Yellow/Red Row Coloring */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">{isArabic ? 'المعرف (RID)' : 'Crew ID'}</th>
                    <th className="px-4 py-3">{isArabic ? 'اسم فرد الطاقم' : 'Full Name'}</th>
                    <th className="px-4 py-3">{isArabic ? 'الرتبة / التخصص' : 'Rank & Role'}</th>
                    <th className="px-4 py-3">{isArabic ? 'السيناريو / الوردية' : 'Scenario & Shift'}</th>
                    <th className="px-4 py-3">{isArabic ? 'الكابينة / الطوارئ' : 'Cabin & Station'}</th>
                    <th className="px-4 py-3">{isArabic ? 'حالة صلاحية الشهادات' : 'Cert Expiry Status'}</th>
                    <th className="px-4 py-3">{isArabic ? 'موافقة النزول' : 'Deployment Status'}</th>
                    <th className="px-4 py-3 text-right">{isArabic ? 'الإجراء' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredMembers.map(m => {
                    const alertInfo = getCrewMemberCertAlert(m.id, m.rid, m.data?.full_name || m.title);

                    // Row Coloring Logic as requested:
                    // 1) Expired cert -> RED row with AlertOctagon warning icon
                    // 2) Expiring in < 30 days -> YELLOW row with AlertTriangle warning icon
                    // 3) Valid -> standard clean row
                    const rowClass = alertInfo.hasExpired
                      ? 'bg-rose-950/70 hover:bg-rose-900/70 border-l-4 border-l-rose-500 text-rose-100 font-medium'
                      : alertInfo.hasCritical
                      ? 'bg-amber-950/60 hover:bg-amber-900/60 border-l-4 border-l-amber-500 text-amber-100 font-medium'
                      : 'hover:bg-slate-800/40 text-slate-300';

                    return (
                      <tr
                        key={m.id}
                        onClick={() => onSelectRecord(m)}
                        className={`transition-colors cursor-pointer ${rowClass}`}
                      >
                        <td className="px-4 py-3 font-mono font-bold whitespace-nowrap">
                          {alertInfo.hasExpired ? (
                            <span className="text-rose-400 flex items-center gap-1.5">
                              <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
                              <span>{m.rid}</span>
                            </span>
                          ) : alertInfo.hasCritical ? (
                            <span className="text-amber-300 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>{m.rid}</span>
                            </span>
                          ) : (
                            <span className="text-cyan-400">{m.rid}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-white text-xs">{m.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            ID: {m.data?.national_id_or_passport || 'Verified'}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-200 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 text-[11px]">
                            {m.data?.role_title || m.data?.role_id || 'Marine Crew'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                          <div>{m.data?.scenario}</div>
                          <div className="text-[10px] text-slate-400">{m.data?.shift}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-300">
                          <div>{m.data?.cabin_number || 'TBD'}</div>
                          <div className="text-[10px] text-slate-400">{m.data?.emergency_station || 'Station 1'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {alertInfo.hasExpired ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-600 text-white flex items-center gap-1.5 w-fit shadow-md shadow-rose-950/60 animate-pulse">
                              <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                              <span>{isArabic ? 'شهادة منتهية (أحمر)' : 'EXPIRED CERT'}</span>
                            </span>
                          ) : alertInfo.hasCritical ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 flex items-center gap-1.5 w-fit shadow-md shadow-amber-950/50">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>{isArabic ? `تنتهي خلال ${alertInfo.minDays} يوماً (أصفر)` : `Expires in ${alertInfo.minDays}d`}</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5 w-fit">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{isArabic ? 'الشهادات سارية' : 'All Certs Valid'}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {alertInfo.hasExpired ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900/60 text-rose-300 border border-rose-500">
                              {isArabic ? 'موقوف / Blocked' : 'Blocked'}
                            </span>
                          ) : alertInfo.hasCritical ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900/60 text-amber-300 border border-amber-500">
                              {isArabic ? 'مشروط / Conditional' : 'Conditional'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                              {m.data?.deployment_approval || 'Approved'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onSelectRecord(m);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
                          >
                            {isArabic ? 'معاينة' : 'Inspect'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MANNING PLAN */}
      {activeSubTab === 'manning' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-100">
              {isArabic ? 'خطط الحد الأدنى الآمن للمانينج (12 خطة لتوزيع الطاقم)' : 'Minimum Safe Manning Baseline Plans (12)'}
            </h4>
            <button
              onClick={() => onOpenNewRecord('manning_plan')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              + {isArabic ? 'إضافة سيناريو' : 'Add Scenario'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {manningPlans.map(plan => (
              <div key={plan.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{plan.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      plan.data?.approval_status === 'Approved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {plan.data?.approval_status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">{isArabic ? 'المطلوب' : 'Required'}</span>
                    <span className="font-mono text-base font-bold text-cyan-400">{plan.data?.required_persons}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">{isArabic ? 'الفعلي' : 'Assigned'}</span>
                    <span className="font-mono text-base font-bold text-emerald-400">{plan.data?.assigned_persons}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">{isArabic ? 'الامتثال' : 'Status'}</span>
                    <span className="font-mono text-xs font-bold text-white block mt-1">
                      {plan.data?.assigned_persons >= plan.data?.required_persons ? '100% OK' : 'DEFICIT'}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  {plan.data?.approving_authority}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ROLES & REQUIREMENTS */}
      {activeSubTab === 'roles' && (
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-sm text-slate-100 mb-3">
              {isArabic ? 'الرتب البحرية الحرجة الـ 12 (Critical Crew Roles)' : 'The 12 Critical Marine Roles'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {crewRoles.map(role => (
                <div key={role.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-400">{role.rid}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px]">
                      {role.data?.applicability}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-200">{role.title}</h4>
                  <p className="text-[11px] text-slate-400">{role.description}</p>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-0.5">
                    <div><strong className="text-slate-300">Basis:</strong> {role.data?.approved_role_basis}</div>
                    <div><strong className="text-slate-300">Authority:</strong> {role.data?.authority}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
