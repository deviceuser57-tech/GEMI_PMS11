import { DocumentRepositoryItem } from '../types/pms';

export const INITIAL_DOCUMENTS: DocumentRepositoryItem[] = [
  {
    id: 'DOC-001',
    document_code: 'DNV-ARC-1976',
    title: 'DNV Structural Integrity & Corrosion Assessment Guide (1976 Asset Rev)',
    title_arabic: 'دليل هيئة DNV للسلامة الهيكلية وتقدير التآكل للبارجة التاريخية 1976',
    category: 'Class Rule',
    department: 'Technical & Maintenance',
    source_type: 'PDF',
    file_url: 'https://www.dnv.com/rules-standards/ship-rules/',
    upload_date: '2026-01-15',
    uploaded_by: 'QA/QC Lead Engineer',
    security_level: 'Restricted',
    revision: 'Rev.04',
    summary_english: 'Establishes UT Thickness Survey protocols, DNV ARC steel corrosion allowances, and structural fatigue evaluation limits for PMS-11 hull and 800T crane pedestal.',
    summary_arabic: 'يحدد بروتوكولات المسح بسماكات الموجات فوق الصوتية UT، حدود تآكل الصلب المسموح بها، وتقييم الإجهاد الهيكلي لبدن البارجة وقاعدة الرافعة 800 طن.',
    text_content: 'DNV Structural Rules Section 4: Steel thickness reduction limits for non-propelled pipelay barge hull built 1976. Maximum allowable corrosion margin is 15% of original plate thickness. Ultrasonic Testing (UT Survey) must cover 100% of crane pedestal weld seams and moonpool corners. Any defect exceeding 3mm depth requires immediate grinding and NDT re-inspection.',
    tags: ['DNV', 'UT Survey', 'Crane 800T', 'Steel Thickness', 'Hull Integrity']
  },
  {
    id: 'DOC-002',
    document_code: 'SOLAS-CH2-FIRE',
    title: 'SOLAS Chapter II-2 Construction Fire Protection & Extinguishing Systems',
    title_arabic: 'كود SOLAS الفصل الثاني-2 أنظمة الوقاية من الحريق والإطفاء على البوارج',
    category: 'Statutory Standard',
    department: 'HSE & Safety',
    source_type: 'Statutory Code',
    file_url: 'https://www.imo.org/en/About/Conventions/Pages/International-Convention-for-the-Safety-of-Life-at-Sea-(SOLAS),-1974.aspx',
    upload_date: '2026-02-01',
    uploaded_by: 'HSE Manager',
    security_level: 'Public',
    revision: '2024 Edition',
    summary_english: 'Statutory requirements for main fire pumps, fixed foam extinguishing systems for helideck/engine room, and emergency fire dampers.',
    summary_arabic: 'الاشتراطات التشريعية لمضخات الحريق الرئيسية، أنظمة الإطفاء بالفوم لرغوة المحركات والمهبط، ومخمدات الحريق للسيطرة على الطوارئ.',
    text_content: 'SOLAS Reg II-2/10: Emergency fire pumps must deliver two full jets of water at minimum 0.35 N/mm2 pressure. Engine room fixed CO2/foam system must be inspected every 12 months with pressure certification. Helideck DIFFS (Deck Integrated Fire Fighting System) requires dual monitor cannons operating at 1,000 L/min flow rate.',
    tags: ['SOLAS', 'Fire System', 'DIFFS Foam', 'IMO', 'HSE']
  },
  {
    id: 'DOC-003',
    document_code: 'ECAR-138-HELI',
    title: 'ECAR Part 138 ECAA Egyptian Civil Aviation Offshore Helideck Operations Standards Handbook',
    title_arabic: 'كتيب تشريعات سلطة الطيران المدني المصري ECAR Part 138 / EAC 139-27 لتفتيش وتشغيل مهابط المروحيات البحرية',
    category: 'Safety Procedure',
    department: 'Aviation & Helideck',
    source_type: 'PDF',
    file_url: 'https://www.civilaviation.gov.eg/ecar138',
    upload_date: '2026-02-10',
    uploaded_by: 'ECAA Aviation Inspector',
    security_level: 'Public',
    revision: 'Rev.02 (ECAA Approved)',
    summary_english: 'Egyptian Civil Aviation Authority (ECAA) ECAR Part 138 regulations covering helideck D-value 22.2m, surface friction >=0.85, green LED perimeter lights, DIFFS foam systems, and HLO command.',
    summary_arabic: 'التشريعات المصرية لسلطة الطيران المدني ECAR Part 138 لاختبار احتكاك السطح (>=0.85)، إضاءة المحيط الخضراء، الفوم التلقائي DIFFS، ومسؤول HLO.',
    text_content: 'ECAR 138 §138.307 & EAC 139-27: Surface friction coefficient of offshore helideck must not be less than 0.85 per ECAA approved tester. Green LED perimeter lighting and 210 degree obstacle-free sector required. Helideck Safety Report and ECAA certificate mandatory.',
    tags: ['ECAR 138', 'ECAA', 'Helideck', 'Egyptian Civil Aviation', 'Friction Test', 'DIFFS']
  },
  {
    id: 'DOC-004',
    document_code: 'PMS11-STABILITY-MANUAL',
    title: 'PMS-11 Barge Intact & Damage Stability Booklet',
    title_arabic: 'كتيب اتزان البارجة PMS-11 للعمليات المباشرة وحالات الأضرار',
    category: 'Barge Manual',
    department: 'Marine',
    source_type: 'PDF',
    file_url: 'https://pms11.offshore/documents/stability_rev3.pdf',
    upload_date: '2026-03-01',
    uploaded_by: 'Barge Master',
    security_level: 'Restricted',
    revision: 'Rev.03',
    summary_english: 'Approved stability curves, draft limits (min 3.2m / max 5.8m), ballast water management procedures, and Hs sea state operational limits.',
    summary_arabic: 'منحنيات الاتزان المعتمدة، حدود الغاطس (أدنى 3.2m / أقصى 5.8m)، إجراءات إدارة مياه التوازن، وحدود حالة البحر التشغيلية Hs.',
    text_content: 'PMS-11 Stability Manual Section 2: Maximum allowable wave height (Significant Wave Height Hs) for pipelay operations is 2.5 meters. During severe weather (Hs > 3.5m), tensioners must be locked and pipe abandoned on seabed with recovery head. Ballast tanks 1P through 4S must be monitored hourly via automated sensors.',
    tags: ['Stability', 'Barge Master', 'Draft Limits', 'Ballast', 'Sea State Hs']
  },
  {
    id: 'DOC-005',
    document_code: 'WPS-PIPELAY-SPEC-2026',
    title: 'PMS-11 Subsea Welding Specification & WPS Procedure Manual',
    title_arabic: 'دليل مواصفات اللحام والإجراءات الفنية لحزم عمل مد الأنابيب WPS',
    category: 'Technical Spec',
    department: 'Pipelay Operations',
    source_type: 'PDF',
    file_url: 'https://pms11.offshore/tech/wps_manual.pdf',
    upload_date: '2026-03-12',
    uploaded_by: 'Pipelay Superintendent',
    security_level: 'Restricted',
    revision: 'Rev.02',
    summary_english: 'Technical parameters for WPS-01 to WPS-24 welding procedures, 100% NDT Radiographic/X-Ray inspection rules, and hydro-test pressures.',
    summary_arabic: 'البارامترات الفنية لإجراءات اللحام WPS-01 إلى WPS-24، قواعد الفحص بالأشعّة X-Ray بنسبة 100%، وضغوط الاختيار المائي Hydro-test.',
    text_content: 'WPS Spec Section 5: All mainline girth welds require 100% Radiographic Testing (RT/X-Ray) and Ultrasonic Testing (UT). Preheat temperature must be maintained at 150C minimum. Tensioner holding capacity is certified for 120 tonnes pull force.',
    tags: ['WPS', 'NDT', 'X-Ray', 'Welding', 'Tensioners']
  }
];

