'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dataService } from '@/services/dataService';
import { Coach } from '@/types/coach';
import { ExerciseProgress, PenaltyTask, BonusTask } from '@/types/journal';
import { Profile, StreakDay, GymBadge } from '@/types/profile';
import { ApiError } from '@/types/errors';
import { Workout, WorkoutProgress, WorkoutResult } from '@/types/workout';
import { useRouter, usePathname } from 'next/navigation';

interface DataContextType {
  // Coach Data
  coaches: Coach[];
  selectedCoach: Coach | null;
  isLoadingCoaches: boolean;
  coachError: ApiError | null;
  loadCoaches: () => Promise<void>;
  selectCoach: (coach: Coach) => void;
  sendMessage: (message: string) => Promise<void>;

  // Profile Data
  profile: Profile | null;
  isLoadingProfile: boolean;
  profileError: ApiError | null;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  streakHistory: StreakDay[];
  badges: GymBadge[];

  // Journal Data
  exercises: ExerciseProgress[];
  isLoadingExercises: boolean;
  exerciseError: ApiError | null;
  loadExercises: () => Promise<void>;
  updateExercise: (exerciseId: string, updates: Partial<ExerciseProgress>) => Promise<void>;
  penaltyTasks: PenaltyTask[];
  bonusTasks: BonusTask[];
  updatePenaltyTask: (taskId: string, progress: number) => Promise<void>;
  updateBonusTask: (taskId: string, completed: boolean) => Promise<void>;
  updateStreak: (update: StreakDay) => Promise<void>;

  // Workout Data
  todayWorkout: Workout | null;
  isLoadingWorkout: boolean;
  workoutError: ApiError | null;
  loadTodayWorkout: () => Promise<void>;
  updateWorkoutProgress: (exercises: WorkoutProgress, completeBonusTask: boolean) => Promise<WorkoutResult>;

  isAuthenticated: boolean;
  isInitializing: boolean;
  globalError: string | null;
}

const defaultContext: DataContextType = {
  // Coach defaults
  coaches: [],
  selectedCoach: null,
  isLoadingCoaches: false,
  coachError: null,
  loadCoaches: async () => {},
  selectCoach: () => {},
  sendMessage: async () => {},
  
  // Profile defaults
  profile: null,
  isLoadingProfile: false,
  profileError: null,
  loadProfile: async () => {},
  updateProfile: async () => {},
  streakHistory: [],
  badges: [],

  // Journal defaults
  exercises: [],
  isLoadingExercises: false,
  exerciseError: null,
  loadExercises: async () => {},
  updateExercise: async () => {},
  penaltyTasks: [],
  bonusTasks: [],
  updatePenaltyTask: async () => {},
  updateBonusTask: async () => {},
  updateStreak: async () => {},

  // Workout defaults
  todayWorkout: null,
  isLoadingWorkout: false,
  workoutError: null,
  loadTodayWorkout: async () => {},
  updateWorkoutProgress: async () => ({
    completed: false,
    xpEarned: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1
  }),
  
  // Auth defaults
  isAuthenticated: false,
  isInitializing: true,
  globalError: null
};

const DataContext = createContext<DataContextType>(defaultContext);

