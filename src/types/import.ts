export type ImportFormat = 
  | 'json'
  | 'csv'
  | 'excel';

export type ImportType = 
  | 'exercises'
  | 'workouts'
  | 'progress'
  | 'achievements'
  | 'profile'
  | 'all';

export interface ImportOptions {
  format: ImportFormat;
  type: ImportType;
  file: File;
  overwrite?: boolean;
  validateOnly?: boolean;
  mapping?: Record<string, string>;
}

export interface ImportJob {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  options: ImportOptions;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ImportProgress {
  jobId: string;
  progress: number;
  status: string;
  processedItems: number;
  totalItems: number;
  estimatedTimeRemaining?: number;
}

export interface ImportResult {
  jobId: string;
  success: boolean;
  processedItems: number;
  importedItems: number;
  failedItems: number;
  errors?: Array<{
    item: any;
    error: string;
  }>;
  warnings?: Array<{
    item: any;
    warning: string;
  }>;
} 