import React, { useState } from 'react';
import { BaseRecord } from '../../types/pms';
import { GitCommit, Calendar, Clock, CheckCircle2, AlertCircle, Filter, ChevronRight } from 'lucide-react';

interface GanttTimelineViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onSelectRecord: (record: BaseRecord) => void;
}

export const GanttTimelineView: React.FC<GanttTimelineViewProps> = ({
  records,
  isArabic,
  onSelectRecord
}) => {
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter records with dates or milestones (WPS, Gates, Tasks, Execution)
  const timelineRecords = records.filter(r => {
    const matchesFilter = selectedEntityFilter === 'all' || r.entity === selectedEntityFilter;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.rid.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch && (r.due_date || r.created_at);
  }).sort((a, b) => new Date(a.due_date || a.created_at).getTime() - new Date(b.due_date || b.created_at).getTime());

  const wpsList = records.filter(r => r.entity === 'wps');

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-cyan-400 rotate-90" />
            {isArabic ? 'مخطط جانت والجدول الزمني للـ WPS والمعالم (Gantt Timeline)' : 'WPS & Milestone Gantt Timeline'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'تصور بصري لتقدم حزم العمل والبوابات والمهام بناءً على تواريخ الاستحقاق وحالة الإنجاز.'
              : 'Visual schedule and progress milestone tracking for work packages, gates, and tasks.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder={isArabic ? 'بحث في المعالم...' : 'Search milestones...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={selectedEntityFilter}
            onChange={e => setSelectedEntityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">{isArabic ? 'جميع الكيانات' : 'All Entities'}</option>
            <option value="wps">{isArabic ? 'حزم العمل (WPS)' : 'Work Packages (WPS)'}</option>
            <option value="gate">{isArabic ? 'بوابات الإغلاق (Gates)' : 'Closure Gates'}</option>
            <option value="task">{isArabic ? 'المهام (Tasks)' : 'Tasks'}</option>
            <option value="execution">{isArabic ? 'المهام التنفيذية (Execution)' : 'Execution'}</option>
          </select>
        </div>
      </div>

      {/* Timeline List / Gantt Bars */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        {timelineRecords.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            {isArabic ? 'لا توجد سجلات مطابقة للبحث أو التاريخ.' : 'No timeline records found matching criteria.'}
          </div>
        ) : (
          <div className="space-y-3">
            {timelineRecords.map(rec => {
              const progress = rec.data?.progress_percent ?? (rec.status === 'Closed' || rec.status === 'Compliant' || rec.status === 'Approved' ? 100 : rec.status === 'In Progress' ? 50 : 10);
              const dueDate = rec.due_date || rec.created_at;
              const isOverdue = rec.due_date && new Date(rec.due_date) < new Date() && rec.status !== 'Closed' && rec.status !== 'Compliant';

              return (
                <div
                  key={rec.id}
                  onClick={() => onSelectRecord(rec)}
                  className="bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/50 rounded-xl p-4 transition-all cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-[280px]">
                    <div className={`p-2 rounded-lg mt-0.5 ${
                      rec.entity === 'wps' ? 'bg-cyan-500/20 text-cyan-300' :
                      rec.entity === 'gate' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">{rec.rid}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase tracking-wider">{rec.entity}</span>
                        {isOverdue && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Overdue
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors mt-0.5">{rec.title}</h4>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>{isArabic ? 'القسم:' : 'Dept:'} {rec.department}</span>
                        <span>•</span>
                        <span>{isArabic ? 'تاريخ الاستحقاق:' : 'Due:'} {dueDate ? new Date(dueDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Status */}
                  <div className="flex-1 max-w-md space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{isArabic ? 'نسبة الإنجاز' : 'Progress'}</span>
                      <span className="font-bold text-cyan-300 font-mono">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress >= 100 ? 'bg-emerald-500' : progress >= 50 ? 'bg-cyan-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      rec.status === 'Closed' || rec.status === 'Compliant' || rec.status === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {rec.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
