import { SyncService } from './sync';
import { CacheStrategy } from './cacheStrategy';
import { ApiResponse } from '@/types/api';

interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
}

export class OfflineService {
  private static instance: OfflineService;
  private operations: Map<string, OfflineOperation>;
  private syncService: SyncService;
  private cacheStrategy: CacheStrategy;
  private isOnline: boolean = true;

  private constructor(syncService: SyncService) {
    this.operations = new Map();
    this.syncService = syncService;
    this.cacheStrategy = CacheStrategy.getInstance();
    this.initialize();
  }

  public static getInstance(syncService: SyncService): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService(syncService);
    }
    return OfflineService.instance;
  }

  private initialize(): void {
    // Load saved operations from localStorage
    if (typeof window !== 'undefined') {
      const savedOperations = localStorage.getItem('offlineOperations');
      if (savedOperations) {
        const parsed = JSON.parse(savedOperations);
        this.operations = new Map(Object.entries(parsed));
      }

      // Listen for online/offline events
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
      this.isOnline = navigator.onLine;
    }
  }

  private saveOperations(): void {
    if (typeof window !== 'undefined') {
      const serialized = Object.fromEntries(this.operations);
      localStorage.setItem('offlineOperations', JSON.stringify(serialized));
    }
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.syncAllOperations();
  }

  private handleOffline(): void {
    this.isOnline = false;
  }

  private async syncAllOperations(): Promise<void> {
    for (const [id, operation] of this.operations.entries()) {
      if (operation.status === 'pending') {
        await this.syncOperation(operation);
      }
    }
  }

  private async syncOperation(operation: OfflineOperation): Promise<ApiResponse<any>> {
    try {
      let response: ApiResponse<any>;
      
      switch (operation.type) {
        case 'create':
          response = await this.syncService.addToQueue(operation.endpoint, 'POST', operation.data);
          break;
        case 'update':
          response = await this.syncService.addToQueue(operation.endpoint, 'PUT', operation.data);
          break;
        case 'delete':
          response = await this.syncService.addToQueue(operation.endpoint, 'DELETE', operation.data);
          break;
      }

      if (response.status >= 200 && response.status < 300) {
        operation.status = 'synced';
        this.operations.delete(operation.id);
        this.saveOperations();
      } else {
        operation.status = 'failed';
        this.operations.set(operation.id, operation);
        this.saveOperations();
      }

      return response;
    } catch (error) {
      operation.status = 'failed';
      this.operations.set(operation.id, operation);
      this.saveOperations();
      return { data: null, status: 500 };
    }
  }

  public async createOperation(type: 'create' | 'update' | 'delete', endpoint: string, data: any): Promise<string> {
    const id = `${type}:${endpoint}:${Date.now()}`;
    const operation: OfflineOperation = {
      id,
      type,
      endpoint,
      data,
      timestamp: Date.now(),
      status: 'pending'
    };

    this.operations.set(id, operation);
    this.saveOperations();

    if (this.isOnline) {
      await this.syncOperation(operation);
    }

    return id;
  }

  public getOperation(id: string): OfflineOperation | undefined {
    return this.operations.get(id);
  }

  public getPendingOperations(): OfflineOperation[] {
    return Array.from(this.operations.values()).filter(op => op.status === 'pending');
  }

  public getFailedOperations(): OfflineOperation[] {
    return Array.from(this.operations.values()).filter(op => op.status === 'failed');
  }

  public clearOperations(): void {
    this.operations.clear();
    this.saveOperations();
  }

  public isOffline(): boolean {
    return !this.isOnline;
  }

  public async createBatchOperations(operations: Array<{
    type: 'create' | 'update' | 'delete';
    endpoint: string;
    data: any;
  }>): Promise<string[]> {
    const operationIds: string[] = [];

    for (const operation of operations) {
      const id = await this.createOperation(operation.type, operation.endpoint, operation.data);
      operationIds.push(id);
    }

    if (this.isOnline) {
      await this.syncAllOperations();
    }

    return operationIds;
  }
} 