import { BaseApiService } from './api';
import { ApiResponse } from '../types/api';
import { ApiError } from '../types/errors';
import { User } from '../types/user';
import { Exercise } from '../types/exercise';
import { Workout, WorkoutUpdate, WorkoutFilters, WorkoutResult } from '../types/workout';
import { Profile, StreakDay, GymBadge } from '../types/profile';
import { UserSettings } from '../types/settings';
import { Achievement, AchievementProgress, AchievementCategory } from '../types/achievements';
import type { Notification, NotificationPreferences, NotificationUpdate, NotificationFilters } from '../types/notifications';
import { LeaderboardEntry, LeaderboardFilters, LeaderboardStats } from '../types/leaderboard';
import { AnalyticsDataPoint, AnalyticsSummary, AnalyticsFilters } from '../types/analytics';
import { SocialProfile, SocialPost, SocialComment, SocialInteraction, SocialFilters, SocialStats } from '../types/social';
import { Feedback, FeedbackComment, FeedbackUpdate, FeedbackFilters, FeedbackStats } from '../types/feedback';
import { Reminder, ReminderFilters, ReminderStats } from '../types/reminder';
import { ExportJob, ExportOptions, ExportProgress, ExportResult } from '../types/export';
import { ImportJob, ImportOptions, ImportProgress, ImportResult } from '../types/import';
import { Coach } from '../types/coach';
import { PenaltyTask, BonusTask } from '../types/journal';

// Mock data
const mockUser: User = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  avatarUrl: '/avatars/default.png',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Push-ups',
    description: 'A classic bodyweight exercise that targets chest, shoulders, and triceps',
    muscleGroup: 'chest, shoulders, triceps',
    equipment: 'none',
    difficulty: 'beginner',
    instructions: [
      'Start in a plank position',
      'Lower your body until your chest nearly touches the ground',
      'Push back up to starting position'
    ],
    videoUrl: '/exercises/pushups.mp4',
    imageUrl: '/exercises/pushups.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Sit-ups',
    description: 'A core strengthening exercise targeting abdominal muscles',
    muscleGroup: 'core, abs',
    equipment: 'none',
    difficulty: 'beginner',
    instructions: [
      'Lie on your back with knees bent',
      'Place hands behind head',
      'Lift upper body towards knees',
      'Lower back down with control'
    ],
    videoUrl: '/exercises/situps.mp4',
    imageUrl: '/exercises/situps.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockProfile: Profile = {
  id: '1',
  username: 'testuser',
  avatarUrl: '/avatars/default.png',
  streakHistory: [],
  notifications: [],
  preferences: {
    enablePenalties: true,
    enableBonuses: true
  },
  badges: [],
  apiKey: 'mock-api-key'
};

const mockCoaches: Coach[] = [
  {
    id: '1',
    name: 'John Doe',
    description: 'Certified personal trainer with 10 years of experience',
    avatar: '/coaches/john.jpg',
    personality: 'motivational'
  },
  {
    id: '2',
    name: 'Jane Smith',
    description: 'Yoga instructor and wellness coach',
    avatar: '/coaches/jane.jpg',
    personality: 'balanced'
  }
];

const mockPenaltyTasks: PenaltyTask[] = [
  {
    id: '1',
    exercise: 'Push-ups',
    count: 10,
    unit: 'reps'
  }
];

const mockBonusTasks: BonusTask[] = [
  {
    id: '1',
    description: 'Go for a 1-mile run',
    completed: false
  }
];

const mockBadges: GymBadge[] = [
  {
    id: '1',
    name: 'First Workout',
    description: 'Completed your first workout',
    icon: '🏆',
    unlocked: true,
    progress: 1,
    total: 1,
    isNew: true
  }
];

const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'First Workout',
    description: 'Complete your first workout',
    icon: '🏆',
    category: 'exercise' as AchievementCategory,
    points: 100,
    requirements: {
      type: 'workouts',
      value: 1
    },
    isSecret: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: '7 Day Streak',
    description: 'Complete workouts for 7 days in a row',
    icon: '🔥',
    category: 'streak' as AchievementCategory,
    points: 500,
    requirements: {
      type: 'streak',
      value: 7
    },
    isSecret: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
];

export class MockApiService extends BaseApiService {
  private createSuccessResponse<T>(data: T, status: number = 200): ApiResponse<T> {
    return { data, status };
  }

  private createErrorResponse(message: string, status: number = 404, code: string = 'NOT_FOUND'): never {
    throw new ApiError(message, status, code);
  }

  private findById<T extends { id: string }>(items: T[], id: string, entityName: string): T {
    const item = items.find(i => i.id === id);
    if (!item) {
      this.createErrorResponse(`${entityName} not found`, 404);
    }
    return item!;
  }

  private updateById<T extends { id: string }>(items: T[], id: string, updates: Partial<T>, entityName: string): T {
    const index = items.findIndex(i => i.id === id);
    if (index === -1) {
      this.createErrorResponse(`${entityName} not found`, 404);
    }
    items[index] = { ...items[index], ...updates };
    return items[index];
  }

