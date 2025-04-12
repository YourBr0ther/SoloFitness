export interface GymBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirements: {
    type: string;
    value: number;
  };
  unlocked: boolean;
  unlockedAt?: string;
} 