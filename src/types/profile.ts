import { ExerciseProgress, Preferences } from './shared';

export interface Profile {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
  profile?: {
    level: number;
    xp: number;
    currentStreak: number;
    longestStreak: number;
    streakHistory: StreakDay[];
    badges: GymBadge[];
  };
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  streakHistory: StreakDay[];
  notifications: NotificationTime[];
  preferences: Preferences;
  badges: GymBadge[];
  apiKey: string;
  reminderTimes?: string[];
  enableNotifications?: boolean;
  enablePenalties?: boolean;
  enableBonuses?: boolean;
  settings?: {
    enableNotifications: boolean;
    darkMode: boolean;
    language: string;
    enablePenalties: boolean;
    enableBonuses: boolean;
    reminderTimes: string[];
  };
  createdAt: string;
  updatedAt: string;
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