import React from 'react';
import { BaseRecord } from '../../types/pms';
import { X, Trash2, Edit3, ShieldCheck, Calendar, User, FileText, Layers, Tag } from 'lucide-react';

interface RecordDetailModalProps {
  record: BaseRecord | null;
  onClose: () => void;
  onEdit: (record: BaseRecord) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: any) => void;
  isArabic: boolean;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  isArabic
}) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {record.rid}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs">
              {record.entity}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(record)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 transition-colors"
              title="Edit Record"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(isArabic ? 'هل أنت متأكد من حذف هذا السجل نهائياً؟' : 'Are you sure you want to permanently delete this record?')) {
                  onDelete(record.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
              title="Delete Record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          <div>
            <h3 className="text-base font-bold text-white">{record.title}</h3>
            {record.description && (
              <p className="text-slate-300 mt-1 leading-relaxed">{record.description}</p>
            )}
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">{isArabic ? 'حزمة العمل التابعة' : 'Work Package'}</span>
              <span className="font-mono text-cyan-300 font-bold">{record.wps_id || 'Global'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">{isArabic ? 'القسم المسؤول' : 'Department'}</span>
              <span className="font-semibold text-slate-200">{record.department}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">{isArabic ? 'المسؤول المباشر' : 'Owner'}</span>
              <span className="font-semibold text-slate-200">{record.owner || 'Superintendent'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">{isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}</span>
              <span className="font-mono text-slate-300">{record.due_date || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">{isArabic ? 'تاريخ الانتهاء للصلاحية' : 'Expiry Date'}</span>
              <span className="font-mono text-amber-400 font-semibold">{record.expiry_date || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">{isArabic ? 'الحالة التشغيلية' : 'Status'}</span>
              <select
                value={record.status}
                onChange={e => onStatusChange(record.id, e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-cyan-300 font-bold"
              >
                <option value="OPEN">OPEN / مفتوحة</option>
                <option value="In Progress">In Progress / قيد التنفيذ</option>
                <option value="Under Review">Under Review / قيد المراجعة</option>
                <option value="Compliant">Compliant / Pass (مطابقة)</option>
                <option value="Approved">Approved / معتمدة</option>
                <option value="Verified">Verified / محققة</option>
                <option value="Non-Compliant">Non-Compliant / Fail</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Closed">Closed / مغلقة</option>
                <option value="Draft">Draft / مسودة</option>
              </select>
            </div>
          </div>

          {/* Specialized Data JSON Payload Display */}
          {record.data && Object.keys(record.data).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isArabic ? 'البيانات التخصصية للشيت (JSONB Schema Data)' : 'Specialized Worksheet Attributes'}</span>
              </h4>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 divide-y divide-slate-850">
                {Object.entries(record.data).map(([key, value]) => (
                  <div key={key} className="py-1.5 flex items-start justify-between gap-4">
                    <span className="font-mono text-[11px] text-slate-400 shrink-0 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-slate-200 font-medium text-right break-words text-[11px]">
                      {typeof value === 'boolean'
                        ? value ? 'Yes' : 'No'
                        : typeof value === 'object'
                        ? JSON.stringify(value)
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Attachments */}
          {record.evidence_ids && record.evidence_ids.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-slate-400 text-[11px] block">{isArabic ? 'الأدلة والشهادات المربوطة:' : 'Linked Evidence Documents:'}</span>
              <div className="flex flex-wrap gap-2">
                {record.evidence_ids.map(id => (
                  <span key={id} className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px]">
                    📄 {id}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Created: {new Date(record.created_at).toLocaleString()}</span>
            <span>Updated: {new Date(record.updated_at).toLocaleString()}</span>
          </div>
          {/* Attachments Section */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-500" />
              {isArabic ? 'المرفقات (صور/وثائق)' : 'Attachments (Images/Docs)'}
            </h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {(record.attachments || []).map((att, idx) => (
                <div key={idx} className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-cyan-300 font-mono text-[10px]">
                  {isArabic ? 'مرفق' : 'Att'} #{idx + 1}
                </div>
              ))}
              {(record.attachments || []).length === 0 && (
                <span className="text-xs text-slate-500 italic">{isArabic ? 'لا توجد مرفقات' : 'No attachments'}</span>
              )}
            </div>
            <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 flex items-center gap-1.5 w-fit">
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                     // In real app, convert to base64 or upload to server. Here we just add a placeholder
                     alert(isArabic ? 'تم محاكاة رفع الملف' : 'Mock file upload: ' + e.target.files[0].name);
                     onEdit({ ...record, attachments: [...(record.attachments || []), 'new_attachment'] });
                  }
                }}
              />
              {isArabic ? 'رفع مرفق جديد' : 'Upload Attachment'}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
