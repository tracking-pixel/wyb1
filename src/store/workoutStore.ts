import { create } from 'zustand';

const STORAGE_KEY = 'ligera_workout_tracker_v1';

export interface WeightRecord {
  date: string;
  weightKg: number;
}

interface WorkoutState {
  currentDay: number;
  completedDays: number[];
  waterGlasses: number;
  waterTarget: number;
  streak: number;
  weightLogs: WeightRecord[];
  challengeCheckins: number[];
  checkedGroceries: string[];

  setCurrentDay: (day: number) => void;
  markDayCompleted: (day: number) => void;
  addWaterGlass: () => void;
  resetWater: () => void;
  logWeight: (weightKg: number) => void;
  toggleChallengeCheckin: (day: number) => void;
  toggleGroceryItem: (item: string) => void;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    currentDay: 1,
    completedDays: [],
    waterGlasses: 3,
    waterTarget: 8,
    streak: 3,
    weightLogs: [
      { date: 'Hace 3 semanas', weightKg: 69.5 },
      { date: 'Hace 2 semanas', weightKg: 68.8 },
      { date: 'Semana pasada', weightKg: 68.3 },
      { date: 'Hoy', weightKg: 67.8 },
    ],
    challengeCheckins: [1, 2],
    checkedGroceries: [],
  };
}

export const useWorkoutStore = create<WorkoutState>((set, get) => {
  const initial = loadState();

  const persist = (data: Partial<WorkoutState>) => {
    try {
      const current = get();
      const updated = { ...current, ...data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return {
    currentDay: initial.currentDay,
    completedDays: initial.completedDays,
    waterGlasses: initial.waterGlasses,
    waterTarget: initial.waterTarget,
    streak: initial.streak,
    weightLogs: initial.weightLogs,
    challengeCheckins: initial.challengeCheckins,
    checkedGroceries: initial.checkedGroceries,

    setCurrentDay: (day) => {
      set({ currentDay: day });
      persist({ currentDay: day });
    },

    markDayCompleted: (day) => {
      const state = get();
      if (!state.completedDays.includes(day)) {
        const completedDays = [...state.completedDays, day];
        const streak = state.streak + 1;
        set({ completedDays, streak });
        persist({ completedDays, streak });
      }
    },

    addWaterGlass: () => {
      const state = get();
      const waterGlasses = Math.min(state.waterTarget, state.waterGlasses + 1);
      set({ waterGlasses });
      persist({ waterGlasses });
    },

    resetWater: () => {
      set({ waterGlasses: 0 });
      persist({ waterGlasses: 0 });
    },

    logWeight: (weightKg) => {
      const state = get();
      const todayLabel = 'Hoy';
      const filtered = state.weightLogs.filter((w) => w.date !== todayLabel);
      const weightLogs = [...filtered, { date: todayLabel, weightKg }];
      set({ weightLogs });
      persist({ weightLogs });
    },

    toggleChallengeCheckin: (day) => {
      const state = get();
      const exists = state.challengeCheckins.includes(day);
      const challengeCheckins = exists
        ? state.challengeCheckins.filter((d) => d !== day)
        : [...state.challengeCheckins, day];
      set({ challengeCheckins });
      persist({ challengeCheckins });
    },

    toggleGroceryItem: (item) => {
      const state = get();
      const exists = state.checkedGroceries.includes(item);
      const checkedGroceries = exists
        ? state.checkedGroceries.filter((i) => i !== item)
        : [...state.checkedGroceries, item];
      set({ checkedGroceries });
      persist({ checkedGroceries });
    },
  };
});
