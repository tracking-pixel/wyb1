import { create } from 'zustand';
import { QuizAnswers, UnitsSystem } from '@/src/types';

const STORAGE_KEY = 'ligera_quiz_state_v1';

const defaultAnswers: QuizAnswers = {
  primary_goal: 'weight_loss',
  age_range: '45_54',
  current_body_type: 'rectangle',
  target_body_type: 'rectangle_fit',
  target_zones: ['abdomen', 'legs'],
  activity_level: 'light_walking',
  workout_preference: 'wall_pilates',
  daily_time: '15_min',
  limitations: ['knees'],
  last_ideal_weight: '1_to_3_years',
  sleep_hours: '6_to_7',
  water_intake: '1_to_2l',
  energy_level: 'afternoon_crash',
  habits: ['snack_between_meals'],
  motivating_event: 'vacation',
  units: 'metric',
  height_cm: 162,
  current_weight_kg: 68,
  target_weight_kg: 60,
  user_name: 'Carmen',
  training_time_preference: 'morning',
  marketing_opt_in: true,
};

function loadStoredState(): { answers: QuizAnswers; lastStep: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        answers: { ...defaultAnswers, ...parsed.answers },
        lastStep: parsed.lastStep || 1,
      };
    }
  } catch {
    // ignore
  }
  return { answers: defaultAnswers, lastStep: 1 };
}

interface QuizState {
  answers: QuizAnswers;
  lastStep: number;
  setAnswer: <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;
  setLastStep: (step: number) => void;
  resetQuiz: () => void;
  getBmi: (weightKg?: number, heightCm?: number) => number;
  getProjectedWeeks: () => number;
}

export const useQuizStore = create<QuizState>((set, get) => {
  const initial = loadStoredState();

  const persist = (answers: QuizAnswers, lastStep: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, lastStep }));
    } catch {
      // ignore
    }
  };

  return {
    answers: initial.answers,
    lastStep: initial.lastStep,

    setAnswer: (key, value) => {
      set((state) => {
        const updatedAnswers = { ...state.answers, [key]: value };
        persist(updatedAnswers, state.lastStep);
        return { answers: updatedAnswers };
      });
    },

    setLastStep: (step) => {
      set((state) => {
        persist(state.answers, step);
        return { lastStep: step };
      });
    },

    resetQuiz: () => {
      set({ answers: defaultAnswers, lastStep: 1 });
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    },

    getBmi: (weightKg, heightCm) => {
      const w = weightKg ?? get().answers.current_weight_kg;
      const h = (heightCm ?? get().answers.height_cm) / 100;
      if (!h || h <= 0) return 22;
      return Number((w / (h * h)).toFixed(1));
    },

    getProjectedWeeks: () => {
      const { current_weight_kg, target_weight_kg } = get().answers;
      const diff = Math.max(0, current_weight_kg - target_weight_kg);
      // Safe, sustainable weight loss: max ~0.65 kg per week
      const weeks = Math.max(4, Math.ceil(diff / 0.65));
      return weeks;
    },
  };
});
