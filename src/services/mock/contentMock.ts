import exerciseList from '@/src/content/program/exercise_library.json';
import programData from '@/src/content/program/program_28_days.json';
import mealPlanData from '@/src/content/program/meal_plan.json';
import faceYogaData from '@/src/content/program/face_yoga.json';
import { ContentService, Exercise, ProgramDay } from '../content';

class ContentServiceImpl implements ContentService {
  private exercises: Exercise[] = exerciseList as Exercise[];
  private programDays: ProgramDay[] = programData.days as ProgramDay[];

  getAllExercises(category?: string): Exercise[] {
    if (!category || category === 'all') {
      return this.exercises;
    }
    return this.exercises.filter((ex) => ex.category === category);
  }

  getExercise(id: string): Exercise | undefined {
    return this.exercises.find((ex) => ex.id === id);
  }

  getProgramDays(): ProgramDay[] {
    return this.programDays;
  }

  getDay(dayNumber: number): ProgramDay | undefined {
    return this.programDays.find((d) => d.dayNumber === dayNumber);
  }

  getMealPlan(): any {
    return mealPlanData;
  }

  getFaceYoga(): any {
    return faceYogaData;
  }
}

export const contentService = new ContentServiceImpl();
