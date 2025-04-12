import { CacheService } from './cache';
import { ApiResponse } from '@/types/api';

export class CacheStrategy {
  private static instance: CacheStrategy;
  private cacheService: CacheService;
  private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.cacheService = CacheService.getInstance();
  }

  public static getInstance(): CacheStrategy {
    if (!CacheStrategy.instance) {
      CacheStrategy.instance = new CacheStrategy();
    }
    return CacheStrategy.instance;
  }

  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    if (!params) return endpoint;
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);
    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<T | null> {
    const key = this.getCacheKey(endpoint, params);
    return this.cacheService.get<T>(key);
  }

  public set<T>(endpoint: string, data: T, params?: Record<string, any>, ttl?: number): void {
    const key = this.getCacheKey(endpoint, params);
    this.cacheService.set(key, data, ttl || this.defaultTTL);
  }

  public invalidate(endpoint: string, params?: Record<string, any>): void {
    const key = this.getCacheKey(endpoint, params);
    this.cacheService.delete(key);
  }

  public invalidateAll(): void {
    this.cacheService.clear();
  }

  public async withCache<T>(
    endpoint: string,
    fetchFn: () => Promise<ApiResponse<T>>,
    params?: Record<string, any>,
    ttl?: number
  ): Promise<ApiResponse<T>> {
    const cached = await this.get<T>(endpoint, params);
    if (cached) {
      return { data: cached, status: 200 };
    }

    const response = await fetchFn();
    if (response.status === 200) {
      this.set(endpoint, response.data, params, ttl);
    }
    return response;
  }

  public getTTL(endpoint: string, params?: Record<string, any>): number | null {
    const key = this.getCacheKey(endpoint, params);
    return this.cacheService.getTTL(key);
  }

  public setTTL(endpoint: string, ttl: number, params?: Record<string, any>): boolean {
    const key = this.getCacheKey(endpoint, params);
    return this.cacheService.setTTL(key, ttl);
  }
} 