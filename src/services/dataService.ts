import { ApiService } from './realApi';
import { mockApiService } from './mockApi';
import { CacheService } from './cacheService';
import { Coach } from '@/types/coach';
import { ExerciseProgress, PenaltyTask, BonusTask } from '@/types/journal';
import { Exercise } from '@/types/exercise';
import { Profile, StreakDay, GymBadge } from '@/types/profile';
import { Workout, WorkoutProgress, WorkoutResult, WorkoutUpdate } from '@/types/workout';

// Use mock API service only when explicitly enabled
const apiService = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' ? mockApiService : new ApiService();

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
    const exercises = response.data.map((exercise: any): ExerciseProgress => ({
      id: exercise.id.toString(),
      name: exercise.name,
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
    const exercise = response.data as any;
    
    const progress: ExerciseProgress = {
      id: exercise.id.toString(),
      name: exercise.name,
      count: 0,
      dailyGoal: 0,
      increment: 1,
      unit: 'reps'
    };
    
    cacheService.set(cacheKey, progress);
    return progress;
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
    const response = await apiService.updatePenaltyTask(id, { count: progress });
    cacheService.delete('penaltyTasks');
    const task = response.data;
    task.count = parseInt(task.count as string, 10);
    return task;
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

  async updateWorkoutProgress(exercises: WorkoutProgress, completeBonusTask: boolean): Promise<WorkoutResult> {
    try {
      // Convert WorkoutProgress to Record<string, number> as expected by the API
      const exerciseData: Record<string, number> = {
        pushups: exercises.pushups,
        situps: exercises.situps,
        squats: exercises.squats,
        milesRan: exercises.milesRan
      };

      const response = await apiService.updateWorkoutProgress(exerciseData, completeBonusTask);
      
      if (!response.data) {
        throw new Error('No data received from workout progress update');
      }

      // Invalidate caches that this affects
      cacheService.delete('todayWorkout');
      cacheService.delete('profile');
      cacheService.delete('streakHistory');

      return response.data;
    } catch (error) {
      console.error('Error updating workout progress:', error);
      // Re-throw the error to be handled by the caller
      throw error;
    }
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

  // Coach messaging
  async sendMessage(coachId: string, message: string): Promise<any> {
    const response = await apiService.sendMessage(coachId, message);
    return response;
  }
}

export const dataService = new DataService(); 