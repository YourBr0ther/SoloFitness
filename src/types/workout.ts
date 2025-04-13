import { Exercise } from './exercise';

export interface WorkoutProgress {
  pushups: number;
  situps: number;
  squats: number;
  milesRan: number;
}

export interface Workout {
  date: string;
  completed: boolean;
  level: number;
  requirements: WorkoutProgress;
  currentProgress: WorkoutProgress;
  penalties: WorkoutProgress;
  bonusTask: string | null;
  hasPenalty: boolean;
}

export interface WorkoutUpdate {
  exercises: WorkoutProgress;
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