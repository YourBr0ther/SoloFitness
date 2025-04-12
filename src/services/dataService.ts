import { realApiService } from './realApi';
import { mockApiService } from './mockApi';
import { CacheService } from './cacheService';
import { Coach } from '@/types/coach';
import { ExerciseProgress, PenaltyTask, BonusTask } from '@/types/journal';
import { Exercise } from '@/types/exercise';
import { Profile, StreakDay, GymBadge } from '@/types/profile';

// Use mock API service for development
const apiService = process.env.NODE_ENV === 'development' ? mockApiService : realApiService;

// Initialize cache service with configuration
const cacheService = new CacheService({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  storageKey: 'solofitness-cache'
});

class DataService {
  // Coach Data
  async getCoaches(): Promise<Coach[]> {
    const cacheKey = 'coaches';
    const cached = cacheService.get<Coach[]>(cacheKey);
    
    if (cached) {
      return cached.data;
    }

    const response = await apiService.getCoaches();
    cacheService.set(cacheKey, response.data);
    return response.data;
  }

  async getCoach(id: string): Promise<Coach> {
    const cacheKey = `coach-${id}`;
    const cached = cacheService.get<Coach>(cacheKey);
    
    if (cached) {
      return cached.data;
    }

    const response = await apiService.getCoach(id);
    cacheService.set(cacheKey, response.data);
    return response.data;
  }

  async createCoach(coach: Omit<Coach, 'id'>): Promise<Coach> {
    const response = await apiService.createCoach(coach);
    // Invalidate coaches cache
    cacheService.delete('coaches');
    return response.data;
  }

  async updateCoach(id: string, coach: Partial<Coach>): Promise<Coach> {
    const response = await apiService.updateCoach(id, coach);
    // Invalidate both specific coach and coaches list cache
    cacheService.delete(`coach-${id}`);
    cacheService.delete('coaches');
    return response.data;
  }

  async deleteCoach(id: string): Promise<void> {
    await apiService.deleteCoach(id);
    // Invalidate both specific coach and coaches list cache
    cacheService.delete(`coach-${id}`);
    cacheService.delete('coaches');
  }

  // Exercise Data
  async getExercises(): Promise<ExerciseProgress[]> {
    const cacheKey = 'exercises';
    const cached = cacheService.get<ExerciseProgress[]>(cacheKey);
    
    if (cached) {
      return cached.data;
    }

    const response = await apiService.getExercises();
    // Transform the response data to match the ExerciseProgress type
    const exercises = response.data.map(ex => ({
      id: ex.id,
      name: ex.name,
      count: 0,
      dailyGoal: 0,
      increment: 1,
      unit: 'reps'
    }));
    cacheService.set(cacheKey, exercises);
    return exercises;
  }

  async getExercise(id: string): Promise<ExerciseProgress> {
    const cacheKey = `exercise-${id}`;
    const cached = cacheService.get<ExerciseProgress>(cacheKey);
    
    if (cached) {
      return cached.data;
    }

    const response = await apiService.getExercise(id);
    // Transform the response data to match the ExerciseProgress type
    const exercise = {
      id: response.data.id,
      name: response.data.name,
      count: 0,
      dailyGoal: 0,
      increment: 1,
      unit: 'reps'
    };
    cacheService.set(cacheKey, exercise);
    return exercise;
  }

  async createExercise(exercise: Omit<ExerciseProgress, 'id'>): Promise<ExerciseProgress> {
    const response = await apiService.createExercise(exercise);
    // Invalidate exercises cache
    cacheService.delete('exercises');
    return response.data;
  }

  async updateExercise(id: string, exercise: Partial<ExerciseProgress>): Promise<ExerciseProgress> {
    const response = await apiService.updateExercise(id, exercise);
    // Invalidate both specific exercise and exercises list cache
    cacheService.delete(`exercise-${id}`);
    cacheService.delete('exercises');
    return response.data;
  }

  async deleteExercise(id: string): Promise<void> {
    await apiService.deleteExercise(id);
    // Invalidate both specific exercise and exercises list cache
    cacheService.delete(`exercise-${id}`);
    cacheService.delete('exercises');
  }

  // Profile Data
  async getProfile(): Promise<Profile> {
    const cacheKey = 'profile';
    const cached = cacheService.get<Profile>(cacheKey);
    
    if (cached) {
      return cached.data;
    }

    const response = await apiService.getProfile();
    cacheService.set(cacheKey, response.data);
    return response.data;
  }

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    const response = await apiService.updateProfile(profile);
    // Invalidate profile cache
    cacheService.delete('profile');
    return response.data;
  }

  // Badge Data
  async getBadges(): Promise<GymBadge[]> {
    const cacheKey = 'badges';
    const cached = cacheService.get<GymBadge[]>(cacheKey);
    
    if (cached) {
      return cached.data;
    }

    const response = await apiService.getBadges();
    cacheService.set(cacheKey, response.data);
    return response.data;
  }

  // Offline Support
  async queueOperation(operation: () => Promise<void>): Promise<void> {
    await cacheService.queueOperation(operation);
  }

  async processQueuedOperations(): Promise<void> {
    await cacheService.processQueue();
  }

  isOffline(): boolean {
    return cacheService.isOffline();
  }
}

export const dataService = new DataService(); 