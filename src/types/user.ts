import { StreakDay } from './profile';

export interface UserProfile {
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  streakHistory: StreakDay[];
  exerciseCounts: {
    pushups: number;
    situps: number;
    squats: number;
    milesRan: number;
  };
}

export interface UserSettings {
  enableNotifications: boolean;
  darkMode: boolean;
  language: string;
  enablePenalties: boolean;
  enableBonuses: boolean;
  reminderTimes: string[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  profile: UserProfile;
  settings?: UserSettings;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  avatarUrl?: string;
} 