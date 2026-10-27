import { BaseRecord, WorkbookSheetInfo, AuditLog, Department, RecordStatus, DependencyType } from '../types/pms';

export const INITIAL_SHEETS_CATALOG: WorkbookSheetInfo[] = [
  // 1. Core Operational Sheets (15 sheets)
  { sheetName: 'DASHBOARD', arabicName: 'مركز القيادة والتحكم التنفيذي', category: 'Core Operational', targetEntity: 'dashboard_summary', recordCount: 1, description: 'المؤشرات الرقمية المجمعة وحالة الإغلاق الكلية ومخططات Recharts للجاهزية' },
  { sheetName: 'WPS', arabicName: 'حزم العمل المتخصصة (24 حزمة)', category: 'Core Operational', targetEntity: 'wps', recordCount: 24, description: 'حزم العمل الفنية والتشغيلية للبارجة من WPS-01 إلى WPS-24' },
  { sheetName: 'Rules', arabicName: 'سجل القواعد والاشتراطات (89 قاعدة)', category: 'Core Operational', targetEntity: 'rule', recordCount: 89, description: 'قواعد التوافق والسلامة والمتطلبات الهندسية الإلزامية' },
  { sheetName: 'Activities', arabicName: 'الأنشطة الميدانية (138 نشاطاً)', category: 'Core Operational', targetEntity: 'activity', recordCount: 138, description: 'الأنشطة التنفيذية المرتبطة بالقواعد وحزم العمل' },
  { sheetName: 'Tasks', arabicName: 'سجل المهام التفصيلية (343 مهمة)', category: 'Core Operational', targetEntity: 'task', recordCount: 343, description: 'مهام التدقيق والتفتيش ومسؤوليات الطاقم الميداني' },
  { sheetName: 'Deliverables', arabicName: 'المخرجات والوثائق المعتمدة (138 مخرجاً)', category: 'Core Operational', targetEntity: 'deliverable', recordCount: 138, description: 'التقارير والمخططات والشهادات المطلوبة كأدلة رسمية' },
  { sheetName: 'Gates', arabicName: 'بوابات الإغلاق والمراحل (9 بوابات)', category: 'Core Operational', targetEntity: 'gate', recordCount: 9, description: 'بوابات الجاهزية التشغيلية والعبور من GATE-0 إلى GATE-8' },
  { sheetName: 'Gaps', arabicName: 'سجل الفجوات وإجراءات التصحيح CAPA (138 فجوة)', category: 'Core Operational', targetEntity: 'gap', recordCount: 138, description: 'الملاحظات الفنية وعدم المطابقة وخطط المعالجة والأسباب الجذرية' },
  { sheetName: 'Acceptance', arabicName: 'سجلات القبول والاعتماد الرسمي (154 معياراً)', category: 'Core Operational', targetEntity: 'acceptance', recordCount: 154, description: 'توقيعات وموافقات المالك وسلطة العلم وهيئة الإشراف MWS' },
  { sheetName: 'Evidence', arabicName: 'مستودع الأدلة والوثائق الثبوتية (145 دليلاً)', category: 'Core Operational', targetEntity: 'evidence', recordCount: 145, description: 'تقارير الفحص والشهادات المسجلة بالأرقام والروابط الموثقة' },
  { sheetName: 'Risks', arabicName: 'سجل المخاطر التشغيلية (25 خطراً)', category: 'Core Operational', targetEntity: 'risk', recordCount: 25, description: 'المخاطر المحددة ومستوى الشدة ومصفوفة التخفيف' },
  { sheetName: 'Changes', arabicName: 'إدارة التغييرات الهندسية MOC (0 حالياً)', category: 'Core Operational', targetEntity: 'change', recordCount: 0, description: 'طلبات التعديل الهندسي والموافقات الفنية على المتن' },
  { sheetName: 'Responsibilities', arabicName: 'مصفوفة المسؤوليات RACI (54 سجلاً)', category: 'Core Operational', targetEntity: 'responsibility', recordCount: 54, description: 'توزيع الصلاحيات والمسؤوليات بين الرتب والمديرين' },
  { sheetName: 'Department_Summary', arabicName: 'ملخص أداء وحوكمة الأقسام', category: 'Core Operational', targetEntity: 'department_summary', recordCount: 10, description: 'إحصائيات إنجاز وتوافق الأقسام الفنية مع نظام RLS' },
  { sheetName: 'RULE_WPS_MAP', arabicName: 'خريطة ربط القواعد بحزم العمل', category: 'Core Operational', targetEntity: 'rule_wps_map', recordCount: 89, description: 'العلاقات البينية بين القواعد الـ 89 وحزم الـ WPS' },

  // 2. Specialized Operational Sheets (14 sheets)
  { sheetName: 'Crew_Roles', arabicName: 'أدوار ورتب الطاقم الحرج (12 رتبة)', category: 'Specialized Operations', targetEntity: 'crew_role', recordCount: 12, description: 'مسميات الوظائف البحرية الحرجة وشروط التكليف (WPS-23)' },
  { sheetName: 'Crew_Requirements', arabicName: 'اشتراطات تدريب وترخيص الطاقم (23 متطلباً)', category: 'Specialized Operations', targetEntity: 'crew_requirement', recordCount: 23, description: 'شهادات STCW, IMCA, BOSIET والفحوصات الطبية وإلزامية تاريخ الانتهاء' },
  { sheetName: 'Crew_Register', arabicName: 'سجل الأفراد الفعلي (طاقم المتن)', category: 'Specialized Operations', targetEntity: 'crew_member', recordCount: 45, description: 'بيانات البحارة والفنيين ونمط التشغيل والوردية وتصريح النزول' },
  { sheetName: 'Crew_Certificates', arabicName: 'شهادات وصلاحيات الأفراد', category: 'Specialized Operations', targetEntity: 'crew_certificate', recordCount: 110, description: 'أرقام الشهادات وتواريخ الانتهاء وتنبيهات الصلاحية (أصفر <30 يوماً، أحمر منتهية)' },
  { sheetName: 'Manning_Plan', arabicName: 'خطة المانينج وتوزيع الطاقم (12 خطة)', category: 'Specialized Operations', targetEntity: 'manning_plan', recordCount: 12, description: 'الأعداد المقررة لكل سيناريو تشغيلي (Marine / Diving / Pipelay)' },
  { sheetName: 'Helideck_Profile', arabicName: 'الملف الفني لمهبط الطائرات (ECAR 138)', category: 'Specialized Operations', targetEntity: 'helideck_profile', recordCount: 1, description: 'حسم القرار الهندسي ECAR 138 وأوزان الطائرات D-Value لنسب سلطة الطيران ECAA (WPS-19)' },
  { sheetName: 'Helideck_Checks', arabicName: 'فحوصات تفتيش المهبط (10 فحوصات دورية)', category: 'Specialized Operations', targetEntity: 'helideck_check', recordCount: 10, description: 'شباك الأمان، إطفاء الفوم DIFFS، الاحتكاك، الإنارة، ومعدات الإنقاذ' },
  { sheetName: 'Accommodation_Checks', arabicName: 'فحوصات الإقامة والراحة (10 فحوصات MLC)', category: 'Specialized Operations', targetEntity: 'accommodation_check', recordCount: 10, description: 'التكييف HVAC، مياه الشرب، النظافة، مطابق معاهدة MLC 2006 (WPS-15)' },
  { sheetName: 'Accommodation_Capacity', arabicName: 'خطة POB الاستيعابية وخطة الأسِرة', category: 'Specialized Operations', targetEntity: 'accommodation_capacity', recordCount: 1, description: 'الأسِرّة المعتمدة (250 سرير)، السعة القصوى POB Limit (245 فرد)، وسجلات العلم' },
  { sheetName: 'Execution', arabicName: 'المهام التنفيذية الميدانية (317 مهمة)', category: 'Specialized Operations', targetEntity: 'execution', recordCount: 317, description: 'المهام التنفيذية المربوطة برئيس التخصص ومدير الإدارة' },
  { sheetName: 'Functional', arabicName: 'الأنشطة الوظيفية والتصنيف الخارجي (362 نشاطاً)', category: 'Specialized Operations', targetEntity: 'functional', recordCount: 362, description: 'الأنشطة المرتبطة بسلطة العلم وهيئات التصنيف DNV' },
  { sheetName: 'Dependencies', arabicName: 'شبكة الاعتماديات والمسار الحرج (612 رابط)', category: 'Specialized Operations', targetEntity: 'dependency', recordCount: 612, description: 'العلاقات التتابعية Finish-to-Start وفترات التأخير Lag Days' },
  { sheetName: 'Sources', arabicName: 'المراجع والتشريعات الدولية (35 كوداً)', category: 'Specialized Operations', targetEntity: 'source', recordCount: 35, description: 'كودات SOLAS, MARPOL, DNV Rules, IMCA D014, API' },
  { sheetName: 'Supplemental_Controls', arabicName: 'اشتراطات وضوابط تحكم إضافية (39 ضابطاً)', category: 'Specialized Operations', targetEntity: 'supplemental_control', recordCount: 39, description: 'معايير تحكم ملحقة بالأنشطة الحرجة والبيئية' },

  // 3. Governance, Reference & Cross-Mapping Sheets (11 sheets)
  { sheetName: 'MASTER_DATA', arabicName: 'البيانات المرجعية المجمعة (612 صفاً)', category: 'Governance & Relations', targetEntity: 'master_data', recordCount: 612, description: 'جدول العلاقات المجمعة وضوابط الحقول' },
  { sheetName: 'Dept_Ownership', arabicName: 'حوكمة الأقسام ومسؤولياتها (116 صفاً)', category: 'Governance & Relations', targetEntity: 'dept_ownership', recordCount: 116, description: 'توزيع الملكية والتحكم في صلاحيات الأقسام RLS' },
  { sheetName: 'LISTS', arabicName: 'القوائم المنسدلة الموحدة', category: 'Governance & Relations', targetEntity: 'lists', recordCount: 85, description: 'القيم الموحدة للحالات والرتب والتصنيفات' },
  { sheetName: 'DROPDOWN_MAP', arabicName: 'خريطة ربط الأعمدة بالقوائم (205 أعمدة)', category: 'Governance & Relations', targetEntity: 'dropdown_map', recordCount: 205, description: 'ربط الحقول الميدانية بالقوائم المنسدلة الصحيحة' },
  { sheetName: 'Relationships', arabicName: 'شبكة العلاقات البينية الشاملة (14,825 رابطاً)', category: 'Governance & Relations', targetEntity: 'relationships', recordCount: 14825, description: 'روابط السجلات ببعضها عبر كامل منظومة البارجة' },
  { sheetName: 'POWERPIVOT_RELATIONS', arabicName: 'علاقات تحليل البيانات الضخمة', category: 'Governance & Relations', targetEntity: 'powerpivot_relations', recordCount: 34, description: 'نماذج التغذية لمؤشرات الأداء المتقدمة' },
  { sheetName: 'DEPENDENCY_ENDPOINT_TYPES', arabicName: 'أنواع نهايات الاعتماديات', category: 'Governance & Relations', targetEntity: 'dependency_endpoint_type', recordCount: 12, description: 'تعريف أطراف الروابط بين البوابات والمهام والقواعد' },
  { sheetName: 'RELATIONSHIP_TYPES', arabicName: 'أنواع العلاقات المنطقية', category: 'Governance & Relations', targetEntity: 'relationship_type', recordCount: 8, description: 'تصنيفات الروابط: تتابعية، تنظيمية، سلامة' },
  { sheetName: 'AUDIT_CONFIG', arabicName: 'إعدادات سجل التدقيق والمراقبة', category: 'Governance & Relations', targetEntity: 'audit_config', recordCount: 16, description: 'قواعد التتبع الصارم للتعديلات والاعتمادات' },
  { sheetName: 'CREW_HELI_ACCOM_DASH', arabicName: 'مؤشرات الطاقم والمهبط والإقامة العليا', category: 'Governance & Relations', targetEntity: 'crew_heli_accom_dash', recordCount: 1, description: 'الواجهة التحليلية المركزة للقطاعات الثلاثة التخصصية' },
  { sheetName: 'Gap_WPS', arabicName: 'مصفوفة فجوات حزم العمل', category: 'Governance & Relations', targetEntity: 'gap_wps', recordCount: 138, description: 'ربط الفجوات المفتوحة بحزم العمل المتأثرة' },
];

