import { BaseRecord, AuditLog, WorkbookSheetInfo, Department, EntityType } from '../types/pms';
import { INITIAL_RECORDS, INITIAL_SHEETS_CATALOG, INITIAL_AUDIT_LOGS } from './mockData';

const STORAGE_KEYS = {
  RECORDS: 'pms11_records_v4',
  AUDIT_LOGS: 'pms11_audit_logs_v4',
  CATALOG: 'pms11_catalog_v4',
  LANGUAGE: 'pms11_lang_v4',
  DEPARTMENT: 'pms11_dept_v4',
  ARCHIVED_RECORDS: 'pms11_archived_v4',
};

export const getStoredRecords = (): BaseRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    }
    const parsed: BaseRecord[] = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length < INITIAL_RECORDS.length) {
      const existingRids = new Set(parsed.map(r => r.rid));
      const missing = INITIAL_RECORDS.filter(r => !existingRids.has(r.rid));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(merged));
        return merged;
      }
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load records from storage', e);
    return INITIAL_RECORDS;
  }
};

export const getStoredAuditLogs = (): AuditLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : INITIAL_AUDIT_LOGS;
  } catch (e) {
    console.error('Failed to load audit logs', e);
    return INITIAL_AUDIT_LOGS;
  }
};

export const saveAllRecords = (records: BaseRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records', e);
  }
};

export const upsertRecord = (record: BaseRecord, currentUser = 'Superintendent'): BaseRecord[] => {
  const records = getStoredRecords();
  const existingIndex = records.findIndex(r => r.id === record.id || r.rid === record.rid);

  let updatedList: BaseRecord[];
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    const oldRecord = records[existingIndex];
    const updatedRecord: BaseRecord = {
      ...oldRecord,
      ...record,
      updated_at: now
    };
    updatedList = [...records];
    updatedList[existingIndex] = updatedRecord;

    addAuditLogEntry({
      id: 'aud-' + Date.now(),
      timestamp: now,
      user: currentUser,
      action: 'UPDATE',
      record_rid: updatedRecord.rid,
      record_title: updatedRecord.title,
      details: `Record ${updatedRecord.rid} updated with status: ${updatedRecord.status}`
    });
  } else {
    const newRecord: BaseRecord = {
      ...record,
      created_at: now,
      updated_at: now
    };
    updatedList = [newRecord, ...records];

    addAuditLogEntry({
      id: 'aud-' + Date.now(),
      timestamp: now,
      user: currentUser,
      action: 'CREATE',
      record_rid: newRecord.rid,
      record_title: newRecord.title,
      details: `New entity ${newRecord.entity} created under ${newRecord.department}`
    });
  }

  saveAllRecords(updatedList);
  return updatedList;
};

export const removeRecord = (id: string, currentUser = 'Superintendent'): BaseRecord[] => {
  const records = getStoredRecords();
  const target = records.find(r => r.id === id);
  const filtered = records.filter(r => r.id !== id);
  saveAllRecords(filtered);

  if (target) {
    addAuditLogEntry({
      id: 'aud-' + Date.now(),
      timestamp: new Date().toISOString(),
      user: currentUser,
      action: 'DELETE',
      record_rid: target.rid,
      record_title: target.title,
      details: `Deleted record ${target.rid}`
    });
  }
  return filtered;
};

export const getArchivedRecords = (): BaseRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ARCHIVED_RECORDS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const archiveRecord = (recordId: string) => {
  const records = getStoredRecords();
  const archived = getArchivedRecords();
  const recordIndex = records.findIndex(r => r.id === recordId);
  if (recordIndex === -1) return;

  const record = records[recordIndex];
  const newRecords = records.filter(r => r.id !== recordId);
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(newRecords));
  localStorage.setItem(STORAGE_KEYS.ARCHIVED_RECORDS, JSON.stringify([...archived, record]));
};

export const restoreRecord = (recordId: string) => {
  const records = getStoredRecords();
  const archived = getArchivedRecords();
  const recordIndex = archived.findIndex(r => r.id === recordId);
  if (recordIndex === -1) return;

  const record = archived[recordIndex];
  const newArchived = archived.filter(r => r.id !== recordId);
  localStorage.setItem(STORAGE_KEYS.ARCHIVED_RECORDS, JSON.stringify(newArchived));
  saveAllRecords([...records, record]);
};

