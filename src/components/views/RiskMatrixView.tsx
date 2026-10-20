import React, { useState } from 'react';
import { BaseRecord } from '../../types/pms';
import { AlertTriangle, Info } from 'lucide-react';

interface RiskMatrixViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onUpdateRisk: (recordId: string, data: any) => void;
}

export const RiskMatrixView: React.FC<RiskMatrixViewProps> = ({ records, isArabic, onUpdateRisk }) => {
  const risks = records.filter(r => r.entity === 'risk');
  const wps = records.filter(r => r.entity === 'wps');

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-rose-500" />
        {isArabic ? 'مصفوفة المخاطر التشغيلية (Risk Matrix)' : 'Operational Risk Matrix'}
      </h2>
      <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-950 text-slate-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">{isArabic ? 'الخطر' : 'Risk Title'}</th>
              <th className="px-4 py-3">WPS</th>
              <th className="px-4 py-3">{isArabic ? 'الشدة' : 'Severity'}</th>
              <th className="px-4 py-3">{isArabic ? 'الاحتمالية' : 'Likelihood'}</th>
              <th className="px-4 py-3">{isArabic ? 'المستوى' : 'Risk Level'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {risks.map(risk => (
              <tr key={risk.id} className="hover:bg-slate-800/50">
                <td className="px-4 py-3 font-mono text-cyan-400">{risk.rid}</td>
                <td className="px-4 py-3 text-white font-medium">{risk.title}</td>
                <td className="px-4 py-3">{risk.data?.wps_id || '-'}</td>
                <td className="px-4 py-3">
                   <select 
                     className="bg-slate-800 border border-slate-700 rounded px-2 py-1"
                     value={risk.data?.severity || 'Low'}
                     onChange={(e) => onUpdateRisk(risk.id, { ...risk.data, severity: e.target.value })}
                   >
                     <option value="Low">Low</option>
                     <option value="Medium">Medium</option>
                     <option value="High">High</option>
                     <option value="Critical">Critical</option>
                   </select>
                </td>
                <td className="px-4 py-3">{risk.data?.likelihood || 'Low'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    risk.data?.severity === 'Critical' ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {risk.data?.severity === 'Critical' ? 'EXTREME' : 'MONITORED'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
