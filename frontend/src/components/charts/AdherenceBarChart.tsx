import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

interface AdherenceBarChartProps {
  data?: Array<{ day: string; adherence: number }>;
  height?: number;
}

export const AdherenceBarChart: React.FC<AdherenceBarChartProps> = ({ data, height = 180 }) => {
  const defaultData = [
    { day: 'Mon', adherence: 100 },
    { day: 'Tue', adherence: 100 },
    { day: 'Wed', adherence: 100 },
    { day: 'Thu', adherence: 66 },
    { day: 'Fri', adherence: 100 },
    { day: 'Sat', adherence: 100 },
    { day: 'Sun', adherence: 85 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="bg-slate-900/95 text-white p-2.5 rounded-xl shadow-lg border border-slate-700 text-xs">
          <p className="font-semibold text-slate-300">{label}</p>
          <p className="text-teal-400 font-bold mt-0.5">Adherence: {val}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="adherence" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.adherence >= 90 ? '#10B981' : entry.adherence >= 70 ? '#0284C7' : '#F59E0B'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

