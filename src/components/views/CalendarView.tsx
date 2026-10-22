import React, { useState, useEffect, useRef } from 'react';
import { BaseRecord } from '../../types/pms';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useGsapPageReveal } from '../../lib/animations';

interface CalendarViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onSelectRecord: (record: BaseRecord) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ records, isArabic, onSelectRecord }) => {
  const containerRef = useGsapPageReveal<HTMLDivElement>();
  const [view, setView] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getRecordsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return records.filter(r => r.due_date?.startsWith(dateStr));
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-cyan-400" />
            {isArabic ? 'التقويم التشغيلي ومواعيد الاستحقاق' : 'Operational Calendar & Due Dates'}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg bg-slate-800 text-slate-300"><ChevronLeft className="w-4 h-4" /></button>
            <span className="px-4 py-2 text-sm font-bold text-white bg-slate-950 rounded-lg">
              {currentDate.toLocaleDateString(isArabic ? 'ar' : 'en', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-lg bg-slate-800 text-slate-300"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-500 pb-2">{day}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map(day => {
            const dayRecords = getRecordsForDate(day);
            return (
              <div key={day} className="min-h-[100px] bg-slate-950 border border-slate-800 rounded-lg p-2 hover:bg-slate-900 transition-colors">
                <span className="text-xs font-bold text-slate-400">{day}</span>
                <div className="space-y-1 mt-1">
                  {dayRecords.map(r => (
                    <div
                      key={r.id}
                      onClick={() => onSelectRecord(r)}
                      className="text-[9px] truncate bg-cyan-900/40 text-cyan-200 border border-cyan-800 rounded px-1 py-0.5 cursor-pointer"
                    >
                      {r.rid}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
