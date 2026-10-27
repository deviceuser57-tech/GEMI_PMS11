import React, { useState } from 'react';
import { BaseRecord, SourceData } from '../../types/pms';
import { BookOpen, Plus, Search, ExternalLink, ShieldCheck } from 'lucide-react';

interface StatutorySourcesViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onOpenNewRecord: (entity?: any) => void;
  onSelectRecord: (record: BaseRecord) => void;
}

export const StatutorySourcesView: React.FC<StatutorySourcesViewProps> = ({
  records,
  isArabic,
  onOpenNewRecord,
  onSelectRecord
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const sources = records.filter(r => r.entity === 'source');

  const filtered = sources.filter(s => {
    const data: SourceData = s.data as any;
    return (
      s.rid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (data?.authority && data.authority.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (data?.source_code && data.source_code.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              INTERNATIONAL CODES
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>{isArabic ? 'المراجع والتشريعات الدولية (35 كوداً بحرياً)' : 'Statutory Sources & Marine Codes (35 Sources)'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'الكودات والاتفاقيات الدولية والوطنية المرجعية: SOLAS, MARPOL, DNV Rules, IMCA D014, ECAR Part 138 (سلطة الطيران المدني المصري ECAA), MLC 2006, API RP 2D.'
              : 'Official international maritime conventions and Egyptian Civil Aviation ECAR Part 138 standards governing closure criteria.'}
          </p>
        </div>

        <button
          onClick={() => onOpenNewRecord('source')}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>{isArabic ? 'إضافة مرجع تشريعي +' : '+ Add Marine Code'}</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={isArabic ? 'بحث باسم الكود أو جهة الإصدار (SOLAS, DNV, IMCA)...' : 'Search code or authority...'}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(src => {
          const data: SourceData = src.data as any;
          return (
            <div
              key={src.id}
              onClick={() => onSelectRecord(src)}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-5 rounded-2xl cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {data?.source_code || src.rid}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {data?.mandatory_level || 'Mandatory'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm">{src.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{src.description}</p>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isArabic ? 'السلطة المصدرة:' : 'Issuing Authority:'}</span>
                  <span className="font-semibold text-slate-200">{data?.authority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isArabic ? 'رقم الوثيقة والإصدار:' : 'Doc No & Edition:'}</span>
                  <span className="font-mono text-cyan-300">{data?.document_number} ({data?.edition_or_year})</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
