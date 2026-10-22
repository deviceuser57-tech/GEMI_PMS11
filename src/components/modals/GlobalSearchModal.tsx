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
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pms_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
        const content = [
          r.rid,
          r.title,
          r.description || '',
          r.department,
          r.entity,
          r.data?.certificate_number || '',
          r.data?.full_name || ''
        ].join(' ').toLowerCase();
        
        // Simple fuzzy match: all query words must be present in content
        const queryWords = q.split(' ');
        return queryWords.every(word => content.includes(word));
      }).slice(0, 15)
    : [];

  const handleSelect = (record: BaseRecord) => {
    if (query.trim() && !recentSearches.includes(query.trim())) {
      const newRecent = [query.trim(), ...recentSearches].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('pms_recent_searches', JSON.stringify(newRecent));
    }
    onSelectRecord(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-2">
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={
              isArabic
                ? 'ابحث بالوصف، المعرف، أو البيانات...'
                : 'Search by description, RID, title, or metadata...'
            }
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {query.trim() === '' ? (
            <div className="p-2">
              {recentSearches.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] uppercase text-slate-500 font-bold px-3 mb-1">
                    {isArabic ? 'عمليات البحث الأخيرة' : 'Recent Searches'}
                  </p>
                  {recentSearches.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(s)}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div className="p-4 text-center text-xs text-slate-500">
                {isArabic
                  ? 'اكتب للبحث الفوري في الـ 40 شيت عمل، القواعد الـ 89، والطواقم...'
                  : 'Type to search across 40 sheets, 89 rules, crew certifications, and metadata...'}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              {isArabic ? 'لم يتم العثور على نتائج مطابقة.' : 'No matching records found.'}
            </div>
          ) : (
            results.map(record => (
              <div
                key={record.id}
                onClick={() => handleSelect(record)}
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 flex items-center justify-between cursor-pointer transition-colors text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 shrink-0">
                    {record.rid}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-200 truncate">{record.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {record.description || ''}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {record.entity} • {record.department}
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

        <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 px-4">
          <span>{isArabic ? 'اضغط ESC للإغلاق' : 'Press ESC to close'}</span>
          <span>PMS-11 Global Index</span>
        </div>
      </div>
    </div>
  );
};
