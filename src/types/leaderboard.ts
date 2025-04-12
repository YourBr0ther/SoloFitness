export type LeaderboardType = 
  | 'global'
  | 'friends'
  | 'weekly'
  | 'monthly'
  | 'all_time';

export type LeaderboardMetric = 
  | 'xp'
  | 'streak'
  | 'exercises'
  | 'minutes'
  | 'calories';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  rank: number;
  metric: LeaderboardMetric;
  value: number;
  type: LeaderboardType;
  period: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardStats {
  totalUsers: number;
  totalXP: number;
  averageXP: number;
  topUsers: LeaderboardEntry[];
  userRank?: number;
  userValue?: number;
}

export interface LeaderboardFilters {
  type?: LeaderboardType;
  metric?: LeaderboardMetric;
  period?: string;
  limit?: number;
  offset?: number;
}

export interface LeaderboardUpdate {
  metric: LeaderboardMetric;
  value: number;
  type: LeaderboardType;
  period: string;
} 