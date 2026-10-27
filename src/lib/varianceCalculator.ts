export interface VarianceResult {
  variancePercent: number;
  dateDeltaDays: number;
  status: 'AHEAD' | 'ON_TRACK' | 'BEHIND' | 'CRITICAL_DELAY';
  statusLabelEnglish: string;
  statusLabelArabic: string;
  badgeClass: string;
  progressClass: string;
}

export const calculateVarianceMetric = (
  plannedPercent: number,
  actualPercent: number,
  plannedDateStr?: string,
  actualDateStr?: string
): VarianceResult => {
  const variancePercent = actualPercent - plannedPercent;

  let dateDeltaDays = 0;
  if (plannedDateStr && actualDateStr) {
    const pDate = new Date(plannedDateStr).getTime();
    const aDate = new Date(actualDateStr).getTime();
    dateDeltaDays = Math.round((aDate - pDate) / (1000 * 60 * 60 * 24));
  }

  let status: 'AHEAD' | 'ON_TRACK' | 'BEHIND' | 'CRITICAL_DELAY' = 'ON_TRACK';
  if (variancePercent >= 0) {
    status = 'AHEAD';
  } else if (variancePercent >= -5) {
    status = 'ON_TRACK';
  } else if (variancePercent >= -15) {
    status = 'BEHIND';
  } else {
    status = 'CRITICAL_DELAY';
  }

  switch (status) {
    case 'AHEAD':
      return {
        variancePercent,
        dateDeltaDays,
        status,
        statusLabelEnglish: `Ahead +${variancePercent}%`,
        statusLabelArabic: `متقدم +${variancePercent}%`,
        badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
        progressClass: 'from-emerald-500 to-teal-500'
      };
    case 'ON_TRACK':
      return {
        variancePercent,
        dateDeltaDays,
        status,
        statusLabelEnglish: `On Track (${variancePercent}%)`,
        statusLabelArabic: `ضمن المسار (${variancePercent}%)`,
        badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-800',
        progressClass: 'from-cyan-500 to-blue-500'
      };
    case 'BEHIND':
      return {
        variancePercent,
        dateDeltaDays,
        status,
        statusLabelEnglish: `Behind ${variancePercent}%`,
        statusLabelArabic: `متأخر ${variancePercent}%`,
        badgeClass: 'bg-amber-950 text-amber-300 border-amber-800',
        progressClass: 'from-amber-500 to-orange-500'
      };
    case 'CRITICAL_DELAY':
      return {
        variancePercent,
        dateDeltaDays,
        status,
        statusLabelEnglish: `Critical Gap ${variancePercent}%`,
        statusLabelArabic: `تأخير حرج ${variancePercent}%`,
        badgeClass: 'bg-rose-950 text-rose-300 border-rose-800',
        progressClass: 'from-rose-500 to-red-600'
      };
  }
};
