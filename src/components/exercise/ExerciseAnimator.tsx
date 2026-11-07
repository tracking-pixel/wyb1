import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Exercise } from '@/src/types/exercise';
import { assetService } from '@/src/services/assetService';
import { MuscleSilhouette } from './MuscleSilhouette';
import { ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

interface ExerciseAnimatorProps {
  exercise: Exercise;
  isPlaying?: boolean;
  useEasierVariant?: boolean;
  className?: string;
  onPhaseChange?: (phaseIndex: number, phaseName: string) => void;
}

export const ExerciseAnimator: React.FC<ExerciseAnimatorProps> = ({
  exercise,
  isPlaying = true,
  useEasierVariant = false,
  className = '',
  onPhaseChange,
}) => {
  const [frameUrls, setFrameUrls] = useState<[string, string, string]>([
    '',
    '',
    '',
  ]);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);

  // Ping-pong sequence indices: 0 (start) -> 1 (mid) -> 2 (end) -> 1 (mid) -> 0 (start)
  const sequence = [0, 1, 2, 1];
  const seqStepRef = useRef(0);

  // Load keyframe images via assetService
  useEffect(() => {
    let isCancelled = false;
    async function loadFrames() {
      try {
        const [startUrl, midUrl, endUrl] = await Promise.all([
          assetService.get(exercise.frames.start),
          assetService.get(exercise.frames.mid),
          assetService.get(exercise.frames.end),
        ]);
        if (!isCancelled) {
          setFrameUrls([startUrl, midUrl, endUrl]);
          setLoaded(true);
        }
      } catch (err) {
        console.warn('Error loading exercise frames:', err);
      }
    }
    loadFrames();
    return () => {
      isCancelled = true;
    };
  }, [exercise.id, exercise.frames]);

  // Tempo animation timer
  useEffect(() => {
    if (!isPlaying) return;

    const tempoPhases = exercise.tempo.length > 0 ? exercise.tempo : [
      { phase: 'Comienza', sec: 2 },
      { phase: 'Sostén', sec: 1 },
      { phase: 'Regresa', sec: 2 },
    ];

    let timer: NodeJS.Timeout;

    const step = () => {
      seqStepRef.current = (seqStepRef.current + 1) % sequence.length;
      const nextFrame = sequence[seqStepRef.current];
      setActiveFrameIndex(nextFrame);

      const nextPhase = seqStepRef.current % tempoPhases.length;
      setCurrentPhaseIndex(nextPhase);
      onPhaseChange?.(nextPhase, tempoPhases[nextPhase]?.phase || 'Movimiento');

      const currentPhaseSec = tempoPhases[nextPhase]?.sec || 2;
      timer = setTimeout(step, currentPhaseSec * 1000);
    };

    const firstPhaseSec = tempoPhases[0]?.sec || 2;
    timer = setTimeout(step, firstPhaseSec * 1000);

    return () => clearTimeout(timer);
  }, [isPlaying, exercise.tempo, onPhaseChange]);

  const currentTempoPhase = exercise.tempo[currentPhaseIndex] || {
    phase: 'Movimiento fluido',
    sec: 2,
  };

  // Check if we have real video
  const hasVideo = !!exercise.videoUrl;

  return (
    <div
      className={`relative w-full aspect-4/3 rounded-3xl overflow-hidden bg-[#FAF7F5] shadow-inner select-none ${className}`}
    >
      {/* Level 1: Video */}
      {hasVideo ? (
        <video
          src={exercise.videoUrl}
          className="w-full h-full object-cover"
          autoPlay={isPlaying}
          loop
          muted
          playsInline
        />
      ) : (
        /* Level 2 & 3: Keyframes Ping-Pong or Breathing Fallback */
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Subtle warm background radial glow */}
          <div className="absolute inset-0 bg-radial from-[#F3E9DC]/60 via-[#FFF9F3] to-[#FAF7F5]" />

          {/* Keyframe images crossfade */}
          <AnimatePresence mode="popLayout">
            {loaded && frameUrls[activeFrameIndex] && (
              <motion.img
                key={`${exercise.id}-${activeFrameIndex}`}
                src={frameUrls[activeFrameIndex]}
                alt={exercise.name}
                initial={{ opacity: 0.75, scale: 0.99 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.6, ease: 'easeInOut' },
                }}
                exit={{ opacity: 0.65, transition: { duration: 0.4 } }}
                className="w-full h-full object-cover relative z-10"
              />
            )}
          </AnimatePresence>

          {/* Fallback directional movement arrows for guidance */}
          <div className="absolute inset-0 flex flex-col items-center justify-between pointer-events-none p-4 z-20 opacity-40">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ChevronUp className="w-6 h-6 text-[#8B1E3F]" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ChevronDown className="w-6 h-6 text-[#8B1E3F]" />
            </motion.div>
          </div>
        </div>
      )}

      {/* Top Left: Easier Variant indicator if active */}
      {useEasierVariant && exercise.easierVariant && (
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#8FAF9A]/40 text-[#406852] text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#8FAF9A]" />
          <span>Versión suave activa</span>
        </div>
      )}

      {/* Top Right: Muscle Zones anatomical mini-silhouette */}
      <div className="absolute top-3 right-3 z-30">
        <MuscleSilhouette activeZones={exercise.targetZones} size={42} />
      </div>

      {/* Bottom Center: Pulsing Tempo phase bar */}
      <div className="absolute bottom-3 inset-x-3 z-30 flex items-center justify-between bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/80 shadow-md">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ repeat: Infinity, duration: currentTempoPhase.sec || 2 }}
            className="w-2.5 h-2.5 rounded-full bg-[#8B1E3F]"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#2A1E22]">
              {currentTempoPhase.phase}
            </span>
            <span className="text-[10px] text-stone-500 font-medium">
              Respira: {exercise.breathing}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-[#8B1E3F] bg-[#8B1E3F]/10 px-2 py-0.5 rounded-md">
            {currentTempoPhase.sec}s
          </span>
        </div>
      </div>
    </div>
  );
};
