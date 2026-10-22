import React from 'react';
import { BaseRecord } from '../types/pms';
import { Bell, X, AlertTriangle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: BaseRecord[];
  isArabic: boolean;
  onSelectRecord: (record: BaseRecord) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  records,
  isArabic,
  onSelectRecord
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Collect alerts
  const alerts: {
    id: string;
    type: 'expired' | 'expiring' | 'overdue' | 'critical';
    title: string;
    subtitle: string;
    date?: string;
    record: BaseRecord;
  }[] = [];

  records.forEach(r => {
    // Check certificate expiry
    if (r.entity === 'crew_certificate' && r.expiry_date) {
      const exp = new Date(r.expiry_date);
      if (exp < now) {
        alerts.push({
          id: `cert-exp-${r.id}`,
          type: 'expired',
          title: isArabic ? `شهادة منتهية: ${r.title}` : `Expired Cert: ${r.title}`,
          subtitle: isArabic ? `رقم الشهادة: ${r.data?.certificate_number || r.rid}` : `Cert No: ${r.data?.certificate_number || r.rid}`,
          date: r.expiry_date,
          record: r
        });
      } else if (exp <= in30Days) {
        alerts.push({
          id: `cert-warn-${r.id}`,
          type: 'expiring',
          title: isArabic ? `شهادة ستنتهي قريباً: ${r.title}` : `Expiring Soon: ${r.title}`,
          subtitle: isArabic ? `تنتهي في: ${r.expiry_date}` : `Expires on: ${r.expiry_date}`,
          date: r.expiry_date,
          record: r
        });
      }
    }

    // Check Overdue Tasks / Items
    if (r.due_date && r.status !== 'Closed' && r.status !== 'Compliant' && r.status !== 'Approved') {
      const due = new Date(r.due_date);
      if (due < now) {
        alerts.push({
          id: `overdue-${r.id}`,
          type: 'overdue',
          title: isArabic ? `مهمة متأخرة: ${r.title}` : `Overdue Item: ${r.title}`,
          subtitle: `${r.rid} • ${r.department}`,
          date: r.due_date,
          record: r
        });
      }
    }

    // Check Critical Gaps / Risks
    if ((r.entity === 'gap' || r.entity === 'risk') && r.status !== 'Closed') {
      const severity = r.data?.severity;
      if (severity === 'Critical' || severity === 'High') {
        alerts.push({
          id: `critical-${r.id}`,
          type: 'critical',
          title: isArabic ? `خطر أو فجوة حرجة: ${r.title}` : `Critical Risk/Finding: ${r.title}`,
          subtitle: `${r.rid} • ${severity} Severity`,
          record: r
        });
      }
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {isArabic ? 'مركز التنبيهات والإشعارات التشغيلية' : 'Operational Notification Center'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isArabic ? `تم رصد ${alerts.length} تنبيهاً يتطلب انتباه الإدارة` : `${alerts.length} active operational alerts requiring attention`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar space-y-3 flex-1">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
              {isArabic ? 'لا توجد تنبيهات حالية. جميع الأنظمة والشهادات مطابقة!' : 'No active alerts. All systems and certifications are fully compliant!'}
            </div>
          ) : (
            alerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => {
                  onSelectRecord(alert.record);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  alert.type === 'expired' || alert.type === 'critical'
                    ? 'bg-rose-950/30 border-rose-900/50 hover:border-rose-700 text-rose-200'
                    : 'bg-amber-950/20 border-amber-900/40 hover:border-amber-700 text-amber-200'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {alert.type === 'expired' || alert.type === 'critical' ? (
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{alert.title}</h4>
                    {alert.date && (
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {alert.date}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 truncate">{alert.subtitle}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
