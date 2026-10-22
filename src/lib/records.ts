import {
  EntityType,
  Department,
  RecordStatus,
  DependencyType,
  BaseRecord,
  CrewRoleData,
  CrewRequirementData,
  CrewMemberData,
  CrewCertificateData,
  ManningPlanData,
  HelideckProfileData,
  InspectionCheckData,
  AccommodationCapacityData,
  ExecutionTaskData,
  DependencyData,
  SourceData
} from '../types/pms';

// Re-export core types for seamless usage
export type {
  EntityType,
  Department,
  RecordStatus,
  DependencyType,
  BaseRecord,
  CrewRoleData,
  CrewRequirementData,
  CrewMemberData,
  CrewCertificateData,
  ManningPlanData,
  HelideckProfileData,
  InspectionCheckData,
  AccommodationCapacityData,
  ExecutionTaskData,
  DependencyData,
  SourceData
};

export interface SupplementalControlData {
  control_level: string;
  audit_frequency: string;
  source_rule_id?: string;
  environmental_aspect?: string;
  mitigation_barrier?: string;
}

export interface EntityDefinition {
  entity: EntityType;
  sheetName: string;
  arabicName: string;
  englishName: string;
  defaultDepartment: Department;
  defaultWpsId?: string;
  idPrefix: string;
  requiredFields: string[];
  description: string;
}

