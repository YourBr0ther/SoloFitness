import { realApiService } from './realApi';
import { mockApiService } from './mockApi';
import { CacheService } from './cacheService';
import { Coach } from '@/types/coach';
import { ExerciseProgress, PenaltyTask, BonusTask } from '@/types/journal';
import { Exercise } from '@/types/exercise';
import { Profile, StreakDay, GymBadge } from '@/types/profile';
import { Workout } from '@/types/workout';

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

  // Streak Data
  async getStreakHistory(): Promise<StreakDay[]> {
    const cacheKey = 'streakHistory';
    const cached = cacheService.get<StreakDay[]>(cacheKey);
    
    if (cached) {
      return cached.data;
    }

    const response = await apiService.getStreakHistory();
    cacheService.set(cacheKey, response.data);
    return response.data;
  }

  async updateStreak(streak: StreakDay): Promise<StreakDay> {
    const response = await apiService.updateStreak(streak);
    // Invalidate streak history cache
    cacheService.delete('streakHistory');
    // Invalidate profile cache since streak affects it
    cacheService.delete('profile');
    return response.data;
  }

  // Penalty Tasks
  async getPenaltyTasks(): Promise<PenaltyTask[]> {
    const cacheKey = 'penaltyTasks';
    const cached = cacheService.get<PenaltyTask[]>(cacheKey);
    
    if (cached) {
      return cached.data;
    }

    const response = await apiService.getPenaltyTasks();
    cacheService.set(cacheKey, response.data);
    return response.data;
  }

  async updatePenaltyTask(id: string, progress: number): Promise<PenaltyTask> {
    const response = await apiService.updatePenaltyTask(id, { progress });
    // Invalidate penalty tasks cache
    cacheService.delete('penaltyTasks');
    return response.data;
  }

  // Bonus Tasks
  async getBonusTasks(): Promise<BonusTask[]> {
    const cacheKey = 'bonusTasks';
    const cached = cacheService.get<BonusTask[]>(cacheKey);
    
    if (cached) {
      return cached.data;
    }

    const response = await apiService.getBonusTasks();
    cacheService.set(cacheKey, response.data);
    return response.data;
  }

  async updateBonusTask(id: string, completed: boolean): Promise<BonusTask> {
    const response = await apiService.updateBonusTask(id, { completed });
    // Invalidate bonus tasks cache
    cacheService.delete('bonusTasks');
    return response.data;
  }

  // Workout Data - New methods
  async getTodayWorkout(): Promise<Workout> {
    const cacheKey = 'todayWorkout';
    const cached = cacheService.get<Workout>(cacheKey);
    
    if (cached) {
      return cached.data;
    }

    const response = await apiService.getTodayWorkout();
    cacheService.set(cacheKey, response.data, 60 * 1000); // Cache for only 1 minute to keep it fresh
    return response.data;
  }

  async updateWorkoutProgress(exercises: any, completeBonusTask: boolean): Promise<any> {
    const response = await apiService.updateWorkoutProgress(exercises, completeBonusTask);
    // Invalidate caches that this affects
    cacheService.delete('todayWorkout');
    cacheService.delete('profile');
    cacheService.delete('streakHistory');
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