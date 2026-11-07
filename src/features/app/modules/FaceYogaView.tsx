import React, { useState } from 'react';
import { contentService } from '@/src/services/content';
import { useTranslation } from '@/src/i18n';
import { Button } from '@/src/components/ui/Button';

export const FaceYogaView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslation();
  const faceYogaData = contentService.getFaceYoga();
  const routines = faceYogaData.routines || [];

  const [selectedRoutine, setSelectedRoutine] = useState<any | null>(routines[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-rose-100">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-rose-800 flex items-center gap-1 hover:underline"
        >
          ← Volver
        </button>
        <span className="font-bold text-sm text-slate-900">
          {t('app.face_yoga.title')}
        </span>
        <div className="w-8" />
      </div>

      {/* Routine Detail / Player Modal */}
      {selectedRoutine && (
        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full">
              Día {selectedRoutine.day} de 21 • 5 min
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {selectedRoutine.targetArea}
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 leading-snug">
            {selectedRoutine.title}
          </h3>

          {/* Visual animation/mirror container */}
          <div className="h-40 rounded-2xl bg-gradient-to-br from-rose-50 via-rose-100/40 to-amber-50/40 border border-rose-200/60 flex flex-col items-center justify-center p-4 text-center">
            <span className="text-4xl mb-2">🌸</span>
            <p className="text-xs font-bold text-rose-950">
              {isPlaying
                ? selectedRoutine.steps?.[activeStepIndex]?.name || 'Movimiento activo'
                : 'Frente al espejo con postura erguida'}
            </p>
            <p className="text-[11px] text-slate-600 mt-1 max-w-xs">
              {isPlaying
                ? selectedRoutine.steps?.[activeStepIndex]?.instruction
                : 'Respira hondo y aplica un toque de crema o aceite ligero en tus manos.'}
            </p>
          </div>

          {/* Detailed Steps */}
          {selectedRoutine.steps && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800">
                Pasos de la rutina:
              </h4>
              <div className="space-y-2 text-xs text-slate-700">
                {selectedRoutine.steps.map((st: any, i: number) => (
                  <div
                    key={i}
                    onClick={() => setActiveStepIndex(i)}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      activeStepIndex === i && isPlaying
                        ? 'border-rose-800 bg-rose-50'
                        : 'border-slate-100 bg-slate-50/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{st.name}</span>
                      <span className="text-[11px] text-rose-800 font-semibold">{st.seconds}s</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {st.instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? 'Pausar sesión' : t('app.face_yoga.start_routine')}
          </Button>
        </div>
      )}

      {/* 21 Routines List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Todas las 21 Rutinas
        </h4>
        <div className="space-y-2">
          {routines.map((r: any) => {
            const isSelected = selectedRoutine?.day === r.day;
            return (
              <div
                key={r.day}
                onClick={() => {
                  setSelectedRoutine(r);
                  setIsPlaying(false);
                  setActiveStepIndex(0);
                }}
                className={`p-3 rounded-2xl border flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? 'border-rose-800 bg-white shadow-xs'
                    : 'border-slate-200 bg-white/70 hover:border-rose-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-900 flex items-center justify-center font-bold text-xs shrink-0">
                    {r.day}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{r.title}</p>
                    <p className="text-[10px] text-slate-500">{r.targetArea} • 5 min</p>
                  </div>
                </div>
                <span className="text-xs text-rose-800 font-bold">➔</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