export function DataProvider({ children }: { children: ReactNode }) {
  // Coach state
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [isLoadingCoaches, setIsLoadingCoaches] = useState(false);
  const [coachError, setCoachError] = useState<ApiError | null>(null);
  
  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<ApiError | null>(null);
  const [streakHistory, setStreakHistory] = useState<StreakDay[]>([]);
  const [badges, setBadges] = useState<GymBadge[]>([]);

  // Journal state
  const [exercises, setExercises] = useState<ExerciseProgress[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [exerciseError, setExerciseError] = useState<ApiError | null>(null);
  const [penaltyTasks, setPenaltyTasks] = useState<PenaltyTask[]>([]);
  const [bonusTasks, setBonusTasks] = useState<BonusTask[]>([]);

  // Workout state
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null);
  const [isLoadingWorkout, setIsLoadingWorkout] = useState(false);
  const [workoutError, setWorkoutError] = useState<ApiError | null>(null);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();

  // List of paths that don't require authentication
  const publicPaths = ['/', '/login', '/register', '/forgot-password'];

  useEffect(() => {
    const checkAuth = () => {
      const token = document.cookie.includes('token=');
      setIsAuthenticated(token);
      setIsInitializing(false);

      // If on a protected route without auth, redirect to login
      if (!token && !publicPaths.includes(pathname)) {
        router.push('/login');
        return false;
      }

      // If authenticated on an auth route, redirect to journal
      if (token && publicPaths.includes(pathname)) {
        router.push('/journal');
        return false;
      }

      return token && !publicPaths.includes(pathname);
    };

    const shouldLoadData = checkAuth();

    // Only load data if authenticated and on a protected route
    if (shouldLoadData) {
      loadCoaches();
      loadProfile();
      loadExercises();
      loadTodayWorkout();
    }
  }, [pathname, router]);

  const loadCoaches = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoadingCoaches(true);
      setCoachError(null);
      const data = await dataService.getCoaches();
      setCoaches(data);
    } catch (error) {
      setCoachError(error as ApiError);
    } finally {
      setIsLoadingCoaches(false);
    }
  };

  const selectCoach = (coach: Coach) => {
    setSelectedCoach(coach);
  };

  const sendMessage = async (message: string) => {
    if (!isAuthenticated || !selectedCoach) return;
    const response = await dataService.sendMessage(selectedCoach.id, message);
    return response.data;
  };

  const loadProfile = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoadingProfile(true);
      setProfileError(null);
      const [profileData, streakData, badgesData] = await Promise.all([
        dataService.getProfile(),
        dataService.getStreakHistory(),
        dataService.getBadges()
      ]);
      setProfile(profileData);
      setStreakHistory(streakData);
      setBadges(badgesData);
    } catch (error) {
      setProfileError(error as ApiError);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!isAuthenticated) return;
    
    try {
      const updatedProfile = await dataService.updateProfile(updates);
      setProfile(updatedProfile);
    } catch (error) {
      setProfileError(error as ApiError);
    }
  };

  const loadExercises = async () => {
    try {
      setIsLoadingExercises(true);
      setExerciseError(null);
      const [exercisesData, penaltyTasksData, bonusTasksData] = await Promise.all([
        dataService.getExercises(),
        dataService.getPenaltyTasks(),
        dataService.getBonusTasks()
      ]);
      setExercises(exercisesData);
      setPenaltyTasks(penaltyTasksData);
      setBonusTasks(bonusTasksData);
    } catch (error) {
      setExerciseError(error as ApiError);
    } finally {
      setIsLoadingExercises(false);
    }
  };

  const updateExercise = async (exerciseId: string, updates: Partial<ExerciseProgress>) => {
    const updatedExercise = await dataService.updateExercise(exerciseId, updates);
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? updatedExercise : ex
    ));
  };

  const updatePenaltyTask = async (taskId: string, progress: number) => {
    const updatedTask = await dataService.updatePenaltyTask(taskId, progress);
    setPenaltyTasks(prev => prev.map(task => 
      task.id === taskId ? updatedTask : task
    ));
  };

  const updateBonusTask = async (taskId: string, completed: boolean) => {
    const updatedTask = await dataService.updateBonusTask(taskId, completed);
    setBonusTasks(prev => prev.map(task => 
      task.id === taskId ? updatedTask : task
    ));
  };

  const updateStreak = async (update: StreakDay) => {
    const updatedStreak = await dataService.updateStreak(update);
    setStreakHistory(prev => prev.map(day => 
      day.date === update.date ? updatedStreak : day
    ));
  };

  const loadTodayWorkout = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoadingWorkout(true);
      setWorkoutError(null);
      const workout = await dataService.getTodayWorkout();
      setTodayWorkout(workout);
    } catch (error) {
      setWorkoutError(error as ApiError);
    } finally {
      setIsLoadingWorkout(false);
    }
  };

  const updateWorkoutProgress = async (
    exercises: WorkoutProgress,
    completeBonusTask: boolean
  ): Promise<WorkoutResult> => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
    
    try {
      const result = await dataService.updateWorkoutProgress(exercises, completeBonusTask);
      
      // Update local state instead of reloading
      if (todayWorkout) {
        setTodayWorkout({
          ...todayWorkout,
          currentProgress: exercises
        });
      }
      
      // Only reload profile since XP/level might have changed
      await loadProfile();
      
      return result;
    } catch (error) {
      setWorkoutError(error as ApiError);
      throw error;
    }
  };

  const value: DataContextType = {
    // Coach Data
    coaches,
    selectedCoach,
    isLoadingCoaches,
    coachError,
    loadCoaches,
    selectCoach,
    sendMessage,

    // Profile Data
    profile,
    isLoadingProfile,
    profileError,
    loadProfile,
    updateProfile,
    streakHistory,
    badges,

    // Journal Data
    exercises,
    isLoadingExercises,
    exerciseError,
    loadExercises,
    updateExercise,
    penaltyTasks,
    bonusTasks,
    updatePenaltyTask,
    updateBonusTask,
    updateStreak,

    // Workout Data
    todayWorkout,
    isLoadingWorkout,
    workoutError,
    loadTodayWorkout,
    updateWorkoutProgress,

    // Auth state
    isAuthenticated,
    isInitializing,
    globalError
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext); 