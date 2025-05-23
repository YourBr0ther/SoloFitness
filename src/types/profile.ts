export interface Profile {
  id: string;
  username: string;
  avatarUrl: string;
  level: number;
  xp: number;
  currentStreak: number;
  streakHistory: StreakDay[];
  notifications: NotificationTime[];
  preferences: {
    enablePenalties: boolean;
    enableBonuses: boolean;
  };
  badges: GymBadge[];
  apiKey: string;
}

export interface StreakDay {
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