  constructor() {
    super('http://mock-api');
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.createSuccessResponse({ user: mockUser, token: 'mock-token' });
  }

  async register(userData: Partial<User>): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.createSuccessResponse({ user: mockUser, token: 'mock-token' }, 201);
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.createSuccessResponse(undefined);
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.createSuccessResponse({ token: 'mock-refreshed-token' });
  }

  // User endpoints
  async getUser(): Promise<ApiResponse<User>> {
    return {
      data: mockUser,
      status: 200
    };
  }

  async updateUser(updates: Partial<User>): Promise<ApiResponse<User>> {
    return {
      data: { ...mockUser, ...updates },
      status: 200
    };
  }

  // Exercise endpoints
  async getExercises(): Promise<ApiResponse<Exercise[]>> {
    return this.createSuccessResponse(mockExercises);
  }

  async getExercise(id: string): Promise<ApiResponse<Exercise>> {
    return this.createSuccessResponse(this.findById(mockExercises, id, 'Exercise'));
  }

  async createExercise(exerciseData: Partial<Exercise>): Promise<ApiResponse<Exercise>> {
    const newExercise: Exercise = {
      id: String(mockExercises.length + 1),
      name: exerciseData.name || '',
      description: exerciseData.description || '',
      muscleGroup: exerciseData.muscleGroup || 'chest',
      equipment: exerciseData.equipment || 'none',
      difficulty: exerciseData.difficulty || 'beginner',
      instructions: exerciseData.instructions || ['No instructions provided'],
      videoUrl: exerciseData.videoUrl || '',
      imageUrl: exerciseData.imageUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockExercises.push(newExercise);
    return {
      data: newExercise,
      status: 201
    };
  }

  async updateExercise(id: string, updates: Partial<Exercise>): Promise<ApiResponse<Exercise>> {
    const index = mockExercises.findIndex(e => e.id === id);
    if (index === -1) {
      throw new ApiError('Exercise not found', 404);
    }
    mockExercises[index] = { ...mockExercises[index], ...updates };
    return {
      data: mockExercises[index],
      status: 200
    };
  }

  async deleteExercise(id: string): Promise<ApiResponse<void>> {
    this.findById(mockExercises, id, 'Exercise'); // Verify exists
    const index = mockExercises.findIndex(e => e.id === id);
    mockExercises.splice(index, 1);
    return this.createSuccessResponse(undefined, 204);
  }

  // Profile endpoints
  async getProfile(): Promise<ApiResponse<Profile>> {
    return this.createSuccessResponse(mockProfile);
  }

  async updateProfile(updates: Partial<Profile>): Promise<ApiResponse<Profile>> {
    return this.createSuccessResponse({ ...mockProfile, ...updates });
  }

  // Achievement endpoints
  async getAchievements(): Promise<ApiResponse<Achievement[]>> {
    return {
      data: mockAchievements,
      status: 200,
    };
  }

  async getAchievementProgress(): Promise<ApiResponse<AchievementProgress[]>> {
    return {
      data: [
        {
          achievementId: '1',
          progress: 1,
          isUnlocked: true
        },
        {
          achievementId: '2',
          progress: 5,
          isUnlocked: false
        },
      ],
      status: 200,
    };
  }

  // Coach endpoints
  async getCoaches(): Promise<ApiResponse<Coach[]>> {
    return this.createSuccessResponse(mockCoaches);
  }

  async getCoach(id: string): Promise<ApiResponse<Coach>> {
    return this.createSuccessResponse(this.findById(mockCoaches, id, 'Coach'));
  }

  async createCoach(data: Omit<Coach, 'id'>): Promise<ApiResponse<Coach>> {
    const newCoach: Coach = {
      ...data,
      id: (mockCoaches.length + 1).toString()
    };
    mockCoaches.push(newCoach);
    return {
      data: newCoach,
      status: 201
    };
  }

  async updateCoach(id: string, data: Partial<Coach>): Promise<ApiResponse<Coach>> {
    const index = mockCoaches.findIndex(c => c.id === id);
    if (index === -1) {
      throw new ApiError('Coach not found', 404, 'NOT_FOUND');
    }
    mockCoaches[index] = {
      ...mockCoaches[index],
      ...data
    };
    return {
      data: mockCoaches[index],
      status: 200
    };
  }

  async deleteCoach(id: string): Promise<ApiResponse<void>> {
    const index = mockCoaches.findIndex(c => c.id === id);
    if (index === -1) {
      throw new ApiError('Coach not found', 404, 'NOT_FOUND');
    }
    mockCoaches.splice(index, 1);
    return {
      data: undefined,
      status: 204
    };
  }

  async sendMessage(coachId: string, message: string): Promise<ApiResponse<string>> {
    return {
      data: 'Message sent successfully',
      status: 200
    };
  }

  // Streak endpoints
  async getStreakHistory(): Promise<ApiResponse<StreakDay[]>> {
    return {
      data: mockProfile.streakHistory,
      status: 200
    };
  }

  async updateStreak(update: StreakDay): Promise<ApiResponse<StreakDay>> {
    const index = mockProfile.streakHistory.findIndex(day => day.date === update.date);
    if (index === -1) {
      mockProfile.streakHistory.push(update);
    } else {
      mockProfile.streakHistory[index] = update;
    }
    return {
      data: update,
      status: 200
    };
  }

  // Badge endpoints
  async getBadges(): Promise<ApiResponse<GymBadge[]>> {
    return {
      data: mockBadges,
      status: 200
    };
  }

  // Penalty task endpoints
  async getPenaltyTasks(): Promise<ApiResponse<PenaltyTask[]>> {
    return {
      data: mockPenaltyTasks,
      status: 200
    };
  }

  async updatePenaltyTask(id: string, updates: Partial<PenaltyTask>): Promise<ApiResponse<PenaltyTask>> {
    const index = mockPenaltyTasks.findIndex(task => task.id === id);
    if (index === -1) {
      throw new ApiError('Penalty task not found', 404);
    }
    mockPenaltyTasks[index] = { ...mockPenaltyTasks[index], ...updates };
    return {
      data: mockPenaltyTasks[index],
      status: 200
    };
  }

  // Bonus task endpoints
  async getBonusTasks(): Promise<ApiResponse<BonusTask[]>> {
    return {
      data: mockBonusTasks,
      status: 200
    };
  }

  async updateBonusTask(id: string, updates: Partial<BonusTask>): Promise<ApiResponse<BonusTask>> {
    const index = mockBonusTasks.findIndex(task => task.id === id);
    if (index === -1) {
      throw new ApiError('Bonus task not found', 404);
    }
    mockBonusTasks[index] = { ...mockBonusTasks[index], ...updates };
    return {
      data: mockBonusTasks[index],
      status: 200
    };
  }

  // Workout endpoints
  async getTodayWorkout(): Promise<ApiResponse<Workout>> {
    // Mock current level
    const level = 1;
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate exercise requirements based on level
    const requirements = {
      pushups: 10 + (level * 5),
      situps: 15 + (level * 5),
      squats: 10 + (level * 3),
      milesRan: Math.max(0.5, Math.floor((level / 3) * 10) / 10)
    };
    
    // Random penalty (20% chance)
    const hasPenalty = Math.random() < 0.2;
    const penalties = hasPenalty ? {
      pushups: 5,
      situps: 5,
      squats: 3,
      milesRan: 0.1
    } : {
      pushups: 0,
      situps: 0,
      squats: 0,
      milesRan: 0
    };
    
    // Random bonus task (20% chance if no penalty)
    const bonusTasks = [
      "Meditate for 10 minutes",
      "Drink an extra glass of water",
      "Stretch for 5 minutes",
      "Call a friend or family member",
      "Write down 3 things you're grateful for"
    ];
    
    const bonusTask = !hasPenalty && Math.random() < 0.2 ? 
      bonusTasks[Math.floor(Math.random() * bonusTasks.length)] : null;
    
    return {
      data: {
        date: today,
        completed: false,
        level,
        requirements,
        currentProgress: {
          pushups: 0,
          situps: 0,
          squats: 0,
          milesRan: 0
        },
        penalties,
        bonusTask,
        hasPenalty
      },
      status: 200
    };
  }

  async updateWorkoutProgress(exercises: Record<string, number>, completeBonusTask: boolean): Promise<ApiResponse<WorkoutResult>> {
    // Mock level and requirements
    const level = 1;
    const requirements = {
      pushups: 10 + (level * 5),
      situps: 15 + (level * 5),
      squats: 10 + (level * 3),
      milesRan: Math.max(0.5, Math.floor((level / 3) * 10) / 10)
    };
    
    // Check if requirements are met
    const isCompleted = 
      exercises.pushups >= requirements.pushups &&
      exercises.situps >= requirements.situps &&
      exercises.squats >= requirements.squats &&
      exercises.milesRan >= requirements.milesRan;
    
    // Calculate XP based on completion and bonus
    let xpEarned = isCompleted ? 50 : 0;
    
    // Add bonus XP for bonus task
    if (completeBonusTask) {
      xpEarned += 25;
    }
    
    // Mock streak data
    const currentStreak = isCompleted ? 1 : 0;
    
    return {
      data: {
        completed: isCompleted,
        xpEarned,
        currentStreak,
        longestStreak: currentStreak,
        level: isCompleted ? level + 1 : level
      },
      status: 200
    };
  }

  // Other endpoints can be implemented similarly
  // For brevity, I'm only implementing the most commonly used ones
  // You can add more mock data and implement other endpoints as needed
}

export const mockApiService = new MockApiService(); 