import React, { useEffect, useState } from 'react';

interface CountdownTimerProps {
  durationMinutes?: number;
  onExpire?: () => void;
  className?: string;
}

const STORAGE_KEY = 'ligera_timer_expires_at_v1';

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  durationMinutes = 10,
  onExpire,
  className = '',
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationMinutes * 60);

  useEffect(() => {
    let expiresAt: number;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        expiresAt = parseInt(stored, 10);
      } else {
        expiresAt = Date.now() + durationMinutes * 60 * 1000;
        sessionStorage.setItem(STORAGE_KEY, expiresAt.toString());
      }
    } catch {
      expiresAt = Date.now() + durationMinutes * 60 * 1000;
    }

    const updateTimer = () => {
      const remainingMs = Math.max(0, expiresAt - Date.now());
      const remainingSec = Math.floor(remainingMs / 1000);
      setSecondsRemaining(remainingSec);

      if (remainingSec <= 0) {
        if (onExpire) onExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [durationMinutes, onExpire]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-mono text-sm font-bold tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/60 ${className}`}
    >
      <svg
        className="w-4 h-4 text-rose-600 animate-pulse"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <polyline points="12 6 12 12 16 14" strokeWidth="2" />
      </svg>
      <span>{formatted}</span>
    </div>
  );
};
