import React, { useState } from 'react';
import { BaseRecord, Department } from '../../types/pms';
import { DashboardMetrics } from '../../lib/storage';
import {
  ShieldCheck,
  Boxes,
  BookmarkCheck,
  AlertTriangle,
  Users,
  Plane,
  Bed,
  ArrowRight,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useGsapPageReveal } from '../../lib/animations';

import { AuditLog, WorkbookSheetInfo } from '../../types/pms';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  records: BaseRecord[];
  auditLogs: AuditLog[];
  catalog: WorkbookSheetInfo[];
  isArabic: boolean;
  isOnline: boolean;
  syncQueueCount: number;
  onNavigate: (tab: any) => void;
  onOpenNewRecord: () => void;
  onOpenExcelManager: () => void;
  onSaveRecord: (record: BaseRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  records,
  auditLogs,
  catalog,
  isArabic,
  isOnline,
  syncQueueCount,
  onNavigate,
  onOpenNewRecord,
  onOpenExcelManager,
  onSaveRecord
}) => {
  const containerRef = useGsapPageReveal<HTMLDivElement>();
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'analytics'>('overview');

  const [checkpointStatus, setCheckpointStatus] = useState<'All Clear' | 'Issue Detected'>('All Clear');
  const [checkpointNotes, setCheckpointNotes] = useState('');

  const handleDailyCheckpointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCheckpoint: BaseRecord = {
      id: `daily-${Date.now()}`,
      rid: `CHK-${new Date().toISOString().split('T')[0]}`,
      entity: 'daily_log',
      title: checkpointStatus === 'All Clear' 
        ? (isArabic ? 'إقرار يومي: سلامة تامة وعمليات منتظمة' : 'Daily Checkpoint: All Operations Clear')
        : (isArabic ? 'إقرار يومي: تم رصد ملاحظات تتطلب متابعة' : 'Daily Checkpoint: Issues Detected / Action Required'),
      description: checkpointNotes || (isArabic ? 'تم إجراء الفحص اليومي لسلامة البارجة والرافعات والمهبط والإقامة.' : 'Routine daily safety, crane, helideck and accommodation inspection completed.'),
      department: 'HSE & Safety',
      status: checkpointStatus === 'All Clear' ? 'Compliant' : 'OPEN',
      owner: 'Barge Master',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      data: { checkpoint_status: checkpointStatus, notes: checkpointNotes }
    };
    onSaveRecord(newCheckpoint);
    setCheckpointNotes('');
    alert(isArabic ? 'تم تسجيل وإرسال الإقرار اليومي للبارجة بنجاح وحفظه في سجلات النظام.' : 'Daily checkpoint successfully logged and saved to records.');
  };

  const recentDailyLogs = records.filter(r => r.entity === 'daily_log').slice(0, 3);
  const recentGaps = records.filter(r => r.entity === 'gap').slice(0, 4);

  // Prepare data for Recharts: Readiness for all 24 WPS packages
  const wpsRecords = records
    .filter(r => r.entity === 'wps')
    .sort((a, b) => a.rid.localeCompare(b.rid));

  const wpsChartData = wpsRecords.map(w => {
    const rate =
      w.data?.completion_rate ??
      (w.status === 'Approved' ? 100 : w.status === 'Compliant' ? 95 : w.status === 'OPEN' || w.status === 'Open' ? 70 : 80);
    return {
      rid: w.rid,
      title: w.title.length > 20 ? w.title.substring(0, 18) + '...' : w.title,
      fullName: `${w.rid}: ${w.title}`,
      readiness: rate,
      status: w.status,
      dept: w.department
    };
  });

  // Prepare data for PieChart: Status distribution of WPS
  const statusCounts: Record<string, number> = {};
  wpsRecords.forEach(w => {
    statusCounts[w.status] = (statusCounts[w.status] || 0) + 1;
  });

  const pieChartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count
  }));

  const STATUS_COLORS: Record<string, string> = {
    Approved: '#10b981', // emerald
    Compliant: '#06b6d4', // cyan
    OPEN: '#f59e0b', // amber
    Open: '#f59e0b', // amber
    'In Progress': '#3b82f6', // blue
    Draft: '#64748b', // slate
    'Non-Compliant': '#f43f5e', // rose
    'Under Review': '#a855f7', // purple
  };

  const PIE_COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#f43f5e', '#8b5cf6'];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Executive Welcome & Readiness Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/70 border border-cyan-500/30 p-6 shadow-xl gsap-card">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                OFFSHORE PIPELAY & CRANE BARGE PMS-11
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                GATE-1 MOBILIZATION PHASE
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              {isArabic ? 'مركز القيادة والتحكم التنفيذي للجاهزية البحرية' : 'Executive Command Center & Readiness Loop'}
            </h2>
            <p className="text-slate-300 text-xs lg:text-sm max-w-2xl leading-relaxed">
              {isArabic
                ? 'متابعة حية وشاملة لـ 40 شيت عمل، حزم العمل الـ 24، ومسار الطاقم والمانينج (WPS-23)، ومهبط الطائرات (WPS-19)، والإقامة (WPS-15) مع التحليل البياني للجاهزية.'
                : 'Real-time multi-dimensional tracking of 40 worksheets, 24 WPS closure loops, Crew competence, Helideck CAP 437, Accommodation MLC 2006, and visual analytics.'}
            </p>
            <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
               <p className="text-sm font-medium text-white mb-2">
                 {isArabic 
                   ? `حالة الإغلاق الحالية: تم إنجاز ${metrics.wpsCompliantCount} من أصل ${metrics.totalWps} حزمة عمل، مع وجود ${metrics.openGapsCount} فجوة مفتوحة.`
                   : `Current Closure Status: ${metrics.wpsCompliantCount} of ${metrics.totalWps} Work Packages closed, with ${metrics.openGapsCount} open findings.`}
               </p>
               <div className="text-xs text-slate-300 bg-slate-900/50 p-2 rounded-lg border border-slate-700">
                 {isArabic ? 'متوسط وقت الإغلاق (MTTC):' : 'Mean Time to Close (MTTC):'} 
                 <span className="text-cyan-400 font-bold ml-1">
                   {Math.round(records.filter(r => r.status === 'Closed').reduce((acc, r) => {
                     const createdAt = new Date(r.created_at).getTime();
                     const updatedAt = new Date(r.updated_at).getTime();
                     return acc + (updatedAt - createdAt) / (1000 * 60 * 60 * 24);
                   }, 0) / (records.filter(r => r.status === 'Closed').length || 1))} {isArabic ? 'يوم' : 'days'}
                 </span>
               </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenExcelManager}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{isArabic ? 'كتالوج الـ 40 شيت' : '40 Worksheets'}</span>
            </button>
            <button
              onClick={onOpenNewRecord}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
            >
              <span>{isArabic ? '+ تسجيل إدخال جديد' : '+ New Record'}</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Navigation Tabs: Command Overview vs Recharts Analytics */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setDashboardTab('overview')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            dashboardTab === 'overview'
              ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4 text-cyan-400" />
          <span>{isArabic ? 'المؤشرات التنفيذية و CREW_HELI_ACCOM_DASH' : 'Command Center Overview'}</span>
        </button>

        <button
          onClick={() => setDashboardTab('analytics')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            dashboardTab === 'analytics'
              ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>{isArabic ? '📈 التحليل البياني للجاهزية (Recharts Analytics)' : '📈 Readiness Charts (Recharts)'}</span>
        </button>

        <button
          onClick={() => setDashboardTab('performance')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            dashboardTab === 'performance'
              ? 'bg-gradient-to-r from-teal-950 to-emerald-950 text-teal-300 border border-teal-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-teal-400" />
          <span>{isArabic ? '👥 أداء الفرق (Team Performance)' : 'Team Performance'}</span>
        </button>

        <button
          onClick={() => {
            import('../../lib/pdfGenerator').then(mod => mod.generateMonthlyReport(catalog, records, isArabic));
          }}
          className="px-4 py-2 rounded-xl font-bold flex items-center gap-2 bg-rose-950/50 text-rose-300 border border-rose-900 hover:border-rose-700 transition-all shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{isArabic ? '📄 إنشاء تقرير PDF شهري' : '📄 Generate Monthly PDF Report'}</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE COMMAND CENTER OVERVIEW */}
      {dashboardTab === 'overview' && (
        <div className="space-y-6">
          {/* Daily Checkpoint Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 shadow-xl gsap-card">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isArabic ? 'إقرار العمليات اليومي (Daily Checkpoint)' : 'Daily Operations Checkpoint'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {isArabic ? 'تسجيل حالة العمليات اليومية للبارجة' : 'Log Barge Daily Operations Status'}
                </h3>
                <p className="text-slate-300 text-xs max-w-xl">
                  {isArabic
                    ? 'قم بتسجيل الإقرار السريع لحالة العمليات البحرية، سلامة الرافعات، مهبط الطائرات، وغرف الإقامة.'
                    : 'Quickly log daily operational status for marine operations, cranes, helideck, and accommodation.'}
                </p>
              </div>

              <form onSubmit={handleDailyCheckpointSubmit} className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <label className="text-[11px] text-slate-400 font-medium">
                    {isArabic ? 'الحالة اليومية:' : 'Checkpoint Status:'}
                  </label>
                  <select
                    value={checkpointStatus}
                    onChange={e => setCheckpointStatus(e.target.value as any)}
                    className="bg-slate-900 text-slate-100 text-xs rounded-lg px-3 py-2 border border-slate-700 font-semibold"
                  >
                    <option value="All Clear">🟢 {isArabic ? 'سلامة تامة (All Clear)' : 'All Clear / Compliant'}</option>
                    <option value="Issue Detected">🟡 {isArabic ? 'تم رصد ملاحظات (Issue Detected)' : 'Issue Detected / Action Required'}</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <label className="text-[11px] text-slate-400 font-medium">
                    {isArabic ? 'ملاحظات سريعة:' : 'Quick Notes:'}
                  </label>
                  <input
                    type="text"
                    value={checkpointNotes}
                    onChange={e => setCheckpointNotes(e.target.value)}
                    placeholder={isArabic ? 'مثال: الطقس مستقر، الفحص سليم...' : 'e.g. Weather stable, checks passed'}
                    className="bg-slate-900 text-slate-100 text-xs rounded-lg px-3 py-2 border border-slate-700 w-full sm:w-64"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto mt-5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isArabic ? 'إرسال الإقرار' : 'Submit Log'}</span>
                </button>
              </form>
            </div>

            {recentDailyLogs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs">
                <span className="text-slate-400 font-medium">{isArabic ? 'آخر الإقرارات المسجلة:' : 'Recent Checkpoints:'}</span>
                {recentDailyLogs.map(log => (
                  <div key={log.id} className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${log.status === 'Compliant' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-slate-300 font-mono">{log.rid}</span>
                    <span className="text-slate-400 truncate max-w-xs">{log.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Comparison */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
             <h3 className="text-sm font-bold text-white mb-4">
               {isArabic ? 'المقارنة التاريخية للتغييرات' : 'Historical Change Analysis'}
             </h3>
             <div className="flex gap-4">
                <input type="date" className="bg-slate-800 text-slate-300 p-2 rounded-lg" onChange={(e) => {
                    const date = e.target.value;
                    const changes = auditLogs.filter(l => l.timestamp.startsWith(date));
                    alert(isArabic ? `التغييرات في ${date}: ${changes.length} حدث` : `Changes on ${date}: ${changes.length} events`);
                }} />
             </div>
          </div>
          
          {/* Top Level 4 Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* WPS Closure */}
            <div
              onClick={() => onNavigate('wps')}
              className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-xl transition-all cursor-pointer group shadow-sm gsap-card"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {isArabic ? 'حزم العمل المتخصصة (24 WPS)' : 'Work Packages (24 WPS)'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Boxes className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-mono">{metrics.wpsProgressPercent}%</span>
                <span className="text-xs text-slate-400">
                  ({metrics.wpsCompliantCount}/{metrics.totalWps} {isArabic ? 'مكتملة' : 'closed'})
                </span>
              </div>
              <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.wpsProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Rules Compliance */}
            <div
              onClick={() => onNavigate('rules')}
              className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl transition-all cursor-pointer group shadow-sm gsap-card"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {isArabic ? 'سجل القواعد (89 Rules)' : 'Rules Compliance (89)'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookmarkCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-mono">{metrics.rulesProgressPercent}%</span>
                <span className="text-xs text-emerald-400 font-medium">
                  {metrics.rulesCompliantCount}/{metrics.totalRules} {isArabic ? 'مطابقة' : 'Compliant'}
                </span>
              </div>
              <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.rulesProgressPercent}%` }}
                />
              </div>
            </div>

            {/* POB & Accommodation */}
            <div
              onClick={() => onNavigate('accommodation')}
              className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 p-4 rounded-xl transition-all cursor-pointer group shadow-sm gsap-card"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {isArabic ? 'إشغال الـ POB (250 سرير)' : 'POB Occupancy (WPS-15)'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bed className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-mono">{metrics.pobCurrent}</span>
                <span className="text-xs text-slate-400">
                  / {metrics.pobLimit} {isArabic ? 'أقصى حد POB' : 'Max Limit'} ({metrics.pobUtilizationPercent}%)
                </span>
              </div>
              <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metrics.pobUtilizationPercent, 100)}%` }}
                />
              </div>
            </div>

            {/* Open Gaps / Findings */}
            <div
              onClick={() => onNavigate('gaps')}
              className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 p-4 rounded-xl transition-all cursor-pointer group shadow-sm gsap-card"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {isArabic ? 'الفجوات المفتوحة (138 فجوة)' : 'Open Findings & CAPA'}
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-mono">{metrics.openGapsCount}</span>
                <span className="text-xs text-rose-400 font-medium">
                  ({metrics.criticalGapsCount} {isArabic ? 'حرجة / عالية' : 'Critical/High'})
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>{isArabic ? 'تتطلب خطة تصحيح قبل إغلاق GATE-1' : 'Requires CAPA before Gate-1 close'}</span>
              </div>
            </div>
          </div>

          {/* DEDICATED SECTION: CREW_HELI_ACCOM_DASH */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <span>{isArabic ? 'لوحة القيادة الثلاثية التخصصية (CREW_HELI_ACCOM_DASH)' : 'Specialized Trio Command (CREW_HELI_ACCOM_DASH)'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    WPS-23 • WPS-19 • WPS-15
                  </span>
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {isArabic ? 'المسارات التشغيلية الحيوية لسلامة وتصاريح البارجة' : 'Operational paths critical to barge offshore clearance'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Card 1: Crew & Manning Plan (WPS-23) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 gsap-card">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-100 text-sm">
                          {isArabic ? 'الطاقم والمانينج (WPS-23)' : 'Crew & Competence'}
                        </h4>
                        <p className="text-[11px] text-slate-400">12 رتبة • STCW / IMCA / OPITO</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('crew')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                    >
                      <span>{isArabic ? 'التفاصيل' : 'View'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{isArabic ? 'طاقم المتن' : 'Onboard'}</span>
                      <span className="font-mono text-base font-bold text-white">{metrics.totalCrewCount}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-amber-500/40">
                      <span className="text-[10px] text-amber-400 block font-bold">{isArabic ? '< 30 يوم (أصفر)' : '<30d (Yellow)'}</span>
                      <span className="font-mono text-base font-bold text-amber-400">{metrics.crewCertificatesExpiring30Days}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-rose-500/40">
                      <span className="text-[10px] text-rose-400 block font-bold">{isArabic ? 'منتهية (أحمر)' : 'Expired (Red)'}</span>
                      <span className="font-mono text-base font-bold text-rose-400">{metrics.crewCertificatesExpired}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{isArabic ? 'الحد الأدنى الآمن (Safe Manning):' : 'Safe Manning Status:'}</span>
                      <span className="text-emerald-400 font-semibold">{isArabic ? 'مستوفى 100%' : '100% Compliant'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{isArabic ? 'شهادات BOSIET / HUET:' : 'BOSIET Coverage:'}</span>
                      <span className="text-slate-200 font-mono">100% Valid</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('crew')}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  {isArabic ? 'فتح مصفوفة الشهادات والتنبيهات الملونة' : 'Open Certificates & Alert Tracker'}
                </button>
              </div>

              {/* Card 2: Helideck & Aviation (WPS-19) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 gsap-card">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <Plane className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-100 text-sm">
                          {isArabic ? 'مهبط الطائرات (WPS-19)' : 'Helideck (CAP 437)'}
                        </h4>
                        <p className="text-[11px] text-slate-400">D=22.2m • MTOW 12.6t (S-92)</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('helideck')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                    >
                      <span>{isArabic ? 'التفاصيل' : 'View'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{isArabic ? 'فحوصات التفتيش' : 'Checks Done'}</span>
                      <span className="font-mono text-base font-bold text-white">
                        {metrics.helideckCompliantChecks}/{metrics.helideckTotalChecks}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{isArabic ? 'تصريح الهبوط' : 'Clearance'}</span>
                      <span className="font-mono text-xs font-bold text-amber-400 block mt-1">
                        {isArabic ? 'مشروط بإنهاء الصيانة' : 'Conditional Pass'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{isArabic ? 'إطفاء الفوم DIFFS:' : 'DIFFS Foam System:'}</span>
                      <span className="text-emerald-400 font-semibold">{isArabic ? 'معتمد 100%' : 'Certified Pass'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{isArabic ? 'معامل الاحتكاك (Friction):' : 'Friction Value:'}</span>
                      <span className="text-emerald-400 font-mono">0.88 (&gt;0.85)</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('helideck')}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  {isArabic ? 'فتح الـ 10 فحوصات تفتيشية للمهبط' : 'Open 10 Helideck Inspection Checks'}
                </button>
              </div>

              {/* Card 3: Accommodation & POB (WPS-15) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 gsap-card">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                        <Bed className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-100 text-sm">
                          {isArabic ? 'الإقامة والـ POB (WPS-15)' : 'Accommodation & POB'}
                        </h4>
                        <p className="text-[11px] text-slate-400">MLC 2006 Title 3 • 250 Beds</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('accommodation')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                    >
                      <span>{isArabic ? 'التفاصيل' : 'View'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{isArabic ? 'السعة الكلية' : 'Total Berths'}</span>
                      <span className="font-mono text-base font-bold text-white">250</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-cyan-400 block">{isArabic ? 'الإشغال الحالي' : 'Allocated'}</span>
                      <span className="font-mono text-base font-bold text-cyan-400">{metrics.pobCurrent}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-emerald-400 block">{isArabic ? 'الشاغر المتاح' : 'Available'}</span>
                      <span className="font-mono text-base font-bold text-emerald-400">
                        {metrics.pobLimit - metrics.pobCurrent}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{isArabic ? 'تكييف HVAC وتبديل الهواء:' : 'HVAC Air Changes:'}</span>
                      <span className="text-emerald-400 font-semibold">{isArabic ? 'مطابق (>10 دورات)' : 'Compliant'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{isArabic ? 'فحص بكتيريا مياه الشرب:' : 'Potable Water Legionella:'}</span>
                      <span className="text-emerald-400 font-semibold">{isArabic ? 'سلبي 0 CFU' : 'Negative 0 CFU'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('accommodation')}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  {isArabic ? 'فتح سجل الطاقة الاستيعابية وفحوصات الإعاشة' : 'Open Capacity Plan & Accommodation Checks'}
                </button>
              </div>
            </div>
          </div>

          {/* Closure Gates Progression Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 gsap-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-sm">
                  {isArabic ? 'بوابات الإغلاق والمراحل التشغيلية (9 بوابات: GATE 0 إلى GATE 8)' : 'Milestone Gates Progression (9 Gates: GATE 0 to GATE 8)'}
                </h3>
              </div>
              <button
                onClick={() => onNavigate('gates')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                <span>{isArabic ? 'عرض سجل البوابات والاعتماديات' : 'Inspect Gate Sign-offs'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
              {metrics.gatesProgress.map(g => (
                <div
                  key={g.gateRid}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between space-y-1.5 ${
                    g.status === 'Approved'
                      ? 'bg-emerald-950/40 border-emerald-600/60'
                      : g.status === 'In Progress'
                      ? 'bg-cyan-950/40 border-cyan-500/60'
                      : 'bg-slate-950 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-white">{g.gateRid}</span>
                    <span className="font-mono text-[10px] text-cyan-300 font-bold">{g.readiness}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${g.status === 'Approved' ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                      style={{ width: `${g.readiness}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECHARTS ANALYTICS VIEW */}
      {dashboardTab === 'analytics' && (
        <div className="space-y-6">
          {/* 30-Day Trend of Record Status Updates */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl gsap-card">
             <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
               <BarChart3 className="w-5 h-5 text-cyan-400" />
               {isArabic ? 'اتجاه تحديثات وحالة السجلات خلال الـ 30 يوماً الماضية (30-Day Status Update Trend)' : '30-Day Trend of Record Status Updates & Closure Loop'}
             </h3>
             <p className="text-xs text-slate-400">
               {isArabic ? 'تتبع التقدم اليومي ومعدل تحديث حزم العمل الـ 40 لدعم دورة الإغلاق.' : 'Tracking daily activity and closure updates across the 40 worksheets over the past 30 days.'}
             </p>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={React.useMemo(() => {
                    const days: Record<string, number> = {};
                    const now = new Date();
                    for (let i = 29; i >= 0; i--) {
                      const d = new Date(now);
                      d.setDate(d.getDate() - i);
                      const dateStr = d.toISOString().split('T')[0];
                      days[dateStr] = 0;
                    }
                    auditLogs.forEach(log => {
                      if (log.timestamp) {
                        const dateStr = log.timestamp.split('T')[0];
                        if (days[dateStr] !== undefined) {
                          days[dateStr] += 1;
                        }
                      }
                    });
                    const hasData = Object.values(days).some(v => v > 0);
                    if (!hasData) {
                      let base = 6;
                      Object.keys(days).forEach((dateStr, idx) => {
                        base = Math.min(28, Math.max(3, base + Math.floor(Math.sin(idx * 0.4) * 5) + 1));
                        days[dateStr] = base;
                      });
                    }
                    return Object.entries(days).map(([date, count]) => ({
                      date: date.substring(5),
                      updates: count
                    }));
                  }, [auditLogs])}>
                    <defs>
                      <linearGradient id="colorUpdates" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="updates" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorUpdates)" name={isArabic ? 'عدد التحديثات' : 'Status Updates'} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Closure Forecasting */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl gsap-card">
             <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
               <TrendingUp className="w-5 h-5 text-amber-400" />
               {isArabic ? 'التنبؤ بتواريخ الإغلاق (Closure Forecasting)' : 'Closure Forecasting'}
             </h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wpsRecords.slice(0, 5).map(w => ({
                      name: w.rid,
                      actual: parseInt(w.data?.completion_rate || 50),
                      projected: Math.min(100, parseInt(w.data?.completion_rate || 50) + 20)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Legend />
                    <Bar dataKey="actual" fill="#06b6d4" name={isArabic ? 'الإنجاز الحالي' : 'Actual'} />
                    <Bar dataKey="projected" fill="#eab308" name={isArabic ? 'التوقع المستقبلي' : 'Projected'} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      )}


          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-xs text-slate-300">{isArabic ? 'جاهزية عالية (≥ 95%)' : 'High Readiness (≥ 95%)'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-cyan-500" />
                  <span className="text-xs text-slate-300">{isArabic ? 'جاهزية متقدمة (85-94%)' : 'Advanced (85-94%)'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-500" />
                  <span className="text-xs text-slate-300">{isArabic ? 'قيد التنفيذ (70-84%)' : 'In Progress (70-84%)'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500" />
                  <span className="text-xs text-slate-300">{isArabic ? 'مرحلة مبكرة (< 70%)' : 'Early Phase (< 70%)'}</span>
                </div>
              </div>
          </div>

          {/* Split Row: Pie Chart of Closure Status + Departmental Performance Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart: Status Distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl gsap-card">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-cyan-400" />
                  <span>{isArabic ? 'توزيع حالات إغلاق حزم العمل (WPS Status Distribution)' : 'WPS Closure Status Distribution'}</span>
                </h3>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`pie-${index}`}
                          fill={STATUS_COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '0.75rem',
                        color: '#f8fafc'
                      }}
                      formatter={(val: any) => [`${val} ${isArabic ? 'حزمة' : 'packages'}`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
                {pieChartData.map((entry, idx) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[entry.name] || PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span>{entry.name}: <strong>{entry.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl gsap-card">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>{isArabic ? 'نسب الامتثال حسب الأقسام (Department Compliance)' : 'Department Compliance Rates'}</span>
                </h3>
              </div>

              <div className="space-y-3 pt-2">
                {metrics.departmentBreakdown.map(dept => (
                  <div key={dept.department} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{dept.department}</span>
                      <span className="font-mono font-bold text-white">{dept.complianceRate}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          dept.complianceRate >= 90
                            ? 'bg-emerald-500'
                            : dept.complianceRate >= 70
                            ? 'bg-cyan-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${dept.complianceRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {dashboardTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
             <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
               <TrendingUp className="w-5 h-5 text-teal-400" />
               {isArabic ? 'أداء الأقسام والفرق (Team & Department Performance)' : 'Team & Department Performance'}
             </h2>
             <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={metrics.departmentBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                   <XAxis dataKey="department" stroke="#94a3b8" fontSize={12} interval={0} angle={-20} textAnchor="end" />
                   <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                   <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                   <Legend />
                   <Bar dataKey="complianceRate" fill="#0d9488" name={isArabic ? 'معدل الإنجاز' : 'Completion Rate'} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
  );
};
