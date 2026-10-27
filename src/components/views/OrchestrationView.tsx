import React, { useState, useRef, useEffect } from 'react';
import { BaseRecord, OrchestrationConsultation, Department } from '../../types/pms';
import { VIRTUAL_ENTITIES, runOrchestratedConsultation } from '../../lib/orchestratorEngine';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Flame,
  Activity,
  FileCheck2,
  Send,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Layers,
  Shield,
  BookOpen,
  Anchor,
  Plane,
  Compass,
  Users,
  Plus,
  MessageSquare,
  Bot,
  User,
  Zap,
  Trash2,
  Terminal,
  ExternalLink,
  Sliders,
  FolderGit2,
  Cpu,
  Target
} from 'lucide-react';
import { useGsapPageReveal } from '../../lib/animations';

interface OrchestrationViewProps {
  records: BaseRecord[];
  currentUser: { name: string; role: string; department: string };
  isArabic: boolean;
  onSelectRecord: (record: BaseRecord) => void;
  onSaveRecord?: (record: BaseRecord) => void;
  onUpdateRecordStatus?: (id: string, newStatus: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentId: string;
  agentName: string;
  agentColor: string;
  text: string;
  timestamp: string;
  contextSnapshot?: {
    project: string;
    asset: string;
    gateState: string;
    wps: string;
  };
  suggestedAction?: {
    title: string;
    department: Department;
    wps_id: string;
    gap_rid: string;
    due_date: string;
  };
}

export const OrchestrationView: React.FC<OrchestrationViewProps> = ({
  records,
  currentUser,
  isArabic,
  onSelectRecord,
  onSaveRecord,
}) => {
  const [activeTab, setActiveTab] = useState<'chatbot' | 'matrix'>('chatbot');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('master');

  // Dynamic Current Context State
  const [selectedProject, setSelectedProject] = useState<string>('PMS-11 Rig Life Extension 2026');
  const [selectedAsset, setSelectedAsset] = useState<string>('PMS-11 Pipe-Lay Derrick Barge (DNV GL Class)');
  const [selectedGateState, setSelectedGateState] = useState<string>('Gate-2: Construction & Weld Integrity (BLOCKED)');
  const [targetWps, setTargetWps] = useState<string>('WPS-01');
  const [selectedRecordRid, setSelectedRecordRid] = useState<string>('');

  // Chatbot Session State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'agent',
      agentId: 'master',
      agentName: isArabic ? 'مستشار الأوركسترا الرئيسي (Master Orchestrator)' : 'Master Orchestrator AI',
      agentColor: '#06b6d4',
      text: isArabic
        ? `أهلاً بك قائد العمليات [${currentUser.name}]. أنا المحرك التفاعلي للأوركسترا لمتابعة بوابات وتراخيص بارجة PMS-11. تم قفل المحادثة على السياق الديناميكي الحالي [${selectedProject}] ومعدة [${selectedAsset}]. يسعدني الإجابة واستدعاء السجلات المرجعية فوراً.`
        : `Welcome Operations Officer [${currentUser.name}]. I am your interactive Orchestration Virtual Consultant. The conversation is dynamically scoped to project [${selectedProject}] and asset [${selectedAsset}]. Ask any query to evaluate gates or resolve gaps.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      contextSnapshot: {
        project: selectedProject,
        asset: selectedAsset,
        gateState: selectedGateState,
        wps: targetWps
      }
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Matrix Audit State
  const [activeConsultation, setActiveConsultation] = useState<OrchestrationConsultation | null>(null);
  const [isProcessingMatrix, setIsProcessingMatrix] = useState<boolean>(false);

  useGsapPageReveal();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const currentEntityInfo = VIRTUAL_ENTITIES.find(e => e.id === selectedEntityId) || {
    id: 'master',
    nameArabic: 'محرك الأوركسترا الرئيسي',
    nameEnglish: 'Master Orchestration Engine',
    title: 'Central Multi-Agent Coordinator',
    avatarIcon: 'Sparkles',
    color: '#06b6d4',
    badge: 'MASTER AI'
  };

  const handleSendChatMessage = async (presetText?: string) => {
    const messageText = presetText || inputPrompt;
    if (!messageText.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      agentId: 'user',
      agentName: currentUser.name,
      agentColor: '#3b82f6',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      contextSnapshot: {
        project: selectedProject,
        asset: selectedAsset,
        gateState: selectedGateState,
        wps: targetWps
      }
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!presetText) setInputPrompt('');
    setIsTyping(true);

    try {
      const selectedRecord = records.find(r => r.rid === selectedRecordRid);

      const response = await fetch('/api/orchestration/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: messageText,
          agentId: selectedEntityId,
          agentName: isArabic ? currentEntityInfo.nameArabic : currentEntityInfo.nameEnglish,
          targetWps,
          selectedRecordTitle: selectedRecord ? selectedRecord.title : undefined,
          selectedRecordRid,
          project: selectedProject,
          asset: selectedAsset,
          gateState: selectedGateState,
          chatHistory: chatMessages.slice(-6).map(m => ({ sender: m.sender, text: m.text })),
          isArabic
        })
      });

      const data = await response.json();
      const agentReplyText = data.reply || (isArabic ? 'عذراً، تعذر معالجة الاستجابة حالياً.' : 'Sorry, unable to process reply at the moment.');

      // Check if message suggests a remediation task
      let suggestedAction;
      if (
        messageText.toLowerCase().includes('task') ||
        messageText.toLowerCase().includes('مهمة') ||
        messageText.toLowerCase().includes('gap') ||
        messageText.toLowerCase().includes('فجوة') ||
        messageText.toLowerCase().includes('remediation')
      ) {
        suggestedAction = {
          title: isArabic ? `مهمة معالجة فورية لمشروع [${selectedProject}] - [${targetWps}]` : `Immediate Remediation Task for [${selectedProject}] - [${targetWps}]`,
          department: 'QUALITY_CONTROL' as Department,
          wps_id: targetWps,
          gap_rid: selectedRecordRid || 'GAP-BOT-01',
          due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
        };
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        agentId: selectedEntityId,
        agentName: isArabic ? currentEntityInfo.nameArabic : currentEntityInfo.nameEnglish,
        agentColor: currentEntityInfo.color,
        text: agentReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        contextSnapshot: {
          project: selectedProject,
          asset: selectedAsset,
          gateState: selectedGateState,
          wps: targetWps
        },
        suggestedAction
      };

      setChatMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      // Fallback response with context awareness
      const fallbackMsg: ChatMessage = {
        id: `agent-err-${Date.now()}`,
        sender: 'agent',
        agentId: selectedEntityId,
        agentName: isArabic ? currentEntityInfo.nameArabic : currentEntityInfo.nameEnglish,
        agentColor: currentEntityInfo.color,
        text: isArabic
          ? `[استجابة أوتوماتيكية مبنية على السياق المحدد للمستشار ${currentEntityInfo.nameArabic}]\n\n📌 **السياق المعتمد**:\n- المشروع: ${selectedProject}\n- الأصل: ${selectedAsset}\n- حالة البوابة: ${selectedGateState}\n- حزمة العمل: ${targetWps} ${selectedRecordRid ? `(السجل [${selectedRecordRid}])` : ''}\n\n**النتيجة**:\nرداً على "${messageText}":\n- تم تقييم اشتراطات البوابة الحتمية (BLOCKED > INCOMPLETE > CONDITIONAL > READY).\n- يرجى فتح السجل المرجعي [${selectedRecordRid || 'GAP-101'}] لمراجعة شهادات التصنيف المطلوبة.`
          : `[Automatic Context-Scoped response for ${currentEntityInfo.nameEnglish}]\n\n📌 **Active Context Scope**:\n- Project: ${selectedProject}\n- Asset: ${selectedAsset}\n- Gate State: ${selectedGateState}\n- Work Package: ${targetWps} ${selectedRecordRid ? `(Record [${selectedRecordRid}])` : ''}\n\n**Verdict**:\nRegarding "${messageText}":\n- Deterministic precedence evaluated: BLOCKED > INCOMPLETE > CONDITIONAL > READY.\n- Click record tag [${selectedRecordRid || 'GAP-101'}] to inspect linked deliverables and NDT requirements.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        contextSnapshot: {
          project: selectedProject,
          asset: selectedAsset,
          gateState: selectedGateState,
          wps: targetWps
        }
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRunMatrixAudit = () => {
    setIsProcessingMatrix(true);
    const targetRecord = records.find(r => r.rid === selectedRecordRid) || null;

    setTimeout(() => {
      const result = runOrchestratedConsultation(
        `Evaluate closeout readiness for ${targetWps} under ${selectedProject} / ${selectedAsset} [${selectedGateState}].`,
        targetRecord,
        targetWps,
        records,
        currentUser.name,
        currentUser.role,
        isArabic
      );
      setActiveConsultation(result);
      setIsProcessingMatrix(false);
    }, 800);
  };

  const handleTriggerAutoRemediation = (actionItem: any) => {
    if (!onSaveRecord) return;

    const newTask: BaseRecord = {
      id: `REM-TASK-${Date.now().toString().slice(-5)}`,
      rid: `REM-${Math.floor(Math.random() * 900 + 100)}`,
      entity: 'task',
      title: actionItem.title || actionItem.action_title,
      description: `Automated remediation task generated by Orchestration Assistant for project ${selectedProject} under ${targetWps}.`,
      wps_id: actionItem.wps_id || targetWps,
      department: (actionItem.department || actionItem.assigned_department || 'QUALITY_CONTROL') as Department,
      status: 'OPEN',
      owner: currentUser.name,
      due_date: actionItem.due_date || actionItem.suggested_due_date || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      data: {
        auto_remediation: true,
        project: selectedProject,
        asset: selectedAsset,
        priority: 'HIGH'
      }
    };

    onSaveRecord(newTask);
    alert(
      isArabic
        ? `تم إنشاء وتكليف مهمة المعالجة التلقائية [${newTask.rid}] بنجاح للقسم: ${newTask.department}`
        : `Automated remediation task [${newTask.rid}] successfully dispatched to ${newTask.department}`
    );
  };

  // Helper to parse text for clickable record tags like [TASK-101], [GAP-02], [WPS-01], etc.
  const renderInteractiveText = (text: string) => {
    const parts = text.split(/(\[[A-Z0-9_-]+\])/g);

    return parts.map((part, index) => {
      if (/^\[[A-Z0-9_-]+\]$/.test(part)) {
        const cleanRid = part.replace('[', '').replace(']', '');
        const matchedRecord = records.find(r => 
          r.rid.toUpperCase() === cleanRid.toUpperCase() || 
          r.id.toUpperCase() === cleanRid.toUpperCase() || 
          (r.wps_id && r.wps_id.toUpperCase() === cleanRid.toUpperCase())
        );

        return (
          <span
            key={index}
            onClick={() => {
              if (matchedRecord) {
                onSelectRecord(matchedRecord);
              } else {
                alert(isArabic ? `جار العثور على السجل المرجعي [${cleanRid}]...` : `Locating referenced record [${cleanRid}]...`);
              }
            }}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-mono text-[11px] font-bold cursor-pointer transition-all hover:scale-105 mx-0.5"
            title={`Click to open & inspect record ${cleanRid}`}
          >
            <span>{part}</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const getEntityIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4" />;
      case 'Award': return <Award className="w-4 h-4" />;
      case 'Flame': return <Flame className="w-4 h-4" />;
      case 'Activity': return <Activity className="w-4 h-4" />;
      case 'FileCheck2': return <FileCheck2 className="w-4 h-4" />;
      case 'Anchor': return <Anchor className="w-4 h-4" />;
      case 'Plane': return <Plane className="w-4 h-4" />;
      case 'Compass': return <Compass className="w-4 h-4" />;
      case 'Users': return <Users className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'READY':
      case 'Approved':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> READY / APPROVED</span>;
      case 'CONDITIONAL':
      case 'Conditional':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> CONDITIONAL</span>;
      case 'BLOCKED':
      case 'Blocked':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> BLOCKED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> INCOMPLETE</span>;
    }
  };

  const promptSuggestions = isArabic ? [
    'كيف يؤثر وضع البوابة المغلقة على أصول مشروع البارجة الحالي؟',
    'استشر خبير السلامة الهيكلية عن سمك الصلب للرافعة 800T',
    `افتراضياً، ما الفجوات الحرجة المعطلة في البوابة ${selectedGateState}؟`,
    'اقترح خطة معالجة تلقائية لعيوب اللحام المكتشفة بالسجل المالي',
    'افحص التطابق مع معايير DNV ARC وتراخيص SOLAS'
  ] : [
    `How does the current gate state affect asset ${selectedAsset.slice(0, 20)}?`,
    'Consult Structural Integrity Expert on 800T crane steel thickness UT survey',
    `What are blocking gaps in ${selectedGateState}?`,
    'Propose an automated remediation plan for critical weld defects',
    'Verify SOLAS and DNV ARC compliance for current package'
  ];

  return (
    <div className="space-y-6 gsap-card">
      {/* Top Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>{isArabic ? 'منظومة الشات بوت وتدقيق البوابات التفاعلية' : 'Interactive Virtual Consultant & Gate Orchestrator'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  LIVE CONTEXT ENGINE
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isArabic
                  ? 'حوار ذكي موجه تلقائياً بالسياق الديناميكي الحالي ومستشاري التخصص الـ 13 لبارجة PMS-11'
                  : 'Real-time conversational interface auto-scoped to project, asset, gate state, and records'}
              </p>
            </div>
          </div>
        </div>

        {/* User Privilege Badge */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3 text-xs shrink-0">
          <Shield className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>{currentUser.name}</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">
                {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{currentUser.department} • Full Orchestration Privilege</p>
          </div>
        </div>
      </div>

      {/* Dynamic 'Current Context' Panel */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-900/60 shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400 animate-spin [animation-duration:8s]" />
            <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <span>{isArabic ? 'لوحة السياق الحالي للتطبيقات والأصول (Current Scope Context Panel):' : 'Current Dynamic Scope Context Panel:'}</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                AUTO-SCOPED
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>{isArabic ? 'حالة التدفق:' : 'Flow Precedence:'}</span>
            <span className="font-mono font-bold text-amber-400">BLOCKED &gt; INCOMPLETE &gt; CONDITIONAL &gt; READY</span>
          </div>
        </div>

        {/* Interactive Context Switcher Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Project Selector */}
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <FolderGit2 className="w-3 h-3" />
              <span>{isArabic ? 'المشروع المحدد (Project):' : 'Active Project:'}</span>
            </label>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
            >
              <option value="PMS-11 Rig Life Extension 2026">PMS-11 Life Extension 2026</option>
              <option value="DNV/GL Class Renewal Survey">DNV/GL Class Renewal Survey</option>
              <option value="Heavy Lift Crane 800T Overhaul">Heavy Lift Crane 800T Overhaul</option>
              <option value="Subsea Pipelay Expansion Project">Subsea Pipelay Expansion Project</option>
            </select>
          </div>

          {/* Asset Selector */}
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <label className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              <span>{isArabic ? 'الأصل / المعدة (Asset):' : 'Active Asset:'}</span>
            </label>
            <select
              value={selectedAsset}
              onChange={e => setSelectedAsset(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
            >
              <option value="PMS-11 Pipe-Lay Derrick Barge (DNV GL Class)">PMS-11 Main Barge Hull</option>
              <option value="Main Derrick Crane 800T Assembly">Derrick Crane 800T Assembly</option>
              <option value="Pipe Ramp & Tensioners Deck Zone">Pipe Ramp & Tensioners Deck</option>
              <option value="Helideck Structure & ECAR-138 Lights">Helideck & Aviation Lights</option>
              <option value="Subsea Tie-in & Moonpool Station">Subsea Tie-in & Moonpool</option>
            </select>
          </div>

          {/* Gate State Selector */}
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>{isArabic ? 'حالة البوابة (Gate State):' : 'Current Gate State:'}</span>
            </label>
            <select
              value={selectedGateState}
              onChange={e => setSelectedGateState(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
            >
              <option value="Gate-0: Initiation & Defect Baseline (READY)">Gate-0: Defect Baseline (READY)</option>
              <option value="Gate-1: Structural Baseline & Verification (CONDITIONAL)">Gate-1: Verification (CONDITIONAL)</option>
              <option value="Gate-2: Construction & Weld Integrity (BLOCKED)">Gate-2: Construction (BLOCKED)</option>
              <option value="Gate-3: Systems SAT Commissioning (INCOMPLETE)">Gate-3: SAT Commissioning (INCOMPLETE)</option>
              <option value="Gate-4: DNV Class Final Sign-off (BLOCKED)">Gate-4: DNV Sign-off (BLOCKED)</option>
            </select>
          </div>

          {/* Target WPS Package */}
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>{isArabic ? 'حزمة العمل (WPS):' : 'Active WPS:'}</span>
            </label>
            <select
              value={targetWps}
              onChange={e => setTargetWps(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
            >
              {Array.from({ length: 24 }).map((_, i) => {
                const wId = `WPS-${String(i + 1).padStart(2, '0')}`;
                return <option key={wId} value={wId}>{wId} Package</option>;
              })}
            </select>
          </div>

          {/* Record RID Filter */}
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <FileCheck2 className="w-3 h-3" />
              <span>{isArabic ? 'السجل المرجعي (Record):' : 'Linked Record RID:'}</span>
            </label>
            <select
              value={selectedRecordRid}
              onChange={e => setSelectedRecordRid(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="">{isArabic ? '-- جميع السجلات --' : '-- All Package Records --'}</option>
              {records.slice(0, 25).map(r => (
                <option key={r.id} value={r.rid}>[{r.rid}] {r.title.slice(0, 18)}...</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('chatbot')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'chatbot'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{isArabic ? '💬 شات بوت الاستشارات الفورية (Context AI Chatbot)' : '💬 Scoped AI Virtual Consultant Chat'}</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isArabic ? '⚡ التقييم الجماعي المنسق للـ 13 وكيلاً (13-Agent Audit Matrix)' : '⚡ 13-Agent Audit Matrix'}</span>
        </button>
      </div>

      {/* Mode 1: Interactive Chatbot Console */}
      {activeTab === 'chatbot' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Agent Selector Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Bot className="w-4 h-4 text-cyan-400" /> {isArabic ? 'الوكيل المستهدف:' : 'Consulting Agent:'}</span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">13 DOMAINS</span>
              </h3>

              {/* Master Agent Choice */}
              <button
                onClick={() => setSelectedEntityId('master')}
                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                  selectedEntityId === 'master'
                    ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-xs truncate">
                    {isArabic ? 'محرك الأوركسترا الرئيسي' : 'Master Orchestration AI'}
                  </p>
                  <p className="text-[10px] text-slate-400">All 13 Domain Synthesis</p>
                </div>
              </button>

              {/* 13 Domain Agents List */}
              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                {VIRTUAL_ENTITIES.map(entity => {
                  const isSelected = selectedEntityId === entity.id;
                  return (
                    <button
                      key={entity.id}
                      onClick={() => setSelectedEntityId(entity.id)}
                      className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-slate-800 border-cyan-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${entity.color}25`, color: entity.color, border: `1px solid ${entity.color}50` }}
                        >
                          {getEntityIcon(entity.avatarIcon)}
                        </div>
                        <span className="text-[11px] font-bold truncate">
                          {isArabic ? entity.nameArabic : entity.nameEnglish}
                        </span>
                      </div>
                      <span className="text-[8px] font-mono px-1 rounded bg-slate-900 border border-slate-700 text-slate-400 shrink-0">
                        {entity.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Interactive Chat Window */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col h-[650px]">
            {/* Active Agent Banner */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: `${currentEntityInfo.color}30`, border: `1px solid ${currentEntityInfo.color}`, color: currentEntityInfo.color }}
                >
                  {getEntityIcon(currentEntityInfo.avatarIcon)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <span>{isArabic ? currentEntityInfo.nameArabic : currentEntityInfo.nameEnglish}</span>
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-mono border" style={{ backgroundColor: `${currentEntityInfo.color}20`, color: currentEntityInfo.color, borderColor: `${currentEntityInfo.color}60` }}>
                      {currentEntityInfo.badge}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Scoped to: <span className="font-bold text-cyan-300">{selectedProject}</span> • Asset: <span className="text-purple-300 font-bold">{selectedAsset.slice(0, 25)}...</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setChatMessages([chatMessages[0]])}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-all text-xs flex items-center gap-1 cursor-pointer"
                title="Clear Chat History"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Suggestions Bar */}
            <div className="mb-3 shrink-0 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                {isArabic ? 'أسئلة سياقية:' : 'Context Prompts:'}
              </span>
              {promptSuggestions.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSendChatMessage(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-700 text-[11px] text-slate-300 transition-all shrink-0 whitespace-nowrap cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Messages Stream Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
              {chatMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${
                        isUser ? 'bg-blue-600' : ''
                      }`}
                      style={!isUser ? { backgroundColor: `${msg.agentColor}30`, border: `1px solid ${msg.agentColor}`, color: msg.agentColor } : {}}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Body */}
                    <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="font-bold text-slate-200">{msg.agentName}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                        {msg.contextSnapshot && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-950 text-cyan-400 font-mono text-[9px] border border-slate-800">
                            {msg.contextSnapshot.wps}
                          </span>
                        )}
                      </div>

                      <div
                        className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                        }`}
                      >
                        {/* Interactive Text Parser with clickable Record Tags */}
                        {renderInteractiveText(msg.text)}

                        {/* Interactive Task Recommendation Action Button */}
                        {msg.suggestedAction && !isUser && (
                          <div className="mt-3 pt-3 border-t border-slate-800/80 bg-rose-950/20 p-2.5 rounded-xl border border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="text-[11px]">
                              <p className="font-bold text-rose-300 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                <span>{msg.suggestedAction.title}</span>
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Assigned to {msg.suggestedAction.department} • Due {msg.suggestedAction.due_date}
                              </p>
                            </div>

                            <button
                              onClick={() => handleTriggerAutoRemediation(msg.suggestedAction)}
                              className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{isArabic ? 'إنشاء المهمة فوراً' : 'Dispatch Task'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300 flex items-center justify-center animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] font-mono text-cyan-300 ml-1">
                      {isArabic ? 'جاري الاستشارة وتنسيق السياق المباشر...' : 'Consulting virtual domain agent for live context...'}
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className="flex items-center gap-2 shrink-0 pt-2 border-t border-slate-800"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                placeholder={
                  isArabic
                    ? `استفسر لوكيل [${currentEntityInfo.nameArabic}] لسياق [${selectedProject}]...`
                    : `Ask ${currentEntityInfo.nameEnglish} for ${selectedProject}...`
                }
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner"
              />

              <button
                type="submit"
                disabled={!inputPrompt.trim() || isTyping}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{isArabic ? 'إرسال' : 'Send'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mode 2: Multi-Agent Matrix Audit */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Interactive Consultation Query Builder */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <span>{isArabic ? 'بدء تدقيق أوركسترا جماعي للسياق الحالي' : 'Initiate Context-Scoped Multi-Consultant Audit'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isArabic
                  ? `مشروع: ${selectedProject} • أصل: ${selectedAsset} • بوابة: ${selectedGateState}`
                  : `Project: ${selectedProject} • Asset: ${selectedAsset} • Gate: ${selectedGateState}`}
              </p>
            </div>

            <button
              onClick={handleRunMatrixAudit}
              disabled={isProcessingMatrix}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessingMatrix ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isArabic ? 'جاري استدعاء المعايير RAG واستشارة الوكلاء الـ 13...' : 'Querying RAG repository & orchestrating 13 agents...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isArabic ? 'تشغيل التقييم الجماعي للسياق الحالي (Run Context Audit Matrix)' : 'Run Scoped 13-Agent Audit Matrix'}</span>
                </>
              )}
            </button>
          </div>

          {/* Orchestrated Synthesis Results Panel */}
          {activeConsultation && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-300">
              {/* Verdict Banner */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <span>Orchestration ID: <strong className="font-mono text-cyan-300">{activeConsultation.id}</strong></span>
                      <span>•</span>
                      <span>Target: <strong className="font-mono text-cyan-300">{activeConsultation.target_wps} / {activeConsultation.target_rid}</strong></span>
                    </div>
                    <h3 className="font-bold text-sm text-white">
                      {activeConsultation.query}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400 font-bold">{isArabic ? 'نتيجة أسبقية البوابة:' : 'Deterministic Gate Precedence:'}</span>
                    {getVerdictBadge(activeConsultation.gate_precedence_verdict)}
                  </div>
                </div>

                {/* Decision Notice Disclaimer */}
                <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-800/60 text-[11px] text-amber-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{activeConsultation.decision_notice}</span>
                </div>
              </div>

              {/* RAG Document Passages & Citations */}
              {activeConsultation.citations.length > 0 && (
                <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{isArabic ? 'المراجع ومستندات الأدلة المستدعاة (RAG Document Citations):' : 'Queried RAG Document Citations & Passages:'}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeConsultation.citations.map(cit => (
                      <div key={cit.citation_id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            [{cit.citation_id}] {cit.document_code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{cit.revision}</span>
                        </div>
                        <p className="font-bold text-slate-200">{cit.title}</p>
                        <p className="text-[11px] text-slate-400 italic line-clamp-2 leading-relaxed">
                          "{cit.passage_snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Automated Issue Remediation Flow Actions */}
              {activeConsultation.remediation_actions.length > 0 && (
                <div className="space-y-3 bg-rose-950/20 p-4 rounded-2xl border border-rose-900/60">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>{isArabic ? 'مسار المعالجة التلقائية للفجوات والمخاطر (Automated Issue Remediation Flow):' : 'Automated Issue Remediation Workflow:'}</span>
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                      {activeConsultation.remediation_actions.length} ACTIONS SUGGESTED
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeConsultation.remediation_actions.map(act => (
                      <div key={act.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                              {act.priority}
                            </span>
                            <span className="font-bold text-white">{act.action_title}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Assigned to: <strong className="text-slate-200">{act.assigned_head}</strong> ({act.assigned_department}) • Due: <span className="font-mono text-cyan-300">{act.suggested_due_date}</span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleTriggerAutoRemediation(act)}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isArabic ? 'تكليف وإنشاء مهمة معالجة' : 'Auto-Create Remediation Task'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
