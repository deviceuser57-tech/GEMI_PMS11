import React, { useMemo } from 'react';
import { BaseRecord } from '../../types/pms';
import { Layers, TrendingUp } from 'lucide-react';
import { useGsapPageReveal } from '../../lib/animations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

interface ComplexityMatrixViewProps {
  records: BaseRecord[];
  isArabic: boolean;
}

export const ComplexityMatrixView: React.FC<ComplexityMatrixViewProps> = ({
  records,
  isArabic
}) => {
  const containerRef = useGsapPageReveal<HTMLDivElement>();

  // Process WPS to calculate complexity
  const complexityData = useMemo(() => {
    const wpsRecords = records.filter(r => r.entity === 'wps');
    
    return wpsRecords.map(w => {
      // Heuristic: Complexity = Risk level + Resource factor (dummy for now)
      const riskScore = w.data?.risk_level === 'High' ? 3 : w.data?.risk_level === 'Medium' ? 2 : 1;
      const resourceFactor = (parseInt(w.data?.resource_count || '1') || 1) * 0.5;
      const complexity = Math.round((riskScore + resourceFactor) * 10);
      
      return {
        name: w.rid,
        title: w.title.substring(0, 15) + (w.title.length > 15 ? '...' : ''),
        complexity: complexity,
        riskScore: riskScore * 10,
        resources: resourceFactor * 10
      };
    }).sort((a, b) => b.complexity - a.complexity);
  }, [records]);

  const COLORS = ['#8b5cf6', '#a855f7', '#d946ef']; // purple shades

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-purple-400" />
          {isArabic ? 'مصفوفة تعقيد حزم العمل (WPS Complexity Matrix)' : 'WPS Complexity Matrix'}
        </h2>
        <p className="text-slate-400 text-xs mb-6">
          {isArabic 
            ? 'تصنيف حزم العمل بناءً على تقييم المخاطر ومتطلبات الموارد.'
            : 'Classifying Work Packages based on risk assessment and resource requirements.'}
        </p>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={complexityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Legend />
              <Bar dataKey="complexity" fill="#8b5cf6" name={isArabic ? 'مستوى التعقيد' : 'Complexity Score'}>
                {complexityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
