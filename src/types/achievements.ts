export type AchievementCategory = 
  | 'streak'
  | 'level'
  | 'exercise'
  | 'social'
  | 'challenge'
  | 'special';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  points: number;
  requirements: {
    type: string;
    value: number;
  };
  isSecret: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  progress: number;
  isUnlocked: boolean;
  unlockedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  isUnlocked: boolean;
}

export interface AchievementFilters {
  category?: AchievementCategory;
  unlocked?: boolean;
  secret?: boolean;
} 