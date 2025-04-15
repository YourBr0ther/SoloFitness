import { Exercise, Task } from './shared';

export interface DailyExercise extends Exercise {}

export interface PenaltyTask {
  id: string;
  exercise: string;
  count: number;
  unit: string;
}

export interface BonusTask extends Task {} 