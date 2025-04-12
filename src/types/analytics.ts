export interface ProgressAnalytics {
  totalExercises: number;
  totalDuration: number;
  averageDuration: number;
  completionRate: number;
  streak: {
    current: number;
    longest: number;
    average: number;
  };
  level: {
    current: number;
    progress: number;
    totalXP: number;
  };
  achievements: {
    unlocked: number;
    total: number;
    progress: number;
  };
}

export interface ExerciseAnalytics {
  exerciseId: string;
  name: string;
  totalCompleted: number;
  averageDuration: number;
  completionRate: number;
  lastCompleted?: Date;
  streak: {
    current: number;
    longest: number;
  };
}

export interface StreakAnalytics {
  current: number;
  longest: number;
  history: {
    date: Date;
    count: number;
  }[];
  average: number;
  completionRate: number;
}

export interface AchievementAnalytics {
  unlocked: number;
  total: number;
  progress: number;
  byCategory: {
    streak: number;
    exercise: number;
    progress: number;
    social: number;
    special: number;
  };
  recent: {
    id: string;
    name: string;
    unlockedAt: Date;
  }[];
  nextMilestone: {
    count: number;
    reward: string;
  };
}

export type AnalyticsPeriod = 
  | 'day'
  | 'week'
  | 'month'
  | 'year'
  | 'all_time';

export type AnalyticsMetric = 
  | 'exercises'
  | 'minutes'
  | 'calories'
  | 'streak'
  | 'xp'
  | 'level'
  | 'achievements';

export interface AnalyticsDataPoint {
  date: Date;
  value: number;
  metric: AnalyticsMetric;
}

export interface AnalyticsSummary {
  total: number;
  average: number;
  max: number;
  min: number;
  currentStreak: number;
  longestStreak: number;
  period: AnalyticsPeriod;
}

export interface AnalyticsChart {
  data: AnalyticsDataPoint[];
  summary: AnalyticsSummary;
  period: AnalyticsPeriod;
  metric: AnalyticsMetric;
}

export interface AnalyticsFilters {
  period?: AnalyticsPeriod;
  metric?: AnalyticsMetric;
  startDate?: Date;
  endDate?: Date;
}

export interface AnalyticsExport {
  data: AnalyticsDataPoint[];
  summary: AnalyticsSummary;
  period: AnalyticsPeriod;
  metric: AnalyticsMetric;
  exportedAt: Date;
} 