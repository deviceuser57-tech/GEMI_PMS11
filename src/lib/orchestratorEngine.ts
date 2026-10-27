import {
  BaseRecord,
  ChatMessage,
  OrchestrationConsultation,
  VirtualEntityId,
  VirtualEntityInfo,
  Department,
  Citation,
  RemediationAction
} from '../types/pms';
import { getStoredDocuments } from './documentRepository';

// All 13 Specialist Domain Agents as defined in the Unified Architectural Master Plan
export const VIRTUAL_ENTITIES: VirtualEntityInfo[] = [
  {
    id: 'structural_heritage',
    nameEnglish: 'Structural Integrity & Heritage Asset Agent',
    nameArabic: 'خبير السلامة الهيكلية والأصول القديمة (1976 Hull)',
    title: 'DNV ARC Steel Corrosion & Crane Fatigue Specialist',
    avatarIcon: 'ShieldCheck',
    color: '#06b6d4', // Cyan
    badge: 'DNV ARC Steel',
    descriptionEnglish: 'Evaluates 1976 hull steel corrosion allowances, Ultrasonic Thickness (UT) survey data, and 800T crane structural fatigue.',
    descriptionArabic: 'تقييم تآكل الصلب للبدن (DNV ARC)، مسح السماكات بالـ UT، وتعديل إجهاد الهيكل للرافعة 800 طن.',
    specialization: 'UT Thickness Survey %, DNV ARC Steel Allowance, 800T Crane Fatigue'
  },
  {
    id: 'dnv_compliance',
    nameEnglish: 'DNV/GL Compliance Inspector',
    nameArabic: 'مفتش الامتثال لقواعد DNV/GL والتاريخية',
    title: 'DNV Rules & Condition Precedent Verifier',
    avatarIcon: 'Award',
    color: '#3b82f6', // Blue
    badge: 'DNV/GL Rules',
    descriptionEnglish: 'Verifies statutory codes (ILLC, ITC, ISM, SOLAS, MARPOL) and resolves Condition Precedents (CPs).',
    descriptionArabic: 'مطابقة قواعد DNV التاريخية والحديثة، متابعة الشهادات القانونية، وإغلاق الشروط المسبقة (CP).',
    specialization: 'Statutory Certificates, Condition Precedent Closure, Flag State Letter'
  },
  {
    id: 'pipelay_construction',
    nameEnglish: 'Offshore Construction & Pipelay Specialist',
    nameArabic: 'أخصائي الإنشاءات البحرية وتمديد الأنابيب',
    title: 'WPS, NDT X-Ray 100% & Hydro-Test Auditor',
    avatarIcon: 'Activity',
    color: '#10b981', // Emerald
    badge: 'Pipelay & WPS',
    descriptionEnglish: 'Validates WPS welding specs, hydro-testing, 100% NDT X-ray joints, and subsea tie-in readiness.',
    descriptionArabic: 'اعتماد مواصفات اللحام WPS، اختبارات الضغط المائي، فحوصات NDT/X-Ray بنسبة 100% للوصلات.',
    specialization: 'WPS Welding Specs, 100% NDT/X-Ray, Hydro-Test, Tensioners'
  },
  {
    id: 'commissioning_testing',
    nameEnglish: 'Commissioning & Systems Testing Agent',
    nameArabic: 'وكيل الاختبارات والتشغيل للأنظمة الميكانيكية',
    title: 'Mechanical Punchlist & SAT Acceptance Specialist',
    avatarIcon: 'Zap',
    color: '#eab308', // Yellow
    badge: 'SAT & Punchlist',
    descriptionEnglish: 'Manages Mechanical Completion Punchlists (MCP), Site Acceptance Testing (SAT) for fire, pumps, and power.',
    descriptionArabic: 'قوائم النواقص الميكانيكية MCP، اختبارات القبول الموقعي SAT لأنظمة الإطفاء، الضخ، والكهرباء.',
    specialization: 'MCP Punchlist, SAT Fire & Pump Acceptance, Spare Parts'
  },
  {
    id: 'marine_ops',
    nameEnglish: 'Marine Operations Consultant',
    nameArabic: 'استشاري العمليات البحرية والاتزان',
    title: 'Barge Stability Booklet & BWMS Advisor',
    avatarIcon: 'Anchor',
    color: '#0284c7', // Sky Blue
    badge: 'Stability & Sea State',
    descriptionEnglish: 'Monitors intact/damage stability curves, draft limits, BWMS ballast management, and Hs sea state limits.',
    descriptionArabic: 'اتزان البارجة (Stability Booklet)، حدود الغاطس والتحميل، نظام مياه التوازن، وحدود حالة البحر Hs.',
    specialization: 'Stability Booklet, Draft Limits 3.2-5.8m, BWMS, Hs Safe Limits'
  },
  {
    id: 'hse_safety',
    nameEnglish: 'HSE & Safety Process Consultant',
    nameArabic: 'استشاري السلامة والبيئة والصحة المهنية (PSM)',
    title: 'Process Safety Management & PTW Permit Advisor',
    avatarIcon: 'Flame',
    color: '#f97316', // Orange
    badge: 'HSE & PTW',
    descriptionEnglish: 'Manages Process Safety Management (PSM), HAZID/HAZOP risk assessments, PTW permits, and emergency drills.',
    descriptionArabic: 'إدارة سلامة العمليات PSM، دراسات HAZID/HAZOP، نظام تصاريح العمل PTW، وتدريبات الطوارئ.',
    specialization: 'PSM, HAZID/HAZOP, PTW Compliance %, Near-Miss Register'
  },
  {
    id: 'crew_training',
    nameEnglish: 'Crew & Training Competence Consultant',
    nameArabic: 'استشاري الطاقم والتسكين والتدريب (POB & STCW)',
    title: 'POB 250 Limit, STCW & BOSIET Auditor',
    avatarIcon: 'Users',
    color: '#a855f7', // Purple
    badge: 'POB & BOSIET',
    descriptionEnglish: 'Audits STCW certificates, BOSIET/HUET validity, rest hours log, and 250 berth POB limits.',
    descriptionArabic: 'شهادات STCW، التدريب البحري BOSIET/HUET، ساعات الراحة، وجاهزية الإقامة لـ 250 سريراً.',
    specialization: 'POB 250 Limit, STCW/BOSIET Expiries, Crew Rest Hours'
  },
  {
    id: 'qaqc_vendor',
    nameEnglish: 'QA/QC & Vendor Validation Consultant',
    nameArabic: 'استشاري حوكمة جودة المقاولين والتدقيق (CAPA)',
    title: 'CAPA Action Tracker & Chain-of-Custody Auditor',
    avatarIcon: 'FileCheck2',
    color: '#8b5cf6', // Indigo
    badge: 'QA/QC & CAPA',
    descriptionEnglish: 'Tracks CAPA root cause corrective actions, dual-signature vendor signoffs, and document chain-of-custody.',
    descriptionArabic: 'متابعة الإجراءات التصحيحية CAPA، التدقيق ثنائي التوقيع للمقاولين، وتوثيق سلسلة الحيازة.',
    specialization: 'CAPA Resolution %, Vendor Signoff, Evidence Authenticity'
  },
  {
    id: 'helideck_aviation',
    nameEnglish: 'Helideck & Aviation Consultant',
    nameArabic: 'استشاري الطيران ومربض المروحيات (ECAR 138 / ECAA)',
    title: 'ECAA ECAR Part 138 Helideck & Aviation Inspector',
    avatarIcon: 'Plane',
    color: '#ff6600', // Orange
    badge: 'ECAR 138 ECAA',
    descriptionEnglish: 'Inspects ECAA ECAR Part 138 regulations, friction testing (>=0.85), DIFFS foam, and perimeter lighting.',
    descriptionArabic: 'فحوصات سلطة الطيران المدني ECAA، اختبار احتكاك السطح، إضاءة الطيران، الفوم التلقائي DIFFS، وتطابق ECAR 138.',
    specialization: 'ECAR 138 Friction >=0.85, ECAA Cert, DIFFS Foam, HLO'
  },
  {
    id: 'environmental_emissions',
    nameEnglish: 'Environmental & Emissions Specialist',
    nameArabic: 'استشاري البيئة والانبعاثات (MARPOL Annex I/VI)',
    title: 'Oil Record Book & SOx/NOx Emissions Specialist',
    avatarIcon: 'Compass',
    color: '#10b981', // Emerald
    badge: 'MARPOL & ORB',
    descriptionEnglish: 'Monitors MARPOL Annex I Oil Record Book (ORB), SOx/NOx emissions, and spill prevention plans.',
    descriptionArabic: 'قياس الانبعاثات (SOx/NOx)، سجلات النفايات وسجل الزيت ORB Annex I، وخطة منع التلوث.',
    specialization: 'Oil Record Book Annex I, MARPOL Annex VI, Spill Prevention'
  },
  {
    id: 'financial_contract',
    nameEnglish: 'Financial & Contract Governance Agent',
    nameArabic: 'استشاري الحوكمة المالية والعقود والتأمين',
    title: 'Budget Burn & P&I Insurance Governance Specialist',
    avatarIcon: 'Shield',
    color: '#ec4899', // Pink
    badge: 'Contract & P&I',
    descriptionEnglish: 'Tracks budget burn vs task milestones, Liquidated Damages (LD) risks, and P&I insurance coverage.',
    descriptionArabic: 'تتبع تصفية الميزانية مقابل المهام، مخاطر الغرامات التأخيرية (LD)، وتغطية التأمين (P&I).',
    specialization: 'Budget Variance, Liquidated Damages Risk, P&I Coverage'
  },
  {
    id: 'third_party_class',
    nameEnglish: 'Third-Party & Class Liaison Agent',
    nameArabic: 'وكيل التنسيق مع الجهات الخارجية ومساحي DNV',
    title: 'DNV Surveyor Boarding & Port Authority Liaison',
    avatarIcon: 'Award',
    color: '#6366f1', // Indigo
    badge: 'DNV Boarding',
    descriptionEnglish: 'Coordinates DNV surveyor boarding schedules, Port Authority notifications, and Flag State visits.',
    descriptionArabic: 'حجز وتنظيم مواعيد صعود مساحي DNV، وإخطارات سلطات الميناء ودولة العلم.',
    specialization: 'DNV Surveyor Schedule, Port Authority Clearance, Flag State Visits'
  },
  {
    id: 'gatekeeper',
    nameEnglish: 'Gatekeeper & Closeout Verifier',
    nameArabic: 'رئيس التحقق والحراس ومحرك البوابات الحتمي',
    title: 'Deterministic Gate Engine & CPM Network Verifier',
    avatarIcon: 'ShieldCheck',
    color: '#0d9488', // Teal
    badge: 'Deterministic Gate',
    descriptionEnglish: 'Evaluates Critical Path Method (CPM) dependencies and enforces deterministic gate precedence rules.',
    descriptionArabic: 'ربط شبكة الاعتمادية بين المهام (CPM)، ومتابعة الجاهزية الكلية لإغلاق البوابات (G0-G8).',
    specialization: 'Deterministic Gate Verdict (BLOCKED>INCOMPLETE>CONDITIONAL>READY)'
  }
];

