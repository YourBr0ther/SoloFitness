import { ApiService } from './api';
import { ApiError } from '../types/errors';
import { User } from '../types/user';
import { Exercise } from '../types/exercise';
import { Workout, WorkoutUpdate, WorkoutFilters } from '../types/workout';
import { Profile } from '../types/profile';
import { UserSettings } from '../types/settings';
import { Achievement, AchievementProgress } from '../types/achievements';
import type { Notification, NotificationPreferences, NotificationUpdate, NotificationFilters } from '../types/notifications';
import { LeaderboardEntry, LeaderboardFilters, LeaderboardStats } from '../types/leaderboard';
import { AnalyticsDataPoint, AnalyticsSummary, AnalyticsFilters } from '../types/analytics';
import { SocialProfile, SocialPost, SocialComment, SocialInteraction, SocialFilters, SocialStats } from '../types/social';
import { Feedback, FeedbackComment, FeedbackUpdate, FeedbackFilters, FeedbackStats } from '../types/feedback';
import { Reminder, ReminderFilters, ReminderStats } from '../types/reminder';
import { ExportJob, ExportOptions, ExportProgress, ExportResult } from '../types/export';
import { ImportJob, ImportOptions, ImportProgress, ImportResult } from '../types/import';
import { ApiResponse } from '../types/api';
import { GymBadge } from '@/types/badges';
import { CacheStrategy } from './cacheStrategy';
import { SyncService } from './sync';
import { OfflineService } from './offline';

// Define missing types
interface ExerciseFilters {
  muscleGroup?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  equipment?: string;
}

interface ExerciseUpdate {
  name?: string;
  description?: string;
  muscleGroup?: string;
  equipment?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string[];
  videoUrl?: string;
  imageUrl?: string;
}

interface ProfileUpdate {
  username?: string;
  avatarUrl?: string;
  preferences?: {
    enablePenalties?: boolean;
    enableBonuses?: boolean;
  };
}

// Add Coach interface
interface Coach {
  id: string;
  name: string;
  description: string;
  avatar: string;
  personality: 'motivational' | 'technical' | 'tough' | 'balanced';
}

interface CoachUpdate {
  name?: string;
  description?: string;
  avatar?: string;
  personality?: 'motivational' | 'technical' | 'tough' | 'balanced';
}

export class RealApiService extends ApiService {
  private cacheStrategy: CacheStrategy;
  private syncService: SyncService;
  private offlineService: OfflineService;

