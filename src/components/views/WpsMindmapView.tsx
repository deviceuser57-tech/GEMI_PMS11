import React, { useState, useMemo } from 'react';
import { BaseRecord } from '../../types/pms';
import {
  GitBranch,
  Boxes,
  ShieldCheck,
  Activity,
  FileText,
  FileCheck2,
  AlertTriangle,
  ChevronRight,
  Eye,
  CheckCircle2,
  X,
  QrCode,
  FolderTree,
  CheckSquare,
  Square,
  Layers,
  Plus,
  Minus
} from 'lucide-react';
import { useGsapPageReveal } from '../../lib/animations';

interface WpsMindmapViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onSelectRecord: (record: BaseRecord) => void;
  onShowQrModal?: (record: BaseRecord) => void;
}

export const WpsMindmapView: React.FC<WpsMindmapViewProps> = ({
  records,
  isArabic,
  onSelectRecord,
  onShowQrModal
}) => {
  // Active Toggled ON WPS Packages (Set of WPS RIDs, default 'WPS-01' ON)
  const [activeToggledWps, setActiveToggledWps] = useState<Record<string, boolean>>({
    'WPS-01': true
  });

  // Active Toggled Branches within each WPS (e.g. "WPS-01-deliverables": true)
  const [activeToggledBranches, setActiveToggledBranches] = useState<Record<string, boolean>>({
    'WPS-01-deliverables': true,
    'WPS-01-tasks': true,
    'WPS-01-gates': true
  });

  const [selectedNodeRecord, setSelectedNodeRecord] = useState<BaseRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useGsapPageReveal();

  // All WPS records sorted
  const wpsRecords = useMemo(() => {
    return records
      .filter(r => r.entity === 'wps')
      .sort((a, b) => a.rid.localeCompare(b.rid));
  }, [records]);

  const filteredWpsRecords = useMemo(() => {
    if (!searchQuery.trim()) return wpsRecords;
    const q = searchQuery.toLowerCase();
    return wpsRecords.filter(w => w.rid.toLowerCase().includes(q) || w.title.toLowerCase().includes(q));
  }, [wpsRecords, searchQuery]);

  const toggleWpsOn = (wpsRid: string) => {
    setActiveToggledWps(prev => ({
      ...prev,
      [wpsRid]: !prev[wpsRid]
    }));
  };

  const toggleBranchOn = (branchKey: string) => {
    setActiveToggledBranches(prev => ({
      ...prev,
      [branchKey]: !prev[branchKey]
    }));
  };

  const getBranchIcon = (category: string) => {
    switch (category) {
      case 'deliverables': return <FileText className="w-4 h-4 text-indigo-400" />;
      case 'tasks': return <Activity className="w-4 h-4 text-teal-400" />;
      case 'acceptance': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'gates': return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      case 'evidence': return <FileCheck2 className="w-4 h-4 text-blue-400" />;
      case 'gaps': return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default: return <GitBranch className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 gsap-card">
      {/* View Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <FolderTree className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>{isArabic ? 'خريطة الشجرة التفاعلية المتسلسلة (Interactive Step-by-Step WPS Mindmap)' : 'Step-by-Step Interactive WPS Node Mindmap'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  ON / OFF HIERARCHY
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isArabic
                  ? 'انقر لتفعيل حزمة الـ WPS (ON/OFF) لاستعراض فروع المخرجات والمهام والمعايير، ثم انقر على الفروع لتوسيع العناصر الفرعية التابعة لها'
                  : 'Toggle WPS packages ON to reveal category branches, then toggle branches to expand sub-elements'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'تصفية وحزمة WPS...' : 'Filter WPS packages...'}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Main Grid: Mindmap Canvas (3 Cols) + Summary Side Panel (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mindmap Interactive Canvas */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="space-y-4">
            {filteredWpsRecords.map(wps => {
              const isWpsOn = !!activeToggledWps[wps.rid];

              // Filter sub-elements for this WPS
              const deliverables = records.filter(r => r.entity === 'deliverable' && r.wps_id === wps.rid);
              const tasks = records.filter(r => (r.entity === 'task' || r.entity === 'execution' || r.entity === 'activity') && r.wps_id === wps.rid);
              const acceptance = records.filter(r => r.entity === 'acceptance' && (r.wps_id === wps.rid || r.data?.wps_id === wps.rid));
              const gates = records.filter(r => r.entity === 'gate' && (r.wps_id === wps.rid || r.data?.wps_id === wps.rid || true)).slice(0, 4);
              const gaps = records.filter(r => r.entity === 'gap' && (r.wps_id === wps.rid || r.data?.wps_id === wps.rid));
              const evidence = records.filter(r => r.entity === 'evidence' && r.wps_id === wps.rid);

              return (
                <div
                  key={wps.id}
                  className={`rounded-2xl border transition-all space-y-4 p-4 ${
                    isWpsOn
                      ? 'bg-slate-950/90 border-cyan-500/80 shadow-2xl shadow-cyan-950/40'
                      : 'bg-slate-950/40 border-slate-800 opacity-75 hover:opacity-100 hover:border-slate-700'
                  }`}
                >
                  {/* Root WPS Node Toggle Bar */}
                  <div
                    onClick={() => toggleWpsOn(wps.rid)}
                    className="flex items-center justify-between gap-3 cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border transition-colors ${isWpsOn ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                        {isWpsOn ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {wps.rid}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${isWpsOn ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>
                            {isWpsOn ? 'NODE ON' : 'NODE OFF'}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors mt-0.5">
                          {wps.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {wps.status}
                      </span>

                      <button className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
                        {isWpsOn ? <Minus className="w-4 h-4 text-cyan-400" /> : <Plus className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  {/* FIRST LEVEL CATEGORY BRANCHES (Revealed when WPS is ON) */}
                  {isWpsOn && (
                    <div className="pt-3 border-t border-slate-800/80 pl-4 space-y-4 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* 1. Deliverables Branch */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
                          <div
                            onClick={() => toggleBranchOn(`${wps.rid}-deliverables`)}
                            className="flex items-center justify-between cursor-pointer select-none group"
                          >
                            <div className="flex items-center gap-2">
                              {getBranchIcon('deliverables')}
                              <span className="font-bold text-xs text-white group-hover:text-indigo-300">
                                {isArabic ? 'المخرجات الهندسية' : 'Deliverables'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-950 text-indigo-300 border border-slate-800">
                              {deliverables.length} Items
                            </span>
                          </div>

                          {/* SECOND LEVEL SUB-ELEMENTS (Revealed when Deliverables Branch is ON) */}
                          {activeToggledBranches[`${wps.rid}-deliverables`] && (
                            <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                              {deliverables.length === 0 ? (
                                <p className="text-[10px] text-slate-500 italic text-center py-2">No deliverables</p>
                              ) : (
                                deliverables.map(item => (
                                  <div
                                    key={item.id}
                                    onClick={() => {
                                      setSelectedNodeRecord(item);
                                      onSelectRecord(item);
                                    }}
                                    className="p-2 rounded-lg bg-slate-950 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-700 transition-all cursor-pointer flex items-center justify-between text-[11px]"
                                  >
                                    <div className="space-y-0.5 truncate pr-2">
                                      <span className="font-mono text-[9px] text-indigo-300 font-bold">[{item.rid}]</span>
                                      <p className="font-semibold text-slate-200 truncate">{item.title}</p>
                                    </div>
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                                      {item.status}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        {/* 2. Tasks Branch */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
                          <div
                            onClick={() => toggleBranchOn(`${wps.rid}-tasks`)}
                            className="flex items-center justify-between cursor-pointer select-none group"
                          >
                            <div className="flex items-center gap-2">
                              {getBranchIcon('tasks')}
                              <span className="font-bold text-xs text-white group-hover:text-teal-300">
                                {isArabic ? 'المهام التشغيلية' : 'Tasks & Activities'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-950 text-teal-300 border border-slate-800">
                              {tasks.length} Items
                            </span>
                          </div>

                          {/* SECOND LEVEL SUB-ELEMENTS */}
                          {activeToggledBranches[`${wps.rid}-tasks`] && (
                            <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                              {tasks.length === 0 ? (
                                <p className="text-[10px] text-slate-500 italic text-center py-2">No tasks</p>
                              ) : (
                                tasks.map(item => (
                                  <div
                                    key={item.id}
                                    onClick={() => {
                                      setSelectedNodeRecord(item);
                                      onSelectRecord(item);
                                    }}
                                    className="p-2 rounded-lg bg-slate-950 hover:bg-teal-950/60 border border-slate-800 hover:border-teal-700 transition-all cursor-pointer flex items-center justify-between text-[11px]"
                                  >
                                    <div className="space-y-0.5 truncate pr-2">
                                      <span className="font-mono text-[9px] text-teal-300 font-bold">[{item.rid}]</span>
                                      <p className="font-semibold text-slate-200 truncate">{item.title}</p>
                                    </div>
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                                      {item.status}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        {/* 3. Acceptance Criteria Branch */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
                          <div
                            onClick={() => toggleBranchOn(`${wps.rid}-acceptance`)}
                            className="flex items-center justify-between cursor-pointer select-none group"
                          >
                            <div className="flex items-center gap-2">
                              {getBranchIcon('acceptance')}
                              <span className="font-bold text-xs text-white group-hover:text-emerald-300">
                                {isArabic ? 'معايير القبول' : 'Acceptance Criteria'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-950 text-emerald-300 border border-slate-800">
                              {acceptance.length} Items
                            </span>
                          </div>

                          {/* SECOND LEVEL SUB-ELEMENTS */}
                          {activeToggledBranches[`${wps.rid}-acceptance`] && (
                            <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                              {acceptance.length === 0 ? (
                                <p className="text-[10px] text-slate-500 italic text-center py-2">No acceptance criteria</p>
                              ) : (
                                acceptance.map(item => (
                                  <div
                                    key={item.id}
                                    onClick={() => {
                                      setSelectedNodeRecord(item);
                                      onSelectRecord(item);
                                    }}
                                    className="p-2 rounded-lg bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-700 transition-all cursor-pointer flex items-center justify-between text-[11px]"
                                  >
                                    <div className="space-y-0.5 truncate pr-2">
                                      <span className="font-mono text-[9px] text-emerald-300 font-bold">[{item.rid}]</span>
                                      <p className="font-semibold text-slate-200 truncate">{item.title}</p>
                                    </div>
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                                      {item.status}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        {/* 4. Gates Preconditions Branch */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
                          <div
                            onClick={() => toggleBranchOn(`${wps.rid}-gates`)}
                            className="flex items-center justify-between cursor-pointer select-none group"
                          >
                            <div className="flex items-center gap-2">
                              {getBranchIcon('gates')}
                              <span className="font-bold text-xs text-white group-hover:text-amber-300">
                                {isArabic ? 'بوابات الامتثال' : 'Gates Preconditions'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-950 text-amber-300 border border-slate-800">
                              {gates.length} Gates
                            </span>
                          </div>

                          {/* SECOND LEVEL SUB-ELEMENTS */}
                          {activeToggledBranches[`${wps.rid}-gates`] && (
                            <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                              {gates.map(item => (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    setSelectedNodeRecord(item);
                                    onSelectRecord(item);
                                  }}
                                  className="p-2 rounded-lg bg-slate-950 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-700 transition-all cursor-pointer flex items-center justify-between text-[11px]"
                                >
                                  <div className="space-y-0.5 truncate pr-2">
                                    <span className="font-mono text-[9px] text-amber-300 font-bold">[{item.rid}]</span>
                                    <p className="font-semibold text-slate-200 truncate">{item.title}</p>
                                  </div>
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                                    {item.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 5. Gaps & Findings Branch */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
                          <div
                            onClick={() => toggleBranchOn(`${wps.rid}-gaps`)}
                            className="flex items-center justify-between cursor-pointer select-none group"
                          >
                            <div className="flex items-center gap-2">
                              {getBranchIcon('gaps')}
                              <span className="font-bold text-xs text-white group-hover:text-rose-300">
                                {isArabic ? 'الفجوات والملاحظات' : 'Gaps & Findings'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-950 text-rose-300 border border-slate-800">
                              {gaps.length} Gaps
                            </span>
                          </div>

                          {/* SECOND LEVEL SUB-ELEMENTS */}
                          {activeToggledBranches[`${wps.rid}-gaps`] && (
                            <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                              {gaps.length === 0 ? (
                                <p className="text-[10px] text-slate-500 italic text-center py-2">No open gaps</p>
                              ) : (
                                gaps.map(item => (
                                  <div
                                    key={item.id}
                                    onClick={() => {
                                      setSelectedNodeRecord(item);
                                      onSelectRecord(item);
                                    }}
                                    className="p-2 rounded-lg bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-700 transition-all cursor-pointer flex items-center justify-between text-[11px]"
                                  >
                                    <div className="space-y-0.5 truncate pr-2">
                                      <span className="font-mono text-[9px] text-rose-300 font-bold">[{item.rid}]</span>
                                      <p className="font-semibold text-slate-200 truncate">{item.title}</p>
                                    </div>
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                                      {item.status}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        {/* 6. Evidence Proofs Branch */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
                          <div
                            onClick={() => toggleBranchOn(`${wps.rid}-evidence`)}
                            className="flex items-center justify-between cursor-pointer select-none group"
                          >
                            <div className="flex items-center gap-2">
                              {getBranchIcon('evidence')}
                              <span className="font-bold text-xs text-white group-hover:text-blue-300">
                                {isArabic ? 'الأدلة والشهادات' : 'Evidence Vault'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-950 text-blue-300 border border-slate-800">
                              {evidence.length} Files
                            </span>
                          </div>

                          {/* SECOND LEVEL SUB-ELEMENTS */}
                          {activeToggledBranches[`${wps.rid}-evidence`] && (
                            <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                              {evidence.length === 0 ? (
                                <p className="text-[10px] text-slate-500 italic text-center py-2">No uploaded proofs</p>
                              ) : (
                                evidence.map(item => (
                                  <div
                                    key={item.id}
                                    onClick={() => {
                                      setSelectedNodeRecord(item);
                                      onSelectRecord(item);
                                    }}
                                    className="p-2 rounded-lg bg-slate-950 hover:bg-blue-950/60 border border-slate-800 hover:border-blue-700 transition-all cursor-pointer flex items-center justify-between text-[11px]"
                                  >
                                    <div className="space-y-0.5 truncate pr-2">
                                      <span className="font-mono text-[9px] text-blue-300 font-bold">[{item.rid}]</span>
                                      <p className="font-semibold text-slate-200 truncate">{item.title}</p>
                                    </div>
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                                      {item.status}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Summary Side Panel (1 Column) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 flex flex-col h-full">
          {selectedNodeRecord ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {selectedNodeRecord.rid}
                </span>
                <button
                  onClick={() => setSelectedNodeRecord(null)}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                  {selectedNodeRecord.entity} • {selectedNodeRecord.department}
                </span>
                <h3 className="font-bold text-sm text-white leading-snug">
                  {selectedNodeRecord.title}
                </h3>
                {selectedNodeRecord.description && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-4 leading-relaxed">
                    {selectedNodeRecord.description}
                  </p>
                )}
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isArabic ? 'الحالة التشغيلية:' : 'Status:'}</span>
                  <span className="font-bold text-cyan-300 font-mono px-2 py-0.5 bg-cyan-950 rounded border border-cyan-800 text-[11px]">
                    {selectedNodeRecord.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isArabic ? 'حزمة العمل:' : 'WPS Package:'}</span>
                  <span className="font-mono font-bold text-slate-200">{selectedNodeRecord.wps_id || 'Global'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isArabic ? 'المسؤول:' : 'Owner:'}</span>
                  <span className="font-semibold text-slate-200">{selectedNodeRecord.owner || 'Superintendent'}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onSelectRecord(selectedNodeRecord)}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Eye className="w-4 h-4" />
                  <span>{isArabic ? 'فتح تفاصيل السجل' : 'View Record Detail'}</span>
                </button>

                {onShowQrModal && (
                  <button
                    onClick={() => onShowQrModal(selectedNodeRecord)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{isArabic ? 'بطاقة الـ QR' : 'Generate Asset QR'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 space-y-3 text-slate-400 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                <FolderTree className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-xs text-white">
                {isArabic ? 'ملخص العقد والسجلات' : 'Node Summary Panel'}
              </h4>
              <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                {isArabic
                  ? 'اختر حزمة WPS وفعّلها (ON) لاستعراض الفروع الفرعية والنقر على العقد لمعاينة تفاصيلها هنا'
                  : 'Toggle any WPS node ON to reveal category branches and inspect record details here'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
