export type ChallengeType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'special';

export type ChallengeStatus = 
  | 'active'
  | 'completed'
  | 'failed'
  | 'expired';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  requirements: {
    type: 'exercise' | 'streak' | 'achievement' | 'xp';
    target: number;
    unit?: string;
  }[];
  rewards: {
    xp: number;
    badges?: string[];
    items?: string[];
  };
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  status: ChallengeStatus;
  progress: number;
  completedAt?: Date;
  failedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeFilters {
  type?: ChallengeType;
  status?: ChallengeStatus;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface ChallengeStats {
  totalChallenges: number;
  completedChallenges: number;
  activeChallenges: number;
  successRate: number;
  averageCompletionTime?: number;
} 