  constructor() {
    super(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');
    this.cacheStrategy = CacheStrategy.getInstance();
    this.syncService = SyncService.getInstance(this);
    this.offlineService = OfflineService.getInstance(this.syncService);
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
    const response = await this.post<{ token: string }>('/auth/login', { email, password });
    this.setAuthToken(response.data.token);
    return response;
  }

  async register(email: string, password: string, username: string): Promise<ApiResponse<{ token: string }>> {
    const response = await this.post<{ token: string }>('/auth/register', { email, password, username });
    this.setAuthToken(response.data.token);
    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.post<void>('/auth/logout', {});
    this.setAuthToken(null);
    return response;
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await this.post<{ token: string }>('/auth/refresh', {});
    this.setAuthToken(response.data.token);
    return response;
  }

  // User endpoints
  async getUser(): Promise<ApiResponse<User>> {
    return this.cacheStrategy.withCache(
      '/users/me',
      () => this.get<User>('/users/me'),
      undefined,
      5 * 60 * 1000 // 5 minutes TTL
    );
  }

  async updateUser(user: Partial<User>): Promise<ApiResponse<User>> {
    if (this.offlineService.isOffline()) {
      const operationId = await this.offlineService.createOperation('update', '/users/me', user);
      return { data: user as User, status: 202 }; // Accepted
    }

    await this.syncService.addToQueue('/users/me', 'PUT', user, {
      priority: 'high',
      conflictResolution: 'merge'
    });
    return { data: user as User, status: 202 }; // Accepted
  }

  // Exercise endpoints
  async getExercises(): Promise<ApiResponse<Exercise[]>> {
    return this.cacheStrategy.withCache(
      '/exercises',
      () => this.get<Exercise[]>('/exercises'),
      undefined,
      5 * 60 * 1000 // 5 minutes TTL
    );
  }

  async getExercise(id: string): Promise<ApiResponse<Exercise>> {
    return this.cacheStrategy.withCache(
      `/exercises/${id}`,
      () => this.get<Exercise>(`/exercises/${id}`),
      undefined,
      5 * 60 * 1000 // 5 minutes TTL
    );
  }

  async createExercise(exercise: Partial<Exercise>): Promise<ApiResponse<Exercise>> {
    if (this.offlineService.isOffline()) {
      const operationId = await this.offlineService.createOperation('create', '/exercises', exercise);
      return { data: exercise as Exercise, status: 202 }; // Accepted
    }

    await this.syncService.addToQueue('/exercises', 'POST', exercise, {
      priority: 'high',
      conflictResolution: 'overwrite'
    });
    return { data: exercise as Exercise, status: 202 }; // Accepted
  }

  async updateExercise(id: string, exercise: Partial<Exercise>): Promise<ApiResponse<Exercise>> {
    if (this.offlineService.isOffline()) {
      const operationId = await this.offlineService.createOperation('update', `/exercises/${id}`, exercise);
      return { data: exercise as Exercise, status: 202 }; // Accepted
    }

    await this.syncService.addToQueue(`/exercises/${id}`, 'PUT', exercise, {
      priority: 'high',
      conflictResolution: 'merge'
    });
    return { data: exercise as Exercise, status: 202 }; // Accepted
  }

  async deleteExercise(id: string): Promise<ApiResponse<void>> {
    if (this.offlineService.isOffline()) {
      const operationId = await this.offlineService.createOperation('delete', `/exercises/${id}`, { id });
      return { data: undefined, status: 202 }; // Accepted
    }

    await this.syncService.addToQueue(`/exercises/${id}`, 'DELETE', { id }, {
      priority: 'high',
      conflictResolution: 'overwrite'
    });
    return { data: undefined, status: 202 }; // Accepted
  }

  // Workout endpoints
  async getWorkouts(filters?: WorkoutFilters): Promise<ApiResponse<Workout[]>> {
    const queryParams = filters ? new URLSearchParams(filters as Record<string, string>).toString() : '';
    const endpoint = queryParams ? `/workouts?${queryParams}` : '/workouts';
    return this.get<Workout[]>(endpoint);
  }

  async getWorkout(id: string): Promise<ApiResponse<Workout>> {
    return this.get<Workout>(`/workouts/${id}`);
  }

  async createWorkout(data: Partial<Workout>): Promise<ApiResponse<Workout>> {
    return this.post<Workout>('/workouts', data);
  }

  async updateWorkout(id: string, data: WorkoutUpdate): Promise<ApiResponse<Workout>> {
    return this.put<Workout>(`/workouts/${id}`, data);
  }

  async deleteWorkout(id: string): Promise<ApiResponse<void>> {
    return this.delete(`/workouts/${id}`);
  }

  // Profile endpoints
  async getProfile(): Promise<ApiResponse<Profile>> {
    return this.cacheStrategy.withCache(
      '/users/me/profile',
      () => this.get<Profile>('/users/me/profile'),
      undefined,
      5 * 60 * 1000 // 5 minutes TTL
    );
  }

  async updateProfile(profile: Partial<Profile>): Promise<ApiResponse<Profile>> {
    if (this.offlineService.isOffline()) {
      const operationId = await this.offlineService.createOperation('update', '/users/me/profile', profile);
      return { data: profile as Profile, status: 202 }; // Accepted
    }

    await this.syncService.addToQueue('/users/me/profile', 'PUT', profile, {
      priority: 'normal',
      conflictResolution: 'merge'
    });
    return { data: profile as Profile, status: 202 }; // Accepted
  }

  // Settings endpoints
  async getUserSettings(): Promise<ApiResponse<UserSettings>> {
    return this.get<UserSettings>('/settings');
  }

  async updateUserSettings(data: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> {
    return this.put<UserSettings>('/settings', data);
  }

  // Achievement endpoints
  async getAchievements(): Promise<ApiResponse<Achievement[]>> {
    return this.cacheStrategy.withCache(
      '/achievements',
      () => this.get<Achievement[]>('/achievements'),
      undefined,
      5 * 60 * 1000 // 5 minutes TTL
    );
  }

  async getAchievementProgress(achievementId: string): Promise<ApiResponse<AchievementProgress>> {
    return this.cacheStrategy.withCache(
      `/achievements/${achievementId}/progress`,
      () => this.get<AchievementProgress>(`/achievements/${achievementId}/progress`),
      undefined,
      5 * 60 * 1000 // 5 minutes TTL
    );
  }

  async getBadges(): Promise<ApiResponse<GymBadge[]>> {
    return this.cacheStrategy.withCache(
      '/badges',
      () => this.get<GymBadge[]>('/badges'),
      undefined,
      5 * 60 * 1000 // 5 minutes TTL
    );
  }

  // Notification endpoints
  async getNotifications(filters?: NotificationFilters): Promise<ApiResponse<Notification[]>> {
    const queryParams = filters ? new URLSearchParams(filters as Record<string, string>).toString() : '';
    const endpoint = queryParams ? `/notifications?${queryParams}` : '/notifications';
    return this.get<Notification[]>(endpoint);
  }

  async getNotificationPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return this.get<NotificationPreferences>('/notifications/preferences');
  }

  async updateNotification(id: string, data: NotificationUpdate): Promise<ApiResponse<Notification>> {
    return this.put<Notification>(`/notifications/${id}`, data);
  }

  // Leaderboard endpoints
  async getLeaderboard(filters?: LeaderboardFilters): Promise<ApiResponse<LeaderboardEntry[]>> {
    const queryParams = filters ? new URLSearchParams(filters as Record<string, string>).toString() : '';
    const endpoint = queryParams ? `/leaderboard?${queryParams}` : '/leaderboard';
    return this.get<LeaderboardEntry[]>(endpoint);
  }

  async getLeaderboardStats(): Promise<ApiResponse<LeaderboardStats>> {
    return this.get<LeaderboardStats>('/leaderboard/stats');
  }

  // Analytics endpoints
  async getAnalytics(filters?: AnalyticsFilters): Promise<ApiResponse<AnalyticsDataPoint[]>> {
    const queryParams = filters ? new URLSearchParams(filters as Record<string, string>).toString() : '';
    const endpoint = queryParams ? `/analytics?${queryParams}` : '/analytics';
    return this.get<AnalyticsDataPoint[]>(endpoint);
  }

  async getAnalyticsSummary(): Promise<ApiResponse<AnalyticsSummary>> {
    return this.get<AnalyticsSummary>('/analytics/summary');
  }

  // Social endpoints
  async getSocialProfile(userId: string): Promise<ApiResponse<SocialProfile>> {
    return this.get<SocialProfile>(`/social/profile/${userId}`);
  }

  async getSocialPosts(filters?: SocialFilters): Promise<ApiResponse<SocialPost[]>> {
    const queryParams = filters ? new URLSearchParams(filters as Record<string, string>).toString() : '';
    const endpoint = queryParams ? `/social/posts?${queryParams}` : '/social/posts';
    return this.get<SocialPost[]>(endpoint);
  }

  async createSocialPost(data: Partial<SocialPost>): Promise<ApiResponse<SocialPost>> {
    if (this.offlineService.isOffline()) {
      const operationId = await this.offlineService.createOperation('create', '/social/posts', data);
      return { data: data as SocialPost, status: 202 }; // Accepted
    }

    await this.syncService.addToQueue('/social/posts', 'POST', data, {
      priority: 'low',
      conflictResolution: 'overwrite'
    });
    return { data: data as SocialPost, status: 202 }; // Accepted
  }

  async getSocialComments(postId: string): Promise<ApiResponse<SocialComment[]>> {
    return this.get<SocialComment[]>(`/social/posts/${postId}/comments`);
  }

  async createSocialComment(postId: string, content: string): Promise<ApiResponse<SocialComment>> {
    return this.post<SocialComment>(`/social/posts/${postId}/comments`, { content });
  }

  async createSocialInteraction(data: Omit<SocialInteraction, 'id' | 'createdAt'>): Promise<ApiResponse<SocialInteraction>> {
    return this.post<SocialInteraction>('/social/interactions', data);
  }

  async updateSocialProfile(data: Partial<SocialProfile>): Promise<ApiResponse<SocialProfile>> {
    return this.put<SocialProfile>('/social/profile', data);
  }

  async getSocialStats(): Promise<ApiResponse<SocialStats>> {
    return this.get<SocialStats>('/social/stats');
  }

  // Feedback endpoints
  async getFeedback(filters?: FeedbackFilters): Promise<ApiResponse<Feedback[]>> {
    const queryParams = filters ? new URLSearchParams(filters as Record<string, string>).toString() : '';
    const endpoint = queryParams ? `/feedback?${queryParams}` : '/feedback';
    return this.get<Feedback[]>(endpoint);
  }

  async createFeedback(data: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Feedback>> {
    return this.post<Feedback>('/feedback', data);
  }

  async getFeedbackComments(feedbackId: string): Promise<ApiResponse<FeedbackComment[]>> {
    return this.get<FeedbackComment[]>(`/feedback/${feedbackId}/comments`);
  }

  async createFeedbackComment(feedbackId: string, content: string): Promise<ApiResponse<FeedbackComment>> {
    return this.post<FeedbackComment>(`/feedback/${feedbackId}/comments`, { content });
  }

  async updateFeedback(id: string, data: FeedbackUpdate): Promise<ApiResponse<Feedback>> {
    return this.put<Feedback>(`/feedback/${id}`, data);
  }

  async getFeedbackStats(): Promise<ApiResponse<FeedbackStats>> {
    return this.get<FeedbackStats>('/feedback/stats');
  }

  // Reminder endpoints
  async getReminders(filters?: ReminderFilters): Promise<ApiResponse<Reminder[]>> {
    const queryParams = filters ? new URLSearchParams(filters as Record<string, string>).toString() : '';
    const endpoint = queryParams ? `/reminders?${queryParams}` : '/reminders';
    return this.get<Reminder[]>(endpoint);
  }

  async createReminder(data: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Reminder>> {
    return this.post<Reminder>('/reminders', data);
  }

  async updateReminder(id: string, data: Partial<Reminder>): Promise<ApiResponse<Reminder>> {
    return this.put<Reminder>(`/reminders/${id}`, data);
  }

  async deleteReminder(id: string): Promise<ApiResponse<void>> {
    return this.delete(`/reminders/${id}`);
  }

  async getReminderStats(): Promise<ApiResponse<ReminderStats>> {
    return this.get<ReminderStats>('/reminders/stats');
  }

  // Export endpoints
  async createExportJob(options: ExportOptions): Promise<ApiResponse<ExportJob>> {
    return this.post<ExportJob>('/export', options);
  }

  async getExportJob(id: string): Promise<ApiResponse<ExportJob>> {
    return this.get<ExportJob>(`/export/${id}`);
  }

  async getExportProgress(id: string): Promise<ApiResponse<ExportProgress>> {
    return this.get<ExportProgress>(`/export/${id}/progress`);
  }

  async getExportResult(id: string): Promise<ApiResponse<ExportResult>> {
    return this.get<ExportResult>(`/export/${id}/result`);
  }

  // Import endpoints
  async createImportJob(options: ImportOptions): Promise<ApiResponse<ImportJob>> {
    return this.post<ImportJob>('/import', options);
  }

  async getImportJob(id: string): Promise<ApiResponse<ImportJob>> {
    return this.get<ImportJob>(`/import/${id}`);
  }

  async getImportProgress(id: string): Promise<ApiResponse<ImportProgress>> {
    return this.get<ImportProgress>(`/import/${id}/progress`);
  }

  async getImportResult(id: string): Promise<ApiResponse<ImportResult>> {
    return this.get<ImportResult>(`/import/${id}/result`);
  }

  // Coach endpoints
  async getCoaches(): Promise<ApiResponse<Coach[]>> {
    return this.get<Coach[]>('/coaches');
  }

  async getCoach(id: string): Promise<ApiResponse<Coach>> {
    return this.get<Coach>(`/coaches/${id}`);
  }

  async createCoach(data: Omit<Coach, 'id'>): Promise<ApiResponse<Coach>> {
    if (this.offlineService.isOffline()) {
      const operationId = await this.offlineService.createOperation('create', '/coaches', data);
      return { data: data as Coach, status: 202 }; // Accepted
    }

    await this.syncService.addToQueue('/coaches', 'POST', data, {
      priority: 'normal',
      conflictResolution: 'overwrite'
    });
    return { data: data as Coach, status: 202 }; // Accepted
  }

  async updateCoach(id: string, data: Partial<Coach>): Promise<ApiResponse<Coach>> {
    if (this.offlineService.isOffline()) {
      const operationId = await this.offlineService.createOperation('update', `/coaches/${id}`, data);
      return { data: data as Coach, status: 202 }; // Accepted
    }

    await this.syncService.addToQueue(`/coaches/${id}`, 'PUT', data, {
      priority: 'normal',
      conflictResolution: 'merge'
    });
    return { data: data as Coach, status: 202 }; // Accepted
  }

  async deleteCoach(id: string): Promise<ApiResponse<void>> {
    if (this.offlineService.isOffline()) {
      const operationId = await this.offlineService.createOperation('delete', `/coaches/${id}`, { id });
      return { data: undefined, status: 202 }; // Accepted
    }

    await this.syncService.addToQueue(`/coaches/${id}`, 'DELETE', { id }, {
      priority: 'normal',
      conflictResolution: 'overwrite'
    });
    return { data: undefined, status: 202 }; // Accepted
  }

  // Batch operations
  async batchUpdateExercises(exercises: Array<{ id: string; data: Partial<Exercise> }>): Promise<ApiResponse<void>> {
    if (this.offlineService.isOffline()) {
      const operations = exercises.map(ex => ({
        type: 'update' as const,
        endpoint: `/exercises/${ex.id}`,
        data: ex.data
      }));
      await this.offlineService.createBatchOperations(operations);
      return { data: undefined, status: 202 }; // Accepted
    }

    const batchItems = exercises.map(ex => ({
      endpoint: `/exercises/${ex.id}`,
      method: 'PUT' as const,
      data: ex.data,
      priority: 'normal' as const,
      conflictResolution: 'merge' as const
    }));

    await this.syncService.addBatch(batchItems);
    return { data: undefined, status: 202 }; // Accepted
  }

  async batchCreateExercises(exercises: Array<Partial<Exercise>>): Promise<ApiResponse<void>> {
    if (this.offlineService.isOffline()) {
      const operations = exercises.map(ex => ({
        type: 'create' as const,
        endpoint: '/exercises',
        data: ex
      }));
      await this.offlineService.createBatchOperations(operations);
      return { data: undefined, status: 202 }; // Accepted
    }

    const batchItems = exercises.map(ex => ({
      endpoint: '/exercises',
      method: 'POST' as const,
      data: ex,
      priority: 'normal' as const,
      conflictResolution: 'overwrite' as const
    }));

    await this.syncService.addBatch(batchItems);
    return { data: undefined, status: 202 }; // Accepted
  }

  async batchDeleteExercises(ids: string[]): Promise<ApiResponse<void>> {
    if (this.offlineService.isOffline()) {
      const operations = ids.map(id => ({
        type: 'delete' as const,
        endpoint: `/exercises/${id}`,
        data: { id }
      }));
      await this.offlineService.createBatchOperations(operations);
      return { data: undefined, status: 202 }; // Accepted
    }

    const batchItems = ids.map(id => ({
      endpoint: `/exercises/${id}`,
      method: 'DELETE' as const,
      data: { id },
      priority: 'normal' as const,
      conflictResolution: 'overwrite' as const
    }));

    await this.syncService.addBatch(batchItems);
    return { data: undefined, status: 202 }; // Accepted
  }

  // Streak endpoints
  async getStreakHistory(): Promise<ApiResponse<StreakDay[]>> {
    try {
      const response = await this.fetchWithAuth('/api/profile');
      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiError(data.message || 'Failed to fetch streak history', response.status);
      }
      
      // Profile data includes streak history
      return {
        data: data.profile?.streakHistory || [],
        status: response.status
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 500);
    }
  }

  async updateStreak(update: StreakDay): Promise<ApiResponse<StreakDay>> {
    try {
      const response = await this.fetchWithAuth('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ streakDay: update })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiError(data.message || 'Failed to update streak', response.status);
      }
      
      return {
        data: update, // Return the updated streak day
        status: response.status
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 500);
    }
  }

  // Penalty Task endpoints
  async getPenaltyTasks(): Promise<ApiResponse<PenaltyTask[]>> {
    try {
      const response = await this.fetchWithAuth('/api/workouts');
      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiError(data.message || 'Failed to fetch penalty tasks', response.status);
      }
      
      // Convert penalties object to array of PenaltyTask
      const penalties = data.penalties || { pushups: 0, situps: 0, squats: 0, milesRan: 0 };
      const penaltyTasks: PenaltyTask[] = [];
      
      if (penalties.pushups > 0) {
        penaltyTasks.push({
          id: 'pushups-penalty',
          exercise: 'Push-ups',
          count: penalties.pushups,
          unit: 'reps'
        });
      }
      
      if (penalties.situps > 0) {
        penaltyTasks.push({
          id: 'situps-penalty',
          exercise: 'Sit-ups',
          count: penalties.situps,
          unit: 'reps'
        });
      }
      
      if (penalties.squats > 0) {
        penaltyTasks.push({
          id: 'squats-penalty',
          exercise: 'Squats',
          count: penalties.squats,
          unit: 'reps'
        });
      }
      
      if (penalties.milesRan > 0) {
        penaltyTasks.push({
          id: 'running-penalty',
          exercise: 'Miles to run',
          count: penalties.milesRan,
          unit: 'miles'
        });
      }
      
      return {
        data: penaltyTasks,
        status: response.status
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 500);
    }
  }

  async updatePenaltyTask(id: string, updates: Partial<PenaltyTask>): Promise<ApiResponse<PenaltyTask>> {
    // In a real implementation, we'd update the penalty task status
    // For now, we just return the updated penalty task
    try {
      const task: PenaltyTask = {
        id,
        exercise: id.includes('pushups') ? 'Push-ups' : 
                  id.includes('situps') ? 'Sit-ups' : 
                  id.includes('squats') ? 'Squats' : 'Miles to run',
        count: updates.count || 0,
        unit: id.includes('running') ? 'miles' : 'reps'
      };
      
      return {
        data: task,
        status: 200
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 500);
    }
  }

  // Bonus Task endpoints
  async getBonusTasks(): Promise<ApiResponse<BonusTask[]>> {
    try {
      const response = await this.fetchWithAuth('/api/workouts');
      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiError(data.message || 'Failed to fetch bonus tasks', response.status);
      }
      
      const bonusTasks: BonusTask[] = [];
      
      if (data.bonusTask) {
        bonusTasks.push({
          id: 'daily-bonus',
          description: data.bonusTask,
          completed: false
        });
      }
      
      return {
        data: bonusTasks,
        status: response.status
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 500);
    }
  }

  async updateBonusTask(id: string, updates: Partial<BonusTask>): Promise<ApiResponse<BonusTask>> {
    try {
      // For now, we just return the updated task
      const task: BonusTask = {
        id,
        description: '',
        completed: updates.completed || false
      };
      
      return {
        data: task,
        status: 200
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 500);
    }
  }

  // Workout endpoints
  async getTodayWorkout(): Promise<ApiResponse<Workout>> {
    try {
      const response = await this.fetchWithAuth('/api/workouts');
      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiError(data.message || 'Failed to fetch today\'s workout', response.status);
      }
      
      return {
        data: data as Workout,
        status: response.status
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 500);
    }
  }

  async updateWorkoutProgress(exercises: Record<string, number>, completeBonusTask: boolean): Promise<ApiResponse<WorkoutResult>> {
    try {
      const response = await this.fetchWithAuth('/api/workouts', {
        method: 'POST',
        body: JSON.stringify({ exercises, completeBonusTask })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiError(data.message || 'Failed to update workout progress', response.status);
      }
      
      return {
        data: data as WorkoutResult,
        status: response.status
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 500);
    }
  }
}

export const realApiService = new RealApiService(); 