export type ReminderType = 
  | 'workout'
  | 'water'
  | 'meal'
  | 'meditation'
  | 'sleep'
  | 'custom';

export type ReminderFrequency = 
  | 'once'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'custom';

export type ReminderStatus = 
  | 'active'
  | 'completed'
  | 'snoozed'
  | 'cancelled';

export interface Reminder {
  id: string;
  userId: string;
  type: ReminderType;
  title: string;
  description?: string;
  frequency: ReminderFrequency;
  startTime: Date;
  endTime?: Date;
  status: ReminderStatus;
  repeatDays?: number[];
  customFrequency?: {
    interval: number;
    unit: 'days' | 'weeks' | 'months';
  };
  snoozeDuration?: number;
  maxSnoozes?: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderUpdate {
  title?: string;
  description?: string;
  frequency?: ReminderFrequency;
  startTime?: Date;
  endTime?: Date;
  status?: ReminderStatus;
  repeatDays?: number[];
  customFrequency?: {
    interval: number;
    unit: 'days' | 'weeks' | 'months';
  };
  snoozeDuration?: number;
  maxSnoozes?: number;
}

export interface ReminderFilters {
  type?: ReminderType;
  status?: ReminderStatus;
  startDate?: Date;
  endDate?: Date;
  frequency?: ReminderFrequency;
}

export interface ReminderStats {
  total: number;
  completed: number;
  active: number;
  snoozed: number;
  cancelled: number;
  completionRate: number;
  averageSnoozes: number;
} 