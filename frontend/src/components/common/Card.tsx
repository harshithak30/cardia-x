import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-card transition-all duration-200 ${
        hover ? 'hover:shadow-card-hover hover:border-cardio-400/40 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, icon, className = '' }) => {
  return (
    <div className={`p-5 pb-3 flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-cardio-50 dark:bg-cardio-950/50 border border-cardio-100 dark:border-cardio-800 text-cardio-600 dark:text-cardio-400 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-snug">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`p-4 px-5 bg-slate-50/50 dark:bg-navy-900/40 rounded-b-2xl border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3 ${className}`}>
      {children}
    </div>
  );
};

