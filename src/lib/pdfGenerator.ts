import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BaseRecord, WorkbookSheetInfo } from '../types/pms';

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