export const ENTITY_DEFINITIONS: Record<EntityType, EntityDefinition> = {
  // 1. Core Entities
  wps: {
    entity: 'wps',
    sheetName: 'WPS',
    arabicName: 'حزمة عمل متخصصة',
    englishName: 'Work Package',
    defaultDepartment: 'Marine',
    idPrefix: 'WPS',
    requiredFields: ['rid', 'title', 'department', 'status'],
    description: 'حزم العمل الفنية والتشغيلية للبارجة من WPS-01 إلى WPS-24'
  },
  rule: {
    entity: 'rule',
    sheetName: 'Rules',
    arabicName: 'قاعدة هندسية / تشريعية',
    englishName: 'Compliance Rule',
    defaultDepartment: 'QA/QC',
    idPrefix: 'R',
    requiredFields: ['rid', 'title', 'wps_id', 'status'],
    description: 'قواعد التوافق والسلامة والمتطلبات الهندسية الإلزامية الـ 89'
  },
  activity: {
    entity: 'activity',
    sheetName: 'Activities',
    arabicName: 'نشاط ميداني',
    englishName: 'Field Activity',
    defaultDepartment: 'Marine',
    idPrefix: 'ACT',
    requiredFields: ['rid', 'title', 'wps_id', 'status'],
    description: 'الأنشطة التنفيذية المرتبطة بالقواعد وحزم العمل'
  },
  task: {
    entity: 'task',
    sheetName: 'Tasks',
    arabicName: 'مهمة تفصيلية',
    englishName: 'Detailed Task',
    defaultDepartment: 'Technical & Maintenance',
    idPrefix: 'TSK',
    requiredFields: ['rid', 'title', 'wps_id', 'status'],
    description: 'مهام التدقيق والتفتيش ومسؤوليات الطاقم (343 مهمة)'
  },
  deliverable: {
    entity: 'deliverable',
    sheetName: 'Deliverables',
    arabicName: 'مخرج معتمد',
    englishName: 'Approved Deliverable',
    defaultDepartment: 'QA/QC',
    idPrefix: 'DEL',
    requiredFields: ['rid', 'title', 'wps_id', 'status'],
    description: 'التقارير والمخططات والشهادات المطلوبة كأدلة رسمية'
  },
  gate: {
    entity: 'gate',
    sheetName: 'Gates',
    arabicName: 'بوابة إغلاق وجاهزية',
    englishName: 'Milestone Gate',
    defaultDepartment: 'Project Management',
    idPrefix: 'GATE',
    requiredFields: ['rid', 'title', 'status'],
    description: 'بوابات الجاهزية التشغيلية والعبور من GATE-0 إلى GATE-8'
  },
  gap: {
    entity: 'gap',
    sheetName: 'Gaps',
    arabicName: 'فجوة / عدم مطابقة CAPA',
    englishName: 'Finding & CAPA',
    defaultDepartment: 'HSE & Safety',
    idPrefix: 'GAP',
    requiredFields: ['rid', 'title', 'status', 'owner'],
    description: 'الملاحظات الفنية وعدم المطابقة وخطط المعالجة والأسباب الجذرية'
  },
  acceptance: {
    entity: 'acceptance',
    sheetName: 'Acceptance',
    arabicName: 'معيار قبول واعتماد',
    englishName: 'Acceptance Criteria',
    defaultDepartment: 'Project Management',
    idPrefix: 'ACC',
    requiredFields: ['rid', 'title', 'status'],
    description: 'توقيعات وموافقات المالك وسلطة العلم وهيئة الإشراف MWS'
  },
  evidence: {
    entity: 'evidence',
    sheetName: 'Evidence',
    arabicName: 'دليل ثبوتي رسمي',
    englishName: 'Evidence Document',
    defaultDepartment: 'QA/QC',
    idPrefix: 'EVD',
    requiredFields: ['rid', 'title', 'status'],
    description: 'تقارير الفحص والشهادات المسجلة بالأرقام والروابط الموثقة'
  },
  risk: {
    entity: 'risk',
    sheetName: 'Risks',
    arabicName: 'خطر تشغيلي',
    englishName: 'Operational Risk',
    defaultDepartment: 'HSE & Safety',
    idPrefix: 'RSK',
    requiredFields: ['rid', 'title', 'status'],
    description: 'المخاطر المحددة ومستوى الشدة ومصفوفة التخفيف'
  },
  change: {
    entity: 'change',
    sheetName: 'Changes',
    arabicName: 'إدارة تغيير هندسي MOC',
    englishName: 'Management of Change',
    defaultDepartment: 'Technical & Maintenance',
    idPrefix: 'MOC',
    requiredFields: ['rid', 'title', 'status'],
    description: 'طلبات التعديل الهندسي والموافقات الفنية على المتن'
  },
  responsibility: {
    entity: 'responsibility',
    sheetName: 'Responsibilities',
    arabicName: 'مسؤولية حوكمة RACI',
    englishName: 'RACI Responsibility',
    defaultDepartment: 'Marine',
    idPrefix: 'RSP',
    requiredFields: ['rid', 'title', 'department'],
    description: 'توزيع الصلاحيات والمسؤوليات بين الرتب والمديرين'
  },

  // 2. Specialized Operational Entities (14 Sheets)
  crew_role: {
    entity: 'crew_role',
    sheetName: 'Crew_Roles',
    arabicName: 'رتبة / دور بحري حرج',
    englishName: 'Critical Crew Role',
    defaultDepartment: 'Marine',
    defaultWpsId: 'WPS-23',
    idPrefix: 'ROLE',
    requiredFields: ['rid', 'title', 'department'],
    description: 'مسميات الوظائف البحرية الحرجة وشروط التكليف (12 رتبة)'
  },
  crew_requirement: {
    entity: 'crew_requirement',
    sheetName: 'Crew_Requirements',
    arabicName: 'اشتراط تدريب وترخيص',
    englishName: 'Crew Requirement',
    defaultDepartment: 'Marine',
    defaultWpsId: 'WPS-23',
    idPrefix: 'REQ',
    requiredFields: ['rid', 'title'],
    description: 'شهادات STCW, IMCA, BOSIET والفحوصات الطبية وإلزامية تاريخ الانتهاء (23 متطلباً)'
  },
  crew_member: {
    entity: 'crew_member',
    sheetName: 'Crew_Register',
    arabicName: 'فرد طاقم مسجل',
    englishName: 'Crew Member',
    defaultDepartment: 'Marine',
    defaultWpsId: 'WPS-23',
    idPrefix: 'CRW',
    requiredFields: ['rid', 'title', 'owner'],
    description: 'بيانات البحارة والفنيين ونمط التشغيل والوردية وتصريح النزول'
  },
  crew_certificate: {
    entity: 'crew_certificate',
    sheetName: 'Crew_Certificates',
    arabicName: 'شهادة وصلاحية فرد',
    englishName: 'Crew Certificate',
    defaultDepartment: 'Marine',
    defaultWpsId: 'WPS-23',
    idPrefix: 'CERT',
    requiredFields: ['rid', 'title', 'expiry_date'],
    description: 'أرقام الشهادات وتواريخ الانتهاء وتنبيهات الصلاحية (أصفر <30 يوماً، أحمر منتهية)'
  },
  manning_plan: {
    entity: 'manning_plan',
    sheetName: 'Manning_Plan',
    arabicName: 'خطة المانينج وتوزيع الطاقم',
    englishName: 'Manning Plan',
    defaultDepartment: 'Marine',
    defaultWpsId: 'WPS-23',
    idPrefix: 'MAN',
    requiredFields: ['rid', 'title', 'status'],
    description: 'الأعداد المقررة لكل سيناريو تشغيلي (Marine / Diving / Pipelay) والتحقق من العجز'
  },
  helideck_profile: {
    entity: 'helideck_profile',
    sheetName: 'Helideck_Profile',
    arabicName: 'الملف الفني لمهبط الطائرات',
    englishName: 'Helideck Profile',
    defaultDepartment: 'Aviation & Helideck',
    defaultWpsId: 'WPS-19',
    idPrefix: 'HEL-PROF',
    requiredFields: ['rid', 'title', 'status'],
    description: 'حسم القرار الهندسي CAP 437 وأوزان الطائرات D-Value وإطفاء DIFFS'
  },
  helideck_check: {
    entity: 'helideck_check',
    sheetName: 'Helideck_Checks',
    arabicName: 'فحص دوري لمهبط الطائرات',
    englishName: 'Helideck Periodic Check',
    defaultDepartment: 'Aviation & Helideck',
    defaultWpsId: 'WPS-19',
    idPrefix: 'HEL-CHK',
    requiredFields: ['rid', 'title', 'status'],
    description: 'فحوصات التفتيش الـ 10 الدورية للمهبط (احتكاك، شباك، فوم، إنارة)'
  },
  accommodation_check: {
    entity: 'accommodation_check',
    sheetName: 'Accommodation_Checks',
    arabicName: 'فحص راحة وإعاشة الطاقم',
    englishName: 'Accommodation Check',
    defaultDepartment: 'Catering & Accommodation',
    defaultWpsId: 'WPS-15',
    idPrefix: 'ACC-CHK',
    requiredFields: ['rid', 'title', 'status'],
    description: 'فحوصات الإقامة والراحة الـ 10 وفق معاهدة العمل البحري MLC 2006'
  },
  accommodation_capacity: {
    entity: 'accommodation_capacity',
    sheetName: 'Accommodation_Capacity',
    arabicName: 'خطة سعة الأفراد POB',
    englishName: 'POB Capacity Plan',
    defaultDepartment: 'Catering & Accommodation',
    defaultWpsId: 'WPS-15',
    idPrefix: 'ACC-CAP',
    requiredFields: ['rid', 'title', 'status'],
    description: 'الأسِرّة المعتمدة (250 سريراً)، السعة القصوى POB Limit (245 فرداً)، وسجلات العلم'
  },
  execution: {
    entity: 'execution',
    sheetName: 'Execution',
    arabicName: 'مهمة تنفيذية ميدانية',
    englishName: 'Execution Task',
    defaultDepartment: 'Technical & Maintenance',
    idPrefix: 'EXE',
    requiredFields: ['rid', 'title', 'status'],
    description: 'المهام التنفيذية الميدانية بربطها برئيس التخصص ومدير الإدارة (317 مهمة)'
  },
  functional: {
    entity: 'functional',
    sheetName: 'Functional',
    arabicName: 'نشاط وظيفي وتصنيف خارجي',
    englishName: 'Functional Activity',
    defaultDepartment: 'QA/QC',
    idPrefix: 'FNC',
    requiredFields: ['rid', 'title', 'status'],
    description: 'الأنشطة الوظيفية الخارجية المرتبطة بسلطة العلم وهيئات التصنيف DNV (362 نشاطاً)'
  },
  dependency: {
    entity: 'dependency',
    sheetName: 'Dependencies',
    arabicName: 'رابط اعتمادي تتابعي',
    englishName: 'Precedence Dependency',
    defaultDepartment: 'Project Management',
    idPrefix: 'DEP',
    requiredFields: ['rid', 'title'],
    description: 'العلاقات التتابعية Finish-to-Start وفترات التأخير Lag Days والمسار الحرج (612 رابط)'
  },
  source: {
    entity: 'source',
    sheetName: 'Sources',
    arabicName: 'مرجع تشريعي / كود دولي',
    englishName: 'Statutory Source',
    defaultDepartment: 'Marine',
    idPrefix: 'SRC',
    requiredFields: ['rid', 'title'],
    description: 'الكودات والاتفاقيات البحرية الدولية SOLAS, MARPOL, DNV, IMCA D014, CAP 437 (35 كوداً)'
  },
  supplemental_control: {
    entity: 'supplemental_control',
    sheetName: 'Supplemental_Controls',
    arabicName: 'ضابط تحكم تكميلي',
    englishName: 'Supplemental Control',
    defaultDepartment: 'HSE & Safety',
    idPrefix: 'SUP',
    requiredFields: ['rid', 'title'],
    description: 'معايير واشتراطات تحكم إضافية ملحقة بالأنشطة الحرجة والبيئية (39 ضابطاً)'
  },
  department_summary: {
    entity: 'department_summary',
    sheetName: 'Department_Summary',
    arabicName: 'ملخص أداء وحوكمة الأقسام',
    englishName: 'Department Summary',
    defaultDepartment: 'Marine',
    idPrefix: 'DEPT',
    requiredFields: ['rid', 'title'],
    description: 'إحصائيات إنجاز وتوافق الأقسام الفنية مع نظام الصلاحيات RLS'
  },
  rule_wps_map: {
    entity: 'rule_wps_map',
    sheetName: 'RULE_WPS_MAP',
    arabicName: 'خريطة ربط القواعد بحزم العمل',
    englishName: 'Rule-WPS Cross Map',
    defaultDepartment: 'QA/QC',
    idPrefix: 'RMAP',
    requiredFields: ['rid', 'title'],
    description: 'العلاقات البينية والمصفوفة التفاعلية بين القواعد الـ 89 وحزم الـ WPS'
  },
  dashboard_summary: {
    entity: 'dashboard_summary',
    sheetName: 'DASHBOARD',
    arabicName: 'ملخص مؤشرات لوحة القيادة',
    englishName: 'Dashboard Executive Summary',
    defaultDepartment: 'Project Management',
    idPrefix: 'DASH',
    requiredFields: ['rid', 'title'],
    description: 'المؤشرات الرقمية المجمعة وحالة الإغلاق الكلية للبارجة PMS-11'
  },
  master_data: {
    entity: 'master_data',
    sheetName: 'MASTER_DATA',
    arabicName: 'البيانات المرجعية المجمعة',
    englishName: 'Consolidated Master Data',
    defaultDepartment: 'QA/QC',
    idPrefix: 'MD',
    requiredFields: ['rid', 'title'],
    description: 'جدول العلاقات المجمعة وضوابط الحقول لـ 612 سجلاً أساسياً'
  },
  dept_ownership: {
    entity: 'dept_ownership',
    sheetName: 'Dept_Ownership',
    arabicName: 'حوكمة الأقسام ومسؤولياتها',
    englishName: 'Department Ownership RLS',
    defaultDepartment: 'Project Management',
    idPrefix: 'OWN',
    requiredFields: ['rid', 'title'],
    description: 'توزيع الملكية والتحكم في صلاحيات الأقسام RLS والموافقات الرسمية'
  },
  lists: {
    entity: 'lists',
    sheetName: 'LISTS',
    arabicName: 'القوائم المنسدلة الموحدة',
    englishName: 'Standard Dropdown Lists',
    defaultDepartment: 'QA/QC',
    idPrefix: 'LST',
    requiredFields: ['rid', 'title'],
    description: 'القيم الموحدة للحالات والرتب وتصنيفات السلامة المعتمدة'
  },
  dropdown_map: {
    entity: 'dropdown_map',
    sheetName: 'DROPDOWN_MAP',
    arabicName: 'خريطة ربط الأعمدة بالقوائم',
    englishName: 'Field Dropdown Map',
    defaultDepartment: 'QA/QC',
    idPrefix: 'DMAP',
    requiredFields: ['rid', 'title'],
    description: 'ربط الحقول الميدانية بالقوائم المنسدلة الصحيحة عبر 205 أعمدة'
  },
  relationships: {
    entity: 'relationships',
    sheetName: 'Relationships',
    arabicName: 'شبكة العلاقات البينية الشاملة',
    englishName: 'Inter-entity Relationships',
    defaultDepartment: 'Project Management',
    idPrefix: 'REL',
    requiredFields: ['rid', 'title'],
    description: 'روابط السجلات ببعضها عبر كامل منظومة البارجة (14,825 رابطاً)'
  },
  powerpivot_relations: {
    entity: 'powerpivot_relations',
    sheetName: 'POWERPIVOT_RELATIONS',
    arabicName: 'علاقات تحليل البيانات الضخمة',
    englishName: 'PowerPivot Model Relations',
    defaultDepartment: 'Project Management',
    idPrefix: 'PPR',
    requiredFields: ['rid', 'title'],
    description: 'نماذج التغذية لمؤشرات الأداء المتقدمة وحسابات الجاهزية'
  },
  dependency_endpoint_type: {
    entity: 'dependency_endpoint_type',
    sheetName: 'DEPENDENCY_ENDPOINT_TYPES',
    arabicName: 'أنواع نهايات الاعتماديات',
    englishName: 'Dependency Endpoint Types',
    defaultDepartment: 'Project Management',
    idPrefix: 'EPT',
    requiredFields: ['rid', 'title'],
    description: 'تعريف أطراف الروابط بين البوابات والمهام والقواعد والمخرجات'
  },
  relationship_type: {
    entity: 'relationship_type',
    sheetName: 'RELATIONSHIP_TYPES',
    arabicName: 'أنواع العلاقات المنطقية',
    englishName: 'Relationship Logic Types',
    defaultDepartment: 'Project Management',
    idPrefix: 'RLT',
    requiredFields: ['rid', 'title'],
    description: 'تصنيفات الروابط: تتابعية، تنظيمية، سلامة، واشتراطات تصنيف'
  },
  audit_config: {
    entity: 'audit_config',
    sheetName: 'AUDIT_CONFIG',
    arabicName: 'إعدادات سجل التدقيق والمراقبة',
    englishName: 'Audit System Configuration',
    defaultDepartment: 'QA/QC',
    idPrefix: 'ACFG',
    requiredFields: ['rid', 'title'],
    description: 'قواعد التتبع الصارم للتعديلات والاعتمادات على المتن'
  },
  crew_heli_accom_dash: {
    entity: 'crew_heli_accom_dash',
    sheetName: 'CREW_HELI_ACCOM_DASH',
    arabicName: 'مؤشرات الطاقم والمهبط والإقامة العليا',
    englishName: 'Crew Heli Accom Dashboard KPI',
    defaultDepartment: 'Marine',
    idPrefix: 'CHAD',
    requiredFields: ['rid', 'title'],
    description: 'الواجهة التحليلية المركزة للقطاعات الثلاثة التخصصية (WPS-23, 19, 15)'
  },
  gap_wps: {
    entity: 'gap_wps',
    sheetName: 'Gap_WPS',
    arabicName: 'مصفوفة فجوات حزم العمل',
    englishName: 'Gap to WPS Mapping Matrix',
    defaultDepartment: 'HSE & Safety',
    idPrefix: 'GWPS',
    requiredFields: ['rid', 'title'],
    description: 'ربط الفجوات المفتوحة وعدم المطابقة بحزم العمل المتأثرة'
  },
  daily_log: {
    entity: 'daily_log',
    sheetName: 'Daily_Logs',
    arabicName: 'إقرار العمليات اليومي',
    englishName: 'Daily Operations Checkpoint',
    defaultDepartment: 'HSE & Safety',
    idPrefix: 'CHK',
    requiredFields: ['rid', 'title', 'status'],
    description: 'سجل إقرارات الحالة اليومية لسلامة وعمليات البارجة (All Clear أو Issue Detected)'
  }
};

