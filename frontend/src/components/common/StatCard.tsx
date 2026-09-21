import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  statusBadge?: {
    label: string;
    variant: 'low' | 'medium' | 'high' | 'info' | 'success' | 'neutral';
  };
  accentColor?: 'cardio' | 'rose' | 'emerald' | 'amber' | 'indigo';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subtext,
  icon,
  trend,
  trendLabel,
  statusBadge,
  accentColor = 'cardio',
  onClick,
}) => {
  const accentBorder = {
    cardio: 'hover:border-sky-400/40',
    rose: 'hover:border-rose-400/40',
    emerald: 'hover:border-emerald-400/40',
    amber: 'hover:border-amber-400/40',
    indigo: 'hover:border-indigo-400/40',
  }[accentColor];

  const iconBg = {
    cardio: 'bg-cardio-50 text-cardio-600 border-cardio-100 dark:bg-cardio-950/40 dark:text-cardio-400 dark:border-cardio-800',
    rose: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800',
  }[accentColor];

  return (
    <Card
      hover={!!onClick}
      onClick={onClick}
      className={`p-5 relative overflow-hidden transition-all duration-200 group ${accentBorder}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-cardio-600 dark:group-hover:text-cardio-400 transition-colors">
              {value}
            </span>
            {unit && <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{unit}</span>}
          </div>
        </div>

        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-subtle ${iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2 text-xs">
        {trend && (
          <div className="flex items-center gap-1 font-medium">
            {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-rose-500" />}
            {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />}
            {trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
            <span className={trend === 'up' ? 'text-rose-600 dark:text-rose-400' : trend === 'down' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}>
              {trendLabel}
            </span>
          </div>
        )}

        {subtext && !trend && <span className="text-slate-500 dark:text-slate-400">{subtext}</span>}

        {statusBadge && (
          <Badge variant={statusBadge.variant} size="sm">
            {statusBadge.label}
          </Badge>
        )}
      </div>
    </Card>
  );
};

