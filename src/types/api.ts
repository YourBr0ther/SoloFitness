import { Coach } from './coach';
import { Exercise, PenaltyTask, BonusTask } from './journal';
import { Profile, StreakDay, GymBadge } from './profile';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
}

// Coach API Types
export interface CoachResponse extends ApiResponse<Coach> {}
export interface CoachesResponse extends ApiResponse<Coach[]> {}

// Journal API Types
export interface ExerciseResponse extends ApiResponse<Exercise> {}
export interface ExercisesResponse extends ApiResponse<Exercise[]> {}
export interface PenaltyTaskResponse extends ApiResponse<PenaltyTask> {}
export interface BonusTaskResponse extends ApiResponse<BonusTask> {}

// Profile API Types
export interface ProfileResponse extends ApiResponse<Profile> {}
export interface StreakResponse extends ApiResponse<StreakDay[]> {}
export interface BadgesResponse extends ApiResponse<GymBadge[]> {}

// Request Types
export interface UpdateExerciseRequest {
  exerciseId: string;
  count: number;
}

export interface UpdateProfileRequest {
  username?: string;
  avatarUrl?: string;
  preferences?: {
    enablePenalties?: boolean;
    enableBonuses?: boolean;
  };
}

export interface UpdateStreakRequest {
  date: string;
  completed: boolean;
  xpEarned: number;
  exercises: {
    pushups: number;
    situps: number;
    squats: number;
    milesRan: number;
  };
} 