export const checkAndArchiveRecords = (records: BaseRecord[]): BaseRecord[] => {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  const toArchive = records.filter(r => r.status === 'Closed' && new Date(r.updated_at) < ninetyDaysAgo);
  if (toArchive.length === 0) return records;

  const remaining = records.filter(r => !(r.status === 'Closed' && new Date(r.updated_at) < ninetyDaysAgo));
  const archived = getArchivedRecords();
  
  localStorage.setItem(STORAGE_KEYS.ARCHIVED_RECORDS, JSON.stringify([...archived, ...toArchive]));
  saveAllRecords(remaining);
  return remaining;
};

export const addAuditLogEntry = (entry: AuditLog) => {
  try {
    const logs = getStoredAuditLogs();
    const updated = [entry, ...logs].slice(0, 200);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to log audit entry', e);
  }
};

export const getStoredCatalog = (): WorkbookSheetInfo[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATALOG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(INITIAL_SHEETS_CATALOG));
      return INITIAL_SHEETS_CATALOG;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_SHEETS_CATALOG;
  }
};

export const resetSystemData = () => {
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(INITIAL_SHEETS_CATALOG));
};

export interface DashboardMetrics {
  totalWps: number;
  wpsCompliantCount: number;
  wpsProgressPercent: number;
  wpsPlannedPercent: number;
  totalRules: number;
  rulesCompliantCount: number;
  rulesProgressPercent: number;
  rulesPlannedPercent: number;
  openGapsCount: number;
  criticalGapsCount: number;
  totalCrewCount: number;
  crewCertificatesExpiring30Days: number;
  crewCertificatesExpiring60Days: number;
  crewCertificatesExpired: number;
  pobCurrent: number;
  pobLimit: number;
  pobUtilizationPercent: number;
  helideckStatus: string;
  helideckCompliantChecks: number;
  helideckTotalChecks: number;
  helideckPlannedPercent: number;
  helideckActualPercent: number;
  accommodationPlannedPercent: number;
  accommodationActualPercent: number;
  gatesProgress: {
    gateRid: string;
    gateTitle: string;
    readiness: number;
    plannedReadiness: number;
    variance: number;
    status: string;
  }[];
  departmentBreakdown: {
    department: Department;
    recordCount: number;
    complianceRate: number;
    plannedRate: number;
    variance: number;
  }[];
}

