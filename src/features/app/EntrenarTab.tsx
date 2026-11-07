import React, { useState, useEffect } from 'react';
import { exercisesData } from '@/src/content/exercises.data';
import { Exercise, ExerciseCategory } from '@/src/types/exercise';
import { assetService } from '@/src/services/assetService';
import { WorkoutPlayerModal } from './WorkoutPlayerModal';
import {
  Play,
  Clock,
  ShieldCheck,
  Sparkles,
  Filter,
} from 'lucide-react';

export const EntrenarTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  const categories: Array<{ id: string; label: string }> = [
    { id: 'todos', label: 'Todos' },
    { id: 'caminata', label: 'Caminata en Casa' },
    { id: 'pilates_pared', label: 'Pilates en Pared' },
    { id: 'pilates_silla', label: 'Pilates en Silla' },
    { id: 'estiramiento', label: 'Estiramiento' },
    { id: 'yoga_facial', label: 'Yoga Facial' },
  ];

  // Preload initial thumbnails
  useEffect(() => {
    let isCancelled = false;
    async function loadThumbnails() {
      const entries: Record<string, string> = {};
      const promises = exercisesData.slice(0, 15).map(async (ex) => {
        const url = await assetService.get(ex.frames.start);
        entries[ex.id] = url;
      });
      await Promise.all(promises);
      if (!isCancelled) {
        setThumbnails(entries);
      }
    }
    loadThumbnails();
    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredExercises = exercisesData.filter((ex) => {
    if (selectedCategory === 'todos') return true;
    return ex.category === selectedCategory;
  });

  return (
    <div className="space-y-4 p-4 pb-8">
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-xl text-[#2A1E22]">
          Biblioteca de Ejercicios
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Movimiento seguro, guiado y de bajo impacto para cada día.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-[#8B1E3F] text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Exercise Count */}
      <div className="flex items-center justify-between text-xs text-stone-400 font-medium px-1">
        <span>{filteredExercises.length} ejercicios disponibles</span>
        <span className="flex items-center gap-1 text-[#8FAF9A]">
          <ShieldCheck className="w-3.5 h-3.5" />
          Aptos para articulaciones
        </span>
      </div>

      {/* Exercises List */}
      <div className="space-y-3">
        {filteredExercises.map((ex) => {
          const thumb = thumbnails[ex.id];

          return (
            <div
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="p-3 rounded-3xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex gap-3 group"
            >
              {/* Thumbnail */}
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={ex.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#F3E9DC] text-[#8B1E3F]">
                    <Sparkles className="w-6 h-6 opacity-60" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/15 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-white/90 text-[#8B1E3F] flex items-center justify-center shadow-xs">
                    <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-[#8B1E3F] bg-[#8B1E3F]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {ex.category.replace('_', ' ')}
                    </span>
                    {ex.kneeSafe && (
                      <span className="text-[10px] font-semibold text-[#406852] bg-[#8FAF9A]/20 px-1.5 py-0.5 rounded-md">
                        Rodillas
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-xs text-[#2A1E22] group-hover:text-[#8B1E3F] transition-colors leading-snug line-clamp-2">
                    {ex.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-stone-400" />
                    {ex.durationSec || 45}s
                  </span>
                  <span className="text-stone-400 capitalize">
                    {ex.targetZones.slice(0, 2).join(', ')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Exercise Workout Player Modal */}
      {selectedExercise && (
        <WorkoutPlayerModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
};
