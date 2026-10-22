import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  ShieldCheck,
  Users,
  Award,
  Plane,
  Bed,
  GitBranch,
  BookOpen,
  AlertTriangle,
  FileCheck2,
  BookmarkCheck,
  FileSpreadsheet,
  History,
  Activity,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Flame,
  UserCheck,
  FileCode,
  GitCommit,
  Shield,
  Layers,
  Calendar
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'sheets'
  | 'wps'
  | 'gates'
  | 'crew'
  | 'helideck'
  | 'accommodation'
  | 'execution'
  | 'functional'
  | 'dependencies'
  | 'supplemental'
  | 'rules'
  | 'activities'
  | 'tasks'
  | 'deliverables'
  | 'acceptance'
  | 'gaps'
  | 'evidence'
  | 'risks'
  | 'risk_matrix'
  | 'responsibilities'
  | 'sources'
  | 'audit'
  | 'gantt'
  | 'smart_reports'
  | 'dependency_graph'
  | 'wps_complexity'
  | 'calendar'
  | 'admin_console';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab, sheetParam?: string) => void;
  isArabic: boolean;
  counts: {
    openGaps: number;
    crewAlerts: number;
    pendingChecks: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isArabic,
  counts
}) => {
  const navSections = [
    {
      title: isArabic ? 'القيادة والكتالوج العام' : 'Command & 40 Sheets',
      items: [
        {
          id: 'dashboard' as ActiveTab,
          label: isArabic ? 'مركز القيادة (Command Center)' : 'Command Center',
          sub: isArabic ? 'لوحة المؤشرات وتحليلات Recharts' : 'KPIs & Recharts Visualizer',
          icon: LayoutDashboard,
        },
        {
          id: 'sheets' as ActiveTab,
          label: isArabic ? 'متصفح الـ 40 شيت عمل' : '40-Sheets Master Browser',
          sub: isArabic ? 'استعراض كل السجلات لأي شيت' : 'Browse All 40 Worksheets',
          icon: FileSpreadsheet,
          badge: '40 Sheets',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        },
        {
          id: 'wps' as ActiveTab,
          label: isArabic ? 'حزم العمل (24 WPS)' : 'Work Packages (24 WPS)',
          sub: isArabic ? 'WPS-01 إلى WPS-24' : '24 Work Packages & Deep Tabs',
          icon: Boxes,
        },
        {
          id: 'gates' as ActiveTab,
          label: isArabic ? 'بوابات الإغلاق (9 بوابات)' : 'Closure Gates (0 to 8)',
          sub: isArabic ? 'GATE-0 إلى GATE-8' : '9 Milestone Readiness Gates',
          icon: ShieldCheck,
        },
        {
          id: 'gantt' as ActiveTab,
          label: isArabic ? 'مخطط جانت الزمني (Gantt)' : 'Gantt Timeline View',
          sub: isArabic ? 'تتبع المعالم وتواريخ الاستحقاق' : 'Milestone & Progress Schedule',
          icon: GitCommit,
          badge: 'Gantt',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
        },
        {
          id: 'smart_reports' as ActiveTab,
          label: isArabic ? 'نظام التقارير الذكية' : 'Smart Reports & Filters',
          sub: isArabic ? 'تقارير مخصصة وفلاتر متعددة' : 'Advanced Filterable Reports',
          icon: FileText,
          badge: 'Reports',
          badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40'
        },
        {
          id: 'dependency_graph' as ActiveTab,
          label: isArabic ? 'خريطة الاعتماديات (D3 Graph)' : 'Dependency D3 Graph',
          sub: isArabic ? 'استكشاف التعقيدات والاختناقات' : 'Interactive Blocking Map',
          icon: GitBranch,
          badge: 'D3',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
        },
        {
          id: 'wps_complexity' as ActiveTab,
          label: isArabic ? 'مصفوفة تعقيد حزم العمل' : 'WPS Complexity Matrix',
          sub: isArabic ? 'تحليل الموارد والمخاطر لكل WPS' : 'Resource & Risk Complexity Analysis',
          icon: Layers,
          badge: 'Matrix',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
        },
        {
          id: 'calendar' as ActiveTab,
          label: isArabic ? 'التقويم التشغيلي' : 'Operational Calendar',
          sub: isArabic ? 'جدول المهام ومواعيد الاستحقاق' : 'Due Dates & Maintenance',
          icon: Calendar,
          badge: 'Date',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        },
        {
          id: 'admin_console' as ActiveTab,
          label: isArabic ? 'وحدة التحكم الإدارية (Admin)' : 'Admin Console & RBAC',
          sub: isArabic ? 'إدارة المستخدمين والصلاحيات' : 'User Roles & System Governance',
          icon: Shield,
          badge: 'Admin',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
        },
      ]
    },
    {
      title: isArabic ? 'المسارات التشغيلية التخصصية (14 شيتاً)' : 'Specialized Operational Tracks (14)',
      items: [
        {
          id: 'crew' as ActiveTab,
          label: isArabic ? 'الطاقم والمانينج والشهادات' : 'Crew Competence Hub',
          sub: isArabic ? '12 رتبة، 45 فرداً، تنبيهات ملونة' : '12 Roles, Manning & Alerts',
          icon: Users,
          badge: counts.crewAlerts > 0 ? `${counts.crewAlerts}` : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        },
        {
          id: 'helideck' as ActiveTab,
          label: isArabic ? 'مهبط الطائرات (WPS-19)' : 'Helideck (CAP 437)',
          sub: isArabic ? 'الملف الفني و 10 فحوصات دورية' : 'Technical Profile & 10 Checks',
          icon: Plane,
        },
        {
          id: 'accommodation' as ActiveTab,
          label: isArabic ? 'الإقامة والـ POB (WPS-15)' : 'Accommodation & POB',
          sub: isArabic ? '250 سريراً معتمداً و 10 فحوصات' : '250 Berths & 10 MLC Checks',
          icon: Bed,
        },
        {
          id: 'execution' as ActiveTab,
          label: isArabic ? 'المهام التنفيذية (317 مهمة)' : 'Execution Tasks (317)',
          sub: isArabic ? 'المهام الميدانية ورؤساء التخصص' : '317 Field Execution Tasks',
          icon: Activity,
        },
        {
          id: 'functional' as ActiveTab,
          label: isArabic ? 'الأنشطة الوظيفية (362 نشاطاً)' : 'Functional Activities (362)',
          sub: isArabic ? 'أنشطة التصنيف وسلطة العلم' : '362 DNV/Flag State Activities',
          icon: UserCheck,
        },
        {
          id: 'dependencies' as ActiveTab,
          label: isArabic ? 'شبكة الاعتماديات (612 رابط)' : 'Dependencies Precedence',
          sub: isArabic ? '612 رابط Finish-to-Start' : '612 Links & Lag Days',
          icon: GitBranch,
        },
        {
          id: 'supplemental' as ActiveTab,
          label: isArabic ? 'ضوابط تكميلية (39 ضابطاً)' : 'Supplemental Controls (39)',
          sub: isArabic ? 'اشتراطات تحكم إضافية بيئية' : '39 Environmental Controls',
          icon: ShieldAlert,
        },
      ]
    },
    {
      title: isArabic ? 'النواة والامتثال والأدلة (15 شيتاً)' : 'Core Compliance & Evidence (15)',
      items: [
        {
          id: 'rules' as ActiveTab,
          label: isArabic ? 'سجل القواعد (89 قاعدة)' : 'Rules Register (89 Rules)',
          sub: isArabic ? 'الاشتراطات الهندسية البحرية' : '89 Compliance Rules & Map',
          icon: BookmarkCheck,
        },
        {
          id: 'tasks' as ActiveTab,
          label: isArabic ? 'سجل المهام (343 مهمة)' : 'Detailed Tasks (343 Tasks)',
          sub: isArabic ? 'مهام التدقيق والتجهيز' : '343 Commissioning Tasks',
          icon: FileCode,
        },
        {
          id: 'activities' as ActiveTab,
          label: isArabic ? 'الأنشطة الميدانية (138 نشاطاً)' : 'Activities (138 Activities)',
          sub: isArabic ? 'أنشطة حزم العمل الميدانية' : '138 Operational Activities',
          icon: Activity,
        },
        {
          id: 'deliverables' as ActiveTab,
          label: isArabic ? 'المخرجات المعتمدة (138 مخرجاً)' : 'Deliverables (138)',
          sub: isArabic ? 'المخططات والتقارير المعتمدة' : '138 Engineering Deliverables',
          icon: FileText,
        },
        {
          id: 'acceptance' as ActiveTab,
          label: isArabic ? 'معايير القبول (154 معياراً)' : 'Acceptance Criteria (154)',
          sub: isArabic ? 'موافقات المالك وسلطة العلم' : '154 Formal Acceptance Signs',
          icon: CheckCircle2,
        },
        {
          id: 'gaps' as ActiveTab,
          label: isArabic ? 'سجل الفجوات (138 فجوة)' : 'Findings & CAPA (138 Gaps)',
          sub: isArabic ? 'إدارة عدم المطابقة والأسباب الجذرية' : '138 Action Tracker & Root Causes',
          icon: AlertTriangle,
          badge: counts.openGaps > 0 ? `${counts.openGaps}` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
        },
        {
          id: 'evidence' as ActiveTab,
          label: isArabic ? 'مستودع الأدلة (145 دليلاً)' : 'Evidence Vault (145 Docs)',
          sub: isArabic ? 'شهادات التفتيش وتقارير الفحص' : '145 Certified Proofs & Seals',
          icon: FileCheck2,
        },
        {
          id: 'risks' as ActiveTab,
          label: isArabic ? 'سجل المخاطر (25 خطراً)' : 'Operational Risks (25)',
          sub: isArabic ? 'مصفوفة تقييم وتخفيف المخاطر' : '25 Identified Marine Risks',
          icon: Flame,
        },
        {
          id: 'risk_matrix' as ActiveTab,
          label: isArabic ? 'مصفوفة المخاطر (Matrix)' : 'Risk Matrix View',
          sub: isArabic ? 'التحليل البياني للمخاطر وتأثيرها' : 'Risk & WPS Impact Analysis',
          icon: AlertTriangle,
        },
        {
          id: 'responsibilities' as ActiveTab,
          label: isArabic ? 'مصفوفة المسؤوليات (54 سجلاً)' : 'RACI Matrix (54 Records)',
          sub: isArabic ? 'توزيع الصلاحيات بين الرتب' : '54 Governance Responsibilities',
          icon: UserCheck,
        },
        {
          id: 'sources' as ActiveTab,
          label: isArabic ? 'المراجع التشريعية (35 كوداً)' : 'Statutory Sources (35 Codes)',
          sub: isArabic ? 'SOLAS, MARPOL, DNV, IMCA' : '35 International Marine Codes',
          icon: BookOpen,
        },
        {
          id: 'audit' as ActiveTab,
          label: isArabic ? 'سجل التدقيق والمراقبة' : 'Audit Trail & Compliance Log',
          sub: isArabic ? 'تتبع العمليات والموافقات' : 'System Activity & Approvals',
          icon: History,
        },
      ]
    }
  ];

  return (
    <aside className="w-64 lg:w-72 glass-sidebar border-r border-cyan-500/20 flex flex-col h-[calc(100vh-61px)] sticky top-[61px] shrink-0 select-none overflow-y-auto custom-scrollbar">
      <div className="p-3 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h2 className="px-3 text-[11px] font-bold text-cyan-400/80 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              {section.title}
            </h2>
            <div className="space-y-1 pt-1">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left nav-item-3d group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-950/90 via-blue-950/80 to-slate-900 text-white border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                            : 'bg-slate-800/70 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className={`text-xs font-semibold truncate ${isActive ? 'text-cyan-200' : 'text-slate-200'}`}>
                          {item.label}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {item.sub}
                        </p>
                      </div>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Barge Quick Specs Footer */}
      <div className="mt-auto p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Barge Unit:</span>
            <span className="font-mono text-cyan-300 font-semibold">PMS-11 Pipelay/Crane</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>POB Capacity:</span>
            <span className="font-mono text-emerald-400 font-semibold">250 Berths (228 Onboard)</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Workbook Rev:</span>
            <span className="font-mono text-amber-400 font-semibold">Rev.03 (40 Sheets)</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
