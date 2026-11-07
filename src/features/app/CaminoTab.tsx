import React, { useState, useEffect } from 'react';
import { CAMINO_STAGES, CaminoPostcard, CaminoStage } from '@/src/config/gamification';
import { gamificationService, GamificationState } from '@/src/services/gamificationService';
import { assetService } from '@/src/services/assetService';
import {
  Compass,
  Footprints,
  MapPin,
  Lock,
  Check,
  Sparkles,
  X,
  BookOpen,
  Award,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export const CaminoTab: React.FC = () => {
  const [gameState, setGameState] = useState<GamificationState>(
    gamificationService.getState()
  );
  const [selectedPostcard, setSelectedPostcard] = useState<CaminoPostcard | null>(null);
  const [postcardImages, setPostcardImages] = useState<Record<string, string>>({});

  useEffect(() => {
    return gamificationService.subscribe((st) => setGameState(st));
  }, []);

  // Preload postcards
  useEffect(() => {
    let isCancelled = false;
    async function loadPostcards() {
      const urls: Record<string, string> = {};
      for (const st of CAMINO_STAGES) {
        urls[st.postcard.id] = await assetService.get(st.postcard.assetId);
      }
      if (!isCancelled) {
        setPostcardImages(urls);
      }
    }
    loadPostcards();
    return () => {
      isCancelled = true;
    };
  }, []);

  const totalTrailKm = 780;
  const currentKm = gameState.caminoKm;

  // Build a trail of 20 nodes with milestones positioned
  const totalNodes = 20;
  // Calculate which node the user is currently at
  const userNodeIndex = Math.min(
    totalNodes - 1,
    Math.floor((currentKm / totalTrailKm) * totalNodes)
  );

  // Map the 5 stages to node indices: 0, 4, 8, 14, 19
  const stageNodeMap: Record<number, CaminoStage> = {
    0: CAMINO_STAGES[0],
    4: CAMINO_STAGES[1],
    8: CAMINO_STAGES[2],
    14: CAMINO_STAGES[3],
    19: CAMINO_STAGES[4],
  };

  // Find next milestone stage
  const nextStage =
    CAMINO_STAGES.find((s) => s.postcard.kmRequired > currentKm) ||
    CAMINO_STAGES[CAMINO_STAGES.length - 1];
  const kmToNext = Math.max(0, parseFloat((nextStage.postcard.kmRequired - currentKm).toFixed(1)));

  return (
    <div className="space-y-4 p-4 pb-8">
      {/* Top Header Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#8B1E3F] via-[#5A1827] to-[#2A1E22] text-[#FFF9F3] shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 text-[#FFF9F3] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#F4A582] uppercase tracking-wider font-semibold block">
                Ruta Virtual
              </span>
              <h1 className="font-serif font-bold text-lg leading-tight">
                El Camino de Santiago
              </h1>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono font-bold text-lg text-[#F4A582] block leading-tight">
              {currentKm} km
            </span>
            <span className="text-[10px] text-stone-300">de 780 km</span>
          </div>
        </div>

        {/* Milestone Distance Banner */}
        <div className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#8FAF9A] shrink-0" />
            <span className="text-stone-200">
              Próxima postal:{' '}
              <strong className="text-white font-semibold">{nextStage.name}</strong>
            </span>
          </div>
          <span className="text-[#F4A582] font-mono font-bold text-[11px]">
            a {kmToNext} km
          </span>
        </div>

        {/* Overall progress bar */}
        <div className="space-y-1">
          <div className="w-full h-2 rounded-full bg-black/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8FAF9A] to-[#F4A582] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (currentKm / totalTrailKm) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-stone-400">
            <span>Roncesvalles (0 km)</span>
            <span>Santiago (780 km)</span>
          </div>
        </div>
      </div>

      {/* Postcards Collection Bar */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-xs text-[#2A1E22]">
            Tus Postales Desbloqueadas ({gameState.unlockedPostcardIds.length} de 5)
          </h3>
          <span className="text-[10px] font-bold text-[#8B1E3F]">
            Toca para leer
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CAMINO_STAGES.map((st) => {
            const isUnlocked = gameState.unlockedPostcardIds.includes(st.postcard.id);
            const img = postcardImages[st.postcard.id];

            return (
              <div
                key={st.postcard.id}
                onClick={() => isUnlocked && setSelectedPostcard(st.postcard)}
                className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border transition-all ${
                  isUnlocked
                    ? 'border-[#8B1E3F]/40 shadow-xs cursor-pointer hover:scale-103'
                    : 'border-stone-200 opacity-50 bg-stone-100 cursor-not-allowed'
                }`}
              >
                {img ? (
                  <img
                    src={img}
                    alt={st.postcard.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#F3E9DC] flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-stone-400" />
                  </div>
                )}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical Duolingo-style Trail Map */}
      <div className="relative py-6 px-4 bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Curving dotted trail background line */}
        <div className="absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-1 border-r-2 border-dashed border-[#D5C4B5]" />

        {/* Trail Nodes */}
        <div className="space-y-10 relative z-10">
          {Array.from({ length: totalNodes }).map((_, index) => {
            const stageMilestone = stageNodeMap[index];
            const isPassed = index < userNodeIndex;
            const isCurrent = index === userNodeIndex;
            const isLocked = index > userNodeIndex;

            // Zig-zag offset: alternating left, center, right
            const offsetClasses = [
              '-translate-x-14',
              '-translate-x-6',
              'translate-x-6',
              'translate-x-14',
            ];
            const offset = offsetClasses[index % offsetClasses.length];

            return (
              <div
                key={index}
                className={`flex flex-col items-center justify-center transition-transform ${offset}`}
              >
                {/* Node Button / Milestone */}
                {stageMilestone ? (
                  // Milestone Landmark Node
                  <button
                    onClick={() => {
                      if (!isLocked) {
                        setSelectedPostcard(stageMilestone.postcard);
                      }
                    }}
                    className={`relative p-3.5 rounded-3xl border-2 transition-all flex flex-col items-center gap-1 shadow-md ${
                      !isLocked
                        ? 'bg-gradient-to-tr from-[#8B1E3F] to-[#F4A582] text-white border-white ring-4 ring-[#8B1E3F]/20 cursor-pointer active:scale-95'
                        : 'bg-stone-100 text-stone-400 border-stone-300'
                    }`}
                  >
                    <MapPin className="w-6 h-6 fill-current" />
                    <span className="text-[10px] font-bold tracking-tight text-center max-w-[80px] leading-tight">
                      {stageMilestone.name.split(':')[1] || stageMilestone.name}
                    </span>
                    {!isLocked && (
                      <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-[#8FAF9A] text-white text-[9px] font-bold flex items-center gap-0.5 shadow-xs">
                        <Sparkles className="w-2.5 h-2.5" />
                        Postal
                      </span>
                    )}
                  </button>
                ) : (
                  // Regular Trail Node
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isPassed
                          ? 'bg-[#8FAF9A] text-white font-bold shadow-xs'
                          : isCurrent
                          ? 'bg-[#8B1E3F] text-white ring-4 ring-[#F4A582] animate-pulse shadow-md'
                          : 'bg-stone-100 border-2 border-stone-300 text-stone-400'
                      }`}
                    >
                      {isPassed ? (
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      ) : isCurrent ? (
                        <Footprints className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>

                    {/* Current Position Tag */}
                    {isCurrent && (
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#2A1E22] text-[#FFF9F3] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                        ¡Aquí estás!
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Postcard & Cultural Trivia Modal */}
      {selectedPostcard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-4">
            <button
              onClick={() => setSelectedPostcard(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Postcard Image */}
            <div className="w-full aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 shadow-inner relative">
              {postcardImages[selectedPostcard.id] ? (
                <img
                  src={postcardImages[selectedPostcard.id]}
                  alt={selectedPostcard.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#F3E9DC] flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-[#8B1E3F]" />
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B1E3F]">
                {selectedPostcard.subtitle}
              </span>
              <h3 className="font-serif font-bold text-lg text-[#2A1E22]">
                {selectedPostcard.title}
              </h3>
            </div>

            {/* Cultural Note */}
            <div className="p-3 rounded-2xl bg-[#FFF9F3] border border-stone-200 text-xs text-stone-700 space-y-1">
              <span className="font-bold text-[#8B1E3F] flex items-center gap-1 text-[11px]">
                <BookOpen className="w-3.5 h-3.5" />
                Historia del lugar
              </span>
              <p className="leading-relaxed">{selectedPostcard.culturalNote}</p>
            </div>

            {/* Health Trivia */}
            <div className="p-3 rounded-2xl bg-[#8FAF9A]/15 border border-[#8FAF9A]/30 text-xs text-stone-800 space-y-1">
              <span className="font-bold text-[#406852] flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                Consejo de salud de Sofía
              </span>
              <p className="leading-relaxed">{selectedPostcard.trivia}</p>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full bg-[#8B1E3F] text-white py-3 rounded-2xl"
              onClick={() => setSelectedPostcard(null)}
            >
              Continuar caminando
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
