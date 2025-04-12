import { Exercise } from './exercise';

export interface Workout {
  date: string;
  completed: boolean;
  level: number;
  requirements: {
    pushups: number;
    situps: number;
    squats: number;
    milesRan: number;
  };
  currentProgress: {
    pushups: number;
    situps: number;
    squats: number;
    milesRan: number;
  };
  penalties: {
    pushups: number;
    situps: number;
    squats: number;
    milesRan: number;
  };
  bonusTask: string | null;
  hasPenalty: boolean;
}

export interface WorkoutUpdate {
  exercises: {
    pushups: number;
    situps: number;
    squats: number;
    milesRan: number;
  };
  completeBonusTask: boolean;
}

export interface WorkoutResult {
  completed: boolean;
  xpEarned: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
}

export interface WorkoutFilters {
  startDate?: string;
  endDate?: string;
  completed?: boolean;
} 