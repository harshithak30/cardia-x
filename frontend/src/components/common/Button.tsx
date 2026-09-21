import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'vital' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-lg font-medium gap-1.5',
    md: 'text-sm px-4 py-2.2 rounded-xl font-medium gap-2',
    lg: 'text-base px-5 py-2.8 rounded-xl font-semibold gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-cardio-600 to-sky-600 hover:from-cardio-700 hover:to-sky-700 text-white shadow-sm shadow-cardio-500/20 active:scale-[0.99]',
    secondary:
      'bg-white dark:bg-navy-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-navy-850 shadow-subtle',
    vital:
      'bg-gradient-to-r from-vital-600 to-teal-600 hover:from-vital-700 hover:to-teal-700 text-white shadow-sm shadow-vital-500/20 active:scale-[0.99]',
    danger:
      'bg-gradient-to-r from-pulse-600 to-rose-600 hover:from-pulse-700 hover:to-rose-700 text-white shadow-sm shadow-pulse-500/20 active:scale-[0.99]',
    outline:
      'border border-cardio-500 text-cardio-600 dark:text-cardio-400 hover:bg-cardio-50 dark:hover:bg-cardio-950/30',
    ghost:
      'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800/80',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-cardio-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};

