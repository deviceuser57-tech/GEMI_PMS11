export type EntityType =
  // Core Entities (15 original sheets)
  | 'wps'
  | 'rule'
  | 'activity'
  | 'task'
  | 'deliverable'
  | 'gate'
  | 'gap'
  | 'acceptance'
  | 'evidence'
  | 'risk'
  | 'change'
  | 'responsibility'
  | 'department_summary'
  | 'rule_wps_map'
  | 'dashboard_summary'
  // Specialized Operational Entities (14 new sheets)
  | 'crew_role'
  | 'crew_requirement'
  | 'crew_member'
  | 'crew_certificate'
  | 'manning_plan'
  | 'helideck_profile'
  | 'helideck_check'
  | 'accommodation_check'
  | 'accommodation_capacity'
  | 'execution'
  | 'functional'
  | 'dependency'
  | 'source'
  | 'supplemental_control'
  // Governance, Relations & Analytics Entities (11 sheets)
  | 'master_data'
  | 'dept_ownership'
  | 'lists'
  | 'dropdown_map'
  | 'relationships'
  | 'powerpivot_relations'
  | 'dependency_endpoint_type'
  | 'relationship_type'
  | 'audit_config'
  | 'crew_heli_accom_dash'
  | 'gap_wps'
  | 'daily_log';

export type Department =
  | 'All'
  | 'Marine'
  | 'Technical & Maintenance'
  | 'HSE & Safety'
  | 'Diving Operations'
  | 'Pipelay Operations'
  | 'Catering & Accommodation'
  | 'Aviation & Helideck'
  | 'QA/QC'
  | 'Project Management';

export type RecordStatus =
  | 'OPEN'
  | 'Open'
  | 'Draft'
  | 'In Progress'
  | 'Under Review'
  | 'Compliant'
  | 'Non-Compliant'
  | 'Pending Verification'
  | 'Verified'
  | 'Closed'
  | 'Overdue'
  | 'Approved';

export type DependencyType = 'Finish-to-Start' | 'Start-to-Start' | 'Finish-to-Finish' | 'Start-to-Finish';

export interface BaseRecord {
  id: string;
  rid: string; // e.g. "ROLE-01", "MAN-001", "ACC-001", "HEL-001", "T-012", "R-048", "GAP-003", "DEP-102"
  entity: EntityType;
  title: string;
  description?: string;
  wps_id?: string; // e.g. "WPS-23", "WPS-19", "WPS-15"
  department: Department;
  status: RecordStatus;
  owner?: string;
  due_date?: string;
  expiry_date?: string; // for certificates and inspection validity
  evidence_ids?: string[];
  acceptance_ids?: string[];
  created_at: string;
  updated_at: string;
  data: Record<string, any>;
  attachments?: string[]; // Array of base64 image strings or file URLs
}

// Specialized payload schemas stored inside data (JSONB)
export interface CrewRoleData {
  role_team: string; // e.g. "Marine / Watchkeeping Lead", "Diving Superintendent"
  source_rule_id?: string; // e.g. "R-057"
  applicability: 'Mandatory' | 'Project-Conditional' | 'Optional';
  approved_role_basis: string; // "STCW", "IMCA", "Flag State"
  authority: string;
  critical_safety_role: boolean;
}

export interface CrewRequirementData {
  role_id: string; // FK -> Crew_Roles
  certificate_type: string; // "COC Class 1", "BOSIET / HUET", "OGUK Medical", "IMCA Dive Supervisor"
  expiry_required: boolean;
  validity_years?: number;
  approved_basis_criteria: string;
  is_mandatory: boolean;
}

export interface CrewMemberData {
  full_name: string;
  national_id_or_passport?: string;
  role_id: string; // FK -> rid of crew_role
  role_title?: string;
  scenario: 'Pipelay Mode' | 'Transit Mode' | 'Anchored / Standby' | 'Diving Campaign';
  shift: 'Day Shift (12h)' | 'Night Shift (12h)' | '24h On-Call' | 'Rotational';
  is_available: boolean;
  deployment_approval: 'Approved' | 'Pending Review' | 'Rejected' | 'Conditional';
  familiarization_status: 'Completed' | 'Pending' | 'Exempt';
  cabin_number?: string;
  blood_type?: string;
  emergency_station?: string;
}

