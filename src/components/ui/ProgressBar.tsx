import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, className = '' }) => {
  const percentage = Math.min(100, Math.max(0, Math.round((current / total) * 100)));

  return (
    <div className={`w-full ${className}`}>
      <div className="h-1.5 w-full bg-rose-100/70 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-rose-500 to-rose-700 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
