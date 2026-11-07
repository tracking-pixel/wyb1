export interface Exercise {
  id: string;
  title: string;
  category: string;
  level: string;
  durationSec: number;
  targetZones: string[];
  instructions: string;
  alternative?: {
    limitation: string;
    title: string;
    instructions: string;
  };
}

export interface ProgramDay {
  dayNumber: number;
  title: string;
  subtitle: string;
  durationMinutes: number;
  restSecBetweenExercises: number;
  focus: string;
  exerciseIds: string[];
  coachTip?: string;
}

export interface ContentService {
  getAllExercises(category?: string): Exercise[];
  getExercise(id: string): Exercise | undefined;
  getProgramDays(): ProgramDay[];
  getDay(dayNumber: number): ProgramDay | undefined;
  getMealPlan(): any;
  getFaceYoga(): any;
}

export { contentService } from './mock/contentMock';
