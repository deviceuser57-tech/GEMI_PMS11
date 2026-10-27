import React from 'react';
import { calculateVarianceMetric } from '../../lib/varianceCalculator';
import { TrendingUp, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface VarianceComparisonWidgetProps {
  title: string;
  subtitle?: string;
  plannedPercent: number;
  actualPercent: number;
  plannedDate?: string;
  actualDate?: string;
  isArabic?: boolean;
}

export const VarianceComparisonWidget: React.FC<VarianceComparisonWidgetProps> = ({
  title,
  subtitle,
  plannedPercent,
  actualPercent,
  plannedDate,
  actualDate,
  isArabic = true
}) => {
  const v = calculateVarianceMetric(plannedPercent, actualPercent, plannedDate, actualDate);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div>
          <h4 className="font-bold text-xs text-white">{title}</h4>
          {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${v.badgeClass}`}>
          {isArabic ? v.statusLabelArabic : v.statusLabelEnglish}
        </span>
      </div>

      {/* Side-by-side Actual vs Planned numbers */}
      <div className="flex items-baseline justify-between text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block">{isArabic ? 'الإنجاز الفعلي (Actual):' : 'Actual Completed:'}</span>
          <span className="text-xl font-extrabold text-cyan-300 font-mono">{actualPercent}%</span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">{isArabic ? 'المستهدف المخطط (Planned):' : 'Planned Target:'}</span>
          <span className="text-base font-extrabold text-amber-400 font-mono">{plannedPercent}%</span>
        </div>
      </div>

      {/* Layered Color-Coded Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 relative">
          {/* Planned Target Marker Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-amber-400 z-10"
            style={{ left: `${Math.min(plannedPercent, 100)}%` }}
            title={`Planned Target: ${plannedPercent}%`}
          />
          {/* Actual Progress Fill */}
          <div
            className={`h-full rounded-full bg-gradient-to-r ${v.progressClass} transition-all duration-500`}
            style={{ width: `${Math.min(actualPercent, 100)}%` }}
          />
        </div>

        {/* Date Delta Banner if available */}
        {plannedDate && actualDate && (
          <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-slate-400">
            <span>Target: <strong className="text-amber-300">{plannedDate}</strong></span>
            <span>Forecast: <strong className={v.dateDeltaDays > 0 ? 'text-rose-400' : 'text-emerald-400'}>{actualDate} ({v.dateDeltaDays > 0 ? `+${v.dateDeltaDays}d delay` : 'On Schedule'})</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};
