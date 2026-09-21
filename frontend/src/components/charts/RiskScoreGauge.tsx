import React from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { ShieldAlert, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { RiskAssessment } from '../../types';

interface RiskScoreGaugeProps {
  risk?: RiskAssessment | null;
  className?: string;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({ risk, className = '' }) => {
  const score = risk?.riskScore ?? 0;
  const level = risk?.overallRiskLevel || 'NOT_ASSESSED';

  // SVG Gauge calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  // Use 240 degree arc (from 150deg to 390deg)
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * Math.min(score, 100)) / 100;

  const colorConfig = {
    LOW: {
      stroke: '#10B981',
      bgStroke: 'rgba(16, 185, 129, 0.15)',
      badgeVariant: 'low' as const,
      text: 'text-emerald-600 dark:text-emerald-400',
      label: 'Low Cardiovascular Risk',
      icon: CheckCircle2,
    },
    MEDIUM: {
      stroke: '#F59E0B',
      bgStroke: 'rgba(245, 158, 11, 0.15)',
      badgeVariant: 'medium' as const,
      text: 'text-amber-600 dark:text-amber-400',
      label: 'Moderate Cardiovascular Risk',
      icon: AlertTriangle,
    },
    HIGH: {
      stroke: '#F43F5E',
      bgStroke: 'rgba(244, 63, 94, 0.15)',
      badgeVariant: 'high' as const,
      text: 'text-rose-600 dark:text-rose-400',
      label: 'Elevated Cardiovascular Risk',
      icon: ShieldAlert,
    },
  }[level as 'LOW' | 'MEDIUM' | 'HIGH'] || {
    stroke: '#0284C7',
    bgStroke: 'rgba(2, 132, 199, 0.15)',
    badgeVariant: 'info' as const,
    text: 'text-sky-600 dark:text-sky-400',
    label: 'Standard Risk Profile',
    icon: CheckCircle2,
  };

  const Icon = colorConfig.icon;

  return (
    <Card className={className}>
      <CardHeader
        title="Cardiovascular Risk Stratification"
        subtitle="Multi-factorial longitudinal risk index (ACC/AHA)"
        icon={<ShieldAlert className="w-5 h-5 text-cardio-600" />}
        action={
          <Badge variant={colorConfig.badgeVariant} dot size="md">
            {level === 'NOT_ASSESSED' ? 'NOT ASSESSED' : `${level} RISK`}
          </Badge>
        }
      />

      <CardContent className="space-y-6">
        {/* Circular Gauge */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-210" viewBox="0 0 160 160">
              {/* Background Arc */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={colorConfig.bgStroke}
                strokeWidth="12"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeLinecap="round"
              />
              {/* Progress Arc */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={colorConfig.stroke}
                strokeWidth="12"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-4xl font-extrabold tracking-tight ${colorConfig.text}`}>{score}</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">out of 100</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                {level === 'NOT_ASSESSED' ? 'NOT ASSESSED' : `${level} RISK`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Icon className={`w-4 h-4 ${colorConfig.text}`} />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{colorConfig.label}</span>
          </div>
        </div>

        {/* Clinical Scores Sub-panel */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">Framingham 10-Yr</p>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">
              {risk?.framinghamScore10Yr != null ? `${risk.framinghamScore10Yr}%` : '--'}
            </p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">ASCVD Lifetime</p>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">
              {risk?.ascvdScore != null ? `${risk.ascvdScore}%` : '--'}
            </p>
          </div>
        </div>

        {/* Key Risk Drivers */}
        {risk?.keyRiskDrivers && risk.keyRiskDrivers.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Primary Risk Drivers</p>
            <div className="space-y-1.5">
              {risk.keyRiskDrivers.slice(0, 3).map((driver, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-navy-900/40 border border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{driver.factor}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{driver.description}</p>
                  </div>
                  <Badge
                    variant={driver.impact === 'Severe' ? 'high' : driver.impact === 'Moderate' ? 'medium' : 'low'}
                    size="sm"
                  >
                    {driver.impact}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

