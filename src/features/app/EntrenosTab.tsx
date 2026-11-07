import React, { useState } from 'react';
import { contentService, Exercise } from '@/src/services/content';
import { useQuizStore } from '@/src/store/quizStore';
import { useTranslation } from '@/src/i18n';
import { WorkoutPlayerModal } from './WorkoutPlayerModal';

export const EntrenosTab: React.FC = () => {
  const { t } = useTranslation();
  const { answers } = useQuizStore();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const categories = [
    { id: 'all', label: t('app.entrenos.filters.all') },
    { id: 'walking', label: t('app.entrenos.filters.walking') },
    { id: 'wall_pilates', label: t('app.entrenos.filters.wall_pilates') },
    { id: 'chair_pilates', label: t('app.entrenos.filters.chair_pilates') },
    { id: 'stretching', label: t('app.entrenos.filters.stretching') },
  ];

  const exercises = contentService.getAllExercises(activeCategory);
  const userLimitations = answers.limitations || [];

  return (
    <div className="space-y-4 pb-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {t('app.entrenos.title')}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {t('app.entrenos.subtitle')}
        </p>
      </div>

      {/* Filter Tabs / Segmented Controls */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                isActive
                  ? 'bg-rose-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-rose-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Exercise list */}
      <div className="space-y-3">
        {exercises.map((ex) => {
          const hasAdaptation =
            ex.alternative && userLimitations.includes(ex.alternative.limitation);

          return (
            <div
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="p-4 rounded-3xl bg-white border border-rose-100 shadow-2xs hover:border-rose-300 transition cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-800 flex items-center justify-center text-xl shrink-0 border border-rose-100">
                  {ex.category === 'walking'
                    ? '👟'
                    : ex.category === 'chair_pilates'
                    ? '🪑'
                    : ex.category === 'stretching'
                    ? '🧘‍♀️'
                    : '🧱'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {ex.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{ex.durationSec}s</span>
                    <span>•</span>
                    <span className="capitalize">{ex.level}</span>
                    {hasAdaptation && (
                      <>
                        <span>•</span>
                        <span className="text-amber-700 font-semibold">Adaptado</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-800 flex items-center justify-center text-xs font-bold shrink-0">
                ▶
              </div>
            </div>
          );
        })}
      </div>

      {/* Player Modal */}
      {selectedExercise && (
        <WorkoutPlayerModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
};
