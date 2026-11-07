export type ExerciseCategory =
  | 'caminata'
  | 'pilates_pared'
  | 'pilates_silla'
  | 'estiramiento'
  | 'yoga_facial';

export type MuscleZone =
  | 'abdomen'
  | 'piernas'
  | 'gluteos'
  | 'brazos'
  | 'espalda'
  | 'rostro';

export interface ExerciseTempoPhase {
  phase: string;
  sec: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  level: 1 | 2 | 3;
  durationSec?: number;
  reps?: number;
  tempo: ExerciseTempoPhase[];
  targetZones: MuscleZone[];
  steps: string[];
  commonMistakes: string[];
  breathing: string;
  easierVariant?: string;
  kneeSafe: boolean;
  backSafe: boolean;
  frames: {
    start: string;
    mid: string;
    end: string;
  };
  framePrompts: {
    start: string;
    mid: string;
    end: string;
  };
  videoUrl?: string;
}
