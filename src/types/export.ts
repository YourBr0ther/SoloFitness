export type ExportFormat = 
  | 'json'
  | 'csv'
  | 'pdf'
  | 'excel';

export type ExportType = 
  | 'exercises'
  | 'workouts'
  | 'progress'
  | 'achievements'
  | 'analytics'
  | 'profile'
  | 'all';

export interface ExportOptions {
  format: ExportFormat;
  type: ExportType;
  startDate?: Date;
  endDate?: Date;
  includeMetadata?: boolean;
  includeAttachments?: boolean;
  compression?: boolean;
}

export interface ExportJob {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  options: ExportOptions;
  fileUrl?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ExportProgress {
  jobId: string;
  progress: number;
  status: string;
  estimatedTimeRemaining?: number;
}

export interface ExportResult {
  jobId: string;
  fileUrl: string;
  fileSize: number;
  format: ExportFormat;
  type: ExportType;
  createdAt: Date;
  expiresAt: Date;
} 