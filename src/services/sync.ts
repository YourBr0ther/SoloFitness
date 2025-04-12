import { RealApiService } from './realApi';
import { CacheStrategy } from './cacheStrategy';
import { ApiResponse } from '@/types/api';

interface SyncQueueItem {
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  data?: any;
  retryCount: number;
  timestamp: number;
  priority: 'high' | 'normal' | 'low';
  conflictResolution?: 'overwrite' | 'merge' | 'skip';
  batchId?: string;
}

interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  currentBatch?: string;
}

export class SyncService {
  private static instance: SyncService;
  private queue: Map<string, SyncQueueItem>;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 5000; // 5 seconds
  private readonly batchSize: number = 10;
  private isSyncing: boolean = false;
  private apiService: RealApiService;
  private cacheStrategy: CacheStrategy;
  private progress: SyncProgress = {
    total: 0,
    completed: 0,
    failed: 0
  };
  private listeners: Set<(progress: SyncProgress) => void> = new Set();

  private constructor(apiService: RealApiService) {
    this.queue = new Map();
    this.apiService = apiService;
    this.cacheStrategy = CacheStrategy.getInstance();
    this.startSyncLoop();
  }

  public static getInstance(apiService: RealApiService): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService(apiService);
    }
    return SyncService.instance;
  }

  private generateQueueKey(item: SyncQueueItem): string {
    return `${item.method}:${item.endpoint}:${Date.now()}`;
  }

  private generateBatchId(): string {
    return `batch-${Date.now()}`;
  }

  public async addToQueue(
    endpoint: string, 
    method: 'POST' | 'PUT' | 'DELETE', 
    data?: any,
    options: {
      priority?: 'high' | 'normal' | 'low';
      conflictResolution?: 'overwrite' | 'merge' | 'skip';
      batchId?: string;
    } = {}
  ): Promise<ApiResponse<any>> {
    const item: SyncQueueItem = {
      endpoint,
      method,
      data,
      retryCount: 0,
      timestamp: Date.now(),
      priority: options.priority || 'normal',
      conflictResolution: options.conflictResolution,
      batchId: options.batchId
    };

    const key = this.generateQueueKey(item);
    this.queue.set(key, item);
    this.progress.total++;
    this.notifyProgress();
    await this.processQueue();
    return { data, status: 202 }; // Accepted
  }

  public async addBatch(
    items: Array<{
      endpoint: string;
      method: 'POST' | 'PUT' | 'DELETE';
      data?: any;
      priority?: 'high' | 'normal' | 'low';
      conflictResolution?: 'overwrite' | 'merge' | 'skip';
    }>
  ): Promise<string> {
    const batchId = this.generateBatchId();
    this.progress.currentBatch = batchId;
    this.notifyProgress();

    for (const item of items) {
      await this.addToQueue(
        item.endpoint,
        item.method,
        item.data,
        {
          priority: item.priority,
          conflictResolution: item.conflictResolution,
          batchId
        }
      );
    }

    return batchId;
  }

  private async processQueue(): Promise<void> {
    if (this.isSyncing || this.queue.size === 0) return;

    this.isSyncing = true;
    try {
      // Sort queue by priority and timestamp
      const sortedItems = Array.from(this.queue.entries())
        .sort((a, b) => {
          const priorityOrder = { high: 0, normal: 1, low: 2 };
          const priorityDiff = priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
          if (priorityDiff !== 0) return priorityDiff;
          return a[1].timestamp - b[1].timestamp;
        });

      // Process items in batches
      for (let i = 0; i < sortedItems.length; i += this.batchSize) {
        const batch = sortedItems.slice(i, i + this.batchSize);
        await this.processBatch(batch);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private async processBatch(batch: [string, SyncQueueItem][]): Promise<void> {
    for (const [key, item] of batch) {
      try {
        let response: ApiResponse<any>;
        
        switch (item.method) {
          case 'POST':
            response = await this.apiService.createExercise(item.data);
            break;
          case 'PUT':
            response = await this.apiService.updateExercise(item.data.id, item.data);
            break;
          case 'DELETE':
            response = await this.apiService.deleteExercise(item.data.id);
            break;
        }

        if (response.status >= 200 && response.status < 300) {
          // Success - remove from queue and invalidate cache
          this.queue.delete(key);
          this.cacheStrategy.invalidate(item.endpoint);
          this.progress.completed++;
          this.notifyProgress();
        } else {
          await this.handleFailure(key, item);
        }
      } catch (error) {
        await this.handleFailure(key, item);
      }
    }
  }

  private async handleFailure(key: string, item: SyncQueueItem): Promise<void> {
    if (item.retryCount >= this.maxRetries) {
      this.queue.delete(key);
      this.progress.failed++;
      this.notifyProgress();
      // TODO: Add error logging or notification
    } else {
      item.retryCount++;
      this.queue.set(key, item);
    }
  }

  private startSyncLoop(): void {
    setInterval(() => {
      this.processQueue();
    }, this.retryDelay);
  }

  public getQueueSize(): number {
    return this.queue.size;
  }

  public getQueueItems(): SyncQueueItem[] {
    return Array.from(this.queue.values());
  }

  public getProgress(): SyncProgress {
    return { ...this.progress };
  }

  public addProgressListener(listener: (progress: SyncProgress) => void): void {
    this.listeners.add(listener);
  }

  public removeProgressListener(listener: (progress: SyncProgress) => void): void {
    this.listeners.delete(listener);
  }

  private notifyProgress(): void {
    const progress = this.getProgress();
    this.listeners.forEach(listener => listener(progress));
  }

  public clearQueue(): void {
    this.queue.clear();
    this.progress = {
      total: 0,
      completed: 0,
      failed: 0
    };
    this.notifyProgress();
  }

  public async syncNow(): Promise<void> {
    await this.processQueue();
  }
} 