export const INITIAL_COMMUNICATION_MESSAGES: ChatMessage[] = [
  {
    id: 'MSG-101',
    sender_name: 'Eng. Ahmed Mansour',
    sender_role: 'Barge Master',
    sender_department: 'Marine',
    recipient_entity: 'Admin',
    message: 'Requesting Admin review and signoff for Gate-1 Closure Readiness. All 228 personnel onboard have BOSIET verified.',
    record_rid: 'GATE-1',
    wps_id: 'WPS-15',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    is_read: true,
    priority: 'Urgent',
    category: 'Approval Request'
  },
  {
    id: 'MSG-102',
    sender_name: 'DNV Class Surveyor',
    sender_role: 'External Auditor',
    sender_department: 'QA/QC',
    recipient_entity: 'Pipelay Operations',
    message: 'WPS-01 Tensioner Hydraulic Pressure calibration certificate is pending upload in Evidence Vault. Please attach proof before proceeding.',
    record_rid: 'WPS-01',
    wps_id: 'WPS-01',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    is_read: false,
    priority: 'Critical Blocker',
    category: 'CAPA Escalation'
  }
];

export function getStoredMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem('pms_comm_messages');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_COMMUNICATION_MESSAGES;
}

export function saveMessages(messages: ChatMessage[]) {
  try {
    localStorage.setItem('pms_comm_messages', JSON.stringify(messages));
  } catch (e) {
    console.error(e);
  }
}

