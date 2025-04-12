import { ApiService } from './api';
import { ApiResponse } from '../types/api';
import { ApiError } from '../types/errors';
import { User } from '../types/user';
import { Exercise } from '../types/journal';
import { Workout, WorkoutUpdate, WorkoutFilters } from '../types/workout';
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
    count: 0,
    dailyGoal: 50,
    increment: 1,
    unit: 'reps'
  },
  {
    id: '2',
    name: 'Sit-ups',
    count: 0,
    dailyGoal: 30,
    increment: 1,
    unit: 'reps'
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

export class MockApiService extends ApiService {
  constructor() {
    super('http://mock-api');
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return {
      data: { user: mockUser, token: 'mock-token' },
      status: 200
    };
  }

  async register(userData: Partial<User>): Promise<ApiResponse<{ user: User; token: string }>> {
    return {
      data: { user: mockUser, token: 'mock-token' },
      status: 201
    };
  }

  async logout(): Promise<ApiResponse<void>> {
    return {
      data: undefined,
      status: 200
    };
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return {
      data: { token: 'mock-token' },
      status: 200
    };
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
    return {
      data: mockExercises,
      status: 200
    };
  }

  async getExercise(id: string): Promise<ApiResponse<Exercise>> {
    const exercise = mockExercises.find(e => e.id === id);
    if (!exercise) {
      throw new ApiError('Exercise not found', 404);
    }
    return {
      data: exercise,
      status: 200
    };
  }

  async createExercise(exerciseData: Partial<Exercise>): Promise<ApiResponse<Exercise>> {
    const newExercise: Exercise = {
      id: String(mockExercises.length + 1),
      name: exerciseData.name || '',
      count: 0,
      dailyGoal: exerciseData.dailyGoal || 50,
      increment: exerciseData.increment || 1,
      unit: exerciseData.unit || 'reps'
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
    const index = mockExercises.findIndex(e => e.id === id);
    if (index === -1) {
      throw new ApiError('Exercise not found', 404);
    }
    mockExercises.splice(index, 1);
    return {
      data: undefined,
      status: 204
    };
  }

  // Profile endpoints
  async getProfile(): Promise<ApiResponse<Profile>> {
    return {
      data: mockProfile,
      status: 200
    };
  }

  async updateProfile(updates: Partial<Profile>): Promise<ApiResponse<Profile>> {
    return {
      data: { ...mockProfile, ...updates },
      status: 200
    };
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
    return {
      data: mockCoaches,
      status: 200
    };
  }

  async getCoach(id: string): Promise<ApiResponse<Coach>> {
    const coach = mockCoaches.find(c => c.id === id);
    if (!coach) {
      throw new ApiError('Coach not found', 404, 'NOT_FOUND');
    }
    return {
      data: coach,
      status: 200
    };
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

  // Other endpoints can be implemented similarly
  // For brevity, I'm only implementing the most commonly used ones
  // You can add more mock data and implement other endpoints as needed
}

export const mockApiService = new MockApiService(); 