export type NotificationType = 
  | 'friend_request'
  | 'friend_request_accepted'
  | 'achievement_unlocked'
  | 'challenge_completed'
  | 'level_up'
  | 'streak_milestone'
  | 'system'
  | 'social';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    friend_request: boolean;
    friend_request_accepted: boolean;
    achievement_unlocked: boolean;
    challenge_completed: boolean;
    level_up: boolean;
    streak_milestone: boolean;
    system: boolean;
    social: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationUpdate {
  isRead?: boolean;
  readAt?: Date;
}

export interface NotificationFilters {
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  startDate?: Date;
  endDate?: Date;
} 