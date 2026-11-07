import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Exercise as LegacyExercise, ProgramDay } from '@/src/services/content';
import { exercisesData } from '@/src/content/exercises.data';
import { Exercise } from '@/src/types/exercise';
import { ExerciseAnimator } from '@/src/components/exercise/ExerciseAnimator';
import { ShareStoryCanvas } from '@/src/features/workout/ShareStoryCanvas';
import { gamificationService } from '@/src/services/gamificationService';
import { trackingService } from '@/src/services/tracking';
import { useQuizStore } from '@/src/store/quizStore';
import { useWorkoutStore } from '@/src/store/workoutStore';
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  HelpCircle,
  Share2,
  Sparkles,
  Flame,
  Award,
  Footprints,
  Clock,
  ShieldCheck,
  ChevronRight,
  Smile,
  Heart,
  Zap,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

interface WorkoutPlayerModalProps {
  day?: ProgramDay;
  exercise?: LegacyExercise | Exercise;
  onClose: () => void;
}

export const WorkoutPlayerModal: React.FC<WorkoutPlayerModalProps> = ({
  day,
  exercise: legacyExercise,
  onClose,
}) => {
  const { answers } = useQuizStore();
  const { markDayCompleted } = useWorkoutStore();

  // Map requested workout exercises to our rich Exercise items
  const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
  const [stage, setStage] = useState<'preview' | 'active' | 'rest' | 'celebration'>('preview');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(45);
  const [exerciseTotalSec, setExerciseTotalSec] = useState(45);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [useEasierVariant, setUseEasierVariant] = useState(false);
  const [showTechniqueSheet, setShowTechniqueSheet] = useState(false);
  const [showShareStory, setShowShareStory] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  // Post-workout stats
  const [xpEarned, setXpEarned] = useState(60);
  const [kmAdded, setKmAdded] = useState(5.4);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  // Speech synthesizer ref
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Build exercise list
  useEffect(() => {
    if (legacyExercise) {
      if ('frames' in legacyExercise) {
        const fullEx = legacyExercise as Exercise;
        setExercisesList([fullEx]);
        setExerciseTotalSec(fullEx.durationSec || 45);
        setSecondsLeft(fullEx.durationSec || 45);
      } else {
        const found = exercisesData.find(
          (e) => e.id === legacyExercise.id || e.category === legacyExercise.category
        ) || exercisesData[0];
        setExercisesList([found]);
        setExerciseTotalSec(found.durationSec || 45);
        setSecondsLeft(found.durationSec || 45);
      }
    } else if (day) {
      const focusText = `${day.focus || ''} ${day.title || ''}`.toLowerCase();
      let filtered = exercisesData.filter((e) => {
        if (focusText.includes('caminata')) return e.category === 'caminata';
        if (focusText.includes('pared')) return e.category === 'pilates_pared';
        if (focusText.includes('silla')) return e.category === 'pilates_silla';
        return true;
      });

      if (filtered.length === 0) filtered = exercisesData.slice(0, 4);
      const routine = filtered.slice(0, Math.min(5, filtered.length));
      setExercisesList(routine);
      const firstSec = routine[0]?.durationSec || 45;
      setExerciseTotalSec(firstSec);
      setSecondsLeft(firstSec);
    } else {
      const routine = exercisesData.slice(0, 4);
      setExercisesList(routine);
      setExerciseTotalSec(45);
      setSecondsLeft(45);
    }
  }, [day, legacyExercise]);

  const currentExercise = exercisesList[currentIndex] || exercisesData[0];
  const nextExercise = exercisesList[currentIndex + 1];

  // Helper for voice coaching in Spanish
  const speakVoice = (text: string) => {
    if (!voiceEnabled || !synthRef.current) return;
    try {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95; // Friendly, calm cadence
      utterance.pitch = 1.05;
      const voices = synthRef.current.getVoices();
      const esVoice = voices.find((v) => v.lang.startsWith('es'));
      if (esVoice) utterance.voice = esVoice;
      synthRef.current.speak(utterance);
    } catch {
      // Ignore voice errors
    }
  };

  const triggerVibrate = (pattern: number[] = [40, 80, 40]) => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  // Start workout from preview
  const handleStartWorkout = () => {
    setStage('active');
    trackingService.track('workout_start', {
      day_number: day?.dayNumber || 1,
      total_exercises: exercisesList.length,
    });
    speakVoice(`Comenzamos con ${currentExercise.name}. Respira con calma y mantén tu postura.`);
    triggerVibrate([50]);
  };

  // Timer Tick Loop
  useEffect(() => {
    if (stage !== 'active' && stage !== 'rest') return;
    if (isPaused) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleTimerEnd();
          return 0;
        }

        // Voice cues at half-time and 5 seconds remaining
        if (stage === 'active') {
          if (prev === Math.floor(exerciseTotalSec / 2)) {
            speakVoice('¡Mitad del tiempo! Alarga tu columna y sonríe.');
          } else if (prev === 6) {
            speakVoice('Últimos cinco segundos... ¡Gran esfuerzo!');
          }
        } else if (stage === 'rest') {
          if (prev === 4 && nextExercise) {
            speakVoice(`Siguiente ejercicio: ${nextExercise.name}. Prepárate.`);
          }
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, isPaused, exerciseTotalSec, currentIndex, nextExercise]);

  const handleTimerEnd = () => {
    triggerVibrate([60, 60, 60]);

    if (stage === 'active') {
      if (nextExercise) {
        // Move to rest interval
        setStage('rest');
        const restSec = day?.restSecBetweenExercises || 15;
        setExerciseTotalSec(restSec);
        setSecondsLeft(restSec);
        speakVoice('Toma un sorbo de agua y relaja tus hombros.');
      } else {
        // Workout Finished!
        finishWorkout();
      }
    } else if (stage === 'rest') {
      // Move to next exercise
      setStage('active');
      setCurrentIndex((prev) => prev + 1);
      const nextSec = nextExercise?.durationSec || 45;
      setExerciseTotalSec(nextSec);
      setSecondsLeft(nextSec);
      speakVoice(`Comenzamos con ${nextExercise?.name || 'el siguiente movimiento'}.`);
    }
  };

  const handleSkipToNext = () => {
    triggerVibrate([40]);
    if (stage === 'rest') {
      // Skip rest
      setStage('active');
      setCurrentIndex((prev) => prev + 1);
      const nextSec = nextExercise?.durationSec || 45;
      setExerciseTotalSec(nextSec);
      setSecondsLeft(nextSec);
      speakVoice(`Comenzamos con ${nextExercise?.name || 'el siguiente movimiento'}.`);
    } else if (nextExercise) {
      setStage('rest');
      const restSec = 15;
      setExerciseTotalSec(restSec);
      setSecondsLeft(restSec);
    } else {
      finishWorkout();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      triggerVibrate([40]);
      setCurrentIndex((prev) => prev - 1);
      const prevSec = exercisesList[currentIndex - 1]?.durationSec || 45;
      setExerciseTotalSec(prevSec);
      setSecondsLeft(prevSec);
      setStage('active');
    }
  };

  const finishWorkout = () => {
    setStage('celebration');
    triggerVibrate([100, 50, 100, 50, 100]);

    const duration = day?.durationMinutes || 12;
    if (day) {
      markDayCompleted(day.dayNumber);
    }

    // Award XP, Camino km, and record streak in gamification service
    const result = gamificationService.recordWorkoutComplete(duration, currentExercise.category);
    setXpEarned(result.xpEarned);
    setKmAdded(result.kmAdded);
    setNewBadges(result.newBadgesUnlocked);

    // Launch confetti
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#8B1E3F', '#F4A582', '#8FAF9A', '#D4AF37'],
      });
    } catch {
      // Ignore
    }

    trackingService.track('workout_complete', {
      day_number: day?.dayNumber || 1,
      duration_minutes: duration,
      xp_earned: result.xpEarned,
      km_added: result.kmAdded,
    });

    speakVoice('¡Felicidades! Has completado tu entrenamiento con éxito. Tu constancia es inspiradora.');
  };

  // Ring calculations
  const progressRatio = exerciseTotalSec > 0 ? (exerciseTotalSec - secondsLeft) / exerciseTotalSec : 0;
  const strokeRadius = 40;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference - progressRatio * strokeCircumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 select-none">
      <div className="relative w-full max-w-[430px] h-full sm:h-[880px] sm:max-h-[92vh] bg-[#FFF9F3] text-[#2A1E22] sm:rounded-[40px] shadow-2xl flex flex-col justify-between overflow-hidden border border-stone-200">
        
        {/* ========================================================
            SCREEN 1: PRE-WORKOUT PREVIEW
        ======================================================== */}
        {stage === 'preview' && (
          <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E3F] bg-[#8B1E3F]/10 px-3 py-1 rounded-full">
                  {day ? `Día ${day.dayNumber}` : 'Sesión Guiada'}
                </span>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-stone-200/60 text-stone-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h1 className="text-2xl font-serif font-bold text-[#2A1E22] mt-1">
                {day?.title || currentExercise.name}
              </h1>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {day?.focus || 'Activación suave de bajo impacto diseñada para cuidar tus articulaciones y activar tu metabolismo.'}
              </p>

              {/* Stat Chips */}
              <div className="grid grid-cols-3 gap-2 mt-5">
                <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col items-center text-center">
                  <Clock className="w-4 h-4 text-[#8B1E3F] mb-1" />
                  <span className="text-xs font-bold text-stone-800">
                    {day?.durationMinutes || 12} min
                  </span>
                  <span className="text-[10px] text-stone-400">Duración</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col items-center text-center">
                  <Flame className="w-4 h-4 text-[#F4A582] mb-1" />
                  <span className="text-xs font-bold text-stone-800">Bajo impacto</span>
                  <span className="text-[10px] text-stone-400">Rodilla segura</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col items-center text-center">
                  <Award className="w-4 h-4 text-[#8FAF9A] mb-1" />
                  <span className="text-xs font-bold text-stone-800">+60 XP</span>
                  <span className="text-[10px] text-stone-400">Recompensa</span>
                </div>
              </div>

              {/* Equipment & Preparation pills */}
              <div className="mt-5 p-3.5 rounded-2xl bg-[#F3E9DC]/60 border border-[#D5C4B5]/40 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#8B1E3F] shrink-0" />
                <div className="text-xs text-stone-700">
                  <p className="font-semibold text-[#2A1E22]">¿Qué necesitas hoy?</p>
                  <p className="text-[11px] text-stone-600">
                    Esterilla o piso firme, pared despejada y un vaso de agua cerca.
                  </p>
                </div>
              </div>

              {/* Sequence preview list */}
              <div className="mt-5">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5">
                  Secuencia de ejercicios ({exercisesList.length})
                </h3>
                <div className="space-y-2">
                  {exercisesList.map((ex, i) => (
                    <div
                      key={ex.id + i}
                      className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-[#2A1E22]">{ex.name}</p>
                          <p className="text-[10px] text-stone-500">
                            {ex.targetZones.join(' · ')}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-medium text-stone-500">
                        {ex.durationSec || 45}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="pt-6">
              <Button
                variant="primary"
                size="xl"
                className="w-full bg-[#8B1E3F] hover:bg-[#A32349] text-white py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-base font-bold"
                onClick={handleStartWorkout}
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Comenzar entrenamiento</span>
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================
            SCREEN 2: IN-WORKOUT ACTIVE PLAYER
        ======================================================== */}
        {stage === 'active' && (
          <div className="flex-1 flex flex-col justify-between p-4 sm:p-5">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#8B1E3F] bg-[#8B1E3F]/10 px-2.5 py-1 rounded-full">
                  {currentIndex + 1} de {exercisesList.length}
                </span>
                <span className="text-xs font-medium text-stone-500 truncate max-w-[170px]">
                  {day?.title || 'Ligera'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Voice Coaching Toggle */}
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  title={voiceEnabled ? 'Voz activada' : 'Voz silenciada'}
                  className={`p-2 rounded-full border transition-colors ${
                    voiceEnabled
                      ? 'bg-[#8B1E3F]/10 text-[#8B1E3F] border-[#8B1E3F]/20'
                      : 'bg-stone-100 text-stone-400 border-stone-200'
                  }`}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    if (window.confirm('¿Quieres pausar y salir del entrenamiento?')) {
                      onClose();
                    }
                  }}
                  className="p-2 rounded-full hover:bg-stone-200/60 text-stone-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Exercise Title */}
            <div className="my-1">
              <h2 className="text-lg font-serif font-bold text-[#2A1E22] truncate">
                {currentExercise.name}
              </h2>
            </div>

            {/* Animated Exercise Visualizer (~55% of screen) */}
            <div className="w-full my-auto">
              <ExerciseAnimator
                exercise={currentExercise}
                isPlaying={!isPaused}
                useEasierVariant={useEasierVariant}
              />
            </div>

            {/* Bottom Controls & Timer Section */}
            <div className="space-y-3 pt-2">
              {/* Circular SVG Timer & Time readout */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  {/* SVG Countdown Ring */}
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r={strokeRadius}
                        stroke="#F3E9DC"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r={strokeRadius}
                        stroke="#8B1E3F"
                        strokeWidth="8"
                        strokeDasharray={strokeCircumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-base text-[#2A1E22]">
                      {secondsLeft}s
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Tiempo restante
                    </span>
                    <p className="text-xs font-medium text-stone-800">
                      {isPaused ? 'Pausa activa' : 'Respira a tu ritmo'}
                    </p>
                  </div>
                </div>

                {/* Options: Easier Variant & Technique Sheet */}
                <div className="flex flex-col gap-1.5 items-end">
                  {currentExercise.easierVariant && (
                    <button
                      onClick={() => setUseEasierVariant(!useEasierVariant)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1 ${
                        useEasierVariant
                          ? 'bg-[#8FAF9A] text-white border-[#8FAF9A]'
                          : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{useEasierVariant ? 'Versión suave: Sí' : 'Hacer más fácil'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowTechniqueSheet(true)}
                    className="text-[11px] font-semibold text-[#8B1E3F] hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Ver postura y técnica</span>
                  </button>
                </div>
              </div>

              {/* Main Playback Buttons */}
              <div className="flex items-center justify-center gap-5 pt-1">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="p-3 rounded-full hover:bg-stone-200 text-stone-600 disabled:opacity-30 transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="w-14 h-14 rounded-full bg-[#8B1E3F] hover:bg-[#A32349] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                >
                  {isPaused ? (
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  ) : (
                    <Pause className="w-6 h-6 fill-current" />
                  )}
                </button>

                <button
                  onClick={handleSkipToNext}
                  className="p-3 rounded-full hover:bg-stone-200 text-stone-600 transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Next exercise teaser banner */}
              {nextExercise && (
                <div
                  onClick={handleSkipToNext}
                  className="p-2.5 rounded-2xl bg-white border border-stone-200 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase">
                      Siguiente:
                    </span>
                    <span className="text-xs font-semibold text-stone-700 truncate max-w-[220px]">
                      {nextExercise.name}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            SCREEN 3: REST INTERVAL SCREEN
        ======================================================== */}
        {stage === 'rest' && (
          <div className="flex-1 flex flex-col justify-between p-6 text-center animate-in fade-in duration-300">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-stone-200/60 text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8FAF9A] bg-[#8FAF9A]/15 px-3 py-1 rounded-full">
                Descanso Activo
              </span>

              {/* Big rest countdown ring */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={strokeRadius}
                    stroke="#F3E9DC"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={strokeRadius}
                    stroke="#8FAF9A"
                    strokeWidth="8"
                    strokeDasharray={strokeCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <span className="absolute font-mono font-extrabold text-3xl text-[#2A1E22]">
                  {secondsLeft}s
                </span>
              </div>

              <p className="text-sm text-stone-600 max-w-xs mx-auto leading-relaxed">
                Toma un sorbo de agua fresca, relaja tus hombros y respira profundo.
              </p>

              {/* Next Exercise Card Preview */}
              {nextExercise && (
                <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-sm text-left mt-6">
                  <span className="text-[10px] font-bold uppercase text-[#8B1E3F]">
                    A continuación
                  </span>
                  <p className="font-serif font-bold text-base text-[#2A1E22] mt-0.5">
                    {nextExercise.name}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Duración: {nextExercise.durationSec || 45}s · {nextExercise.targetZones.join(' · ')}
                  </p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-full border-stone-300 text-stone-700 py-3 rounded-2xl"
              onClick={handleSkipToNext}
            >
              Saltar descanso ⏭
            </Button>
          </div>
        )}

        {/* ========================================================
            SCREEN 4: POST-WORKOUT CELEBRATION
        ======================================================== */}
        {stage === 'celebration' && (
          <div className="flex-1 flex flex-col justify-between p-6 text-center overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="my-auto space-y-4 pt-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#8B1E3F] to-[#F4A582] text-white flex items-center justify-center mx-auto shadow-xl ring-4 ring-[#FFF9F3]">
                <Sparkles className="w-10 h-10" />
              </div>

              <div>
                <h1 className="text-2xl font-serif font-bold text-[#2A1E22]">
                  ¡Increíble trabajo, {answers.user_name || 'amiga'}!
                </h1>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed max-w-xs mx-auto">
                  Has completado tu sesión con dedicación y cariño a tu cuerpo.
                </p>
              </div>

              {/* Rewards Summary Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col items-center">
                  <span className="text-2xl font-extrabold text-[#8B1E3F] font-mono">
                    +{xpEarned} XP
                  </span>
                  <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1 mt-0.5">
                    <Award className="w-3.5 h-3.5 text-[#8B1E3F]" />
                    Progreso de nivel
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col items-center">
                  <span className="text-2xl font-extrabold text-[#8FAF9A] font-mono">
                    +{kmAdded} km
                  </span>
                  <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1 mt-0.5">
                    <Footprints className="w-3.5 h-3.5 text-[#8FAF9A]" />
                    En tu Camino virtual
                  </span>
                </div>
              </div>

              {/* Unlocked Badges announcement */}
              {newBadges.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#F4A582]/15 border border-[#F4A582]/30 flex items-center gap-3 text-left">
                  <div className="p-2 rounded-xl bg-[#F4A582] text-white">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#8B1E3F]">
                      ¡Nueva medalla desbloqueada!
                    </p>
                    <p className="text-[11px] text-stone-600">
                      Revisa tu vitrina de trofeos en la pestaña Logros.
                    </p>
                  </div>
                </div>
              )}

              {/* 3-Option Mood Rating */}
              <div className="pt-2 text-left">
                <span className="text-xs font-bold text-stone-700 block mb-2 text-center">
                  ¿Cómo sentiste la sesión de hoy?
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedMood(1)}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      selectedMood === 1
                        ? 'bg-[#8FAF9A]/20 border-[#8FAF9A] text-[#406852] font-bold'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Smile className="w-5 h-5 mx-auto mb-1 text-[#8FAF9A]" />
                    <span className="text-[10px] block leading-tight">Suave & agradable</span>
                  </button>

                  <button
                    onClick={() => setSelectedMood(2)}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      selectedMood === 2
                        ? 'bg-[#F4A582]/20 border-[#F4A582] text-[#A34F2D] font-bold'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Heart className="w-5 h-5 mx-auto mb-1 text-[#F4A582]" />
                    <span className="text-[10px] block leading-tight">Perfecto & vital</span>
                  </button>

                  <button
                    onClick={() => setSelectedMood(3)}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      selectedMood === 3
                        ? 'bg-[#8B1E3F]/15 border-[#8B1E3F] text-[#8B1E3F] font-bold'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Zap className="w-5 h-5 mx-auto mb-1 text-[#8B1E3F]" />
                    <span className="text-[10px] block leading-tight">Desafiante</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2.5 pt-4">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-[#8B1E3F]/30 text-[#8B1E3F] hover:bg-[#8B1E3F]/5 py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-xs"
                onClick={() => setShowShareStory(true)}
              >
                <Share2 className="w-4 h-4" />
                <span>Compartir en Historia de Instagram</span>
              </Button>

              <Button
                variant="primary"
                size="xl"
                className="w-full bg-[#8B1E3F] hover:bg-[#A32349] text-white py-3.5 rounded-2xl font-bold shadow-md"
                onClick={onClose}
              >
                Guardar y volver a Hoy
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================
            TECHNIQUE BOTTOM SHEET
        ======================================================== */}
        {showTechniqueSheet && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end">
            <div className="w-full bg-white rounded-t-3xl p-6 shadow-2xl max-h-[80%] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h3 className="font-serif font-bold text-lg text-[#2A1E22]">
                  Técnica y Postura
                </h3>
                <button
                  onClick={() => setShowTechniqueSheet(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Steps */}
              <div>
                <h4 className="text-xs font-bold text-[#8B1E3F] uppercase tracking-wider mb-2">
                  Paso a paso
                </h4>
                <ul className="space-y-2 text-xs text-stone-700">
                  {currentExercise.steps.map((st, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{st}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Breathing */}
              <div className="p-3 rounded-2xl bg-[#FFF9F3] border border-stone-200">
                <h4 className="text-xs font-bold text-[#8B1E3F] mb-1">
                  Guía de Respiración
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {currentExercise.breathing}
                </p>
              </div>

              {/* Common Mistakes */}
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                  Errores comunes a evitar
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-600">
                  {currentExercise.commonMistakes.map((mis, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600">⚠️</span>
                      <span className="leading-relaxed">{mis}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full bg-[#8B1E3F] text-white py-3 rounded-2xl"
                onClick={() => setShowTechniqueSheet(false)}
              >
                Entendido, continuar
              </Button>
            </div>
          </div>
        )}

        {/* Instagram Story Share Modal */}
        {showShareStory && (
          <ShareStoryCanvas
            workoutTitle={day?.title || currentExercise.name}
            durationMinutes={day?.durationMinutes || 12}
            streakDays={gamificationService.getState().streak}
            caminoKm={gamificationService.getState().caminoKm}
            xpEarned={xpEarned}
            userName={answers.user_name || 'Amiga'}
            onClose={() => setShowShareStory(false)}
          />
        )}
      </div>
    </div>
  );
};