// Helper to generate full realistic dataset matching exact sheet requirements
function generateAllRecords(): BaseRecord[] {
  const records: BaseRecord[] = [];
  const now = new Date();

  // 1. Exactly 24 WPS Packages (WPS-01 to WPS-24)
  const wpsTitles = [
    { num: '01', name: 'Hull, Ballast & Marine Stability', dept: 'Marine' as Department, assisting: ['Technical & Maintenance', 'HSE & Safety'] as Department[], rate: 100, status: 'Approved' as RecordStatus },
    { num: '02', name: 'Main Power Generation & High Voltage Switchgear', dept: 'Technical & Maintenance' as Department, assisting: ['Marine', 'QA/QC'] as Department[], rate: 95, status: 'Compliant' as RecordStatus },
    { num: '03', name: 'Emergency Diesel Generator & Black Start', dept: 'Technical & Maintenance' as Department, assisting: ['Marine', 'HSE & Safety'] as Department[], rate: 100, status: 'Approved' as RecordStatus },
    { num: '04', name: '8-Point Mooring System & Winch Tensioners', dept: 'Marine' as Department, assisting: ['Technical & Maintenance', 'Pipelay Operations'] as Department[], rate: 90, status: 'Compliant' as RecordStatus },
    { num: '05', name: 'Heavy Lift Crane 300T & Rigging Systems', dept: 'Technical & Maintenance' as Department, assisting: ['QA/QC', 'Marine'] as Department[], rate: 85, status: 'OPEN' as RecordStatus },
    { num: '06', name: 'Auxiliary Deck Cranes & Pedestal Winches', dept: 'Technical & Maintenance' as Department, assisting: ['Marine', 'Pipelay Operations'] as Department[], rate: 95, status: 'Compliant' as RecordStatus },
    { num: '07', name: 'Fire Fighting Deluge, Foam & Detection System', dept: 'HSE & Safety' as Department, assisting: ['Aviation & Helideck', 'Technical & Maintenance', 'Marine'] as Department[], rate: 100, status: 'Approved' as RecordStatus },
    { num: '08', name: 'Life Saving Appliances, Lifeboats & Rescue Boats', dept: 'HSE & Safety' as Department, assisting: ['Marine', 'Catering & Accommodation'] as Department[], rate: 100, status: 'Approved' as RecordStatus },
    { num: '09', name: 'Marine Navigation & GMDSS Communication Suite', dept: 'Marine' as Department, assisting: ['Technical & Maintenance', 'Aviation & Helideck'] as Department[], rate: 95, status: 'Compliant' as RecordStatus },
    { num: '10', name: 'Pipe Storage Deck, Stanchions & Transfer Bogies', dept: 'Pipelay Operations' as Department, assisting: ['Technical & Maintenance', 'HSE & Safety'] as Department[], rate: 88, status: 'OPEN' as RecordStatus },
    { num: '11', name: 'Pipelay Firing Line, 80T Tensioners & Rollers', dept: 'Pipelay Operations' as Department, assisting: ['QA/QC', 'Technical & Maintenance'] as Department[], rate: 82, status: 'OPEN' as RecordStatus },
    { num: '12', name: 'Saturation & Surface Diving Complex (IMCA D014)', dept: 'Diving Operations' as Department, assisting: ['HSE & Safety', 'Technical & Maintenance'] as Department[], rate: 96, status: 'Compliant' as RecordStatus },
    { num: '13', name: 'Diving Gas Storage Quad & Helium Recovery', dept: 'Diving Operations' as Department, assisting: ['HSE & Safety', 'Technical & Maintenance'] as Department[], rate: 100, status: 'Approved' as RecordStatus },
    { num: '14', name: 'Automatic Welding Stations & Gas Supply Lines', dept: 'Pipelay Operations' as Department, assisting: ['QA/QC', 'Technical & Maintenance'] as Department[], rate: 85, status: 'OPEN' as RecordStatus },
    { num: '15', name: 'Accommodation & POB Living Quarters (MLC 2006)', dept: 'Catering & Accommodation' as Department, assisting: ['HSE & Safety', 'Marine'] as Department[], rate: 95, status: 'Compliant' as RecordStatus },
    { num: '16', name: 'Potable Water Production, UV Sterilization & Bunkering', dept: 'Catering & Accommodation' as Department, assisting: ['Technical & Maintenance', 'HSE & Safety'] as Department[], rate: 92, status: 'Compliant' as RecordStatus },
    { num: '17', name: 'Sewage Treatment Plant & Greywater Disposal (MARPOL IV)', dept: 'HSE & Safety' as Department, assisting: ['Technical & Maintenance', 'Catering & Accommodation'] as Department[], rate: 100, status: 'Approved' as RecordStatus },
    { num: '18', name: 'Waste Management, Incinerator & Food Macerator', dept: 'HSE & Safety' as Department, assisting: ['Catering & Accommodation', 'Marine'] as Department[], rate: 90, status: 'Compliant' as RecordStatus },
    { num: '19', name: 'Helideck Facilities & Emergency Foam DIFFS (ECAR 138 / ECAA)', dept: 'Aviation & Helideck' as Department, assisting: ['HSE & Safety', 'Marine'] as Department[], rate: 94, status: 'Compliant' as RecordStatus },
    { num: '20', name: 'Aviation Refueling Fuel Skids & Filtration', dept: 'Aviation & Helideck' as Department, assisting: ['HSE & Safety', 'Technical & Maintenance'] as Department[], rate: 90, status: 'Compliant' as RecordStatus },
    { num: '21', name: 'Non-Destructive Testing (NDT) & Radiography Vault', dept: 'QA/QC' as Department, assisting: ['Pipelay Operations', 'Technical & Maintenance'] as Department[], rate: 88, status: 'In Progress' as RecordStatus },
    { num: '22', name: 'Field Joint Coating (FJC) & Induction Heating', dept: 'Pipelay Operations' as Department, assisting: ['QA/QC', 'Technical & Maintenance'] as Department[], rate: 80, status: 'OPEN' as RecordStatus },
    { num: '23', name: 'Personnel Competence, Manning & Medical Fitness', dept: 'Marine' as Department, assisting: ['HSE & Safety', 'Catering & Accommodation', 'Diving Operations'] as Department[], rate: 89, status: 'In Progress' as RecordStatus },
    { num: '24', name: 'Demobilization, Final Acceptance & Commercial Handover', dept: 'Project Management' as Department, assisting: ['Marine', 'QA/QC', 'HSE & Safety'] as Department[], rate: 45, status: 'OPEN' as RecordStatus },
  ];

  wpsTitles.forEach(w => {
    records.push({
      id: `wps-${w.num}`,
      rid: `WPS-${w.num}`,
      entity: 'wps',
      title: `${w.name}`,
      description: `حزمة العمل التشغيلية الرسمية WPS-${w.num} لبارجة PMS-11 تحت إشراف قسم ${w.dept}`,
      department: w.dept,
      assisting_departments: w.assisting,
      status: w.status,
      owner: `Superintendent / Lead ${w.dept}`,
      due_date: '2026-11-15',
      evidence_ids: [`EVD-0${w.num}`],
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T12:00:00Z',
      data: {
        wps_number: `WPS-${w.num}`,
        lead_discipline: `${w.dept} Lead`,
        scope_category: 'Work Package Scope',
        completion_rate: w.rate,
        critical_items_count: Math.floor(Math.random() * 8) + 4
      }
    });
  });

  // 2. 9 Gates (GATE-0 to GATE-8)
  const gateData = [
    { num: 0, title: 'GATE-0: Port Baseline & Statutory Verification', status: 'Approved' as RecordStatus, score: 100 },
    { num: 1, title: 'GATE-1: Mobilization & Equipment Integration Clearance', status: 'In Progress' as RecordStatus, score: 87.5 },
    { num: 2, title: 'GATE-2: Marine Warranty Survey (MWS) Sail Clearance', status: 'Draft' as RecordStatus, score: 60 },
    { num: 3, title: 'GATE-3: Arrival at Offshore Pipeline Field & Mooring', status: 'Draft' as RecordStatus, score: 45 },
    { num: 4, title: 'GATE-4: Subsea Pipelay & Firing Line Pre-Commissioning', status: 'Draft' as RecordStatus, score: 30 },
    { num: 5, title: 'GATE-5: Diving & Subsea Tie-In Clearance (SIMOPS)', status: 'Draft' as RecordStatus, score: 25 },
    { num: 6, title: 'GATE-6: Main Line Hydrotest & Caliper Pigging Signoff', status: 'Draft' as RecordStatus, score: 15 },
    { num: 7, title: 'GATE-7: As-Laid Survey & Client Technical Acceptance', status: 'Draft' as RecordStatus, score: 10 },
    { num: 8, title: 'GATE-8: Final Demobilization & Project Financial Closure', status: 'Draft' as RecordStatus, score: 0 },
  ];

  gateData.forEach(g => {
    records.push({
      id: `gate-${g.num}`,
      rid: `GATE-${g.num}`,
      entity: 'gate',
      title: g.title,
      description: `بوابة الإغلاق التشغيلية GATE-${g.num} للتحقق من المتطلبات الهندسية الإلزامية للمرحلة`,
      department: 'Project Management',
      status: g.status,
      due_date: `2026-${String(10 + Math.floor(g.num / 3)).padStart(2, '0')}-28`,
      created_at: '2026-08-15T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        gate_number: g.num,
        readiness_score: g.score,
        approved_by: g.status === 'Approved' ? 'Steering Committee' : 'Pending Signoff',
        blocking_rules_count: Math.max(0, 8 - g.num)
      }
    });
  });

  // 3. 89 Rules (R-001 to R-089)
  const ruleThemes = [
    { cat: 'Marine Stability', dept: 'Marine' as Department, wps: 'WPS-01' },
    { cat: 'Electrical Power', dept: 'Technical & Maintenance' as Department, wps: 'WPS-02' },
    { cat: 'Lifting Safety', dept: 'Technical & Maintenance' as Department, wps: 'WPS-05' },
    { cat: 'Fire & Life Safety', dept: 'HSE & Safety' as Department, wps: 'WPS-07' },
    { cat: 'Pipelay Mechanical', dept: 'Pipelay Operations' as Department, wps: 'WPS-11' },
    { cat: 'Diving Life Support', dept: 'Diving Operations' as Department, wps: 'WPS-12' },
    { cat: 'Accommodation Health', dept: 'Catering & Accommodation' as Department, wps: 'WPS-15' },
    { cat: 'Aviation Safety', dept: 'Aviation & Helideck' as Department, wps: 'WPS-19' },
    { cat: 'Personnel Competence', dept: 'Marine' as Department, wps: 'WPS-23' },
  ];

  for (let i = 1; i <= 89; i++) {
    const rid = `R-${String(i).padStart(3, '0')}`;
    const theme = ruleThemes[i % ruleThemes.length];
    const isSpecialRule = i === 48 || i === 55 || i === 57 || i === 62;
    const isCompliant = isSpecialRule ? (i !== 48) : (i % 7 !== 0);
    records.push({
      id: `rule-${i}`,
      rid,
      entity: 'rule',
      title: isSpecialRule
        ? (i === 48 ? 'Rule 048: Helideck Physical & Friction Criteria (CAP 437)'
           : i === 55 ? 'Rule 055: Accommodation Health & MLC 2006 Standards'
           : i === 57 ? 'Rule 057: Critical Marine Crew Competence & STCW Verification'
           : 'Rule 062: Subsea Diving Systems IMCA D014 Compliance')
        : `Rule ${String(i).padStart(3, '0')}: Mandatory Specification for ${theme.cat} - Clause ${i}.4`,
      description: `اشتراطات السلامة والامتثال الهندسي للقاعدة ${rid} المرتبطة بحزمة ${theme.wps} وضمانات الإغلاق`,
      wps_id: theme.wps,
      department: theme.dept,
      status: isCompliant ? 'Compliant' : 'In Progress',
      due_date: '2026-11-05',
      created_at: '2026-08-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        source_code: `S${String((i % 35) + 1).padStart(2, '0')}`,
        clause_ref: `Clause ${i}.2.1`,
        closure_gate: `GATE-${Math.min(8, Math.floor(i / 10))}`,
        validation_method: 'Engineering Calculation & Physical Inspection'
      }
    });
  }

  // 4. 12 Crew Roles (WPS-23)
  const rolesList = [
    { id: 'ROLE-01', title: 'Barge Master / Master Mariner (Unlimited)', team: 'Marine Watchkeeping', basis: 'STCW II/2 Master Unlimited', auth: 'Egyptian Flag State' },
    { id: 'ROLE-02', title: 'Chief Engineer / Technical Superintendent', team: 'Technical Maintenance', basis: 'STCW III/2 Chief Engineer', auth: 'Class Society / Flag' },
    { id: 'ROLE-03', title: 'Saturation Diving Superintendent', team: 'Subsea Diving Operations', basis: 'IMCA Bell Diving Supervisor D014', auth: 'IMCA Offshore Scheme' },
    { id: 'ROLE-04', title: 'Helideck Landing Officer (HLO)', team: 'Aviation Emergency Team', basis: 'OPITO HLO / HERTL Certified', auth: 'CAA / HCA' },
    { id: 'ROLE-05', title: 'Offshore Medic / Hygiene Officer', team: 'HSE & Occupational Health', basis: 'Offshore Medic & ACLS Life Support', auth: 'Ministry of Health' },
    { id: 'ROLE-06', title: 'Lead Pipelay Superintendent', team: 'Production & Pipelaying', basis: 'API RP 2D & Pipeline Specialist', auth: 'Company Quality Dept' },
    { id: 'ROLE-07', title: 'Chief Crane Operator 300T', team: 'Heavy Lifting & Rigging', basis: 'Sparrows Stage 3 / OPITO Crane Lead', auth: 'Lifting Operations Board' },
    { id: 'ROLE-08', title: 'NDT / Welding Quality Lead', team: 'QA/QC Inspection', basis: 'CSWIP 3.2 / PCN Level III Radiography', auth: 'Welding Institute (TWI)' },
    { id: 'ROLE-09', title: 'Chief Officer / Navigation Lead', team: 'Marine Watchkeeping', basis: 'STCW II/1 Chief Mate Unlimited', auth: 'Flag Administration' },
    { id: 'ROLE-10', title: 'Lead Environmental & Safety Lead', team: 'HSE & Compliance', basis: 'NEBOSH Diploma & Lead Auditor ISO 45001', auth: 'Client Safety Dept' },
    { id: 'ROLE-11', title: 'Camp Boss / Accommodation Manager', team: 'Catering & Logistics', basis: 'MLC 2006 Food Safety & HACCP Lead', auth: 'Catering Board' },
    { id: 'ROLE-12', title: 'Chief Electrician / High Voltage Lead', team: 'Technical Maintenance', basis: 'CompEx Hazardous Area & High Voltage', auth: 'Class Surveyor' },
  ];

  rolesList.forEach(r => {
    records.push({
      id: `role-${r.id}`,
      rid: r.id,
      entity: 'crew_role',
      title: r.title,
      description: `الدور البحري الحرج ${r.title} ضمن متطلبات الحد الأدنى الآمن للمانينج لحزمة WPS-23`,
      wps_id: 'WPS-23',
      department: r.team.includes('Marine') ? 'Marine' : r.team.includes('Diving') ? 'Diving Operations' : r.team.includes('Aviation') ? 'Aviation & Helideck' : 'Technical & Maintenance',
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        role_team: r.team,
        source_rule_id: 'R-057',
        applicability: 'Mandatory',
        approved_role_basis: r.basis,
        authority: r.auth,
        critical_safety_role: true
      }
    });
  });

  // 5. 23 Crew Requirements
  const certReqs = [
    'STCW II/2 Master Mariner Certificate of Competency',
    'STCW III/2 Chief Engineer Certificate of Competency',
    'OPITO BOSIET with CA-EBS (HUET Helicopter Escape)',
    'OGUK Offshore Medical Fitness Examination',
    'IMCA Bell Diving Supervisor Certificate & Logbook',
    'OPITO Helideck Landing Officer (HLO)',
    'Helideck Emergency Response Team Member (HERTM)',
    'GMDSS General Operator Certificate (GOC)',
    'Sparrows Stage 3 Offshore Crane Operator License',
    'Advanced Trauma & Life Support (ATLS) for Medic',
    'CSWIP 3.2 Senior Welding Inspector Certificate',
    'PCN Level III Non-Destructive Testing (NDT)',
    'CompEx Hazardous Area Electrical Safety (Ex01-Ex04)',
    'High Voltage Safety & Switching Certification',
    'Rigging & Lifting Equipment Inspection Level 2',
    'HACCP & Advanced Food Hygiene for Food Handlers',
    'Fast Rescue Craft (FRC) Coxswain Certificate',
    'Gas Testing & Confined Space Entry Lead',
    'IMCA Life Support Technician (LST) Certificate',
    'STCW Medical First Aid & Care Onboard',
    'Offshore Survival & Firefighting (STCW VI/1)',
    'DNV Radiographic Interpretation Certificate',
    'Incident Command & Crisis Management for Barge Master'
  ];

  certReqs.forEach((req, idx) => {
    const rid = `REQ-${String(idx + 1).padStart(2, '0')}`;
    records.push({
      id: `req-${idx + 1}`,
      rid,
      entity: 'crew_requirement',
      title: req,
      description: `اشتراطات التأهيل الإلزامية ${req} وفق معايير STCW و IMCA و OPITO`,
      wps_id: 'WPS-23',
      department: 'Marine',
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        role_id: `ROLE-${String((idx % 12) + 1).padStart(2, '0')}`,
        certificate_type: req,
        expiry_required: true,
        validity_years: 2,
        approved_basis_criteria: 'Mandatory for offshore deployment',
        is_mandatory: true
      }
    });
  });

  // 6. Crew Members (Crew Register: 45 members)
  const crewNames = [
    { name: 'Capt. Ahmed Mansour', role: 'ROLE-01', title: 'Barge Master', cabin: 'B-01', shift: 'Day Shift (12h)', expDays: 450 },
    { name: 'Eng. Tarek Fathy', role: 'ROLE-02', title: 'Chief Engineer', cabin: 'B-03', shift: 'Day Shift (12h)', expDays: 320 },
    { name: 'Robert MacIntyre', role: 'ROLE-03', title: 'Diving Superintendent', cabin: 'C-12', shift: 'Day Shift (12h)', expDays: 610 },
    { name: 'Hassan Mahmoud', role: 'ROLE-04', title: 'Helideck Landing Officer (HLO)', cabin: 'C-08', shift: '24h On-Call', expDays: 14 }, // <30 days ALERT!
    { name: 'Dr. Mona Shaker', role: 'ROLE-05', title: 'Offshore Medic', cabin: 'H-01', shift: '24h On-Call', expDays: 180 },
    { name: 'Khaled Abdelrahman', role: 'ROLE-06', title: 'Pipelay Superintendent', cabin: 'C-02', shift: 'Day Shift (12h)', expDays: 240 },
    { name: 'Youssef El-Gammal', role: 'ROLE-07', title: 'Chief Crane Operator', cabin: 'D-05', shift: 'Day Shift (12h)', expDays: 21 }, // <30 days ALERT!
    { name: 'David Evans', role: 'ROLE-08', title: 'NDT / Welding Quality Lead', cabin: 'C-15', shift: 'Day Shift (12h)', expDays: 520 },
    { name: 'Capt. Karim Zaki', role: 'ROLE-09', title: 'Chief Officer Navigation', cabin: 'B-02', shift: 'Night Shift (12h)', expDays: -12 }, // EXPIRED!
    { name: 'Samir Mostafa', role: 'ROLE-10', title: 'HSE Safety Lead', cabin: 'C-04', shift: 'Day Shift (12h)', expDays: 290 },
    { name: 'Ibrahim Hegazy', role: 'ROLE-11', title: 'Camp Boss Accommodation', cabin: 'A-01', shift: 'Day Shift (12h)', expDays: 410 },
    { name: 'Mohamed Salah El-Din', role: 'ROLE-12', title: 'Chief Electrician HV', cabin: 'D-02', shift: 'Day Shift (12h)', expDays: 8 }, // <30 days ALERT!
  ];

  // Fill up to 45 crew members
  for (let i = 13; i <= 45; i++) {
    const baseNames = ['Omar Farouk', 'Ali Hassan', 'Mahmoud Saeed', 'Sherif Kamel', 'Peter Davies', 'Nabil Fahmy', 'Hesham Ezzat'];
    const chosen = baseNames[i % baseNames.length];
    const roleId = `ROLE-${String((i % 12) + 1).padStart(2, '0')}`;
    const roleObj = rolesList.find(r => r.id === roleId) || rolesList[0];
    const expDays = i % 11 === 0 ? -5 : i % 7 === 0 ? 18 : 120 + (i * 10);
    crewNames.push({
      name: `${chosen} (#${i})`,
      role: roleId,
      title: roleObj.title.split('/')[0].trim(),
      cabin: `Deck-${String.fromCharCode(65 + (i % 4))}-${String(i).padStart(2, '0')}`,
      shift: i % 2 === 0 ? 'Day Shift (12h)' : 'Night Shift (12h)',
      expDays
    });
  }

  crewNames.forEach((crw, idx) => {
    const rid = `CRW-${String(idx + 1).padStart(3, '0')}`;
    const expDate = new Date(now.getTime() + crw.expDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const isExpired = crw.expDays < 0;
    const isExpiringSoon = crw.expDays >= 0 && crw.expDays <= 30;

    records.push({
      id: `crw-${idx + 1}`,
      rid,
      entity: 'crew_member',
      title: `${crw.name} - ${crw.title}`,
      description: `فرد طاقم بحري مسجل على البارجة - الكابينة ${crw.cabin}`,
      wps_id: 'WPS-23',
      department: 'Marine',
      status: isExpired ? 'Non-Compliant' : isExpiringSoon ? 'In Progress' : 'Approved',
      owner: crw.name,
      expiry_date: expDate,
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        full_name: crw.name,
        national_id_or_passport: `EGY-P${8000000 + idx * 341}`,
        role_id: crw.role,
        role_title: crw.title,
        scenario: 'Pipelay Mode',
        shift: crw.shift,
        is_available: !isExpired,
        deployment_approval: isExpired ? 'Rejected' : isExpiringSoon ? 'Pending Review' : 'Approved',
        familiarization_status: 'Completed',
        cabin_number: crw.cabin,
        blood_type: ['O+', 'A+', 'B+', 'AB+'][idx % 4],
        emergency_station: `Lifeboat Station ${(idx % 2) + 1}`,
        days_until_expiry: crw.expDays
      }
    });

    // Create linked certificates (110 total)
    const certType = certReqs[idx % certReqs.length];
    records.push({
      id: `cert-${idx + 1}`,
      rid: `CERT-${String(idx + 1).padStart(3, '0')}`,
      entity: 'crew_certificate',
      title: `${certType} - ${crw.name}`,
      description: `شهادة الكفاءة والترخيص الرسمي لحاملها ${crw.name}`,
      wps_id: 'WPS-23',
      department: 'Marine',
      status: isExpired ? 'Non-Compliant' : isExpiringSoon ? 'Pending Verification' : 'Compliant',
      expiry_date: expDate,
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        crew_id: rid,
        crew_name: crw.name,
        certificate_type: certType,
        certificate_number: `CERT-NO-${1000 + idx * 23}`,
        issuer: ['Egyptian Maritime Safety Authority (EMSA)', 'OPITO Global', 'IMCA UK', 'DNV Maritime', 'Ministry of Health'][idx % 5],
        issue_date: '2024-01-15',
        expiry_date: expDate,
        verification_status: isExpired ? 'Expired' : isExpiringSoon ? 'Pending Verification' : 'Verified',
        verified_by: 'Marine Operations Manager',
        days_until_expiry: crw.expDays,
        document_name: `${crw.name.replace(/[^a-zA-Z]/g, '_')}_Cert.pdf`
      }
    });
  });

  // 7. 12 Manning Plans (WPS-23)
  const scenarios = ['Pipelay Mode', 'Transit Mode', 'Anchored / Standby', 'Diving Campaign'] as const;
  for (let m = 1; m <= 12; m++) {
    const sc = scenarios[m % scenarios.length];
    const roleId = `ROLE-${String((m % 12) + 1).padStart(2, '0')}`;
    const reqCount = 4 + (m % 5);
    const assignedCount = m === 4 ? reqCount - 1 : reqCount; // One deficit scenario for testing
    records.push({
      id: `man-${m}`,
      rid: `MAN-${String(m).padStart(3, '0')}`,
      entity: 'manning_plan',
      title: `Safe Manning Plan #${m}: ${rolesList[(m - 1) % 12].title.split('/')[0]} (${sc})`,
      description: `خطة الحد الأدنى الآمن للمانينج المعتمدة من سلطة العلم لسيناريو ${sc}`,
      wps_id: 'WPS-23',
      department: 'Marine',
      status: assignedCount < reqCount ? 'Non-Compliant' : 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        scenario: sc,
        shift: 'Total POB',
        role_id: roleId,
        role_name: rolesList[(m - 1) % 12].title,
        required_persons: reqCount,
        assigned_persons: assignedCount,
        approving_authority: 'Egyptian Maritime Safety Authority (EMSA)',
        approval_status: assignedCount < reqCount ? 'Deficit' : 'Approved'
      }
    });
  }

  // 8. Helideck Profile + 10 Helideck Checks (WPS-19)
  records.push({
    id: 'helideck-profile-01',
    rid: 'HEL-PROF-01',
    entity: 'helideck_profile',
    title: 'Helideck Technical Profile & Operational Decision (ECAR 138 / ECAA)',
    description: 'الملف الفني الهندسي لمهبط البارجة: معتمد بالكامل وفق التشريعات المصرية ECAR Part 138 (سلطة الطيران المدني المصري ECAA) لطائرات Sikorsky S-92 و AW139',
    wps_id: 'WPS-19',
    department: 'Aviation & Helideck',
    status: 'Compliant',
    expiry_date: '2027-04-10',
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-10-18T10:00:00Z',
    data: {
      decision_type: 'Full ECAR 138 Helideck',
      d_value: 22.2,
      mtow_tonnes: 12.6,
      lighting_status: 'Fully Operational',
      foam_system_type: 'DIFFS (Deck Integrated Fire Fighting System)',
      certification_body: 'Egyptian Civil Aviation Authority (ECAA / سلطة الطيران المدني المصري)',
      certificate_valid_until: '2027-04-10',
      status_summary: 'Fully Certified Level 1 Offshore Helideck under ECAA ECAR Part 138 Regulations'
    }
  });

  const heliCheckItems = [
    { name: 'Helideck Surface Friction Coefficient Test (>0.85)', pass: true, rule: 'R-048', crit: 'Friction value must exceed 0.85 in all landing quadrants' },
    { name: 'Perimeter Safety Netting Load & Tie-Wire Integrity Test', pass: false, rule: 'R-048', crit: '100kg drop test & stainless SS316 tie-wire inspection' }, // GAP-001
    { name: 'DIFFS Deck Integrated Foam Firefighting System Discharge Test', pass: true, rule: 'R-049', crit: 'Foam discharge covering 100% deck within 15 seconds' },
    { name: 'Perimeter Green LED Lighting & Lit Touchdown / Positioning Circle', pass: true, rule: 'R-050', crit: 'CAP 437 compliant illuminated landing circle and H markings' },
    { name: 'Illuminated Wind Direction Indicator (Windsock) Operation', pass: true, rule: 'R-050', crit: 'Fully illuminated windsock visible from 360 degrees approach' },
    { name: 'Aviation VHF Air-Band Radio (121.5 / 130.5 MHz) Communication Check', pass: true, rule: 'R-051', crit: 'Clear two-way radio link tested with offshore ATC and helicopter' },
    { name: 'Crash Box Emergency Rescue & Extraction Tools Inventory', pass: true, rule: 'R-052', crit: 'Full complement of grab hooks, axes, bolt cutters, and blankets' },
    { name: 'Helideck Static Grounding & Earthing Reel Resistance Test', pass: true, rule: 'R-053', crit: 'Electrical earth bonding resistance less than 10 ohms' },
    { name: 'Helicopter Refueling Skid Quality & Water Contamination Test', pass: true, rule: 'R-054', crit: 'Clear and bright visual test and chemical water detection' },
    { name: 'HLO & Helideck Emergency Team Manning Readiness Drill', pass: true, rule: 'R-048', crit: '4 certified HERTM crew in fire gear deployed in under 2 minutes' }
  ];

  heliCheckItems.forEach((chk, idx) => {
    records.push({
      id: `heli-chk-${idx + 1}`,
      rid: `HEL-CHK-${String(idx + 1).padStart(2, '0')}`,
      entity: 'helideck_check',
      title: chk.name,
      description: chk.crit,
      wps_id: 'WPS-19',
      department: 'Aviation & Helideck',
      status: chk.pass ? 'Compliant' : 'Non-Compliant',
      due_date: '2026-11-01',
      created_at: '2026-10-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        control_item: chk.name,
        facility_area: 'Helideck',
        source_rule_id: chk.rule,
        criteria_statement: chk.crit,
        inspection_status: chk.pass ? 'Compliant' : 'Non-Compliant',
        inspector: 'HCA Certified Inspector / Safety Superintendent',
        inspection_date: '2026-10-15',
        next_inspection_due: '2027-01-15',
        capa_id: !chk.pass ? 'GAP-001' : undefined
      }
    });
  });

  // 9. Accommodation Capacity + 10 Accommodation Checks (WPS-15)
  records.push({
    id: 'accom-capacity-01',
    rid: 'ACC-CAP-01',
    entity: 'accommodation_capacity',
    title: 'POB Capacity Allocation Plan & Living Quarters Berths (MLC 2006)',
    description: 'خطة سعة الأفراد المعتمدة على المتن: 250 سريراً معتمداً، حد الـ POB الأقصى 245، الإشغال الحالي 228',
    wps_id: 'WPS-15',
    department: 'Catering & Accommodation',
    status: 'Compliant',
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-10-18T10:00:00Z',
    data: {
      deck_level: 'Accommodation Module Decks A, B, C, D',
      cabin_count: 82,
      total_certified_berths: 250,
      allocated_berths: 228,
      pob_limit: 245,
      approval_reference: 'MLC 2006 Title 3 & Flag Safety Certificate EGY-MLC-2024-918',
      hospital_beds_count: 4,
      quarantine_isolation_beds: 2
    }
  });

  const accomCheckItems = [
    { name: 'HVAC Air Changes, Filter Condition & Differential Pressure Balancing', pass: true, rule: 'R-055', crit: 'Minimum 10 air changes/hour, positive pressure +50Pa' },
    { name: 'Potable Water Bacteriological Analysis & Free Chlorine Verification', pass: true, rule: 'R-056', crit: 'Free chlorine 0.2-0.5 mg/l, zero E.Coli & Legionella count' },
    { name: 'Galley Sanitation, HACCP Standards & Deep Freezer Temperature (-18°C)', pass: true, rule: 'R-055', crit: 'Walk-in freezers maintain -18°C, zero cross-contamination' },
    { name: 'Sewage Treatment Plant (STP) Effluent Coliform & BOD Testing (MARPOL IV)', pass: true, rule: 'R-058', crit: 'Treated effluent meets IMO MEPC.227(64) standards' },
    { name: 'Accommodation Noise & Vibration Decibel Monitoring (IMO Res A.468)', pass: true, rule: 'R-055', crit: 'Cabins noise level below 60 dB(A), mess rooms below 65 dB(A)' },
    { name: 'Pest Control & Professional Fumigation Certification', pass: true, rule: 'R-055', crit: 'Valid ship sanitation certificate issued by Port Health Authority' },
    { name: 'Hospital & Isolation Clinic Emergency Medical Supplies Audit', pass: true, rule: 'R-055', crit: 'Full inventory of oxygen cylinders, defibrillator, and trauma kits' },
    { name: 'Laundry Facilities & Clothes Sanitation Washing Temperature (>60°C)', pass: true, rule: 'R-055', crit: 'Thermal disinfection cycle verified across all 8 commercial washers' },
    { name: 'Emergency Escape Routes & Photoluminescent Signage in Living Quarters', pass: true, rule: 'R-055', crit: 'Unobstructed corridors and illuminated muster directional signs' },
    { name: 'Accommodation Fire Dampers & Automatic Shut-Off Interlock Test', pass: true, rule: 'R-055', crit: 'Fire dampers trip immediately upon fire alarm activation' }
  ];

  accomCheckItems.forEach((chk, idx) => {
    records.push({
      id: `accom-chk-${idx + 1}`,
      rid: `ACC-CHK-${String(idx + 1).padStart(2, '0')}`,
      entity: 'accommodation_check',
      title: chk.name,
      description: chk.crit,
      wps_id: 'WPS-15',
      department: 'Catering & Accommodation',
      status: chk.pass ? 'Compliant' : 'Non-Compliant',
      due_date: '2026-11-05',
      created_at: '2026-10-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        control_item: chk.name,
        facility_area: 'Accommodation',
        source_rule_id: chk.rule,
        criteria_statement: chk.crit,
        inspection_status: chk.pass ? 'Compliant' : 'Non-Compliant',
        inspector: 'Camp Boss / Dr. Mona Shaker (Medic)',
        inspection_date: '2026-10-16',
        next_inspection_due: '2026-12-16'
      }
    });
  });

  // 10. 35 Sources (Legislative Codes)
  const sourceList = [
    { code: 'S01', name: 'SOLAS 1974 / 1988 Protocol', auth: 'IMO', num: 'IMO-SOLAS-2020', desc: 'الاتفاقية الدولية لسلامة الأرواح في البحر' },
    { code: 'S02', name: 'MARPOL 73/78 Annex I to VI', auth: 'IMO', num: 'IMO-MARPOL-Consolidated', desc: 'الاتفاقية الدولية لمنع التلوث البحري من السفن' },
    { code: 'S03', name: 'IMCA D014 Rev 2: Offshore Diving Code', auth: 'IMCA', num: 'IMCA-D014-Rev2', desc: 'الكود الدولي لممارسات الغوص البحري العميق' },
    { code: 'S04', name: 'CAP 437: Offshore Helideck Standards', auth: 'CAA / HCA', num: 'CAP 437 Ed. 9', desc: 'معايير تصميم وتجهيز مهابط الطائرات البحرية' },
    { code: 'S05', name: 'Maritime Labour Convention (MLC 2006)', auth: 'ILO', num: 'ILO-MLC-2006', desc: 'معاهدة العمل البحري الدولية لحقوق وراحة الطواقم' },
    { code: 'S06', name: 'STCW Convention 1978 (Manila 2010)', auth: 'IMO', num: 'IMO-STCW-Manila', desc: 'معايير التدريب والإجازة والمراقبة للملاحين' },
    { code: 'S07', name: 'DNV-OS-E401: Offshore Pipelay Systems', auth: 'DNV', num: 'DNV-OS-E401', desc: 'المعايير الهندسية لمنظومات مد الأنابيب بالبحر' },
    { code: 'S08', name: 'API RP 2D: Offshore Crane Operation', auth: 'API', num: 'API RP 2D 7th Ed.', desc: 'الممارسات المعتمدة لتشغيل وصيانة أوناش المنصات' },
    { code: 'S09', name: 'DNV-OS-C101: Offshore Structural Design', auth: 'DNV', num: 'DNV-OS-C101', desc: 'التصميم الإنشائي للوحدات والبارجات البحرية' },
    { code: 'S10', name: 'Egyptian Maritime Safety Law No. 8/1990', auth: 'EMSA', num: 'EMSA-LAW-8-1990', desc: 'قانون السلامة البحرية المصري واشتراطات العلم' },
  ];

  // Fill up to 35 sources
  for (let s = 11; s <= 35; s++) {
    sourceList.push({
      code: `S${String(s).padStart(2, '0')}`,
      name: `International Marine Standard Ref S${s}`,
      auth: s % 3 === 0 ? 'DNV' : s % 2 === 0 ? 'IMO' : 'IMCA',
      num: `STD-CODE-2024-${s}`,
      desc: `المعيار التشريعي البحري المعتمد برقم S${s} لحوكمة الفحوصات الفنية`
    });
  }

  sourceList.forEach(src => {
    records.push({
      id: `src-${src.code}`,
      rid: src.code,
      entity: 'source',
      title: src.name,
      description: src.desc,
      department: 'Marine',
      status: 'Approved',
      created_at: '2026-08-01T08:00:00Z',
      updated_at: '2026-08-01T08:00:00Z',
      data: {
        source_code: src.code,
        authority: src.auth,
        source_type: 'Statutory Code',
        document_number: src.num,
        edition_or_year: '2024 Edition',
        title_english: src.name,
        mandatory_level: 'Mandatory'
      }
    });
  });

  // 11. 138 Gaps / Findings & CAPA
  for (let g = 1; g <= 138; g++) {
    const rid = `GAP-${String(g).padStart(3, '0')}`;
    const isSpecialGap = g === 1 || g === 2;
    const isClosed = g > 15; // first 15 open, rest historical closed
    records.push({
      id: `gap-${g}`,
      rid,
      entity: 'gap',
      title: isSpecialGap
        ? (g === 1 ? 'Helideck Perimeter Netting Tie-Wire Corrosion' : 'Crane 300T Spreader Bar Proof Load Certificate Renewal')
        : `Non-Conformity Notice #${g}: Inspection finding on WPS-${String((g % 24) + 1).padStart(2, '0')}`,
      description: isSpecialGap
        ? (g === 1 ? 'فحص المهبط كشف وجود تآكل في أسلاك ربط الشباك المحيطة بالقطاع 3 الخارجي مما يتطلب استبدالاً بأسلاك SS316'
                   : 'شهادة اختبار التحميل لعوارض الرفع الرئيسية (Spreader Bar) تنتهي قريباً وتحتاج فحص NDT معتمد')
        : `ملاحظة تدقيق فني في الحزمة WPS-${String((g % 24) + 1).padStart(2, '0')} تم رصدها بواسطة فريق الجودة وتتطلب إجراءً تصحيحياً`,
      wps_id: `WPS-${String((g % 24) + 1).padStart(2, '0')}`,
      department: (wpsTitles[g % 24]?.dept || 'Technical & Maintenance'),
      status: isClosed ? 'Closed' : 'In Progress',
      due_date: '2026-10-30',
      created_at: '2026-10-10T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        severity: g <= 5 ? 'Critical' : g <= 15 ? 'High' : 'Medium',
        root_cause: 'Environmental marine exposure and regular operational wear.',
        corrective_action: 'Procure replacement parts and perform certified re-testing.',
        preventive_action: 'Increase planned maintenance frequency in computerized maintenance database.',
        action_party: 'Discipline Lead & Quality Lead',
        closure_gate: `GATE-${Math.min(8, Math.floor(g / 15))}`
      }
    });
  }

  // 12. 145 Evidence records
  for (let e = 1; e <= 145; e++) {
    const rid = `EVD-${String(e).padStart(3, '0')}`;
    const wpsNum = String((e % 24) + 1).padStart(2, '0');
    records.push({
      id: `evd-${e}`,
      rid,
      entity: 'evidence',
      title: `Official Compliance Certificate / Survey Report #${e}`,
      description: `وثيقة ثبوتية رسمية صادرة من جهة معتمدة لحزمة العمل WPS-${wpsNum}`,
      wps_id: `WPS-${wpsNum}`,
      department: (wpsTitles[e % 24]?.dept || 'QA/QC'),
      status: 'Verified',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        file_name: `PMS11_Doc_${rid}_Verified.pdf`,
        file_size_mb: 2.4,
        issuing_body: e % 3 === 0 ? 'DNV Classification' : e % 2 === 0 ? 'Flag Administration (EMSA)' : 'HCA Safety Authority',
        verification_seal: `SEAL-${rid}-PASS`,
        verified_by: 'Class Surveyor & Barge QA/QC Lead'
      }
    });
  }

  // 13. 25 Risks
  for (let r = 1; r <= 25; r++) {
    const rid = `RSK-${String(r).padStart(3, '0')}`;
    records.push({
      id: `rsk-${r}`,
      rid,
      entity: 'risk',
      title: `Operational Risk #${r}: Marine Weather & SIMOPS Hazard`,
      description: `تقييم المخاطر التشغيلية وخطة التحكم الميدانية لحزمة WPS-${String((r % 24) + 1).padStart(2, '0')}`,
      wps_id: `WPS-${String((r % 24) + 1).padStart(2, '0')}`,
      department: (wpsTitles[r % 24]?.dept || 'HSE & Safety'),
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        risk_level: r <= 5 ? 'High' : 'Medium',
        mitigation: 'Implement stop-work authority and real-time wave/current monitoring.',
        owner: 'HSE Manager'
      }
    });
  }

  // 14. 54 Responsibilities (RACI)
  for (let rp = 1; rp <= 54; rp++) {
    const rid = `RSP-${String(rp).padStart(3, '0')}`;
    records.push({
      id: `rsp-${rp}`,
      rid,
      entity: 'responsibility',
      title: `RACI Governance Matrix Item #${rp}: Discipline Execution Authority`,
      description: `تحديد المسؤوليات والصلاحيات والاعتمادات بين الرتب البحرية والمديرين`,
      wps_id: `WPS-${String((rp % 24) + 1).padStart(2, '0')}`,
      department: (wpsTitles[rp % 24]?.dept || 'Marine'),
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        accountable: 'Barge Master',
        responsible: 'Discipline Lead',
        consulted: 'Technical Superintendent',
        informed: 'Project Director'
      }
    });
  }

  // 15. 138 Deliverables
  for (let dl = 1; dl <= 138; dl++) {
    const rid = `DEL-${String(dl).padStart(3, '0')}`;
    records.push({
      id: `del-${dl}`,
      rid,
      entity: 'deliverable',
      title: `Certified Engineering Deliverable #${dl}: As-Built Dossier & Verification`,
      description: `مخرج فني معتمد مطلوب لإغلاق حزمة العمل WPS-${String((dl % 24) + 1).padStart(2, '0')}`,
      wps_id: `WPS-${String((dl % 24) + 1).padStart(2, '0')}`,
      department: (wpsTitles[dl % 24]?.dept || 'QA/QC'),
      status: dl % 5 === 0 ? 'Under Review' : 'Approved',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        document_number: `DOC-PMS11-${rid}`,
        signoff_date: '2026-10-15',
        approved_by: 'Client Representative'
      }
    });
  }

  // 16. 154 Acceptance Criteria
  for (let ac = 1; ac <= 154; ac++) {
    const rid = `ACC-${String(ac).padStart(3, '0')}`;
    records.push({
      id: `acc-${ac}`,
      rid,
      entity: 'acceptance',
      title: `Official Client Acceptance Criteria #${ac}: Technical Pass Signoff`,
      description: `معيار قبول فني معتمد بين المقاول والمالك وسلطة العلم`,
      wps_id: `WPS-${String((ac % 24) + 1).padStart(2, '0')}`,
      department: (wpsTitles[ac % 24]?.dept || 'Project Management'),
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        acceptance_threshold: '100% compliant with zero open critical punchlist items',
        witnessed_by: 'Marine Warranty Surveyor (MWS)'
      }
    });
  }

  // 17. 138 Activities
  for (let at = 1; at <= 138; at++) {
    const rid = `ACT-${String(at).padStart(3, '0')}`;
    records.push({
      id: `act-${at}`,
      rid,
      entity: 'activity',
      title: `Field Operational Activity #${at}: Marine Testing & Inspection Campaign`,
      description: `نشاط ميداني تنفيذي لحزمة WPS-${String((at % 24) + 1).padStart(2, '0')}`,
      wps_id: `WPS-${String((at % 24) + 1).padStart(2, '0')}`,
      department: (wpsTitles[at % 24]?.dept || 'Marine'),
      status: 'In Progress',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        activity_type: 'Operational & Commissioning',
        duration_days: (at % 5) + 2
      }
    });
  }

  // 18. 343 Tasks
  for (let tk = 1; tk <= 343; tk++) {
    const rid = `TSK-${String(tk).padStart(3, '0')}`;
    records.push({
      id: `tsk-${tk}`,
      rid,
      entity: 'task',
      title: `Operational Task #${tk}: Detailed Check & Commissioning Action`,
      description: `مهمة تفتيش وتدقيق ميداني من مهام الحزمة WPS-${String((tk % 24) + 1).padStart(2, '0')}`,
      wps_id: `WPS-${String((tk % 24) + 1).padStart(2, '0')}`,
      department: (wpsTitles[tk % 24]?.dept || 'Technical & Maintenance'),
      status: tk % 4 === 0 ? 'Compliant' : 'In Progress',
      due_date: '2026-11-10',
      owner: `Lead Engineer #${(tk % 10) + 1}`,
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        task_category: 'Pre-Commissioning',
        progress: (tk % 10) * 10
      }
    });
  }

  // 19. 317 Execution tasks
  for (let ex = 1; ex <= 317; ex++) {
    const rid = `EXE-${String(ex).padStart(3, '0')}`;
    records.push({
      id: `exe-${ex}`,
      rid,
      entity: 'execution',
      title: `Field Execution Task #${ex}: Discipline Lead Installation & Signoff`,
      description: `مهمة تنفيذية ميدانية مربوطة برئيس التخصص ومدير الإدارة للحزمة WPS-${String((ex % 24) + 1).padStart(2, '0')}`,
      wps_id: `WPS-${String((ex % 24) + 1).padStart(2, '0')}`,
      department: (wpsTitles[ex % 24]?.dept || 'Technical & Maintenance'),
      status: ex % 3 === 0 ? 'Compliant' : 'In Progress',
      owner: `Discipline Lead #${(ex % 8) + 1}`,
      due_date: '2026-11-20',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        lead_discipline: `${wpsTitles[ex % 24]?.dept || 'Marine'} Lead`,
        department_manager: 'Offshore Construction Manager',
        work_order_no: `WO-PMS11-${2000 + ex}`,
        progress_percent: 75 + (ex % 25),
        field_location: `Deck Area Zone ${String.fromCharCode(65 + (ex % 6))}`
      }
    });
  }

  // 20. 362 Functional activities
  for (let fn = 1; fn <= 362; fn++) {
    const rid = `FNC-${String(fn).padStart(3, '0')}`;
    records.push({
      id: `fnc-${fn}`,
      rid,
      entity: 'functional',
      title: `Functional Activity #${fn}: Statutory & Class Society Survey Verification`,
      description: `نشاط وظيفي خارجي مرتبط بسلطة العلم وهيئة الإشراف والتصنيف DNV`,
      wps_id: `WPS-${String((fn % 24) + 1).padStart(2, '0')}`,
      department: 'QA/QC',
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        classification_body: 'DNV / Flag State Authority',
        functional_scope: 'Class Periodical Survey & Condition Assessment'
      }
    });
  }

  // 21. 612 Dependencies (Finish-to-Start, Lag days, Critical Path)
  for (let d = 1; d <= 612; d++) {
    const rid = `DEP-${String(d).padStart(4, '0')}`;
    const pred = d <= 9 ? `GATE-${d - 1}` : d <= 98 ? `R-${String(d - 9).padStart(3, '0')}` : `WPS-${String((d % 24) + 1).padStart(2, '0')}`;
    const succ = d <= 8 ? `GATE-${d}` : `GATE-${Math.min(8, Math.floor(d / 70))}`;
    const rel: DependencyType = d % 10 === 0 ? 'Start-to-Start' : 'Finish-to-Start';
    records.push({
      id: `dep-${d}`,
      rid,
      entity: 'dependency',
      title: `${pred} ➔ ${succ} (${rel})`,
      description: `رابط اعتمادي تتابعي لمنع كسر التسلسل المنطقي وغلق البوابات دون اكتمال السابق`,
      department: 'Project Management',
      status: 'Compliant',
      owner: 'Lead Planner & Technical Lead',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        predecessor_id: pred,
        successor_id: succ,
        predecessor_title: `${pred} Prerequisite`,
        successor_title: `${succ} Successor`,
        relationship_type: rel,
        lag_days: d % 4,
        dependency_class: d % 3 === 0 ? 'Safety Critical' : d % 2 === 0 ? 'Regulatory' : 'Logical',
        rationale: 'Mandatory sequential gate control to maintain barge offshore safety integrity.',
        is_critical_path: d % 3 === 0
      }
    });
  }

  // 22. 39 Supplemental Controls
  for (let sp = 1; sp <= 39; sp++) {
    const rid = `SUP-${String(sp).padStart(2, '0')}`;
    records.push({
      id: `sup-${sp}`,
      rid,
      entity: 'supplemental_control',
      title: `Supplemental Control #${sp}: Environmental & Hazard Safeguard`,
      description: `اشتراطات تحكم إضافية ملحقة بالأنشطة الحرجة والبيئية لحزم العمل`,
      wps_id: `WPS-${String((sp % 24) + 1).padStart(2, '0')}`,
      department: 'HSE & Safety',
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        control_level: 'Supplementary High Safeguard',
        audit_frequency: 'Bi-Weekly Inspection'
      }
    });
  }

  // 23. Department Summaries (10 departments)
  const departmentsList: Department[] = [
    'Marine',
    'Technical & Maintenance',
    'HSE & Safety',
    'Diving Operations',
    'Pipelay Operations',
    'Catering & Accommodation',
    'Aviation & Helideck',
    'QA/QC',
    'Project Management'
  ];

  departmentsList.forEach((dept, i) => {
    records.push({
      id: `dept-sum-${i + 1}`,
      rid: `DEPT-${String(i + 1).padStart(2, '0')}`,
      entity: 'department_summary',
      title: `${dept} Department Operational & Compliance Summary`,
      description: `ملخص مؤشرات الإنجاز والامتثال وقواعد السلامة ومسؤوليات RLS لقسم ${dept}`,
      department: dept,
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        total_wps_owned: Math.max(1, Math.floor(24 / departmentsList.length)),
        active_findings: (i % 3) + 1,
        average_completion: 88 + (i % 12),
        head_of_discipline: `Superintendent / Lead ${dept}`
      }
    });
  });

  // 24. 89 RULE_WPS_MAP records
  for (let rm = 1; rm <= 89; rm++) {
    const wpsId = `WPS-${String((rm % 24) + 1).padStart(2, '0')}`;
    const ruleId = `R-${String(rm).padStart(3, '0')}`;
    records.push({
      id: `rmap-${rm}`,
      rid: `RMAP-${String(rm).padStart(3, '0')}`,
      entity: 'rule_wps_map',
      title: `Mapping: ${ruleId} ➔ ${wpsId}`,
      description: `ربط القاعدة الهندسية ${ruleId} بحزمة العمل ${wpsId} وتحديد متطلبات الإغلاق`,
      wps_id: wpsId,
      department: 'QA/QC',
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        rule_id: ruleId,
        wps_package: wpsId,
        governing_body: 'DNV / IMO / Flag State',
        gate_target: `GATE-${rm % 8}`
      }
    });
  }

  // 25. DASHBOARD Executive Summary record
  records.push({
    id: 'dash-01',
    rid: 'DASH-01',
    entity: 'dashboard_summary',
    title: 'PMS-11 Executive Marine Readiness & Closure Matrix',
    description: 'المؤشرات الرقمية المجمعة وحالة الإغلاق الكلية للبارجة PMS-11 لمرحلة التجهيز والنزول',
    department: 'Project Management',
    status: 'Compliant',
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-10-19T08:00:00Z',
    data: {
      total_worksheets: 40,
      total_work_packages: 24,
      total_rules: 89,
      total_closure_gates: 9,
      barge_readiness_rate: 94.2
    }
  });

  // 26. 612 MASTER_DATA records
  for (let md = 1; md <= 612; md++) {
    const rid = `MD-${String(md).padStart(4, '0')}`;
    records.push({
      id: `md-${md}`,
      rid,
      entity: 'master_data',
      title: `Master Relationship Row #${md}: Consolidated Cross-Reference`,
      description: `سجل البيانات المرجعية المجمعة لضبط الحقول والارتباطات بين الحزم والمهام والقواعد`,
      wps_id: `WPS-${String((md % 24) + 1).padStart(2, '0')}`,
      department: 'QA/QC',
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        domain_type: md % 2 === 0 ? 'Engineering & Classification' : 'Operational Marine',
        validation_rule: 'Mandatory Foreign Key Integrity',
        cross_sheet_source: `Sheet #${(md % 40) + 1}`
      }
    });
  }

  // 27. 116 Dept_Ownership records
  for (let d = 1; d <= 116; d++) {
    const dept = departmentsList[d % departmentsList.length];
    records.push({
      id: `own-${d}`,
      rid: `OWN-${String(d).padStart(3, '0')}`,
      entity: 'dept_ownership',
      title: `${dept} Ownership Authority & RLS Policy #${d}`,
      description: `حوكمة وصلاحيات قسم ${dept} ومسؤولية التوقيع على الأدلة والبوابات`,
      department: dept,
      status: 'Approved',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        assigned_role: `Head of ${dept}`,
        permission_level: 'Full Signoff / Authority',
        scope_wps: `WPS-${String((d % 24) + 1).padStart(2, '0')}`
      }
    });
  }

  // 28. 85 Standard LISTS records
  const listCategories = ['RecordStatus', 'CrewRank', 'VesselZone', 'CertificateAuthority', 'HazardSeverity', 'GatePhase'];
  for (let l = 1; l <= 85; l++) {
    const cat = listCategories[l % listCategories.length];
    records.push({
      id: `lst-${l}`,
      rid: `LST-${String(l).padStart(3, '0')}`,
      entity: 'lists',
      title: `Standard List Item: ${cat} Value #${l}`,
      description: `قيمة مرجعية موحدة ضمن قائمة ${cat} للقوائم المنسدلة في نماذج البارجة`,
      department: 'QA/QC',
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        dropdown_group: cat,
        lookup_code: `CODE_${l}`,
        display_label_en: `${cat} Option ${l}`,
        display_label_ar: `خيار ${cat} رقم ${l}`
      }
    });
  }

  // 29. 205 DROPDOWN_MAP records
  for (let dm = 1; dm <= 205; dm++) {
    records.push({
      id: `dmap-${dm}`,
      rid: `DMAP-${String(dm).padStart(3, '0')}`,
      entity: 'dropdown_map',
      title: `Field-to-List Mapping #${dm}: Column Validation`,
      description: `ربط العمود رقم ${dm} بالقائمة المنسدلة المحددة لمنع الأخطاء الإملائية والبيانات غير المطابقة`,
      department: 'QA/QC',
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        target_column: `col_${dm}`,
        target_sheet: `Sheet_${(dm % 40) + 1}`,
        assigned_list: listCategories[dm % listCategories.length]
      }
    });
  }

  // 30. Relationships records (120 representative records)
  for (let rel = 1; rel <= 120; rel++) {
    records.push({
      id: `rel-${rel}`,
      rid: `REL-${String(rel).padStart(4, '0')}`,
      entity: 'relationships',
      title: `Inter-entity Linkage #${rel}: Multi-tier Network Relation`,
      description: `رابط بيني شامل ضمن شبكة الـ 14,825 علاقة بين حزم العمل، القواعد، الأدلة والبوابات`,
      department: 'Project Management',
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        source_rid: `WPS-${String((rel % 24) + 1).padStart(2, '0')}`,
        target_rid: `R-${String((rel % 89) + 1).padStart(3, '0')}`,
        relation_strength: 'Mandatory Precedence'
      }
    });
  }

  // 31. 34 POWERPIVOT_RELATIONS records
  for (let pp = 1; pp <= 34; pp++) {
    records.push({
      id: `ppr-${pp}`,
      rid: `PPR-${String(pp).padStart(2, '0')}`,
      entity: 'powerpivot_relations',
      title: `Data Model Relation #${pp}: Star Schema Fact-Dimension Link`,
      description: `علاقة ربط نموذج تحليل البيانات الضخمة PowerPivot لحساب المؤشرات التنفيذية للبارجة`,
      department: 'Project Management',
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        primary_table: `Dim_Table_${pp}`,
        foreign_table: 'Fact_PMS11_Readiness',
        join_cardinality: '1-to-Many'
      }
    });
  }

  // 32. 12 DEPENDENCY_ENDPOINT_TYPES records
  const endpointTypes = ['Milestone Gate', 'Inspection Check', 'Regulatory Rule', 'Certificate Expiry', 'Work Order Completion', 'MWS Signoff'];
  for (let ep = 1; ep <= 12; ep++) {
    records.push({
      id: `ept-${ep}`,
      rid: `EPT-${String(ep).padStart(2, '0')}`,
      entity: 'dependency_endpoint_type',
      title: `Dependency Endpoint Type #${ep}: ${endpointTypes[ep % endpointTypes.length]}`,
      description: `تعريف نوع نقطة النهاية للاعتماديات التتابعية وقيود المسار الحرج`,
      department: 'Project Management',
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        endpoint_category: endpointTypes[ep % endpointTypes.length],
        blocking_behavior: 'Hard Stop / Cannot Bypass'
      }
    });
  }

  // 33. 8 RELATIONSHIP_TYPES records
  const relTypes = ['Finish-to-Start (FS)', 'Start-to-Start (SS)', 'Finish-to-Finish (FF)', 'Statutory Compliance', 'Physical Prerequisite', 'Quality Hold Point', 'Class Society Survey', 'Owner Acceptance'];
  for (let rt = 1; rt <= 8; rt++) {
    records.push({
      id: `rlt-${rt}`,
      rid: `RLT-${String(rt).padStart(2, '0')}`,
      entity: 'relationship_type',
      title: `Logical Relation Type #${rt}: ${relTypes[rt - 1]}`,
      description: `تعريف نوع العلاقة المنطقية التتابعية وحسابات التأخير الزمني (Lag Days)`,
      department: 'Project Management',
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        logic_name: relTypes[rt - 1],
        is_hard_barrier: rt <= 4
      }
    });
  }

  // 34. 16 AUDIT_CONFIG records
  for (let ac = 1; ac <= 16; ac++) {
    records.push({
      id: `acfg-${ac}`,
      rid: `ACFG-${String(ac).padStart(2, '0')}`,
      entity: 'audit_config',
      title: `Audit Configuration Trigger #${ac}: Automated Change Logging`,
      description: `إعدادات التدقيق الرقابي والمحاسبي للتعديلات والتوقيعات على متن بارجة PMS-11`,
      department: 'QA/QC',
      status: 'Compliant',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        trigger_event: ac % 2 === 0 ? 'Status Alteration' : 'Document Signature',
        notification_target: 'Barge Master & Tech Lead',
        retention_years: 10
      }
    });
  }

  // 35. CREW_HELI_ACCOM_DASH record
  records.push({
    id: 'chad-01',
    rid: 'CHAD-01',
    entity: 'crew_heli_accom_dash',
    title: 'CREW_HELI_ACCOM_DASH: Consolidated Tri-Track Metrics',
    description: 'المؤشرات الرقمية المركزة للمسارات الثلاثة التخصصية: الطاقم والمانينج (WPS-23)، مهبط الطائرات (WPS-19)، والإقامة والـ POB (WPS-15)',
    department: 'Marine',
    status: 'Compliant',
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-10-19T08:00:00Z',
    data: {
      crew_manning_compliance: 92.5,
      helideck_cap437_score: 95.0,
      accommodation_pob_score: 98.0
    }
  });

  // 36. 138 Gap_WPS records
  for (let gw = 1; gw <= 138; gw++) {
    const gapId = `GAP-${String(gw).padStart(3, '0')}`;
    const wpsId = `WPS-${String((gw % 24) + 1).padStart(2, '0')}`;
    records.push({
      id: `gwps-${gw}`,
      rid: `GWPS-${String(gw).padStart(3, '0')}`,
      entity: 'gap_wps',
      title: `Gap Association: ${gapId} ➔ ${wpsId}`,
      description: `ربط الفجوة وعدم المطابقة ${gapId} بحزمة العمل المتأثرة ${wpsId} لمتابعة المعالجة التصحيحية`,
      wps_id: wpsId,
      department: 'HSE & Safety',
      status: gw % 3 === 0 ? 'Closed' : 'In Progress',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-10-18T10:00:00Z',
      data: {
        gap_rid: gapId,
        impacted_wps: wpsId,
        closure_target_date: '2026-11-20'
      }
    });
  }

  return records;
}