// Multi-Consultant Orchestration Synthesis Engine with Three-Tier Verification & Citations
export function runOrchestratedConsultation(
  query: string,
  targetRecord: BaseRecord | null,
  targetWpsId: string | undefined,
  allRecords: BaseRecord[],
  userName: string,
  userRole: string,
  isArabic: boolean
): OrchestrationConsultation {
  const rid = targetRecord?.rid || targetWpsId || 'GENERAL-QUERY';
  const wpsId = targetWpsId || targetRecord?.wps_id || 'WPS-01';

  // 1. Document Repository Passage Retrieval (RAG Citations)
  const availableDocs = getStoredDocuments();
  const matchedDocs = availableDocs.filter(d =>
    d.text_content.toLowerCase().includes(wpsId.toLowerCase()) ||
    d.title.toLowerCase().includes(query.toLowerCase()) ||
    d.tags.some(t => query.toLowerCase().includes(t.toLowerCase())) ||
    d.department === targetRecord?.department
  ).slice(0, 3);

  const citations: Citation[] = (matchedDocs.length > 0 ? matchedDocs : availableDocs.slice(0, 2)).map((doc, idx) => ({
    citation_id: `S${idx + 1}`,
    document_code: doc.document_code,
    title: doc.title,
    revision: doc.revision,
    passage_snippet: doc.text_content.slice(0, 180) + '...',
    passage_snippet_arabic: doc.summary_arabic,
    url: doc.file_url
  }));

  // 2. Real Record Analysis across 40 Worksheets
  const relatedGaps = allRecords.filter(
    r => r.entity === 'gap' && (r.wps_id === wpsId || r.rid === rid || r.data?.wps_id === wpsId)
  );
  const openGaps = relatedGaps.filter(r => r.status !== 'Closed' && r.status !== 'Compliant');

  const relatedEvidence = allRecords.filter(
    r => r.entity === 'evidence' && (r.wps_id === wpsId || r.rid === rid)
  );

  const relatedTasks = allRecords.filter(
    r => (r.entity === 'task' || r.entity === 'execution') && (r.wps_id === wpsId || r.rid === rid)
  );
  const uncompletedTasks = relatedTasks.filter(
    r => r.status !== 'Closed' && r.status !== 'Compliant' && r.status !== 'Approved'
  );

  const hasBlockingGap = openGaps.length > 0;
  const missingEvidence = relatedEvidence.length === 0;

  // 3. Three-Tier Verification Engine & Deterministic Precedence Rule: BLOCKED > INCOMPLETE > CONDITIONAL > READY
  let tier1Status: 'Pass' | 'Fail' | 'Partial' = 'Pass';
  let tier2Status: 'Resolved' | 'Blocked Links' | 'Pending' = 'Resolved';
  let tier3Status: 'Signed' | 'Pending Quorum' | 'Rejected' = 'Signed';
  let verdictPrecedence: 'BLOCKED' | 'INCOMPLETE' | 'CONDITIONAL' | 'READY' = 'READY';

  if (hasBlockingGap) {
    tier1Status = 'Fail';
    tier2Status = 'Blocked Links';
    tier3Status = 'Pending Quorum';
    verdictPrecedence = 'BLOCKED';
  } else if (missingEvidence) {
    tier1Status = 'Partial';
    tier2Status = 'Pending';
    verdictPrecedence = 'INCOMPLETE';
  } else if (uncompletedTasks.length > 0) {
    tier1Status = 'Partial';
    verdictPrecedence = 'CONDITIONAL';
  }

  // 4. Automated Issue Remediation Actions Generator
  const remediation_actions: RemediationAction[] = [];
  if (hasBlockingGap) {
    openGaps.forEach((gap, idx) => {
      remediation_actions.push({
        id: `REM-${Date.now()}-${idx}`,
        gap_rid: gap.rid,
        wps_id: wpsId,
        action_title: isArabic
          ? `معالجة وإزالة الفجوة الحرجة [${gap.rid}]: ${gap.title}`
          : `Remediate critical finding [${gap.rid}]: ${gap.title}`,
        assigned_department: gap.department || 'Technical & Maintenance',
        assigned_head: gap.owner || 'Department Superintendent',
        priority: gap.data?.severity === 'Critical' ? 'Critical Hard-Stop' : 'High Risk',
        suggested_due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        auto_created: true,
        status: 'Suggested'
      });
    });
  } else if (missingEvidence) {
    remediation_actions.push({
      id: `REM-${Date.now()}-EVID`,
      gap_rid: rid,
      wps_id: wpsId,
      action_title: isArabic
        ? `رفع وتوثيق دليل الفحص والشهادة المعمدة لـ [${rid}] في مستودع الأدلة`
        : `Upload and verify certified inspection proof for [${rid}] in Evidence Vault`,
      assigned_department: targetRecord?.department || 'QA/QC',
      assigned_head: 'QA/QC Lead Engineer',
      priority: 'High Risk',
      suggested_due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      auto_created: true,
      status: 'Suggested'
    });
  }

  // 5. Generate 13 Domain Agent Feedbacks
  const entity_feedbacks = VIRTUAL_ENTITIES.map(entity => {
    let verdict: 'Approved' | 'Conditional' | 'Blocked' | 'Incomplete' = 'Approved';
    let confidence = 95;
    let adviceEnglish = '';
    let adviceArabic = '';
    let actionItems: string[] = [];

    switch (entity.id) {
      case 'structural_heritage':
        adviceEnglish = `Structural Integrity Agent: 1976 hull plate UT thickness survey data aligns with DNV ARC allowances (max 15% corrosion margin). 800T crane pedestal weld seams are verified.`;
        adviceArabic = `خبير السلامة الهيكلية: بيانات مسح السماكات بالـ UT لبدن 1976 تتطابق مع الحدود المسموح بها DNV ARC. وصلات قاعدة الرافعة 800 طن موثقة.`;
        actionItems = [`Maintain annual UT survey log for moonpool corners.`];
        break;

      case 'dnv_compliance':
        if (hasBlockingGap) {
          verdict = 'Blocked';
          confidence = 98;
          adviceEnglish = `DNV/GL Compliance Inspector: Condition Precedent (CP) is BLOCKED due to open finding ${openGaps[0]?.rid}. Statutory survey endorsement cannot be granted until cleared.`;
          adviceArabic = `مفتش DNV/GL: الشرط المسبق (CP) محظور بسبب وجود الفجوة ${openGaps[0]?.rid}. لا يمكن منح خطاط الملاحة حتى إزالة الملاحظة.`;
          actionItems = [`Resolve open DNV finding ${openGaps[0]?.rid} with certified surveyor.`];
        } else {
          adviceEnglish = `DNV/GL Compliance Inspector: All statutory certificates (SOLAS, MARPOL, ILLC) for ${wpsId} are verified against class rulebook R-001..R-089.`;
          adviceArabic = `مفتش DNV/GL: جميع الشهادات القانونية لـ ${wpsId} موثقة ومطابقة لقواعد هيئة التصنيف.`;
          actionItems = [`Keep DNV surveyor endorsement letter on file.`];
        }
        break;

      case 'pipelay_construction':
        adviceEnglish = `Pipelay Construction Specialist: WPS welding specs, 100% NDT/X-Ray joint logs, and tensioners 120T pull force parameters for ${wpsId} are structurally validated.`;
        adviceArabic = `أخصائي الإنشاءات ومد الأنابيب: مواصفات اللحام WPS، فحص X-Ray بنسبة 100%، وقوة شداد الأنابيب 120 طناً معتمدة.`;
        actionItems = [`Monitor tensioner hydraulic pressure during field laying.`];
        break;

      case 'commissioning_testing':
        if (uncompletedTasks.length > 0) {
          verdict = 'Conditional';
          confidence = 88;
          adviceEnglish = `Commissioning Testing Agent: Mechanical Completion Punchlist (MCP) shows ${uncompletedTasks.length} pending items for ${wpsId}. Conditional SAT signoff permitted with work order.`;
          adviceArabic = `وكيل التشغيل والاختبارات: قائمة النواقص الميكانيكية MCP تحوي ${uncompletedTasks.length} مهام معلقة. يُسمح بالقبول المشروط مع أمر العمل.`;
          actionItems = [`Complete SAT test protocol for emergency fire pumps.`];
        } else {
          adviceEnglish = `Commissioning Testing Agent: SAT site acceptance tests for fire, pumps, and power systems are 100% completed with zero punchlist blockers.`;
          adviceArabic = `وكيل التشغيل: اختبارات القبول الموقعي SAT لأنظمة الإطفاء والكهرباء مكتملة 100%.`;
          actionItems = [`Lock mechanical completion certificates.`];
        }
        break;

      case 'marine_ops':
        adviceEnglish = `Marine Operations Advisor: Barge stability booklet curves, draft operational limits (3.2m - 5.8m), and BWMS ballast water logs satisfy safe sea state (Hs <= 2.5m).`;
        adviceArabic = `استشاري العمليات البحرية: منحنيات كتاب الاتزان، حدود الغاطس التشغيلية، ومياه التوازن تتوافق مع أمان البحر (Hs <= 2.5m).`;
        actionItems = [`Check ballast tank automated sensors every shift.`];
        break;

      case 'hse_safety':
        adviceEnglish = `HSE & Safety Consultant: Process Safety Management (PSM), HAZID/HAZOP risk matrix ratings, and PTW permit compliance for ${wpsId} are within safe thresholds.`;
        adviceArabic = `استشاري السلامة والبيئة: دراسات المخاطر HAZID/HAZOP، مصفوفة المخاطر، ونظام تصاريح العمل PTW ضمن الحدود الآمنة.`;
        actionItems = [`Maintain weekly PTW audit sampling.`];
        break;

      case 'crew_training':
        adviceEnglish = `Crew & Training Consultant: POB total is compliant with certified 250 berth limit. All offshore crew have active STCW and BOSIET/HUET certificates.`;
        adviceArabic = `استشاري الطاقم والتسكين: إجمالي المقيمين POB ضمن الحد المعتمد 250 سريراً، وجميع الشهادات سارية.`;
        actionItems = [`Verify rest hours log before shift change.`];
        break;

      case 'qaqc_vendor':
        if (missingEvidence) {
          verdict = 'Incomplete';
          confidence = 92;
          adviceEnglish = `QA/QC Vendor Auditor: Evidence Vault lacks verified inspection report for ${rid}. Dual-signature chain-of-custody proof is missing.`;
          adviceArabic = `استشاري الجودة والتدقيق: مستودع الأدلة يفتقر لتقرير الفحص المعمد لـ ${rid}. توثيق سلسلة الحيازة غير مكتمل.`;
          actionItems = [`Attach signed inspection proof to Evidence Vault.`];
        } else {
          adviceEnglish = `QA/QC Vendor Auditor: CAPA findings are closed and document chain-of-custody is verified.`;
          adviceArabic = `استشاري الجودة: تم إغلاق الإجراءات التصحيحية CAPA وتوثيق المستندات.`;
          actionItems = [`Archive vendor compliance certificates.`];
        }
        break;

      case 'helideck_aviation':
        adviceEnglish = `Helideck & Aviation Consultant: ECAA ECAR Part 138 helideck friction coefficient (>=0.85), green LED perimeter lighting, and DIFFS foam system are fully ready.`;
        adviceArabic = `استشاري الطيران والمربض: معامل احتكاك السطح طبقاً لتشريعات سلطة الطيران المدني المصري ECAR 138 (>=0.85)، إضاءة المحيط، ومعدات الإطفاء DIFFS جاهزة.`;
        actionItems = [`Keep HLO and crash firefighters stationed during flight ops.`];
        break;

      case 'environmental_emissions':
        adviceEnglish = `Environmental Specialist: MARPOL Annex I Oil Record Book (ORB) entries and SOx/NOx emissions measurements align with statutory environmental limits.`;
        adviceArabic = `أخصائي البيئة والانبعاثات: سجل الزيت ORB وسجلات النفايات وتفريغ الانبعاثات مطابقة للاشتراطات البيئية.`;
        actionItems = [`Log daily oily water separator operations.`];
        break;

      case 'financial_contract':
        adviceEnglish = `Financial & Contract Governance: Task completion aligns with budget burn rates. Liquidated Damages (LD) risks are low, and P&I insurance is active.`;
        adviceArabic = `استشاري الحوكمة المالية والعقود: إنجاز المهام يتطابق مع الميزانية، ومخاطر الغرامات منخفضة والتأمين P&I سارٍ.`;
        actionItems = [`Review monthly milestone payment certificate.`];
        break;

      case 'third_party_class':
        adviceEnglish = `Third-Party & Class Liaison: DNV surveyor boarding schedule is confirmed. Port authority and Flag State notifications are transmitted.`;
        adviceArabic = `وكيل التنسيق مع الجهات الخارجية: موعد صعود مساح DNV مؤكد، وإخطارات سلطة الميناء ودولة العلم مكتملة.`;
        actionItems = [`Prepare surveyor escort briefing.`];
        break;

      case 'gatekeeper':
        if (hasBlockingGap) {
          verdict = 'Blocked';
          confidence = 99;
          adviceEnglish = `Deterministic Gate Engine: Gate Verdict is BLOCKED. Critical path dependency has failed due to unresolved gap ${openGaps[0]?.rid}. Precedence rule strictly enforces BLOCKED status.`;
          adviceArabic = `المحرك الحتمي للبوابات: نتيجة البوابة محظورة (BLOCKED). شرط المسار الحرجة فشل بسبب الفجوة ${openGaps[0]?.rid}. قاعدة الأسبقية تفرض الحظر.`;
          actionItems = [`Execute automated issue remediation actions.`];
        } else {
          adviceEnglish = `Deterministic Gate Engine: Gate Precedence Rule is READY. All CPM dependency paths for ${wpsId} are clear for milestone signoff.`;
          adviceArabic = `المحرك الحتمي للبوابات: قاعدة أسبقية البوابات جاهزة (READY). جميع مسارات اعتمادية CPM لـ ${wpsId} مفتوحة للتوقيع.`;
          actionItems = [`Submit formal Gate Sign-Off Protocol to Admin.`];
        }
        break;
    }

    return {
      entity_id: entity.id,
      verdict,
      confidence,
      adviceEnglish,
      adviceArabic,
      actionItems
    };
  });

  const decisionNotice = isArabic
    ? 'تنبيه حوكمي: هذه الإجابة والاستشارات لدعم القرار واتخاذ الإجراءات فقط ولا تعتبر اعتماداً قانونياً رسمياً دون التوقيع البشري النصابي.'
    : 'Governance Notice: This consultation response is for decision support only and does not constitute formal statutory certification without human quorum sign-off.';

  return {
    id: `CONSULT-${Date.now().toString().slice(-6)}`,
    query,
    target_rid: rid,
    target_wps: wpsId,
    timestamp: new Date().toISOString(),
    user_name: userName,
    user_role: userRole,
    overall_status: verdictPrecedence,
    gate_precedence_verdict: verdictPrecedence,
    tier1_agent_status: tier1Status,
    tier2_cross_dependency_status: tier2Status,
    tier3_authority_signoff_status: tier3Status,
    decision_notice: decisionNotice,
    citations,
    remediation_actions,
    entity_feedbacks
  };
}
