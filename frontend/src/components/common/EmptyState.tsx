import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`p-8 text-center flex flex-col items-center justify-center max-w-sm mx-auto ${className}`}>
      <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-slate-700/80 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-4 shadow-subtle">
        {icon}
      </div>
      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button size="sm" variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

