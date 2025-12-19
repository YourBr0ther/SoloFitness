// Distance unit preference
export type DistanceUnit = 'km' | 'miles';

// Exercise types
export type ExerciseType = 'pushups' | 'situps' | 'squats' | 'running';

// Daily requirements based on progression
export interface DailyRequirements {
  pushups: number;
  situps: number;
  squats: number;
  runningKm: number;
  dayNumber: number;
}

// Exercise log entry
export interface ExerciseEntry {
  pushups: number;
  situps: number;
  squats: number;
  runningKm: number;
}

// Penalty calculation result
export interface PenaltyCalculation {
  exercise: ExerciseType;
  shortfall: number;
  penaltyAmount: number;
}

// Achievement definition
export interface AchievementDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

// Level milestone
export interface LevelMilestone {
  level: number;
  day: number;
  pushups: number;
  runningKm: number;
}

// User stats summary
export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalPushups: number;
  totalSitups: number;
  totalSquats: number;
  totalRunningKm: number;
  totalWorkouts: number;
  currentXP: number;
  currentLevel: number;
  dayNumber: number;
}

// Daily log with computed fields
export interface DailyLogWithStatus {
  id: string;
  date: Date;
  pushups: number;
  situps: number;
  squats: number;
  runningKm: number;
  targetPushups: number;
  targetSitups: number;
  targetSquats: number;
  targetRunningKm: number;
  completed: boolean;
  xpEarned: number;
  completionPercentage: number;
}
