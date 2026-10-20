import * as XLSX from 'xlsx';
import { BaseRecord, EntityType, Department, RecordStatus } from '../types/pms';
import { ENTITY_DEFINITIONS } from './records';

export interface ImportSummary {
  fileName: string;
  sheetsFound: string[];
  totalRowsParsed: number;
  newRecords: BaseRecord[];
  errors: string[];
}

export const parseWorkbookFile = async (file: File): Promise<ImportSummary> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  const sheetNames = workbook.SheetNames;
  const newRecords: BaseRecord[] = [];
  const errors: string[] = [];
  let totalRowsParsed = 0;

  sheetNames.forEach(sheetName => {
    try {
      const worksheet = workbook.Sheets[sheetName];
      const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
      totalRowsParsed += jsonRows.length;

      const lowerSheet = sheetName.toLowerCase().replace(/[^a-z0-9]/g, '_');

      jsonRows.forEach((row, idx) => {
        const rid =
          row['RID'] ||
          row['rid'] ||
          row['ID'] ||
          row['id'] ||
          row['Code'] ||
          `${sheetName.substring(0, 3).toUpperCase()}-${String(idx + 1).padStart(3, '0')}`;
        const title =
          row['Title'] ||
          row['title'] ||
          row['Name'] ||
          row['name'] ||
          row['Description'] ||
          `${sheetName} Item ${idx + 1}`;
        const department: Department = parseDepartment(row['Department'] || row['department'] || '');
        const status: RecordStatus = parseStatus(row['Status'] || row['status'] || 'Draft');

        let entity: EntityType = 'task';
        let specializedData: Record<string, any> = { ...row };

        // 14 Specialized Tracks & New Sheets Mapping
        if (lowerSheet.includes('crew_role')) {
          entity = 'crew_role';
          specializedData = {
            role_team: row['Role_Team'] || row['role_team'] || 'Marine Watchkeeping',
            source_rule_id: row['Source_Rule_ID'] || row['source_rule_id'] || 'R-057',
            applicability: row['Applicability'] || 'Mandatory',
            approved_role_basis: row['Approved_Role_Basis'] || 'STCW / Flag State',
            authority: row['Authority'] || 'Flag Administration',
            critical_safety_role: true
          };
        } else if (lowerSheet.includes('crew_req')) {
          entity = 'crew_requirement';
          specializedData = {
            role_id: row['Role_ID'] || row['role_id'] || 'ROLE-01',
            certificate_type: row['Certificate_Type'] || row['certificate_type'] || title,
            expiry_required: true,
            validity_years: Number(row['Validity_Years'] || 2),
            approved_basis_criteria: row['Approved_Basis_Criteria'] || 'Valid Certification',
            is_mandatory: true
          };
        } else if (lowerSheet.includes('crew_reg') || lowerSheet.includes('crew_member')) {
          entity = 'crew_member';
          specializedData = {
            full_name: row['Full_Name'] || row['full_name'] || title,
            national_id_or_passport: row['Passport'] || row['National_ID'] || 'Verified',
            role_id: row['Role_ID'] || row['role_id'] || 'ROLE-01',
            role_title: row['Role_Title'] || 'Marine Specialist',
            scenario: row['Scenario'] || 'Pipelay Mode',
            shift: row['Shift'] || 'Day Shift (12h)',
            is_available: true,
            deployment_approval: row['Deployment_Approval'] || 'Approved',
            familiarization_status: 'Completed',
            cabin_number: row['Cabin'] || 'C-01',
            emergency_station: row['Muster_Station'] || 'Station 1'
          };
        } else if (lowerSheet.includes('crew_cert')) {
          entity = 'crew_certificate';
          specializedData = {
            crew_id: row['Crew_ID'] || row['crew_id'] || 'CRW-001',
            crew_name: row['Crew_Name'] || title,
            certificate_type: row['Certificate_Type'] || title,
            certificate_number: row['Certificate_Number'] || `CERT-${idx + 1}`,
            issuer: row['Issuer'] || 'Maritime Authority',
            issue_date: row['Issue_Date'] || '2024-01-01',
            expiry_date: row['Expiry_Date'] || '2027-01-01',
            verification_status: row['Verification_Status'] || 'Verified'
          };
        } else if (lowerSheet.includes('manning')) {
          entity = 'manning_plan';
          specializedData = {
            scenario: row['Scenario'] || 'Pipelay Mode',
            shift: row['Shift'] || 'Total POB',
            role_id: row['Role_ID'] || 'ROLE-01',
            role_name: row['Role_Name'] || title,
            required_persons: Number(row['Required_Persons'] || row['required_persons'] || 1),
            assigned_persons: Number(row['Assigned_Persons'] || row['assigned_persons'] || 1),
            approving_authority: row['Approving_Authority'] || 'Flag State Administration',
            approval_status: row['Approval_Status'] || 'Approved'
          };
        } else if (lowerSheet.includes('helideck_prof')) {
          entity = 'helideck_profile';
          specializedData = {
            decision_type: row['Decision_Type'] || 'Full CAP 437 Helideck',
            d_value: Number(row['D_Value'] || 22.2),
            mtow_tonnes: Number(row['MTOW'] || 12.6),
            lighting_status: row['Lighting_Status'] || 'Fully Operational',
            foam_system_type: row['Foam_System'] || 'DIFFS (Deck Integrated Fire Fighting System)',
            certification_body: row['Cert_Body'] || 'HCA / CAA',
            certificate_valid_until: row['Valid_Until'] || '2027-04-10'
          };
        } else if (lowerSheet.includes('helideck_check') || lowerSheet.includes('heli_chk')) {
          entity = 'helideck_check';
          specializedData = {
            control_item: title,
            facility_area: 'Helideck',
            source_rule_id: row['Rule_ID'] || 'R-048',
            criteria_statement: row['Criteria'] || descriptionFromRow(row),
            inspection_status: status === 'Compliant' ? 'Compliant' : 'Non-Compliant',
            inspector: row['Inspector'] || 'HCA Certified Inspector',
            inspection_date: row['Inspection_Date'] || new Date().toISOString().split('T')[0],
            capa_id: row['CAPA_ID'] || undefined
          };
        } else if (lowerSheet.includes('accom_check') || lowerSheet.includes('accommodation_check')) {
          entity = 'accommodation_check';
          specializedData = {
            control_item: title,
            facility_area: 'Accommodation',
            source_rule_id: row['Rule_ID'] || 'R-055',
            criteria_statement: row['Criteria'] || descriptionFromRow(row),
            inspection_status: status === 'Compliant' ? 'Compliant' : 'Non-Compliant',
            inspector: row['Inspector'] || 'Camp Boss / Medic',
            inspection_date: row['Inspection_Date'] || new Date().toISOString().split('T')[0]
          };
        } else if (lowerSheet.includes('accom_cap') || lowerSheet.includes('accommodation_cap')) {
          entity = 'accommodation_capacity';
          specializedData = {
            deck_level: row['Deck_Level'] || 'Main Deck Living Quarters',
            total_certified_berths: Number(row['Total_Berths'] || 250),
            allocated_berths: Number(row['Allocated_Berths'] || 228),
            pob_limit: Number(row['POB_Limit'] || 245),
            approval_reference: row['Approval_Ref'] || 'MLC 2006 Title 3',
            hospital_beds_count: 4,
            quarantine_isolation_beds: 2
          };
        } else if (lowerSheet.includes('execution')) {
          entity = 'execution';
          specializedData = {
            lead_discipline: row['Lead_Discipline'] || 'Marine Lead',
            department_manager: row['Manager'] || 'Offshore Construction Manager',
            work_order_no: row['WO_No'] || `WO-PMS11-${idx + 1}`,
            progress_percent: Number(row['Progress'] || 80),
            field_location: row['Location'] || 'Main Deck'
          };
        } else if (lowerSheet.includes('functional')) {
          entity = 'functional';
          specializedData = {
            classification_body: row['Class_Body'] || 'DNV / Flag Administration',
            functional_scope: row['Scope'] || 'Classification Society Periodical Survey'
          };
        } else if (lowerSheet.includes('depend')) {
          entity = 'dependency';
          specializedData = {
            predecessor_id: row['Predecessor_ID'] || row['Predecessor'] || 'GATE-0',
            successor_id: row['Successor_ID'] || row['Successor'] || 'GATE-1',
            relationship_type: row['Relationship_Type'] || 'Finish-to-Start',
            lag_days: Number(row['Lag_Days'] || 0),
            dependency_class: row['Class'] || 'Regulatory',
            rationale: row['Rationale'] || 'Mandatory sequential safety rule',
            is_critical_path: Boolean(row['Critical_Path'] ?? true)
          };
        } else if (lowerSheet.includes('source')) {
          entity = 'source';
          specializedData = {
            source_code: rid,
            authority: row['Authority'] || 'IMO / DNV',
            source_type: row['Source_Type'] || 'Statutory Code',
            document_number: row['Document_Number'] || rid,
            edition_or_year: row['Edition'] || '2024 Edition',
            title_english: title,
            mandatory_level: 'Mandatory'
          };
        } else if (lowerSheet.includes('supplemental') || lowerSheet.includes('supp_ctrl')) {
          entity = 'supplemental_control';
          specializedData = {
            control_level: row['Control_Level'] || 'Supplementary High Safeguard',
            audit_frequency: row['Frequency'] || 'Bi-Weekly Inspection'
          };
        }
        // Core Sheets Mapping
        else if (lowerSheet.includes('rule')) {
          entity = 'rule';
        } else if (lowerSheet.includes('wps')) {
          entity = 'wps';
        } else if (lowerSheet.includes('gap')) {
          entity = 'gap';
        } else if (lowerSheet.includes('gate')) {
          entity = 'gate';
        } else if (lowerSheet.includes('evidence')) {
          entity = 'evidence';
        } else if (lowerSheet.includes('risk')) {
          entity = 'risk';
        } else if (lowerSheet.includes('deliverable')) {
          entity = 'deliverable';
        } else if (lowerSheet.includes('acceptance')) {
          entity = 'acceptance';
        } else if (lowerSheet.includes('activity') || lowerSheet.includes('activities')) {
          entity = 'activity';
        } else if (lowerSheet.includes('task')) {
          entity = 'task';
        } else if (lowerSheet.includes('responsibility') || lowerSheet.includes('responsibilities')) {
          entity = 'responsibility';
        } else if (lowerSheet.includes('change')) {
          entity = 'change';
        }

        const record: BaseRecord = {
          id: `imp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          rid,
          entity,
          title,
          description: row['Description'] || row['description'] || `${sheetName} Record: ${title}`,
          wps_id: row['WPS_ID'] || row['wps_id'] || undefined,
          department,
          status,
          owner: row['Owner'] || row['owner'] || 'Discipline Lead',
          due_date: row['Due_Date'] || row['due_date'] || undefined,
          expiry_date: row['Expiry_Date'] || row['expiry_date'] || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          data: specializedData
        };

        newRecords.push(record);
      });
    } catch (err: any) {
      errors.push(`Error parsing sheet "${sheetName}": ${err.message}`);
    }
  });

  return {
    fileName: file.name,
    sheetsFound: sheetNames,
    totalRowsParsed,
    newRecords,
    errors
  };
};

export const exportWorkbook = (records: BaseRecord[], fileName = 'MASTER_WORKBOOK_Rev.03_EXECUTIVE_EXPORT.xlsx') => {
  const wb = XLSX.utils.book_new();
  const groups: Record<string, any[]> = {};

  records.forEach(r => {
    let sheetName = r.entity.toUpperCase();
    if (r.entity === 'crew_role') sheetName = 'Crew_Roles';
    if (r.entity === 'crew_requirement') sheetName = 'Crew_Requirements';
    if (r.entity === 'crew_member') sheetName = 'Crew_Register';
    if (r.entity === 'crew_certificate') sheetName = 'Crew_Certificates';
    if (r.entity === 'manning_plan') sheetName = 'Manning_Plan';
    if (r.entity === 'helideck_profile') sheetName = 'Helideck_Profile';
    if (r.entity === 'helideck_check') sheetName = 'Helideck_Checks';
    if (r.entity === 'accommodation_check') sheetName = 'Accommodation_Checks';
    if (r.entity === 'accommodation_capacity') sheetName = 'Accommodation_Capacity';
    if (r.entity === 'execution') sheetName = 'Execution';
    if (r.entity === 'functional') sheetName = 'Functional';
    if (r.entity === 'dependency') sheetName = 'Dependencies';
    if (r.entity === 'source') sheetName = 'Sources';
    if (r.entity === 'supplemental_control') sheetName = 'Supplemental_Controls';
    if (r.entity === 'wps') sheetName = 'WPS';
    if (r.entity === 'rule') sheetName = 'Rules';
    if (r.entity === 'activity') sheetName = 'Activities';
    if (r.entity === 'task') sheetName = 'Tasks';
    if (r.entity === 'deliverable') sheetName = 'Deliverables';
    if (r.entity === 'gate') sheetName = 'Gates';
    if (r.entity === 'gap') sheetName = 'Gaps';
    if (r.entity === 'acceptance') sheetName = 'Acceptance';
    if (r.entity === 'evidence') sheetName = 'Evidence';
    if (r.entity === 'risk') sheetName = 'Risks';
    if (r.entity === 'change') sheetName = 'Changes';
    if (r.entity === 'responsibility') sheetName = 'Responsibilities';

    if (!groups[sheetName]) groups[sheetName] = [];

    const rowObj: Record<string, any> = {
      RID: r.rid,
      Title: r.title,
      Description: r.description || '',
      Department: r.department,
      Status: r.status,
      WPS_ID: r.wps_id || '',
      Owner: r.owner || '',
      Due_Date: r.due_date || '',
      Expiry_Date: r.expiry_date || '',
      ...r.data
    };
    groups[sheetName].push(rowObj);
  });

  // Ensure sheets are added in order
  Object.keys(groups).forEach(sheetName => {
    const ws = XLSX.utils.json_to_sheet(groups[sheetName]);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, fileName);
};

export const generateSampleWorkbookTemplate = () => {
  const wb = XLSX.utils.book_new();

  const sampleSheets: Record<string, any[]> = {
    Crew_Roles: [
      { RID: 'ROLE-01', Title: 'Barge Master', Role_Team: 'Marine Watchkeeping', Source_Rule_ID: 'R-057', Applicability: 'Mandatory', Approved_Role_Basis: 'STCW II/2 Master', Authority: 'Flag State', Department: 'Marine', Status: 'Compliant' }
    ],
    Crew_Requirements: [
      { RID: 'REQ-01', Title: 'STCW II/2 Master Mariner', Role_ID: 'ROLE-01', Certificate_Type: 'STCW II/2', Validity_Years: 5, Approved_Basis_Criteria: 'Mandatory', Department: 'Marine', Status: 'Compliant' }
    ],
    Crew_Register: [
      { RID: 'CRW-001', Full_Name: 'Capt. Ahmed Mansour', Role_ID: 'ROLE-01', Scenario: 'Pipelay Mode', Shift: 'Day Shift (12h)', Cabin: 'B-01', Muster_Station: 'Station 1', Department: 'Marine', Status: 'Approved' }
    ],
    Crew_Certificates: [
      { RID: 'CERT-001', Crew_ID: 'CRW-001', Certificate_Type: 'STCW II/2', Certificate_Number: 'EGY-COC-8911', Issuer: 'EMSA', Issue_Date: '2024-01-01', Expiry_Date: '2027-01-01', Department: 'Marine', Status: 'Compliant' }
    ],
    Manning_Plan: [
      { RID: 'MAN-001', Scenario: 'Pipelay Mode', Role_ID: 'ROLE-01', Required_Persons: 6, Assigned_Persons: 6, Approving_Authority: 'EMSA', Approval_Status: 'Approved', Department: 'Marine', Status: 'Compliant' }
    ],
    Helideck_Profile: [
      { RID: 'HEL-PROF-01', Decision_Type: 'Full CAP 437 Helideck', D_Value: 22.2, MTOW: 12.6, Foam_System: 'DIFFS', Cert_Body: 'HCA / CAA', Department: 'Aviation & Helideck', Status: 'Compliant' }
    ],
    Helideck_Checks: [
      { RID: 'HEL-CHK-01', Title: 'Helideck Friction Test', Rule_ID: 'R-048', Criteria: 'Friction > 0.85 per CAP 437', Inspector: 'HCA Surveyor', Inspection_Date: '2026-10-01', Department: 'Aviation & Helideck', Status: 'Compliant' }
    ],
    Accommodation_Checks: [
      { RID: 'ACC-CHK-01', Title: 'HVAC Air Changes Check', Rule_ID: 'R-055', Criteria: 'Min 10 air changes/hour per MLC 2006', Inspector: 'HVAC Engineer', Inspection_Date: '2026-10-01', Department: 'Catering & Accommodation', Status: 'Compliant' }
    ],
    Accommodation_Capacity: [
      { RID: 'ACC-CAP-01', Total_Berths: 250, POB_Limit: 245, Allocated_Berths: 228, Approval_Ref: 'MLC 2006 Title 3', Department: 'Catering & Accommodation', Status: 'Compliant' }
    ],
    Execution: [
      { RID: 'EXE-001', Title: 'Main Deck Tensioner Commissioning', Lead_Discipline: 'Pipelay Lead', Manager: 'Construction Manager', Progress: 85, Location: 'Deck Zone A', Department: 'Pipelay Operations', Status: 'In Progress' }
    ],
    Functional: [
      { RID: 'FNC-001', Title: 'Classification Society Survey Inspection', Class_Body: 'DNV', Scope: 'Annual Hull Survey', Department: 'QA/QC', Status: 'Compliant' }
    ],
    Dependencies: [
      { RID: 'DEP-0001', Predecessor_ID: 'GATE-0', Successor_ID: 'GATE-1', Relationship_Type: 'Finish-to-Start', Lag_Days: 0, Rationale: 'Baseline readiness check', Class: 'Regulatory', Critical_Path: true, Department: 'Project Management', Status: 'Compliant' }
    ],
    Sources: [
      { RID: 'SRC-01', Title: 'SOLAS 1974 / 1988 Protocol', Authority: 'IMO', Document_Number: 'IMO-SOLAS-2020', Edition: '2020', Department: 'Marine', Status: 'Approved' }
    ],
    Supplemental_Controls: [
      { RID: 'SUP-01', Title: 'Environmental Spill Contingency Control', Control_Level: 'High', Frequency: 'Weekly', Department: 'HSE & Safety', Status: 'Compliant' }
    ],
    WPS: [
      { RID: 'WPS-01', Title: 'Hull & Marine Stability', Department: 'Marine', Status: 'Approved' }
    ],
    Rules: [
      { RID: 'R-001', Title: 'Hull Integrity Standard', WPS_ID: 'WPS-01', Department: 'Marine', Status: 'Compliant' }
    ]
  };

  Object.entries(sampleSheets).forEach(([sheetName, data]) => {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, 'PMS11_Workbook_Template_40Sheets.xlsx');
};

const parseDepartment = (val: string): Department => {
  const str = val.toLowerCase();
  if (str.includes('marine')) return 'Marine';
  if (str.includes('tech') || str.includes('maint')) return 'Technical & Maintenance';
  if (str.includes('hse') || str.includes('safe')) return 'HSE & Safety';
  if (str.includes('div')) return 'Diving Operations';
  if (str.includes('pipe') || str.includes('weld')) return 'Pipelay Operations';
  if (str.includes('cater') || str.includes('accom')) return 'Catering & Accommodation';
  if (str.includes('aviat') || str.includes('heli')) return 'Aviation & Helideck';
  if (str.includes('qa') || str.includes('qc')) return 'QA/QC';
  if (str.includes('proj') || str.includes('mgmt')) return 'Project Management';
  return 'Marine';
};

const parseStatus = (val: string): RecordStatus => {
  const str = val.toLowerCase();
  if (str.includes('comp') || str.includes('pass')) return 'Compliant';
  if (str.includes('non') || str.includes('fail')) return 'Non-Compliant';
  if (str.includes('appr')) return 'Approved';
  if (str.includes('prog')) return 'In Progress';
  if (str.includes('verif')) return 'Verified';
  if (str.includes('close')) return 'Closed';
  if (str.includes('over')) return 'Overdue';
  if (str.includes('pend')) return 'Pending Verification';
  return 'Draft';
};

const descriptionFromRow = (row: Record<string, any>): string => {
  return row['Description'] || row['Criteria'] || row['Title'] || 'Operational check item';
};
