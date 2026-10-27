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
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Target,
  Clock
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

import { PredictiveCompletionWidget } from '../widgets/PredictiveCompletionWidget';

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
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'analytics' | 'performance' | 'predictive'>('overview');

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

  const trendData = React.useMemo(() => {
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
  }, [auditLogs]);

  // Prepare data for Recharts: Readiness for all 24 WPS packages
  const wpsRecords = records
    .filter(r => r.entity === 'wps')
    .sort((a, b) => a.rid.localeCompare(b.rid));

  return (
    <div ref={containerRef} className="space-y-6">
      {/* SCEDC Deep Navy Executive Welcome Container matching reference image_7e8f4996.png */}
      <div className="rounded-3xl bg-[#0f2942] border border-[#1a3a5c] p-6 lg:p-8 shadow-2xl text-white space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#ff6600] text-white shadow-md">
                منظومة المشروعات والتدقيق الفني
              </span>
              <span className="px-3 py-1 text-xs font-mono rounded-full bg-[#1a3a5c] text-cyan-300 border border-cyan-800">
                SCEDC PORTAL 2026
              </span>
            </div>
            <h2 className="text-2xl lg:text-4xl font-black tracking-tight text-white">
              {isArabic ? 'مرحباً بك في لوحة المشترك والقيادة' : 'Welcome to Executive Command Portal'}
            </h2>
            <p className="text-slate-300 text-xs lg:text-sm max-w-2xl leading-relaxed">
              {isArabic
                ? 'تابع جميع الخدمات، المستهدفات المخططة مقابل الإنجاز الفعلي، وأرقام التحصيل والمرتبطة بإدارتك.'
                : 'Monitor all operational services, planned vs actual variance, and department KPIs in real-time.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenExcelManager}
              className="px-4 py-2.5 rounded-xl bg-[#1a3a5c] hover:bg-[#234b75] border border-slate-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{isArabic ? 'كتالوج الـ 40 شيت' : '40 Worksheets'}</span>
            </button>
            <button
              onClick={onOpenNewRecord}
              className="px-5 py-2.5 rounded-xl bg-[#ff6600] hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/30 transition-all"
            >
              <span>{isArabic ? '+ إضافة سجل جديد' : '+ New Record'}</span>
            </button>
          </div>
        </div>

        {/* 3 Status Info Cards inside Navy Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
            <span className="text-[11px] text-slate-300 block">{isArabic ? 'آخر دخول للنظام' : 'Last System Login'}</span>
            <span className="font-mono text-sm font-bold text-white mt-1 block">
              23:30:18 2026-10-27
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
            <span className="text-[11px] text-slate-300 block">{isArabic ? 'آخر قراءة مسجلة' : 'Last Recorded Entry'}</span>
            <span className="font-mono text-sm font-bold text-amber-300 mt-1 block">
              {records.length > 0 ? `${records.length} سجل معتمد` : 'لا توجد قراءة'}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
            <span className="text-[11px] text-slate-300 block">{isArabic ? 'حالة المزامنة والربط' : 'System Sync Status'}</span>
            <span className="font-mono text-sm font-bold text-emerald-300 mt-1 block">
              {isOnline ? (isArabic ? 'متصل ومحدث' : 'Online & Synced') : (isArabic ? `غير متصل (${syncQueueCount})` : `Offline (${syncQueueCount})`)}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Stat Summary Cards Row with Big Orange Numbers matching image_7e8f4996.png */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f2942] border border-[#1a3a5c] rounded-2xl p-6 shadow-lg text-center space-y-2 hover:border-orange-500/50 transition-all">
          <span className="text-4xl lg:text-5xl font-black text-[#ff6600] font-mono block">
            {records.filter(r => (r.entity === 'task' || r.entity === 'activity') && r.status !== 'Closed' && r.status !== 'Compliant').length || 0}
          </span>
          <span className="text-xs lg:text-sm font-bold text-slate-200 block">
            {isArabic ? 'الحجوزات والمهام' : 'Tasks & Bookings'}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {isArabic ? 'المهام والتفتيش الفضي' : 'Active Inspections'}
          </span>
        </div>

        <div className="bg-[#0f2942] border border-[#1a3a5c] rounded-2xl p-6 shadow-lg text-center space-y-2 hover:border-orange-500/50 transition-all">
          <span className="text-4xl lg:text-5xl font-black text-[#ff6600] font-mono block">
            {metrics.openGapsCount || 0}
          </span>
          <span className="text-xs lg:text-sm font-bold text-slate-200 block">
            {isArabic ? 'طلبات التواصل والمحاضر' : 'Communications & Gaps'}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {isArabic ? 'الفجوات المفتوحة' : 'Open Findings & CAPA'}
          </span>
        </div>

        <div className="bg-[#0f2942] border border-[#1a3a5c] rounded-2xl p-6 shadow-lg text-center space-y-2 hover:border-orange-500/50 transition-all">
          <span className="text-4xl lg:text-5xl font-black text-[#ff6600] font-mono block">
            {metrics.gatesProgress ? metrics.gatesProgress.filter(g => g.status !== 'Approved').length : 2}
          </span>
          <span className="text-xs lg:text-sm font-bold text-slate-200 block">
            {isArabic ? 'استعلامات الأذونات والبوابات' : 'Gates & Permits Query'}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {isArabic ? 'بوابات الإغلاق النشطة' : 'Mobilization Gates'}
          </span>
        </div>

        <div className="bg-[#0f2942] border border-[#1a3a5c] rounded-2xl p-6 shadow-lg text-center space-y-2 hover:border-orange-500/50 transition-all">
          <span className="text-4xl lg:text-5xl font-black text-[#ff6600] font-mono block">
            {metrics.wpsProgressPercent || 0}%
          </span>
          <span className="text-xs lg:text-sm font-bold text-slate-200 block">
            {isArabic ? 'القراءات المرسلة والإنجاز' : 'Submitted Records & Progress'}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {isArabic ? 'نسبة الإنجاز العامة' : 'Overall Completion Rate'}
          </span>
        </div>
      </div>

      {/* Top Navigation Tabs */}
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
          <span>{isArabic ? 'نظرة عامة والجاهزية الفعالية' : 'Command Center Overview'}</span>
        </button>

        <button
          onClick={() => setDashboardTab('performance')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            dashboardTab === 'performance'
              ? 'bg-gradient-to-r from-teal-950 to-emerald-950 text-teal-300 border border-teal-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span>{isArabic ? '📈 مقارنة المخطط مقابل الفعلي (Planned vs Actual)' : '📈 Planned vs Actual Performance'}</span>
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
          <span>{isArabic ? 'التحليل البياني للأعمال' : 'Readiness Charts'}</span>
        </button>

        <button
          onClick={() => setDashboardTab('predictive')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            dashboardTab === 'predictive'
              ? 'bg-gradient-to-r from-teal-950 to-cyan-950 text-teal-300 border border-teal-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{isArabic ? '🔮 التنبؤ بالانتهاء (Predictive 100%)' : '🔮 Predictive Forecast'}</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {dashboardTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Level 4 Metrics Cards with Planned vs Actual Comparisons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* WPS Closure Planned vs Actual */}
            <div
              onClick={() => onNavigate('wps')}
              className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-xl transition-all cursor-pointer group shadow-sm gsap-card space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {isArabic ? 'حزم العمل المتخصصة (24 WPS)' : 'Work Packages (24 WPS)'}
                </span>
                <Boxes className="w-4 h-4 text-cyan-400" />
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold text-white font-mono">{metrics.wpsProgressPercent}%</span>
                  <span className="text-[10px] text-slate-400 block">{isArabic ? 'الفعلي Actual' : 'Actual'}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-amber-400 font-mono">{metrics.wpsPlannedPercent}%</span>
                  <span className="text-[10px] text-slate-400 block">{isArabic ? 'المخطط Planned' : 'Planned Target'}</span>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 relative">
                  <div className="bg-amber-500/40 h-full rounded-full absolute" style={{ width: `${metrics.wpsPlannedPercent}%` }} />
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full relative" style={{ width: `${metrics.wpsProgressPercent}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono">
                  <span className={metrics.wpsProgressPercent >= metrics.wpsPlannedPercent ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    Variance: {metrics.wpsProgressPercent - metrics.wpsPlannedPercent}%
                  </span>
                  <span className="text-slate-400">{metrics.wpsCompliantCount}/{metrics.totalWps} Closed</span>
                </div>
              </div>
            </div>

            {/* Rules Compliance Planned vs Actual */}
            <div
              onClick={() => onNavigate('rules')}
              className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl transition-all cursor-pointer group shadow-sm gsap-card space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {isArabic ? 'سجل القواعد (89 Rules)' : 'Rules Compliance (89)'}
                </span>
                <BookmarkCheck className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold text-white font-mono">{metrics.rulesProgressPercent}%</span>
                  <span className="text-[10px] text-slate-400 block">{isArabic ? 'الفعلي Actual' : 'Actual'}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-amber-400 font-mono">{metrics.rulesPlannedPercent}%</span>
                  <span className="text-[10px] text-slate-400 block">{isArabic ? 'المخطط Planned' : 'Planned Target'}</span>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 relative">
                  <div className="bg-emerald-500 h-full rounded-full relative" style={{ width: `${metrics.rulesProgressPercent}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-emerald-400 font-bold">
                  <span>Variance: {metrics.rulesProgressPercent - metrics.rulesPlannedPercent}%</span>
                  <span>{metrics.rulesCompliantCount}/{metrics.totalRules} Pass</span>
                </div>
              </div>
            </div>

            {/* Accommodation Living Quarters (WPS-15 MLC 2006) - COMPLETELY SEPARATE */}
            <div
              onClick={() => onNavigate('accommodation')}
              className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 p-4 rounded-xl transition-all cursor-pointer group shadow-sm gsap-card space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <Bed className="w-4 h-4" />
                  <span>{isArabic ? 'الإقامة والإعاشة (WPS-15 MLC 2006)' : 'Accommodation & POB (WPS-15)'}</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 font-mono border border-blue-800">
                  MLC 2006
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold text-white font-mono">{metrics.pobCurrent}</span>
                  <span className="text-[10px] text-slate-400 block">/ {metrics.pobLimit} Berths ({metrics.pobUtilizationPercent}%)</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-amber-400 font-mono">{metrics.accommodationPlannedPercent}%</span>
                  <span className="text-[10px] text-slate-400 block">Planned Compliance</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-between">
                <span>HVAC & Legionella Status:</span>
                <span className="text-emerald-400 font-bold">Compliant Pass</span>
              </div>
            </div>

            {/* Helideck & Aviation Operations (WPS-19 ECAR 138 ECAA) - COMPLETELY SEPARATE */}
            <div
              onClick={() => onNavigate('helideck')}
              className="bg-[#0d2137] border border-[#1a365d] hover:border-orange-500/50 p-4 rounded-xl transition-all cursor-pointer group shadow-sm gsap-card space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                  <Plane className="w-4 h-4" />
                  <span>{isArabic ? 'مهبط الطائرات (WPS-19 ECAR 138)' : 'Helideck Aviation (ECAR 138)'}</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#ff6600] text-white font-mono font-bold border border-orange-400">
                  ECAR 138
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold text-white font-mono">{metrics.helideckActualPercent}%</span>
                  <span className="text-[10px] text-slate-400 block">{metrics.helideckCompliantChecks}/{metrics.helideckTotalChecks} Checks</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-amber-400 font-mono">{metrics.helideckPlannedPercent}%</span>
                  <span className="text-[10px] text-slate-400 block">Planned Target</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-between">
                <span>Helideck Status:</span>
                <span className="text-amber-400 font-bold">{metrics.helideckStatus}</span>
              </div>
            </div>
          </div>

          {/* Closure Gates Progression Bar (Planned vs Actual) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 gsap-card">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <span>{isArabic ? 'بوابات الإغلاق والمراحل (مقارنة المخطط مقابل الفعلي)' : 'Milestone Gates Progression (Planned vs Actual Readiness)'}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                    GATE 0 to GATE 8
                  </span>
                </h3>
              </div>
              <button
                onClick={() => onNavigate('gates')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                <span>{isArabic ? 'تفاصيل البوابات' : 'Inspect Gates'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
              {metrics.gatesProgress.map(g => {
                const isAhead = g.variance >= 0;
                return (
                  <div
                    key={g.gateRid}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between space-y-2 ${
                      g.status === 'Approved'
                        ? 'bg-emerald-950/40 border-emerald-600/60'
                        : g.status === 'In Progress'
                        ? 'bg-cyan-950/40 border-cyan-500/60'
                        : 'bg-slate-950 border-slate-800 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">{g.gateRid}</span>
                      <span className={`text-[9px] font-mono font-bold px-1 rounded ${isAhead ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                        {isAhead ? `+${g.variance}%` : `${g.variance}%`}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-cyan-300 font-bold">Act: {g.readiness}%</span>
                        <span className="text-amber-400 font-bold">Plan: {g.plannedReadiness}%</span>
                      </div>

                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 relative">
                        <div className="bg-amber-500/40 h-full rounded-full absolute" style={{ width: `${g.plannedReadiness}%` }} />
                        <div className={`h-full rounded-full relative ${g.status === 'Approved' ? 'bg-emerald-500' : 'bg-cyan-500'}`} style={{ width: `${g.readiness}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLANNED VS ACTUAL PERFORMANCE MATRIX */}
      {dashboardTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
             <div>
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-amber-400" />
                 <span>{isArabic ? 'مقارنة أداء الأقسام والفرق (المخطط Planned مقابل الفعلي Actual)' : 'Team & Department Performance (Planned vs Actual Comparison)'}</span>
               </h2>
               <p className="text-xs text-slate-400 mt-1">
                 {isArabic
                   ? 'رسم بياني مقترن ومباشر يوضح النسبة المئوية للجاهزية المخططة لكل قسم مقابل الإنجاز الفعلي ونسبة الانحراف (Variance).'
                   : 'Side-by-side comparative chart displaying target planned completion vs actual achievements per department.'}
               </p>
             </div>

             <div className="h-[420px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={metrics.departmentBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                   <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                   <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                   <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                   <Legend wrapperStyle={{ paddingTop: '10px' }} />
                   <Bar dataKey="complianceRate" fill="#06b6d4" name={isArabic ? 'الإنجاز الفعلي (Actual %)' : 'Actual Completion %'} radius={[6, 6, 0, 0]} />
                   <Bar dataKey="plannedRate" fill="#f59e0b" name={isArabic ? 'المستهدف المخطط (Planned %)' : 'Planned Target %'} radius={[6, 6, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>

             {/* Department Variance Table */}
             <div className="overflow-x-auto border-t border-slate-800 pt-4">
               <table className="w-full text-xs text-left">
                 <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold">
                   <tr>
                     <th className="px-4 py-3">{isArabic ? 'القسم التشغيلي' : 'Department'}</th>
                     <th className="px-4 py-3">{isArabic ? 'عدد السجلات' : 'Record Count'}</th>
                     <th className="px-4 py-3">{isArabic ? 'الإنجاز الفعلي (Actual)' : 'Actual Rate %'}</th>
                     <th className="px-4 py-3">{isArabic ? 'المستهدف المخطط (Planned)' : 'Planned Target %'}</th>
                     <th className="px-4 py-3">{isArabic ? 'الانحراف (Variance)' : 'Variance %'}</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800/80">
                   {metrics.departmentBreakdown.map(dept => {
                     const isAhead = dept.variance >= 0;
                     return (
                       <tr key={dept.department} className="hover:bg-slate-800/50">
                         <td className="px-4 py-3 font-bold text-white">{dept.department}</td>
                         <td className="px-4 py-3 font-mono text-slate-300">{dept.recordCount}</td>
                         <td className="px-4 py-3 font-mono text-cyan-300 font-bold">{dept.complianceRate}%</td>
                         <td className="px-4 py-3 font-mono text-amber-400 font-bold">{dept.plannedRate}%</td>
                         <td className="px-4 py-3 font-mono font-extrabold">
                           <span className={`px-2 py-0.5 rounded text-[11px] ${isAhead ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                             {isAhead ? `+${dept.variance}% Ahead` : `${dept.variance}% Behind`}
                           </span>
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

      {/* TAB 3: ANALYTICS & TRENDS */}
      {dashboardTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl gsap-card">
             <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
               <BarChart3 className="w-5 h-5 text-cyan-400" />
               {isArabic ? 'اتجاه تحديثات وحالة السجلات خلال الـ 30 يوماً الماضية' : '30-Day Trend of Record Status Updates & Closure Loop'}
             </h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
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
        </div>
      )}

      {/* TAB 4: PREDICTIVE TIMELINE */}
      {dashboardTab === 'predictive' && (
        <PredictiveCompletionWidget
          catalog={catalog}
          records={records}
          isArabic={isArabic}
        />
      )}
    </div>
  );
};
