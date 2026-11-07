import React from 'react';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useTranslation } from '@/src/i18n';
import confetti from 'canvas-confetti';

export const Challenge28View: React.FC<{ isLite?: boolean; onBack: () => void }> = ({
  isLite = false,
  onBack,
}) => {
  const { t } = useTranslation();
  const { challengeCheckins, toggleChallengeCheckin } = useWorkoutStore();

  const handleCheckin = (day: number) => {
    toggleChallengeCheckin(day);
    if (!challengeCheckins.includes(day)) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    }
  };

  const completedCount = challengeCheckins.length;

  const medals = [
    { target: 7, label: t('app.challenge_28.medal_7_days'), icon: '🥉' },
    { target: 14, label: t('app.challenge_28.medal_14_days'), icon: '🥈' },
    { target: 21, label: t('app.challenge_28.medal_21_days'), icon: '🥇' },
    { target: 28, label: t('app.challenge_28.medal_28_days'), icon: '👑' },
  ];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-rose-100">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-rose-800 flex items-center gap-1 hover:underline"
        >
          ← Volver
        </button>
        <span className="font-bold text-sm text-slate-900">
          {t('app.challenge_28.title')} {isLite ? '(Versión Esencial)' : ''}
        </span>
        <div className="w-8" />
      </div>

      {/* Progress banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-800 to-rose-900 text-white shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200">
            Tu Progreso del Reto
          </span>
          <p className="text-xl font-bold mt-0.5">
            {completedCount} de 28 días completados
          </p>
          <p className="text-xs text-rose-200/90 mt-1">
            Cada día cuenta para tu ligereza y bienestar.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-2xl">
          🔥
        </div>
      </div>

      {/* Medals Showcase (Full version feature, previewed) */}
      {!isLite && (
        <div className="bg-white rounded-3xl p-4 border border-rose-100 shadow-xs space-y-2.5">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {t('app.challenge_28.medals_title')}
          </h4>
          <div className="grid grid-cols-4 gap-2 text-center">
            {medals.map((m, i) => {
              const isUnlocked = completedCount >= m.target;
              return (
                <div
                  key={i}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center transition ${
                    isUnlocked
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50 border-slate-100 opacity-40'
                  }`}
                >
                  <span className="text-2xl mb-1">{m.icon}</span>
                  <span className="text-[9px] font-bold text-slate-700 leading-tight">
                    {m.target} Días
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 28 Days Grid */}
      <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Calendario Diario
        </h4>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {Array.from({ length: 28 }, (_, i) => i + 1).map((dayNum) => {
            const isChecked = challengeCheckins.includes(dayNum);
            return (
              <button
                key={dayNum}
                onClick={() => handleCheckin(dayNum)}
                className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center min-h-[56px] select-none ${
                  isChecked
                    ? 'bg-rose-800 text-white border-rose-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-rose-200 text-slate-700'
                }`}
              >
                <span className="text-[10px] font-semibold opacity-75">Día</span>
                <span className="text-sm font-bold leading-tight">{dayNum}</span>
                <span className="text-[10px] mt-0.5">{isChecked ? '✓' : '○'}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
