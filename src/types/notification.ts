export type NotificationType = 
  | 'achievement'
  | 'level_up'
  | 'streak'
  | 'reminder'
  | 'system'
  | 'feedback'
  | 'social';

export type NotificationPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  data?: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: Record<NotificationType, boolean>;
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface NotificationUpdate {
  read?: boolean;
  priority?: NotificationPriority;
  expiresAt?: Date;
}

export interface NotificationFilters {
  type?: NotificationType;
  priority?: NotificationPriority;
  read?: boolean;
  startDate?: Date;
  endDate?: Date;
} 