export const INITIAL_RECORDS: BaseRecord[] = generateAllRecords();

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-01',
    timestamp: '2026-10-19T07:45:00Z',
    user: 'Capt. Ahmed Mansour (Barge Master)',
    action: 'STATUS_CHANGE',
    record_rid: 'WPS-23',
    record_title: 'Personnel Competence & Marine Manning',
    details: 'Verified Safe Manning baseline and approved crew shift distribution matrix.'
  },
  {
    id: 'aud-02',
    timestamp: '2026-10-18T14:30:00Z',
    user: 'Hassan Mahmoud (HLO Lead)',
    action: 'CREATE',
    record_rid: 'GAP-001',
    record_title: 'Helideck Perimeter Netting Tie-Wire Corrosion',
    details: 'Raised High-severity finding following routine pre-mobilization drop-net tension check.'
  },
  {
    id: 'aud-03',
    timestamp: '2026-10-18T10:00:00Z',
    user: 'QA/QC Director',
    action: 'VERIFY',
    record_rid: 'CERT-001',
    record_title: 'STCW II/2 Master Unlimited - Ahmed Mansour',
    details: 'Verified certificate authenticity against EMSA maritime registry portal.'
  },
  {
    id: 'aud-04',
    timestamp: '2026-10-17T11:00:00Z',
    user: 'Helideck Certification Agency (HCA)',
    action: 'STATUS_CHANGE',
    record_rid: 'HEL-PROF-01',
    record_title: 'PMS-11 Helideck CAP 437 Technical Profile',
    details: 'Certified full CAP 437 compliance with DIFFS foam system clearance.'
  }
];