export const computeDashboardMetrics = (records: BaseRecord[]): DashboardMetrics => {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  // WPS
  const wpsRecords = records.filter(r => r.entity === 'wps');
  const wpsCompliant = wpsRecords.filter(r => r.status === 'Compliant' || r.status === 'Approved');
  const wpsPercent = wpsRecords.length > 0 ? Math.round((wpsCompliant.length / wpsRecords.length) * 100) : 0;
  const wpsPlannedPercent = 88; // Target baseline planned schedule

  // Rules
  const ruleRecords = records.filter(r => r.entity === 'rule');
  const rulesCompliant = ruleRecords.filter(r => r.status === 'Compliant');
  const rulesPercent = ruleRecords.length > 0 ? Math.round((rulesCompliant.length / ruleRecords.length) * 100) : 0;
  const rulesPlannedPercent = 95;

  // Gaps
  const gaps = records.filter(r => r.entity === 'gap');
  const openGaps = gaps.filter(g => g.status !== 'Closed');
  const criticalGaps = openGaps.filter(g => g.data?.severity === 'Critical' || g.data?.severity === 'High');

  // Crew & Certs
  const crewMembers = records.filter(r => r.entity === 'crew_member');
  const certs = records.filter(r => r.entity === 'crew_certificate');
  let certsExp30 = 0;
  let certsExp60 = 0;
  let certsExpired = 0;

  certs.forEach(c => {
    if (c.expiry_date) {
      const exp = new Date(c.expiry_date);
      if (exp < now) {
        certsExpired++;
      } else if (exp <= in30Days) {
        certsExp30++;
      } else if (exp <= in60Days) {
        certsExp60++;
      }
    }
  });

  // Accommodation (MLC 2006 Living Quarters & POB - Completely Separate)
  const accomCap = records.find(r => r.entity === 'accommodation_capacity');
  const pobCurrent = accomCap?.data?.allocated_berths || 228;
  const pobLimit = accomCap?.data?.pob_limit || 245;
  const pobUtilization = Math.round((pobCurrent / pobLimit) * 100);
  const accommodationPlannedPercent = 92;
  const accommodationActualPercent = pobUtilization > 100 ? 98 : 91;

  // Helideck (CAP 437 Aviation & Helideck - Completely Separate)
  const heliProf = records.find(r => r.entity === 'helideck_profile');
  const heliChecks = records.filter(r => r.entity === 'helideck_check');
  const heliCompliantChecks = heliChecks.filter(c => c.status === 'Compliant' || c.data?.inspection_status === 'Compliant');
  const helideckStatus = heliProf?.status || (heliCompliantChecks.length === heliChecks.length ? 'Compliant' : 'Conditional');
  const helideckPlannedPercent = 95;
  const helideckActualPercent = heliChecks.length > 0 ? Math.round((heliCompliantChecks.length / heliChecks.length) * 100) : 80;

  // Gates (Planned vs Actual)
  const gateRecords = records
    .filter(r => r.entity === 'gate')
    .sort((a, b) => (a.data?.gate_number ?? 0) - (b.data?.gate_number ?? 0));

  const plannedGateTargets: Record<string, number> = {
    'G-00': 100, 'G-01': 95, 'G-02': 85, 'G-03': 75, 'G-04': 65, 'G-05': 50, 'G-06': 40, 'G-07': 30, 'G-08': 20
  };

  const gatesProgress = gateRecords.map(g => {
    const readiness = g.data?.readiness_score ?? (g.status === 'Approved' ? 100 : g.status === 'In Progress' ? 70 : 30);
    const plannedReadiness = plannedGateTargets[g.rid] || 80;
    return {
      gateRid: g.rid,
      gateTitle: g.title,
      readiness,
      plannedReadiness,
      variance: readiness - plannedReadiness,
      status: g.status
    };
  });

  // Department Breakdown (Planned vs Actual)
  const depts: Department[] = [
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

  const plannedDeptRates: Record<Department, number> = {
    'Marine': 90,
    'Technical & Maintenance': 85,
    'HSE & Safety': 95,
    'Diving Operations': 80,
    'Pipelay Operations': 88,
    'Catering & Accommodation': 92,
    'Aviation & Helideck': 94,
    'QA/QC': 90,
    'Project Management': 86,
    'All': 90
  };

  const departmentBreakdown = depts.map(dept => {
    const deptRecords = records.filter(r => r.department === dept);
    const compliant = deptRecords.filter(r => r.status === 'Compliant' || r.status === 'Approved' || r.status === 'Verified');
    const complianceRate = deptRecords.length > 0 ? Math.round((compliant.length / deptRecords.length) * 100) : 100;
    const plannedRate = plannedDeptRates[dept] || 85;
    return {
      department: dept,
      recordCount: deptRecords.length,
      complianceRate,
      plannedRate,
      variance: complianceRate - plannedRate
    };
  });

  return {
    totalWps: wpsRecords.length,
    wpsCompliantCount: wpsCompliant.length,
    wpsProgressPercent: wpsPercent,
    wpsPlannedPercent,
    totalRules: ruleRecords.length,
    rulesCompliantCount: rulesCompliant.length,
    rulesProgressPercent: rulesPercent,
    rulesPlannedPercent,
    openGapsCount: openGaps.length,
    criticalGapsCount: criticalGaps.length,
    totalCrewCount: crewMembers.length,
    crewCertificatesExpiring30Days: certsExp30,
    crewCertificatesExpiring60Days: certsExp60,
    crewCertificatesExpired: certsExpired,
    pobCurrent,
    pobLimit,
    pobUtilizationPercent: pobUtilization,
    helideckStatus,
    helideckCompliantChecks: heliCompliantChecks.length,
    helideckTotalChecks: heliChecks.length,
    helideckPlannedPercent,
    helideckActualPercent,
    accommodationPlannedPercent,
    accommodationActualPercent,
    gatesProgress,
    departmentBreakdown
  };
};
