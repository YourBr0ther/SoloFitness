export interface ExerciseProgress {
  id: string;
  name: string;
  count: number;
  dailyGoal: number;
  increment?: number;
  unit?: string;
}

export interface PenaltyTask {
  id: string;
  exercise: string;
  count: number;
  unit: string;
}

export interface BonusTask {
  id: string;
  description: string;
  completed: boolean;
}

export interface DailyExercise {
  id: string;
  name: string;
  count: number;
  dailyGoal: number;
  increment: number;
  unit: string;
} 