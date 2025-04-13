import { User } from '../types/user';
import { Exercise } from '../types/exercise';
import { Profile } from '../types/profile';
import { Coach } from '../types/coach';
import { Achievement, AchievementCategory } from '../types/achievements';
import { GymBadge } from '../types/profile';
import { PenaltyTask, BonusTask } from '../types/journal';

export const mockUser: User = {
  id: 'mock-user-1',
  email: 'user@example.com',
  username: 'mockuser',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const mockExercises: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Push-ups',
    description: 'Basic push-ups',
    muscleGroup: 'chest, triceps, shoulders',
    equipment: 'none',
    difficulty: 'beginner',
    instructions: ['Get into plank position', 'Lower body', 'Push back up'],
    videoUrl: 'https://example.com/pushups.mp4',
    imageUrl: 'https://example.com/pushups.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ex-2',
    name: 'Pull-ups',
    description: 'Basic pull-ups',
    muscleGroup: 'back, biceps',
    equipment: 'pull-up bar',
    difficulty: 'intermediate',
    instructions: ['Grip the bar', 'Pull up', 'Lower slowly'],
    videoUrl: 'https://example.com/pullups.mp4',
    imageUrl: 'https://example.com/pullups.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockProfile: Profile = {
  id: 'profile-1',
  username: mockUser.username,
  avatarUrl: mockUser.avatarUrl,
  streakHistory: [
    { 
      date: '2024-03-01', 
      completed: true,
      xpEarned: 100,
      exercises: {
        pushups: 20,
        situps: 30,
        squats: 15,
        milesRan: 1
      }
    },
    { 
      date: '2024-03-02', 
      completed: true,
      xpEarned: 150,
      exercises: {
        pushups: 25,
        situps: 35,
        squats: 20,
        milesRan: 1.5
      }
    },
    { 
      date: '2024-03-03', 
      completed: false,
      xpEarned: 0,
      exercises: {
        pushups: 0,
        situps: 0,
        squats: 0,
        milesRan: 0
      }
    }
  ],
  notifications: [],
  preferences: {
    enablePenalties: true,
    enableBonuses: true
  },
  badges: [],
  apiKey: 'mock-api-key'
};

export const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'First Workout',
    description: 'Complete your first workout',
    icon: '🎯',
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
    name: 'Workout Warrior',
    description: 'Complete 10 workouts',
    icon: '💪',
    category: 'streak' as AchievementCategory,
    points: 500,
    requirements: {
      type: 'streak',
      value: 10
    },
    isSecret: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const mockCoaches: Coach[] = [
  {
    id: 'coach-1',
    name: 'John Smith',
    description: 'Expert in strength training',
    avatar: 'https://example.com/coach1.jpg',
    personality: 'motivational'
  },
  {
    id: 'coach-2',
    name: 'Sarah Johnson',
    description: 'HIIT and cardio specialist',
    avatar: 'https://example.com/coach2.jpg',
    personality: 'technical'
  }
];

export const mockBadges: GymBadge[] = [
  {
    id: 'badge-1',
    name: 'Early Bird',
    description: 'Complete 5 morning workouts',
    icon: '🌅',
    progress: 3,
    total: 5,
    isNew: true,
    unlocked: false
  },
  {
    id: 'badge-2',
    name: 'Night Owl',
    description: 'Complete 5 evening workouts',
    icon: '🌙',
    progress: 5,
    total: 5,
    isNew: false,
    unlocked: true
  }
];

export const mockPenaltyTasks: PenaltyTask[] = [
  {
    id: 'penalty-1',
    exercise: 'Push-ups',
    count: 10,
    unit: 'reps'
  },
  {
    id: 'penalty-2',
    exercise: 'Running',
    count: 1,
    unit: 'miles'
  }
];

export const mockBonusTasks: BonusTask[] = [
  {
    id: 'bonus-1',
    description: 'Complete an extra set of each exercise',
    completed: false
  },
  {
    id: 'bonus-2',
    description: 'Add 5 minutes to your cardio',
    completed: true
  }
]; 