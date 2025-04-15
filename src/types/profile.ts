import { ExerciseProgress, Preferences } from './shared';

export interface Profile {
  id: string;
  username: string;
  avatarUrl: string;
  level: number;
  xp: number;
  currentStreak: number;
  streakHistory: StreakDay[];
  notifications: NotificationTime[];
  preferences: Preferences;
  badges: GymBadge[];
  apiKey: string;
  reminderTimes?: string[];
  enableNotifications?: boolean;
  enablePenalties?: boolean;
  enableBonuses?: boolean;
}

export interface StreakDay {
  date: string;
  completed: boolean;
  xpEarned: number;
  exercises: ExerciseProgress;
}

export interface NotificationTime {
  id: string;
  time: string;
  enabled: boolean;
}

export interface GymBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  total: number;
  isNew: boolean;
} 