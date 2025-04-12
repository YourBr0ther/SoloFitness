import { ApiResponse } from '@/types/api';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  storageKey: string; // Key for localStorage
}

export class CacheService {
  private memoryCache: Map<string, CacheEntry<any>>;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: config.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: config.maxSize || 100, // 100 entries default
      storageKey: config.storageKey || 'solofitness-cache'
    };
    this.memoryCache = new Map();
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.memoryCache = new Map(Object.entries(parsed));
        this.cleanup(); // Remove expired entries
      }
    } catch (error) {
      console.error('Failed to load cache from storage:', error);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const serialized = JSON.stringify(Object.fromEntries(this.memoryCache));
      localStorage.setItem(this.config.storageKey, serialized);
    } catch (error) {
      console.error('Failed to save cache to storage:', error);
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > this.config.ttl) {
        this.memoryCache.delete(key);
      }
    }

    // Remove oldest entries if cache is too large
    if (this.memoryCache.size > this.config.maxSize) {
      const entries = Array.from(this.memoryCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const entriesToRemove = entries.slice(0, entries.length - this.config.maxSize);
      for (const [key] of entriesToRemove) {
        this.memoryCache.delete(key);
      }
    }

    this.saveToStorage();
  }

  get<T>(key: string): CacheEntry<T> | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.config.ttl) {
      this.memoryCache.delete(key);
      this.saveToStorage();
      return null;
    }

    return entry;
  }

  set<T>(key: string, data: T, etag?: string) {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      etag
    });
    this.cleanup();
  }

  delete(key: string) {
    this.memoryCache.delete(key);
    this.saveToStorage();
  }

  clear() {
    this.memoryCache.clear();
    this.saveToStorage();
  }

  // Offline support
  isOffline(): boolean {
    return typeof navigator !== 'undefined' && !navigator.onLine;
  }

  // Queue for offline operations
  private operationQueue: Array<() => Promise<void>> = [];

  async queueOperation(operation: () => Promise<void>) {
    if (this.isOffline()) {
      this.operationQueue.push(operation);
      return;
    }
    await operation();
  }

  async processQueue() {
    if (this.isOffline() || this.operationQueue.length === 0) return;

    const operation = this.operationQueue.shift();
    if (operation) {
      try {
        await operation();
      } catch (error) {
        console.error('Failed to process queued operation:', error);
        // Put the operation back in the queue if it failed
        this.operationQueue.unshift(operation);
      }
    }
  }
} 