export function getStoredDocuments(): DocumentRepositoryItem[] {
  try {
    const raw = localStorage.getItem('pms_document_repository');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_DOCUMENTS;
}

export function saveDocuments(docs: DocumentRepositoryItem[]) {
  try {
    localStorage.setItem('pms_document_repository', JSON.stringify(docs));
  } catch (e) {
    console.error(e);
  }
}

// Scoped Document Search & Retrieval Engine (RAG Passage Search)
export function queryDocumentRepository(
  searchQuery: string,
  targetDepartment?: string,
  userSecurityRole: string = 'Admin'
): DocumentRepositoryItem[] {
  const allDocs = getStoredDocuments();
  const q = searchQuery.toLowerCase().trim();

  return allDocs.filter(doc => {
    // RBAC Security Check
    if (userSecurityRole !== 'Admin' && doc.security_level === 'Confidential Admin') {
      return false;
    }

    if (targetDepartment && targetDepartment !== 'All' && doc.department !== targetDepartment) {
      // Allow general match if doc matches tags or query
      const matchesDept = doc.department === targetDepartment;
      const matchesQuery = q ? (doc.title.toLowerCase().includes(q) || doc.text_content.toLowerCase().includes(q) || doc.tags.some(t => t.toLowerCase().includes(q))) : true;
      return matchesDept || matchesQuery;
    }

    if (!q) return true;

    return (
      doc.document_code.toLowerCase().includes(q) ||
      doc.title.toLowerCase().includes(q) ||
      doc.summary_english.toLowerCase().includes(q) ||
      doc.text_content.toLowerCase().includes(q) ||
      doc.tags.some(t => t.toLowerCase().includes(q))
    );
  });
}
