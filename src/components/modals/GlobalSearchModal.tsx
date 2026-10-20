import React, { useState, useEffect } from 'react';
import { BaseRecord } from '../../types/pms';
import { Search, X, ArrowRight, ShieldCheck, Users, Plane, Bed, FileText } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: BaseRecord[];
  onSelectRecord: (record: BaseRecord) => void;
  isArabic: boolean;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  records,
  onSelectRecord,
  isArabic
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? records.filter(r => {
        const q = query.toLowerCase();
        return (
          r.rid.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          r.department.toLowerCase().includes(q) ||
          r.entity.toLowerCase().includes(q) ||
          (r.data?.certificate_number && r.data.certificate_number.toLowerCase().includes(q)) ||
          (r.data?.full_name && r.data.full_name.toLowerCase().includes(q))
        );
      }).slice(0, 15)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-2">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={
              isArabic
                ? 'ابحث برمز السجل (T-01, R-048, CRW-01)، اسم الشخص، رقم الشهادة، أو الموضوع...'
                : 'Search by RID (e.g. ROLE-01, R-048, GAP-001), crew name, cert number...'
            }
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-xs text-slate-500">
              {isArabic
                ? 'اكتب للبحث الفوري في الـ 40 شيت عمل، القواعد الـ 89، والطواقم، والاعتماديات...'
                : 'Type to search across 40 sheets, 89 rules, crew certifications, and precedence links...'}
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              {isArabic ? 'لم يتم العثور على نتائج مطابقة.' : 'No matching records found.'}
            </div>
          ) : (
            results.map(record => (
              <div
                key={record.id}
                onClick={() => {
                  onSelectRecord(record);
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 flex items-center justify-between cursor-pointer transition-colors text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 shrink-0">
                    {record.rid}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-200 truncate">{record.title}</p>
                    <p className="text-[10px] text-slate-400">
                      {record.entity} • {record.department} {record.wps_id ? `• [${record.wps_id}]` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                    {record.status}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Search Footer */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 px-4">
          <span>{isArabic ? 'اضغط ESC للإغلاق' : 'Press ESC to close'}</span>
          <span>PMS-11 Global Index</span>
        </div>
      </div>
    </div>
  );
};
