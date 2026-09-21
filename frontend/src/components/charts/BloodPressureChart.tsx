import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { WearableMetric } from '../../types';

interface BloodPressureChartProps {
  data: WearableMetric[];
  height?: number;
}

export const BloodPressureChart: React.FC<BloodPressureChartProps> = ({ data, height = 240 }) => {
  const chartData = data.map((d) => ({
    time: new Date(d.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    systolic: d.bloodPressure?.systolic || 120,
    diastolic: d.bloodPressure?.diastolic || 80,
    category: d.bloodPressure?.category || 'Normal',
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const s = payload[0]?.value;
      const d = payload[1]?.value;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700/80 text-xs space-y-1">
          <p className="font-semibold text-slate-300 border-b border-slate-800 pb-1">{label}</p>
          <div className="flex items-center justify-between gap-4 font-bold text-sky-400">
            <span>Blood Pressure:</span>
            <span>{s}/{d} mmHg</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <span>Stage:</span>
            <span className={s >= 140 || d >= 90 ? 'text-rose-400 font-semibold' : s >= 130 ? 'text-amber-400' : 'text-emerald-400'}>
              {payload[0]?.payload?.category}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
          <YAxis domain={[60, 180]} tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={140} stroke="#FDA4AF" strokeDasharray="3 3" label={{ value: 'Stage 2 HTN (140)', fill: '#FB7185', fontSize: 10, position: 'insideTopRight' }} />
          <ReferenceLine y={120} stroke="#86EFAC" strokeDasharray="3 3" label={{ value: 'Target SBP (120)', fill: '#4ADE80', fontSize: 10, position: 'insideBottomRight' }} />
          <Line
            type="monotone"
            dataKey="systolic"
            name="Systolic"
            stroke="#0284C7"
            strokeWidth={2.6}
            dot={{ fill: '#0284C7', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="diastolic"
            name="Diastolic"
            stroke="#10B981"
            strokeWidth={2.2}
            dot={{ fill: '#10B981', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

