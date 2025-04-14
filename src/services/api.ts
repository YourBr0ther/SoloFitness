import { ApiError } from '@/types/errors';
import { ApiResponse } from '@/types/api';
import { User } from '../types/user';
import { PenaltyTask, BonusTask, DailyExercise } from '../types/journal';
import { Workout, WorkoutResult } from '../types/workout';
import { Profile, StreakDay, GymBadge } from '../types/profile';
import { Coach } from '../types/coach';
import { AUTH_CONFIG } from '@/config/auth';

export abstract class BaseApiService {
  protected baseUrl: string;
  private requestTimeout = 10000; // 10 seconds
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  setAuthToken(token: string | null) {
    if (token) {
      // Set cookie with secure options
      const secure = process.env.NODE_ENV === 'production' ? 'Secure;' : '';
      document.cookie = `${AUTH_CONFIG.TOKEN_STORAGE_KEY}=${token}; path=/; ${secure} SameSite=Lax; max-age=604800`; // 7 days
    } else {
      document.cookie = `${AUTH_CONFIG.TOKEN_STORAGE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      let errorCode = 'UNKNOWN_ERROR';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorCode = errorData.code || errorCode;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }

      // Handle specific error cases
      if (response.status === 401) {
        this.setAuthToken(null);
        errorCode = 'UNAUTHORIZED';
      } else if (response.status === 403) {
        errorCode = 'FORBIDDEN';
      } else if (response.status === 404) {
        errorCode = 'NOT_FOUND';
      } else if (response.status === 429) {
        errorCode = 'RATE_LIMITED';
      }

      throw new ApiError(errorMessage, response.status, errorCode);
    }

    const data = await response.json();
    return { data, status: response.status };
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT');
      }
      throw error;
    }
  }

  private async retryRequest<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      return await requestFn();
    } catch (error) {
      if (retryCount < this.maxRetries && 
          error instanceof ApiError && 
          (error.status === 429 || error.status >= 500)) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.retryRequest(requestFn, retryCount + 1);
      }
      throw error;
    }
  }

  protected async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return this.handleResponse<T>(response);
    });
  }

  protected async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    });
  }

  protected async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    });
  }

  protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return this.handleResponse<T>(response);
    });
  }

  protected async patch<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    });
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Authentication endpoints
  abstract login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>>;
  abstract register(userData: Partial<User>): Promise<ApiResponse<{ user: User; token: string }>>;
  abstract logout(): Promise<ApiResponse<void>>;
  abstract refreshToken(): Promise<ApiResponse<{ token: string }>>;

  // User endpoints
  abstract getUser(): Promise<ApiResponse<User>>;
  abstract updateUser(updates: Partial<User>): Promise<ApiResponse<User>>;

  // Exercise endpoints
  abstract getExercises(): Promise<ApiResponse<DailyExercise[]>>;
  abstract getExercise(id: string): Promise<ApiResponse<DailyExercise>>;
  abstract createExercise(exerciseData: Partial<DailyExercise>): Promise<ApiResponse<DailyExercise>>;
  abstract updateExercise(id: string, updates: Partial<DailyExercise>): Promise<ApiResponse<DailyExercise>>;
  abstract deleteExercise(id: string): Promise<ApiResponse<void>>;

  // Profile endpoints
  abstract getProfile(): Promise<ApiResponse<Profile>>;
  abstract updateProfile(updates: Partial<Profile>): Promise<ApiResponse<Profile>>;

  // Coach endpoints
  abstract getCoaches(): Promise<ApiResponse<Coach[]>>;
  abstract getCoach(id: string): Promise<ApiResponse<Coach>>;
  abstract createCoach(data: Omit<Coach, 'id'>): Promise<ApiResponse<Coach>>;
  abstract updateCoach(id: string, data: Partial<Coach>): Promise<ApiResponse<Coach>>;
  abstract deleteCoach(id: string): Promise<ApiResponse<void>>;
  abstract sendMessage(coachId: string, message: string): Promise<ApiResponse<string>>;

  // Streak endpoints
  abstract getStreakHistory(): Promise<ApiResponse<StreakDay[]>>;
  abstract updateStreak(update: StreakDay): Promise<ApiResponse<StreakDay>>;

  // Badge endpoints
  abstract getBadges(): Promise<ApiResponse<GymBadge[]>>;

  // Penalty and Bonus Task endpoints
  abstract getPenaltyTasks(): Promise<ApiResponse<PenaltyTask[]>>;
  abstract updatePenaltyTask(id: string, updates: Partial<PenaltyTask>): Promise<ApiResponse<PenaltyTask>>;
  abstract getBonusTasks(): Promise<ApiResponse<BonusTask[]>>;
  abstract updateBonusTask(id: string, updates: Partial<BonusTask>): Promise<ApiResponse<BonusTask>>;

  // Workout endpoints
  abstract getTodayWorkout(): Promise<ApiResponse<Workout>>;
  abstract updateWorkoutProgress(exercises: Record<string, number>, completeBonusTask: boolean): Promise<ApiResponse<WorkoutResult>>;

  protected clearAuth() {
    document.cookie = `${AUTH_CONFIG.TOKEN_STORAGE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }
} 