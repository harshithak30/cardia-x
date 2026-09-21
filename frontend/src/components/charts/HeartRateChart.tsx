import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { WearableMetric } from '../../types';

interface HeartRateChartProps {
  data: WearableMetric[];
  height?: number;
}

export const HeartRateChart: React.FC<HeartRateChartProps> = ({ data, height = 240 }) => {
  const chartData = data.map((d) => ({
    time: new Date(d.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    current: d.heartRate?.currentBpm || 72,
    resting: d.heartRate?.restingBpm || 68,
    min: d.heartRate?.minBpm || 58,
    max: d.heartRate?.maxBpm || 115,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700/80 text-xs space-y-1">
          <p className="font-semibold text-slate-300 border-b border-slate-800 pb-1">{label}</p>
          <div className="flex items-center justify-between gap-4 text-rose-400 font-medium">
            <span>Current HR:</span>
            <span className="font-bold">{payload[0]?.value} bpm</span>
          </div>
          {payload[1] && (
            <div className="flex items-center justify-between gap-4 text-sky-400">
              <span>Resting HR:</span>
              <span className="font-bold">{payload[1]?.value} bpm</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="restingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
          <YAxis domain={[50, 130]} tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={100} stroke="#FDA4AF" strokeDasharray="3 3" label={{ value: 'Tachycardia (100)', fill: '#FB7185', fontSize: 10, position: 'insideTopRight' }} />
          <ReferenceLine y={60} stroke="#BAE6FD" strokeDasharray="3 3" label={{ value: 'Bradycardia (60)', fill: '#38BDF8', fontSize: 10, position: 'insideBottomRight' }} />
          <Area
            type="monotone"
            dataKey="current"
            stroke="#F43F5E"
            strokeWidth={2.4}
            fillOpacity={1}
            fill="url(#hrGradient)"
          />
          <Area
            type="monotone"
            dataKey="resting"
            stroke="#0284C7"
            strokeWidth={1.8}
            fillOpacity={1}
            fill="url(#restingGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