export interface CrewCertificateData {
  crew_id: string; // FK -> rid of crew_member
  crew_name?: string;
  certificate_type: string;
  certificate_number: string;
  issuer: string; // e.g. "DNV", "Egyptian Flag Administration", "OPITO", "IMCA"
  issue_date: string;
  expiry_date: string;
  verification_status: 'Verified' | 'Pending Verification' | 'Expired' | 'Rejected';
  verified_by?: string;
  verification_date?: string;
  document_url?: string;
  document_name?: string;
}

export interface ManningPlanData {
  scenario: 'Pipelay Mode' | 'Transit Mode' | 'Anchored / Standby' | 'Diving Campaign';
  shift: 'Day Shift' | 'Night Shift' | '24h Joint' | 'Total POB';
  role_id: string;
  role_name?: string;
  required_persons: number;
  assigned_persons: number;
  approving_authority: string; // "Egyptian Maritime Authority / Class / Charterer"
  approval_status: 'Approved' | 'Pending Approval' | 'Deficit';
}

export interface HelideckProfileData {
  decision_type: 'Full CAP 437 Helideck' | 'Winching Area' | 'Not Applicable';
  d_value: number; // e.g. 22.2 meters
  mtow_tonnes: number; // e.g. 12.6 tonnes (Sikorsky S-92 / AW139)
  lighting_status: 'Fully Operational' | 'Degraded' | 'Service Required';
  foam_system_type: 'DIFFS (Deck Integrated Fire Fighting System)' | 'Monitor Foam Cannons';
  certification_body: string; // "HCA / CAA / Flag State"
  certificate_valid_until: string;
  status_summary: string;
}

export interface InspectionCheckData {
  control_item: string; // e.g. "Helideck Friction Test", "HVAC Air Changes & Filter Check"
  facility_area: 'Helideck' | 'Accommodation' | 'Lifeboats' | 'Engine Room' | 'Dive Complex';
  source_rule_id?: string; // e.g. "R-048", "R-055"
  criteria_statement: string;
  inspection_status: 'Compliant' | 'Non-Compliant' | 'Pending Inspection' | 'Conditional Pass';
  inspector: string;
  inspection_date: string;
  next_inspection_due: string;
  evidence_attached?: boolean;
  corrective_action_needed?: boolean;
  capa_id?: string;
  findings_notes?: string;
}

export interface AccommodationCapacityData {
  deck_level: string; // e.g. "Main Deck", "Bridge Deck Level 1", "Tween Deck"
  cabin_count: number;
  total_certified_berths: number;
  allocated_berths: number;
  pob_limit: number;
  approval_reference: string; // "MLC 2006 Statement of Compliance / Flag Safety Dept"
  hospital_beds_count: number;
  quarantine_isolation_beds: number;
}

export interface ExecutionTaskData {
  lead_discipline: string; // e.g. "Lead Marine Engineer", "Lead Pipeling Superintendent"
  department_manager: string;
  predecessor_ids?: string[];
  deliverable_ref?: string;
  work_order_no?: string;
  progress_percent: number;
  field_location: string;
  currency?: string;
  cost_amount?: number;
}

export interface DependencyData {
  predecessor_id: string; // e.g. "GATE-0", "T-041", "R-057"
  successor_id: string;
  predecessor_title?: string;
  successor_title?: string;
  relationship_type: DependencyType;
  lag_days: number;
  dependency_class: 'Logical' | 'Regulatory' | 'Operational' | 'Safety Critical';
  rationale: string;
  is_critical_path: boolean;
}

export interface SourceData {
  source_code: string; // e.g. "S01", "S02"
  authority: string; // "IMO / SOLAS", "DNV", "IMCA", "Egyptian Flag State", "API"
  source_type: 'Rules & Standards' | 'Statutory Code' | 'Contract Spec' | 'Company Procedure';
  document_number: string;
  edition_or_year: string;
  title_english: string;
  title_arabic?: string;
  url?: string;
  mandatory_level: 'Mandatory' | 'Guidance' | 'Best Practice';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VERIFY' | 'IMPORT' | 'EXPORT' | 'STATUS_CHANGE';
  record_rid: string;
  record_title: string;
  details: string;
}

export interface WorkbookSheetInfo {
  sheetName: string;
  arabicName: string;
  category: 'Core Operational' | 'Specialized Operations' | 'Governance & Relations';
  targetEntity?: EntityType;
  recordCount: number;
  description: string;
}
export type UserRole = 'Admin' | 'Supervisor' | 'Viewer';

export interface Reminder {
  id: string;
  record_id: string;
  record_rid: string;
  message: string;
  due_date: string;
  is_dismissed: boolean;
}
