/**
 * Utility function for reliable cross-browser and iframe-safe printing of records and documents.
 */

export interface PrintableRecord {
  id: string;
  rid?: string;
  entity?: string;
  title?: string;
  description?: string;
  department?: string;
  assisting_departments?: string[];
  wps_id?: string;
  status?: string;
  owner?: string;
  due_date?: string;
  expiry_date?: string;
  created_at?: string;
  updated_at?: string;
  data?: Record<string, any>;
  evidence_ids?: string[];
  attachments?: string[];
}

export function triggerWindowPrint() {
  try {
    window.print();
  } catch (e) {
    console.error('Direct window.print error:', e);
  }
}

export function printRecordDetails(record: PrintableRecord, isArabic: boolean = true) {
  const title = isArabic 
    ? `نموذج سجل التفتيش المعياري - ${record.rid || record.id}`
    : `Standard Inspection Record Document - ${record.rid || record.id}`;

  const entityLabel = record.entity ? String(record.entity).toUpperCase() : 'RECORD';
  const statusLabel = record.status || 'OPEN';

  let htmlContent = '';
  try {
    const printWindow = window.open('', '_blank', 'width=850,height=900,scrollbars=yes');
    htmlContent = `
      <!DOCTYPE html>
      <html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${isArabic ? 'ar' : 'en'}">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
          * { box-sizing: border-box; }
          body {
            font-family: 'Cairo', system-ui, -apple-system, sans-serif;
            background-color: #ffffff;
            color: #0f172a;
            margin: 0;
            padding: 32px;
            font-size: 13px;
            line-height: 1.6;
          }
          .header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #0284c7;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .org-title {
            font-size: 12px;
            font-weight: 800;
            color: #0369a1;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .doc-title {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 4px;
          }
          .badge-rid {
            background: #0284c7;
            color: #ffffff;
            font-weight: 800;
            padding: 6px 14px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 14px;
          }
          .badge-status {
            display: inline-block;
            padding: 4px 10px;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            color: #334155;
            font-weight: 700;
            border-radius: 4px;
            font-size: 12px;
            margin-top: 6px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }
          .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 14px;
          }
          .card-label {
            font-size: 11px;
            color: #64748b;
            font-weight: 700;
            margin-bottom: 4px;
          }
          .card-value {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
          }
          .section-header {
            font-size: 14px;
            font-weight: 800;
            color: #0284c7;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 6px;
            margin-top: 24px;
            margin-bottom: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 24px;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 8px 12px;
            text-align: ${isArabic ? 'right' : 'left'};
          }
          th {
            background: #f1f5f9;
            font-weight: 700;
            color: #334155;
            font-size: 12px;
          }
          td {
            font-size: 12px;
          }
          .footer-note {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #cbd5e1;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #64748b;
          }
          .print-btn-bar {
            margin-bottom: 20px;
            text-align: center;
          }
          .print-btn {
            background: #0284c7;
            color: white;
            border: none;
            padding: 10px 24px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
            font-family: inherit;
          }
          @media print {
            .print-btn-bar { display: none !important; }
            body { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div className="print-btn-bar">
          <button className="print-btn" onclick="window.print();">
            ${isArabic ? '🖨️ اضغط هنا للطباعة الان' : '🖨️ Click Here to Print Now'}
          </button>
        </div>

        <div className="header-bar">
          <div>
            <div className="org-title">${isArabic ? 'منظومة إدارة التفتيش وإجابة الجودة البحرية | OFFSHORE PMS' : 'OFFSHORE PMS & SAFETY INSPECTION SYSTEM'}</div>
            <div className="doc-title">${record.title || (isArabic ? 'سجل تفتيش فني' : 'Technical Inspection Record')}</div>
          </div>
          <div style="text-align: ${isArabic ? 'left' : 'right'};">
            <div className="badge-rid">${record.rid || record.id}</div>
            <div className="badge-status">${isArabic ? 'الحالة:' : 'Status:'} ${statusLabel}</div>
          </div>
        </div>

        <div className="grid-3">
          <div className="card">
            <div className="card-label">${isArabic ? 'حزمة العمل التابعة (WPS)' : 'Work Package (WPS)'}</div>
            <div className="card-value">${record.wps_id || 'Global'}</div>
          </div>
          <div className="card">
            <div className="card-label">${isArabic ? 'نوع السجل / الكيان' : 'Entity Type'}</div>
            <div className="card-value">${entityLabel}</div>
          </div>
          <div className="card">
            <div className="card-label">${isArabic ? 'الإدارة الرئيسية' : 'Primary Department'}</div>
            <div className="card-value">${record.department || '-'}</div>
          </div>
          <div className="card">
            <div className="card-label">${isArabic ? 'المسؤول المباشر' : 'Owner'}</div>
            <div className="card-value">${record.owner || 'Superintendent'}</div>
          </div>
          <div className="card">
            <div className="card-label">${isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}</div>
            <div className="card-value">${record.due_date || 'N/A'}</div>
          </div>
          <div className="card">
            <div className="card-label">${isArabic ? 'تاريخ انتهى الصلاحية' : 'Expiry Date'}</div>
            <div className="card-value">${record.expiry_date || 'N/A'}</div>
          </div>
        </div>

        ${record.description ? `
          <div className="section-header">${isArabic ? 'تفاصيل السجل والوصف التشغيلي' : 'Record Details & Description'}</div>
          <div className="card" style="margin-bottom: 20px;">
            ${record.description}
          </div>
        ` : ''}

        ${record.data && Object.keys(record.data).length > 0 ? `
          <div className="section-header">${isArabic ? 'البيانات المعيارية والتخصصية (Attributes)' : 'Specialized Attributes'}</div>
          <table>
            <thead>
              <tr>
                <th style="width: 40%;">${isArabic ? 'البند / الخاصية' : 'Attribute Item'}</th>
                <th>${isArabic ? 'القيمة المسجلة' : 'Recorded Value'}</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(record.data).map(([k, v]) => `
                <tr>
                  <td style="font-weight: bold; font-family: monospace;">${k.replace(/_/g, ' ')}</td>
                  <td>${typeof v === 'boolean' ? (v ? '✅ نعم / Yes' : '❌ لا / No') : typeof v === 'object' ? JSON.stringify(v) : String(v)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        ${record.evidence_ids && record.evidence_ids.length > 0 ? `
          <div className="section-header">${isArabic ? 'الأدلة والوثائق المرتبطة' : 'Linked Evidence Documents'}</div>
          <div>
            ${record.evidence_ids.map(id => `<span style="display:inline-block; padding:3px 8px; margin:2px; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:4px; font-family:monospace;">📄 ${id}</span>`).join(' ')}
          </div>
        ` : ''}

        <div className="footer-note">
          <span>${isArabic ? 'تم استخراج هذا التقرير رسمياً من قاعدة البيانات البحرية' : 'Official Offshore Record Printout'}</span>
          <span>${isArabic ? 'تاريخ الطباعة:' : 'Printed on:'} ${new Date().toLocaleString(isArabic ? 'ar-SA' : 'en-US')}</span>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      printRecordViaIframe(htmlContent);
    }
  } catch (err) {
    console.error('Print window error, falling back to iframe print', err);
    printRecordViaIframe(htmlContent);
  }
}

export function printRecordViaIframe(htmlContent: string) {
  try {
    let iframe = document.getElementById('pms-print-hidden-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'pms-print-hidden-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = '0px';
      document.body.appendChild(iframe);
    }
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.print();
        }
      }, 400);
    } else {
      window.print();
    }
  } catch {
    window.print();
  }
}

export function printDocumentDetails(doc: {
  document_code?: string;
  title?: string;
  category?: string;
  department?: string;
  security_level?: string;
  upload_date?: string;
  uploaded_by?: string;
  text_content?: string;
  summary_english?: string;
}, isArabic: boolean = true) {
  try {
    const printWindow = window.open('', '_blank', 'width=850,height=900,scrollbars=yes');
    const title = isArabic
      ? `وثيقة المستودع الفني - ${doc.document_code || doc.title}`
      : `Technical Document - ${doc.document_code || doc.title}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${isArabic ? 'ar' : 'en'}">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
          * { box-sizing: border-box; }
          body {
            font-family: 'Cairo', system-ui, -apple-system, sans-serif;
            background-color: #ffffff;
            color: #0f172a;
            margin: 0;
            padding: 32px;
            font-size: 13px;
            line-height: 1.6;
          }
          .header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #0284c7;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .doc-title {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 4px;
          }
          .badge-code {
            background: #0284c7;
            color: #ffffff;
            font-weight: 800;
            padding: 6px 14px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 14px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 14px;
          }
          .card-label {
            font-size: 11px;
            color: #64748b;
            font-weight: 700;
            margin-bottom: 4px;
          }
          .card-value {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
          }
          .section-header {
            font-size: 14px;
            font-weight: 800;
            color: #0284c7;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 6px;
            margin-top: 24px;
            margin-bottom: 12px;
          }
          .print-btn-bar {
            margin-bottom: 20px;
            text-align: center;
          }
          .print-btn {
            background: #0284c7;
            color: white;
            border: none;
            padding: 10px 24px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
            font-family: inherit;
          }
          @media print {
            .print-btn-bar { display: none !important; }
            body { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div className="print-btn-bar">
          <button className="print-btn" onclick="window.print();">
            ${isArabic ? '🖨️ اضغط هنا لطباعة الوثيقة' : '🖨️ Click Here to Print Document'}
          </button>
        </div>

        <div className="header-bar">
          <div>
            <div style="font-size:12px; color:#0369a1; font-weight:800; text-transform:uppercase;">OFFSHORE TECHNICAL VAULT</div>
            <div className="doc-title">${doc.title || 'Technical Document'}</div>
          </div>
          <div>
            <span className="badge-code">${doc.document_code || 'DOC-REF'}</span>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-label">${isArabic ? 'التصنيف' : 'Category'}</div>
            <div className="card-value">${doc.category || '-'}</div>
          </div>
          <div className="card">
            <div className="card-label">${isArabic ? 'القسم المسؤول' : 'Department'}</div>
            <div className="card-value">${doc.department || '-'}</div>
          </div>
          <div className="card">
            <div className="card-label">${isArabic ? 'مستوى السرية' : 'Security Access'}</div>
            <div className="card-value">${doc.security_level || '-'}</div>
          </div>
          <div className="card">
            <div className="card-label">${isArabic ? 'معلومات الرفع' : 'Upload Info'}</div>
            <div className="card-value">${doc.uploaded_by || '-'} (${doc.upload_date || '-'})</div>
          </div>
        </div>

        ${doc.text_content ? `
          <div className="section-header">${isArabic ? 'محتوى الوثيقة' : 'Document Content Passage'}</div>
          <div className="card" style="font-family: monospace; white-space: pre-wrap;">
            ${doc.text_content}
          </div>
        ` : ''}

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          };
        </script>
      </body>
      </html>
    `;

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      window.print();
    }
  } catch (err) {
    window.print();
  }
}

