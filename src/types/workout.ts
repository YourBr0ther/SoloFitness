import { Exercise } from './exercise';

export interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutUpdate {
  name?: string;
  description?: string;
  exercises?: Exercise[];
  duration?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface WorkoutFilters {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  search?: string;
} 