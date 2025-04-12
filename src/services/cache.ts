import { ApiResponse } from '@/types/api';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  lastCleared: number;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>>;
  private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutes
  private readonly maxSize: number = 1000; // Maximum number of cache entries
  private readonly storageKey: string = 'solofitness-cache';
  private readonly currentVersion: number = 1;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    lastCleared: Date.now()
  };

  private constructor() {
    this.cache = new Map();
    this.loadFromStorage();
    this.cleanupExpired();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const { version, data } = JSON.parse(stored);
        if (version === this.currentVersion) {
          this.cache = new Map(Object.entries(data));
          this.stats.size = this.cache.size;
        } else {
          // Handle version mismatch by clearing cache
          this.clear();
        }
      }
    } catch (error) {
      console.error('Failed to load cache from storage:', error);
      this.clear();
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        version: this.currentVersion,
        data: Object.fromEntries(this.cache)
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save cache to storage:', error);
    }
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        this.stats.evictions++;
      }
    }
    this.stats.size = this.cache.size;
    this.saveToStorage();
  }

  private evictOldest(): void {
    if (this.cache.size >= this.maxSize) {
      let oldestKey: string | null = null;
      let oldestTimestamp = Infinity;

      for (const [key, entry] of this.cache.entries()) {
        if (entry.timestamp < oldestTimestamp) {
          oldestKey = key;
          oldestTimestamp = entry.timestamp;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.stats.evictions++;
        this.stats.size = this.cache.size;
      }
    }
  }

  public set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    this.evictOldest();
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      version: this.currentVersion
    });

    this.stats.size = this.cache.size;
    this.saveToStorage();
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      this.stats.size = this.cache.size;
      this.saveToStorage();
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  public delete(key: string): void {
    this.cache.delete(key);
    this.stats.size = this.cache.size;
    this.saveToStorage();
  }

  public clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      lastCleared: Date.now()
    };
    this.saveToStorage();
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      this.stats.size = this.cache.size;
      this.saveToStorage();
      return false;
    }

    this.stats.hits++;
    return true;
  }

  public getSize(): number {
    return this.stats.size;
  }

  public getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  public getEntries(): [string, CacheEntry<any>][] {
    return Array.from(this.cache.entries());
  }

  public setTTL(key: string, ttl: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    entry.expiresAt = Date.now() + ttl;
    this.saveToStorage();
    return true;
  }

  public getTTL(key: string): number | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const remaining = entry.expiresAt - Date.now();
    return remaining > 0 ? remaining : null;
  }

  public getStats(): CacheStats {
    return { ...this.stats };
  }

  public getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? this.stats.hits / total : 0;
  }
} 