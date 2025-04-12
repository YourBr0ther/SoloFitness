export type FeedbackType = 
  | 'bug'
  | 'feature'
  | 'improvement'
  | 'question'
  | 'other';

export type FeedbackStatus = 
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'duplicate';

export type FeedbackPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export interface Feedback {
  id: string;
  userId: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  category?: string;
  tags?: string[];
  attachments?: string[];
  votes: number;
  comments: number;
  assignedTo?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackComment {
  id: string;
  feedbackId: string;
  userId: string;
  content: string;
  attachments?: string[];
  votes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackFilters {
  type?: FeedbackType;
  status?: FeedbackStatus;
  priority?: FeedbackPriority;
  category?: string;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
  assignedTo?: string;
}

export interface FeedbackUpdate {
  title?: string;
  description?: string;
  status?: FeedbackStatus;
  priority?: FeedbackPriority;
  category?: string;
  tags?: string[];
  attachments?: string[];
  assignedTo?: string;
}

export interface FeedbackStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byType: Record<FeedbackType, number>;
  byPriority: Record<FeedbackPriority, number>;
  averageResolutionTime: number;
  satisfactionScore: number;
} 