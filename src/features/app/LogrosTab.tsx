import React, { useState, useEffect } from 'react';
import { BADGES_CATALOG, BadgeDefinition } from '@/src/config/gamification';
import { gamificationService, GamificationState } from '@/src/services/gamificationService';
import {
  Award,
  Sparkles,
  Lock,
  CheckCircle2,
  X,
  Flame,
  Footprints,
  ShieldCheck,
  Crown,
  Activity,
  Star,
  Layers,
  Compass,
  HeartPulse,
  Smile,
  MapPin,
  Navigation,
  TrendingUp,
  Trophy,
  Droplets,
  Sun,
  Moon,
  Shield,
  Gift,
  Zap,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

// Icon map for badges
const ICON_MAP: Record<string, React.ElementType> = {
  Footprints,
  Flame,
  Award,
  ShieldCheck,
  Crown,
  Activity,
  Sparkles,
  Star,
  Layers,
  Compass,
  HeartPulse,
  Smile,
  MapPin,
  Navigation,
  TrendingUp,
  Trophy,
  Droplets,
  Sun,
  Moon,
  Shield,
  Gift,
  Zap,
};

export const LogrosTab: React.FC = () => {
  const [gameState, setGameState] = useState<GamificationState>(
    gamificationService.getState()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);

  useEffect(() => {
    return gamificationService.subscribe((st) => setGameState(st));
  }, []);

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'constancia', label: 'Constancia' },
    { id: 'tecnica', label: 'Técnica' },
    { id: 'camino', label: 'Camino' },
    { id: 'bienestar', label: 'Bienestar' },
    { id: 'especial', label: 'Especial' },
  ];

  const badgesWithStatus = gamificationService.getBadgesWithStatus();

  const filteredBadges = badgesWithStatus.filter((b) => {
    if (selectedCategory === 'todos') return true;
    return b.category === selectedCategory;
  });

  const unlockedCount = badgesWithStatus.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-4 p-4 pb-8">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#8B1E3F] to-[#5A1827] text-[#FFF9F3] shadow-md flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#F4A582] uppercase tracking-wider font-semibold block">
            Vitrina de Trofeos
          </span>
          <h1 className="font-serif font-bold text-xl leading-tight">
            Tus Medallas de Honor
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            Cada medalla celebra tu dedicación diaria.
          </p>
        </div>

        <div className="text-center bg-white/10 px-3.5 py-2 rounded-2xl border border-white/20">
          <span className="font-mono font-extrabold text-xl text-[#F4A582] block leading-tight">
            {unlockedCount} / {badgesWithStatus.length}
          </span>
          <span className="text-[10px] text-stone-300">Desbloqueadas</span>
        </div>
      </div>

      {/* Category Pills */}
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

      {/* Badges Grid (3 Columns) */}
      <div className="grid grid-cols-3 gap-3">
        {filteredBadges.map((badge) => {
          const IconComponent = ICON_MAP[badge.iconName] || Award;
          const isUnlocked = badge.unlocked;

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-3 rounded-3xl border transition-all flex flex-col items-center text-center cursor-pointer relative group ${
                isUnlocked
                  ? 'bg-gradient-to-b from-white to-[#FFF9F3] border-[#8B1E3F]/30 shadow-2xs hover:shadow-md hover:scale-103'
                  : 'bg-stone-50/70 border-stone-200/80 opacity-60'
              }`}
            >
              {/* Medal Emblem Circle */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 transition-transform relative ${
                  isUnlocked
                    ? 'bg-gradient-to-tr from-[#8B1E3F] to-[#F4A582] text-white shadow-md ring-2 ring-[#FFF9F3]'
                    : 'bg-stone-200 text-stone-400'
                }`}
              >
                <IconComponent className="w-6 h-6 stroke-[2]" />
                {isUnlocked ? (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#8FAF9A] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    ✓
                  </span>
                ) : (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-stone-300 text-stone-600 flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              {/* Title & XP */}
              <h3 className="font-bold text-[11px] text-[#2A1E22] leading-tight line-clamp-1">
                {badge.title}
              </h3>
              <span className="text-[10px] font-mono font-bold text-[#8B1E3F] mt-0.5">
                +{badge.xpReward} XP
              </span>
            </div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-center space-y-4">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Big Medal Icon */}
            {(() => {
              const Icon = ICON_MAP[selectedBadge.iconName] || Award;
              const isUnlocked = gameState.unlockedBadgeIds.includes(selectedBadge.id);

              return (
                <div
                  className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-lg ${
                    isUnlocked
                      ? 'bg-gradient-to-tr from-[#8B1E3F] to-[#F4A582] text-white ring-4 ring-[#FFF9F3]'
                      : 'bg-stone-200 text-stone-400'
                  }`}
                >
                  <Icon className="w-10 h-10 stroke-[2]" />
                </div>
              );
            })()}

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B1E3F]">
                Categoría: {selectedBadge.category}
              </span>
              <h2 className="font-serif font-bold text-xl text-[#2A1E22] mt-0.5">
                {selectedBadge.title}
              </h2>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                {selectedBadge.description}
              </p>
            </div>

            {/* Reward & Status */}
            <div className="p-3 rounded-2xl bg-[#FFF9F3] border border-stone-200 flex items-center justify-between text-xs">
              <span className="text-stone-600 font-medium">Recompensa</span>
              <span className="font-mono font-bold text-[#8B1E3F] text-sm">
                +{selectedBadge.xpReward} XP
              </span>
            </div>

            <div className="text-xs">
              {gameState.unlockedBadgeIds.includes(selectedBadge.id) ? (
                <div className="flex items-center justify-center gap-1.5 text-[#406852] font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#8FAF9A]" />
                  <span>¡Medalla desbloqueada y en tu vitrina!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-stone-500">
                  <Lock className="w-4 h-4 text-stone-400" />
                  <span>Sigue entrenando para desbloquearla</span>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full bg-[#8B1E3F] text-white py-3 rounded-2xl"
              onClick={() => setSelectedBadge(null)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
