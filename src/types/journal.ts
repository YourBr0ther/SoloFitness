export interface Exercise {
  id: string;
  name: string;
  count: number;
  dailyGoal: number;
  increment?: number;
  unit?: string;
}

export interface PenaltyTask {
  exercise: string;
  count: number;
  unit: string;
}

export interface BonusTask {
  description: string;
  completed: boolean;
} 