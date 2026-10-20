import React from 'react';
import { AuditLog } from '../../types/pms';
import { History, ShieldCheck, Clock, User, Tag } from 'lucide-react';

interface AuditTrailViewProps {
  logs: AuditLog[];
  isArabic: boolean;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs, isArabic }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              AUDIT_CONFIG
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" />
              <span>{isArabic ? 'سجل التدقيق والمراقبة الشامل (Audit Trail)' : 'System Audit Trail & Compliance Log'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'تتبع تاريخي صلب لجميع التعديلات، الموافقات، وتغييرات الحالات على المتن لضمان النزاهة الهندسية والتفتيش الرسمي.'
              : 'Tamper-evident chronological activity log of all record creations, status transitions, and safety inspections.'}
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-800">
          {logs.map(log => (
            <div key={log.id} className="p-4 hover:bg-slate-850 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    {log.action}
                  </span>
                  <span className="font-mono font-bold text-cyan-400">{log.record_rid}</span>
                  <span className="font-semibold text-slate-200">{log.record_title}</span>
                </div>
                <p className="text-slate-300 text-[11px]">{log.details}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    {log.user}
                  </span>
                  <span>•</span>
                  <span className="font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[10px] self-start sm:self-center">
                Log ID: {log.id}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
