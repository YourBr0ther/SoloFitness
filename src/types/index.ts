export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string | null;
  level: number;
  currentXP: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  penaltiesEnabled: boolean;
  bonusEnabled: boolean;
}

export interface DailyLog {
  id: string;
  userId: string;
  date: Date;
  pushups: number;
  situps: number;
  squats: number;
  milesRan: number;
  xpEarned: number;
  completed: boolean;
  penalties: Penalty[];
  bonusTasks: BonusTask[];
}

export interface Penalty {
  id: string;
  dailyLogId: string;
  exercise: string;
  amount: number;
  completed: boolean;
}

export interface BonusTask {
  id: string;
  dailyLogId: string;
  task: string;
  completed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  achievement: Achievement;
}

export interface ExerciseTarget {
  current: number;
  target: number;
}

export interface LevelRequirement {
  pushups: number;
  situps: number;
  squats: number;
  miles: number;
  xpRequired: number;
}

export interface JournalPageProps {
  streak: number;
  todayXP: number;
  currentLevel: number;
  levelProgress: { current: number; required: number };
  exercises: {
    pushups: ExerciseTarget;
    situps: ExerciseTarget;
    squats: ExerciseTarget;
    milesRan: ExerciseTarget;
  };
  penalties?: Penalty[];
  bonusTask?: BonusTask;
}

export interface AuthForm {
  username: string;
  email: string;
  password: string;
}