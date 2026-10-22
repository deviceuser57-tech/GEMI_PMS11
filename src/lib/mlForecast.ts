import { BaseRecord, AuditLog } from '../types/pms';

/**
 * Machine learning-based heuristic to estimate Projected Completion Date
 * based on historical velocity of record status changes from audit logs.
 */
export function estimateProjectedCompletionDate(record: BaseRecord, auditLogs: AuditLog[]): { projectedDate: string; velocityDays: number; confidence: 'High' | 'Medium' | 'Low' } {
  // Calculate average daily completion velocity from audit logs
  const completionLogs = auditLogs.filter(l => l.action.toLowerCase().includes('compliant') || l.action.toLowerCase().includes('approved') || l.action.toLowerCase().includes('closed'));
  
  let velocityDays = 4.5; // default baseline days per milestone item
  if (completionLogs.length >= 5) {
    // Estimate velocity based on timestamp gaps
    const sortedDates = completionLogs.map(l => new Date(l.timestamp).getTime()).sort((a, b) => a - b);
    let totalDiffDays = 0;
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
      if (diff > 0 && diff < 30) totalDiffDays += diff;
    }
    const avg = totalDiffDays / (sortedDates.length - 1);
    if (avg > 0 && !isNaN(avg)) {
      velocityDays = Math.max(1.2, Math.min(15, avg));
    }
  }

  // Determine remaining items or work factor
  let remainingWorkFactor = 1.0;
  if (record.entity === 'wps') {
    const rate = parseInt(record.data?.completion_rate || '50');
    remainingWorkFactor = Math.max(0.1, (100 - rate) / 25); // e.g. 4 increments of 25%
  } else if (record.status === 'OPEN' || record.status === 'Open') {
    remainingWorkFactor = 2.0;
  } else if (record.status === 'In Progress') {
    remainingWorkFactor = 1.2;
  } else {
    remainingWorkFactor = 0.5;
  }

  const estimatedDaysToComplete = Math.round(velocityDays * remainingWorkFactor);
  
  const baseDate = record.due_date ? new Date(record.due_date) : new Date();
  const projectedTime = baseDate.getTime() + estimatedDaysToComplete * 24 * 60 * 60 * 1000;
  const projectedDate = new Date(projectedTime).toISOString().split('T')[0];

  const confidence: 'High' | 'Medium' | 'Low' = completionLogs.length > 10 ? 'High' : completionLogs.length > 3 ? 'Medium' : 'Low';

  return {
    projectedDate,
    velocityDays: Number(velocityDays.toFixed(1)),
    confidence
  };
}