/**
 * Validate a record against schema rules
 */
export function validateRecord(record: Partial<BaseRecord>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!record.rid || record.rid.trim() === '') {
    errors.push('Record ID (RID) is required');
  }

  if (!record.title || record.title.trim() === '') {
    errors.push('Title is required');
  }

  if (!record.entity) {
    errors.push('Entity type is required');
  }

  if (record.entity === 'crew_certificate' && !record.expiry_date) {
    errors.push('Expiry date is mandatory for crew certificates');
  }

  if (record.entity === 'dependency') {
    if (!record.data?.predecessor_id || !record.data?.successor_id) {
      errors.push('Both Predecessor and Successor are required for dependency links');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Factory to create a pristine new record with default typed data payload
 */
export function createEmptyRecord(entity: EntityType, wpsId?: string, department?: Department): BaseRecord {
  const def = ENTITY_DEFINITIONS[entity] || ENTITY_DEFINITIONS.task;
  const now = new Date().toISOString();
  const randomSuffix = Math.floor(100 + Math.random() * 900);

  let defaultData: Record<string, any> = {};

  if (entity === 'crew_role') {
    defaultData = {
      role_team: 'Marine Watchkeeping',
      source_rule_id: 'R-057',
      applicability: 'Mandatory',
      approved_role_basis: 'STCW / Flag State',
      authority: 'Flag Administration',
      critical_safety_role: true
    } as CrewRoleData;
  } else if (entity === 'crew_requirement') {
    defaultData = {
      role_id: 'ROLE-01',
      certificate_type: 'STCW Certificate of Competency',
      expiry_required: true,
      validity_years: 2,
      approved_basis_criteria: 'Mandatory for offshore deployment',
      is_mandatory: true
    } as CrewRequirementData;
  } else if (entity === 'crew_member') {
    defaultData = {
      full_name: 'New Offshore Crew Member',
      role_id: 'ROLE-01',
      scenario: 'Pipelay Mode',
      shift: 'Day Shift (12h)',
      is_available: true,
      deployment_approval: 'Approved',
      familiarization_status: 'Completed',
      cabin_number: 'C-01',
      blood_type: 'O+',
      emergency_station: 'Lifeboat Station 1'
    } as CrewMemberData;
  } else if (entity === 'crew_certificate') {
    defaultData = {
      crew_id: 'CRW-001',
      certificate_type: 'STCW II/2 Master Mariner',
      certificate_number: `CERT-NO-${Date.now().toString().slice(-4)}`,
      issuer: 'Egyptian Maritime Safety Authority (EMSA)',
      issue_date: now.split('T')[0],
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      verification_status: 'Verified'
    } as CrewCertificateData;
  } else if (entity === 'manning_plan') {
    defaultData = {
      scenario: 'Pipelay Mode',
      shift: 'Total POB',
      role_id: 'ROLE-01',
      role_name: 'Barge Master',
      required_persons: 6,
      assigned_persons: 6,
      approving_authority: 'Flag State Administration',
      approval_status: 'Approved'
    } as ManningPlanData;
  } else if (entity === 'helideck_check') {
    defaultData = {
      control_item: 'Helideck Periodic Check',
      facility_area: 'Helideck',
      source_rule_id: 'R-048',
      criteria_statement: 'CAP 437 compliant physical and operational check',
      inspection_status: 'Compliant',
      inspector: 'Safety Superintendent',
      inspection_date: now.split('T')[0],
      next_inspection_due: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    } as InspectionCheckData;
  } else if (entity === 'accommodation_check') {
    defaultData = {
      control_item: 'Accommodation Living Quarters Check',
      facility_area: 'Accommodation',
      source_rule_id: 'R-055',
      criteria_statement: 'MLC 2006 Title 3 hygiene and habitability standard',
      inspection_status: 'Compliant',
      inspector: 'Camp Boss / Medic',
      inspection_date: now.split('T')[0],
      next_inspection_due: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    } as InspectionCheckData;
  } else if (entity === 'dependency') {
    defaultData = {
      predecessor_id: 'GATE-0',
      successor_id: 'GATE-1',
      predecessor_title: 'Prerequisite Activity',
      successor_title: 'Successor Milestone',
      relationship_type: 'Finish-to-Start',
      lag_days: 0,
      dependency_class: 'Regulatory',
      rationale: 'Mandatory sequence to prevent premature operational risk',
      is_critical_path: true
    } as DependencyData;
  } else if (entity === 'source') {
    defaultData = {
      source_code: `S${randomSuffix.toString().slice(-2)}`,
      authority: 'IMO / DNV',
      source_type: 'Statutory Code',
      document_number: `STD-${Date.now().toString().slice(-4)}`,
      edition_or_year: '2024 Edition',
      title_english: 'Marine Code Specification',
      mandatory_level: 'Mandatory'
    } as SourceData;
  }

  return {
    id: `rec-${entity}-${Date.now()}`,
    rid: `${def.idPrefix}-${randomSuffix}`,
    entity,
    title: `New ${def.englishName}`,
    description: `Official record registered under ${def.sheetName}`,
    wps_id: wpsId || def.defaultWpsId || 'WPS-01',
    department: department || def.defaultDepartment,
    status: 'In Progress',
    owner: 'Superintendent',
    created_at: now,
    updated_at: now,
    data: defaultData
  };
}
