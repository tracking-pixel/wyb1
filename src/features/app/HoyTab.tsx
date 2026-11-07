import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { contentService } from '@/src/services/content';
import { entitlementService } from '@/src/services/entitlements';
import { assetService } from '@/src/services/assetService';
import { gamificationService, GamificationState } from '@/src/services/gamificationService';
import { useQuizStore } from '@/src/store/quizStore';
import { useWorkoutStore } from '@/src/store/workoutStore';
import {
  Flame,
  ShieldCheck,
  Sparkles,
  Droplets,
  Clock,
  Play,
  CheckCircle2,
  Lock,
  ChevronRight,
  Gift,
  Compass,
  Footprints,
  Plus,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { WorkoutPlayerModal } from './WorkoutPlayerModal';
import { MealPlanView } from './modules/MealPlanView';
import { Challenge28View } from './modules/Challenge28View';
import { FaceYogaView } from './modules/FaceYogaView';
import { AICoachView } from './modules/AICoachView';

export const HoyTab: React.FC = () => {
  const navigate = useNavigate();
  const { answers } = useQuizStore();
  const { currentDay, completedDays, addWaterGlass } = useWorkoutStore();

  const [gameState, setGameState] = useState<GamificationState>(
    gamificationService.getState()
  );
  const [headerBgUrl, setHeaderBgUrl] = useState<string>('');
  const [workoutCoverUrl, setWorkoutCoverUrl] = useState<string>('');
  const [moduleCovers, setModuleCovers] = useState<Record<string, string>>({});
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<
    'none' | 'meal_plan' | 'challenge' | 'face_yoga' | 'coach'
  >('none');
  const [chestOpening, setChestOpening] = useState(false);

  // Subscribe to gamification state changes
  useEffect(() => {
    return gamificationService.subscribe((st) => setGameState(st));
  }, []);

  // Determine day part for greeting and background
  const currentHour = new Date().getHours();
  let greetingTime = 'Buenos días';
  let headerAssetId = 'home_header_morning';
  if (currentHour >= 12 && currentHour < 19) {
    greetingTime = 'Buenas tardes';
    headerAssetId = 'home_header_afternoon';
  } else if (currentHour >= 19 || currentHour < 5) {
    greetingTime = 'Buenas noches';
    headerAssetId = 'home_header_evening';
  }

  // Load assets
  useEffect(() => {
    let isCancelled = false;
    async function loadAssets() {
      const [headerUrl, coverUrl, mealCover, challengeCover, faceCover, coachCover] =
        await Promise.all([
          assetService.get(headerAssetId),
          assetService.get('workout_cover_day1'),
          assetService.get('module_cover_meal_plan'),
          assetService.get('module_cover_challenge_28'),
          assetService.get('module_cover_face_yoga'),
          assetService.get('module_cover_ai_coach'),
        ]);

      if (!isCancelled) {
        setHeaderBgUrl(headerUrl);
        setWorkoutCoverUrl(coverUrl);
        setModuleCovers({
          meal_plan: mealCover,
          challenge_28: challengeCover,
          face_yoga: faceCover,
          ai_coach: coachCover,
        });
      }
    }
    loadAssets();
    return () => {
      isCancelled = true;
    };
  }, [headerAssetId]);

  const levelInfo = gamificationService.getCurrentLevel();
  const missions = gamificationService.getDailyMissions();
  const canClaimChest = gamificationService.canClaimChest();

  const todayWorkout =
    contentService.getDay(gameState.currentDay) || contentService.getDay(1)!;
  const isCompletedToday = gameState.completedDays.includes(gameState.currentDay);

  // Entitlements
  const hasMealPlan = entitlementService.has('meal_plan');
  const hasChallenge =
    entitlementService.has('challenge_28') ||
    entitlementService.has('challenge_28_lite');
  const isChallengeLite =
    entitlementService.has('challenge_28_lite') &&
    !entitlementService.has('challenge_28');
  const hasFaceYoga = entitlementService.has('face_yoga');
  const hasCoach = entitlementService.has('ai_coach');

  // Claim animated chest
  const handleClaimChest = () => {
    if (!canClaimChest) return;
    setChestOpening(true);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#D4AF37', '#F4A582', '#8B1E3F'],
      });
    } catch {
      // ignore
    }
    setTimeout(() => {
      gamificationService.claimChest();
      setChestOpening(false);
    }, 600);
  };

  const handleAddWater = () => {
    gamificationService.logWater(1);
    addWaterGlass();
  };

  // Module views
  if (activeModule === 'meal_plan') {
    return <MealPlanView onBack={() => setActiveModule('none')} />;
  }
  if (activeModule === 'challenge') {
    return (
      <Challenge28View
        isLite={isChallengeLite}
        onBack={() => setActiveModule('none')}
      />
    );
  }
  if (activeModule === 'face_yoga') {
    return <FaceYogaView onBack={() => setActiveModule('none')} />;
  }
  if (activeModule === 'coach') {
    return <AICoachView onBack={() => setActiveModule('none')} />;
  }

  const weekDayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="space-y-4 p-4 pb-8">
      {/* 1. Header with Day-Part & Visual Greeting */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#8B1E3F] to-[#5A1827] text-[#FFF9F3] p-5 shadow-md">
        {headerBgUrl && (
          <img
            src={headerBgUrl}
            alt="Ambiente del día"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-35"
          />
        )}
        <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-[#F4A582] uppercase tracking-wider block">
                {greetingTime}
              </span>
              <h1 className="text-xl font-serif font-bold text-white tracking-tight">
                {answers.user_name ? `${answers.user_name}` : 'Amiga'}
              </h1>
            </div>

            {/* Streak Indicator Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-[#FFF9F3]">
              <Flame className="w-4 h-4 text-[#F4A582] fill-current" />
              <span>{gameState.streak} días seguidos</span>
            </div>
          </div>

          {/* Weekly 7-Day Calendar Dots */}
          <div className="pt-1">
            <div className="flex items-center justify-between bg-black/20 backdrop-blur-xs p-2 rounded-2xl">
              {weekDayLabels.map((dayLabel, index) => {
                const isDone = gameState.weeklyHistory[index];
                const isToday = (new Date().getDay() + 6) % 7 === index;

                return (
                  <div key={dayLabel + index} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-stone-300 font-medium">
                      {dayLabel}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                        isDone
                          ? 'bg-[#8FAF9A] text-white font-bold shadow-xs'
                          : isToday
                          ? 'border-2 border-[#F4A582] bg-white/10 text-white font-bold'
                          : 'bg-white/10 text-stone-400'
                      }`}
                    >
                      {isDone ? '✓' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Streak Protector banner */}
          {gameState.streakShieldAvailable && (
            <div className="flex items-center gap-2 text-[11px] text-[#F3E9DC] bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              <ShieldCheck className="w-4 h-4 text-[#8FAF9A] shrink-0" />
              <span>Protector de racha activo: tu hábito está seguro.</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Level & XP Progress Card */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2A1E22]">
                Nivel {levelInfo.current.level}: {levelInfo.current.name}
              </p>
              <p className="text-[10px] text-stone-500">
                {levelInfo.current.description}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#8B1E3F]">
            {gameState.xp} XP
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8B1E3F] to-[#F4A582] transition-all duration-500"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-stone-400 font-medium">
            <span>{levelInfo.current.minXp} XP</span>
            <span>
              {levelInfo.next
                ? `Faltan ${levelInfo.next.minXp - gameState.xp} XP para Nivel ${levelInfo.next.level}`
                : 'Nivel Máximo'}
            </span>
            <span>{levelInfo.current.maxXp} XP</span>
          </div>
        </div>
      </div>

      {/* 3. Main Workout of the Day Card */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-md group">
        {/* Cover image */}
        <div className="relative h-44 w-full overflow-hidden bg-stone-100">
          {workoutCoverUrl && (
            <img
              src={workoutCoverUrl}
              alt="Entrenamiento de hoy"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Top badges on cover */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between">
            <span className="text-[11px] font-bold text-white bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              Día {gameState.currentDay} de 28
            </span>
            {isCompletedToday && (
              <span className="text-[11px] font-bold text-white bg-[#8FAF9A] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Listo hoy</span>
              </span>
            )}
          </div>

          {/* Bottom text on cover */}
          <div className="absolute bottom-3 inset-x-3 text-white">
            <h3 className="font-serif font-bold text-lg leading-snug drop-shadow-sm">
              {todayWorkout.title}
            </h3>
            <p className="text-xs text-stone-200 drop-shadow-xs line-clamp-1">
              {todayWorkout.focus}
            </p>
          </div>
        </div>

        {/* Workout Details & Action */}
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-stone-600">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#8B1E3F]" />
              {todayWorkout.durationMinutes} min
            </span>
            <span className="text-stone-300">·</span>
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8FAF9A]" />
              Bajo impacto
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-[#8B1E3F] font-bold">+60 XP</span>
          </div>

          <Button
            variant="primary"
            size="md"
            className="bg-[#8B1E3F] hover:bg-[#A32349] text-white px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-1.5 font-bold text-xs"
            onClick={() => setIsPlayerOpen(true)}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isCompletedToday ? 'Repetir' : 'Comenzar'}</span>
          </Button>
        </div>
      </div>

      {/* 4. Three Activity Rings / Quick Trackers */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Tracker 1: Rutina */}
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col items-center text-center">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 ${
              isCompletedToday
                ? 'bg-[#8FAF9A]/20 text-[#8FAF9A]'
                : 'bg-stone-100 text-stone-400'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#2A1E22]">
            {isCompletedToday ? '1 de 1' : '0 de 1'}
          </span>
          <span className="text-[10px] text-stone-400">Rutina diaria</span>
        </div>

        {/* Tracker 2: Hidratación con botón de añadir vaso */}
        <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col items-center text-center relative group">
          <button
            onClick={handleAddWater}
            className="w-9 h-9 rounded-full bg-[#F4A582]/20 text-[#A34F2D] flex items-center justify-center mb-1.5 hover:bg-[#F4A582]/30 active:scale-90 transition-transform"
            title="Añadir 1 vaso de agua"
          >
            <Droplets className="w-4 h-4 fill-current" />
          </button>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-[#2A1E22]">
              {gameState.waterGlasses}/{gameState.waterTarget}
            </span>
            <button
              onClick={handleAddWater}
              className="w-4 h-4 rounded-full bg-[#8B1E3F] text-white flex items-center justify-center text-[10px] font-bold"
              title="Registrar vaso"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span className="text-[10px] text-stone-400">Vasos agua</span>
        </div>

        {/* Tracker 3: Minutos activos */}
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col items-center text-center">
          <div className="w-9 h-9 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center mb-1.5">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#2A1E22]">
            {isCompletedToday ? todayWorkout.durationMinutes : 0} min
          </span>
          <span className="text-[10px] text-stone-400">Movimiento</span>
        </div>
      </div>

      {/* 5. Daily Missions Card + Animated Chest */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2A1E22]">
              Misiones Diarias
            </span>
            <span className="text-[10px] font-bold bg-[#8B1E3F]/10 text-[#8B1E3F] px-2 py-0.5 rounded-full">
              3 al día
            </span>
          </div>

          {/* Animated Chest Reward */}
          <button
            onClick={handleClaimChest}
            disabled={!canClaimChest}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              canClaimChest
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4A582] text-white animate-bounce shadow-md ring-2 ring-[#D4AF37]/50'
                : gameState.chestClaimedToday
                ? 'bg-[#8FAF9A]/20 text-[#406852]'
                : 'bg-stone-100 text-stone-400'
            }`}
          >
            <Gift className={`w-3.5 h-3.5 ${chestOpening ? 'animate-spin' : ''}`} />
            <span>
              {gameState.chestClaimedToday
                ? 'Cofre abierto'
                : canClaimChest
                ? '¡Abrir cofre! (+50 XP)'
                : 'Cofre diario'}
            </span>
          </button>
        </div>

        {/* Missions Checklist */}
        <div className="space-y-2">
          {missions.map((m) => (
            <div
              key={m.id}
              className={`p-2.5 rounded-2xl border transition-colors flex items-center justify-between ${
                m.completed
                  ? 'bg-[#8FAF9A]/10 border-[#8FAF9A]/30 text-stone-700'
                  : 'bg-stone-50/60 border-stone-200 text-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    m.completed
                      ? 'bg-[#8FAF9A] text-white font-bold'
                      : 'border-2 border-stone-300'
                  }`}
                >
                  {m.completed ? '✓' : ''}
                </div>
                <div>
                  <p className={`text-xs font-semibold ${m.completed ? 'line-through text-stone-500' : ''}`}>
                    {m.title}
                  </p>
                  <p className="text-[10px] text-stone-400">{m.description}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#8B1E3F]">
                +{m.xpReward} XP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. "Tu Camino de Santiago" Miniature Widget */}
      <div
        onClick={() => navigate('/app/camino')}
        className="p-4 rounded-3xl bg-gradient-to-br from-[#F3E9DC] to-[#FFF9F3] border border-[#D5C4B5]/60 shadow-2xs cursor-pointer hover:shadow-sm transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#8FAF9A]/20 text-[#406852] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#406852] tracking-wider block">
                Tu Ruta Virtual
              </span>
              <h4 className="text-xs font-bold text-[#2A1E22]">
                El Camino de Santiago
              </h4>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-[#8B1E3F] gap-0.5">
            <span>Ver mapa</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-600 mt-2">
          <span className="flex items-center gap-1 font-mono font-bold text-stone-800">
            <Footprints className="w-3.5 h-3.5 text-[#8FAF9A]" />
            {gameState.caminoKm} km recorridos
          </span>
          <span className="text-[11px] text-stone-500">
            Meta: 780 km a Santiago
          </span>
        </div>

        {/* Trail progress line */}
        <div className="w-full h-1.5 rounded-full bg-stone-200 mt-2 overflow-hidden">
          <div
            className="h-full bg-[#8FAF9A] rounded-full"
            style={{ width: `${Math.min(100, (gameState.caminoKm / 780) * 100)}%` }}
          />
        </div>
      </div>

      {/* 7. Programs & Locked Modules Grid */}
      <div className="space-y-2.5 pt-2">
        <h3 className="font-serif font-bold text-base text-[#2A1E22]">
          Tus Módulos de Bienestar
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Module 1: Comidas */}
          <div
            onClick={() => setActiveModule('meal_plan')}
            className="relative rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-2xs group cursor-pointer"
          >
            <div className="h-28 w-full bg-stone-100 relative overflow-hidden">
              {moduleCovers.meal_plan && (
                <img
                  src={moduleCovers.meal_plan}
                  alt="Plan de Comidas"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                />
              )}
              {!hasMealPlan && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                  <div className="p-2 rounded-full bg-black/60 text-white">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs font-bold text-[#2A1E22]">
                Comidas Antiinflamatorias
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                {hasMealPlan ? 'Acceso completo' : 'Desde $14.99'}
              </p>
            </div>
          </div>

          {/* Module 2: Reto 28 Días */}
          <div
            onClick={() => setActiveModule('challenge')}
            className="relative rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-2xs group cursor-pointer"
          >
            <div className="h-28 w-full bg-stone-100 relative overflow-hidden">
              {moduleCovers.challenge_28 && (
                <img
                  src={moduleCovers.challenge_28}
                  alt="Reto 28 Días"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                />
              )}
              {!hasChallenge && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                  <div className="p-2 rounded-full bg-black/60 text-white">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs font-bold text-[#2A1E22]">
                Reto 28 Días Core & Postura
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                {hasChallenge ? 'Acceso activo' : 'Desde $19.99'}
              </p>
            </div>
          </div>

          {/* Module 3: Yoga Facial */}
          <div
            onClick={() => setActiveModule('face_yoga')}
            className="relative rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-2xs group cursor-pointer"
          >
            <div className="h-28 w-full bg-stone-100 relative overflow-hidden">
              {moduleCovers.face_yoga && (
                <img
                  src={moduleCovers.face_yoga}
                  alt="Yoga Facial"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                />
              )}
              {!hasFaceYoga && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                  <div className="p-2 rounded-full bg-black/60 text-white">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs font-bold text-[#2A1E22]">
                Yoga Facial 21 Días
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                {hasFaceYoga ? 'Acceso activo' : 'Desde $14.99'}
              </p>
            </div>
          </div>

          {/* Module 4: Coach IA */}
          <div
            onClick={() => setActiveModule('coach')}
            className="relative rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-2xs group cursor-pointer"
          >
            <div className="h-28 w-full bg-stone-100 relative overflow-hidden">
              {moduleCovers.ai_coach && (
                <img
                  src={moduleCovers.ai_coach}
                  alt="Coach IA Sofía"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                />
              )}
              {!hasCoach && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                  <div className="p-2 rounded-full bg-black/60 text-white">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs font-bold text-[#2A1E22]">
                Coach Personal Sofía
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                {hasCoach ? 'Chat disponible' : 'Desbloquear'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Player Modal */}
      {isPlayerOpen && (
        <WorkoutPlayerModal
          day={todayWorkout}
          onClose={() => setIsPlayerOpen(false)}
        />
      )}
    </div>
  );
};
