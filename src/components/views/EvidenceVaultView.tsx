import React, { useState } from 'react';
import { BaseRecord } from '../../types/pms';
import { FileCheck2, Plus, Search, Download, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface EvidenceVaultViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onOpenNewRecord: (entity?: any) => void;
  onSelectRecord: (record: BaseRecord) => void;
}

export const EvidenceVaultView: React.FC<EvidenceVaultViewProps> = ({
  records,
  isArabic,
  onOpenNewRecord,
  onSelectRecord
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const evidenceList = records.filter(r => r.entity === 'evidence');

  const filtered = evidenceList.filter(e => {
    return (
      e.rid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.data?.file_name && e.data.file_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.data?.issuing_body && e.data.issuing_body.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              CHAIN OF CUSTODY
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
              <span>{isArabic ? 'مستودع الأدلة والوثائق الثبوتية المعتمدة' : 'Official Evidence & Document Vault'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'شهادات التفتيش، تقارير الفحص المخبري، وأدلة الامتثال الرسمية المربوطة بحزم العمل والقواعد الـ 89.'
              : 'Certified test reports, classification certificates, and evidence files proving compliance for gates closure.'}
          </p>
        </div>

        <button
          onClick={() => onOpenNewRecord('evidence')}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>{isArabic ? 'إيداع دليل ثبوتي جديد +' : '+ Deposit Evidence'}</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={isArabic ? 'بحث بالاسم، اسم الملف، أو جهة الإصدار...' : 'Search evidence, file name, or issuer...'}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(ev => (
          <div
            key={ev.id}
            onClick={() => onSelectRecord(ev)}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl cursor-pointer transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                {ev.rid}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 text-xs sm:text-sm line-clamp-1">{ev.title}</h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{ev.description}</p>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] text-slate-200 truncate font-semibold">
                  {ev.data?.file_name || `${ev.rid}_Official_Doc.pdf`}
                </p>
                <p className="text-[10px] text-slate-400">
                  {ev.data?.issuing_body || 'Accredited Authority'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-mono text-cyan-400">{ev.wps_id || 'General'}</span>
              <span className="text-slate-300 font-mono">{ev.data?.verification_seal || 'CERTIFIED'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
