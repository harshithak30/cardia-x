import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = 'h-16 w-full',
}) => {
  return (
    <div className="space-y-3 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-slate-200/80 dark:bg-navy-800/80 rounded-2xl ${className}`}
        />
      ))}
    </div>
  );
};

