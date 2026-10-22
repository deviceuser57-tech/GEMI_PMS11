import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BaseRecord, WorkbookSheetInfo, AuditLog } from '../types/pms';

export const generateMonthlyReport = (
  catalog: WorkbookSheetInfo[],
  records: BaseRecord[],
  isArabic: boolean
) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text(isArabic ? 'تقرير الأداء الشهري' : 'Monthly Performance Report', 14, 20);
  
  doc.setFontSize(12);
  doc.text(new Date().toLocaleDateString(), 14, 30);

  // Summary Table
  const tableData = catalog.map(sheet => {
    const sheetRecords = records.filter(r => 
      r.entity === sheet.targetEntity || 
      r.entity?.toLowerCase() === sheet.sheetName?.toLowerCase() ||
      (sheet.sheetName?.toLowerCase().includes('wps') && r.entity === 'wps')
    );
    const completed = sheetRecords.filter(r => r.status === 'Closed' || r.status === 'Compliant' || r.status === 'Approved').length;
    return [
      sheet.sheetName,
      sheetRecords.length,
      completed,
      sheetRecords.length > 0 ? Math.round((completed / sheetRecords.length) * 100) + '%' : '0%'
    ];
  });

  (doc as any).autoTable({
    startY: 40,
    head: [[
      isArabic ? 'الشيت' : 'Sheet',
      isArabic ? 'الإجمالي' : 'Total',
      isArabic ? 'المكتمل' : 'Completed',
      isArabic ? 'النسبة' : 'Progress'
    ]],
    body: tableData,
  });

  doc.save('Monthly_Performance_Report.pdf');
};

export const generateSheetReport = (
  sheetName: string,
  records: BaseRecord[],
  isArabic: boolean
) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(isArabic ? `تقرير شيت العمل: ${sheetName}` : `Worksheet Report: ${sheetName}`, 14, 20);
  
  doc.setFontSize(10);
  doc.text(`${isArabic ? 'تاريخ التقرير:' : 'Generated:'} ${new Date().toLocaleString()}`, 14, 28);

  const tableData = records.map(r => [
    r.rid,
    r.title,
    r.department,
    r.status,
    r.due_date || 'N/A'
  ]);

  (doc as any).autoTable({
    startY: 35,
    head: [[
      isArabic ? 'المعرف' : 'RID',
      isArabic ? 'العنوان' : 'Title',
      isArabic ? 'القسم' : 'Department',
      isArabic ? 'الحالة' : 'Status',
      isArabic ? 'تاريخ الاستحقاق' : 'Due Date'
    ]],
    body: tableData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 23, 42] }
  });

  doc.save(`Sheet_${sheetName}_Report.pdf`);
};

export const generateAuditLogsReport = (
  auditLogs: AuditLog[],
  isArabic: boolean
) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(isArabic ? 'تقرير سجلات التدقيق والمراقبة' : 'Audit Trail & Compliance Log Report', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`${isArabic ? 'تاريخ التقرير:' : 'Generated:'} ${new Date().toLocaleString()}`, 14, 28);

  const tableData = auditLogs.map(log => [
    new Date(log.timestamp).toLocaleString(),
    log.user,
    log.action,
    log.record_rid,
    log.details
  ]);

  (doc as any).autoTable({
    startY: 35,
    head: [[
      isArabic ? 'الوقت' : 'Timestamp',
      isArabic ? 'المستخدم' : 'User',
      isArabic ? 'الإجراء' : 'Action',
      isArabic ? 'السجل' : 'Record',
      isArabic ? 'التفاصيل' : 'Details'
    ]],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 23, 42] }
  });

  doc.save('Audit_Logs_Report.pdf');
};
