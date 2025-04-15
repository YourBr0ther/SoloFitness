export interface Exercise {
  id: string;
  name: string;
  count: number;
  dailyGoal: number;
  increment: number;
  unit: string;
}

export interface ExerciseProgress {
  pushups: number;
  situps: number;
  squats: number;
  milesRan: number;
}

export interface Task {
  id: string;
  description: string;
  completed: boolean;
}

export interface Preferences {
  enablePenalties: boolean;
  enableBonuses: boolean;
} 