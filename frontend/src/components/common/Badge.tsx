import React from 'react';

interface BadgeProps {
  variant?: 'low' | 'medium' | 'high' | 'critical' | 'info' | 'neutral' | 'success';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
  size = 'md',
  dot = false,
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 rounded-full font-semibold',
    md: 'text-xs px-2.5 py-1 rounded-full font-semibold',
    lg: 'text-sm px-3 py-1.5 rounded-full font-semibold',
  }[size];

  const variantClasses = {
    low: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    medium: 'bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    high: 'bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    critical: 'bg-red-600 text-white shadow-sm shadow-red-500/20 animate-pulse-slow',
    info: 'bg-sky-50 text-sky-700 border border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    success: 'bg-teal-50 text-teal-700 border border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
  }[variant];

  const dotColors = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-rose-500',
    critical: 'bg-white',
    info: 'bg-sky-500',
    success: 'bg-teal-500',
    neutral: 'bg-slate-400',
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1.5 transition-all ${sizeClasses} ${variantClasses} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors}`} />}
      {children}
    </span>
  );
};

