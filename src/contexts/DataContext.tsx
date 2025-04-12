'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dataService } from '@/services/dataService';
import { Coach } from '@/types/coach';
import { Exercise, PenaltyTask, BonusTask } from '@/types/journal';
import { Profile, StreakDay, GymBadge } from '@/types/profile';
import { ApiError } from '@/types/errors';
import { Workout } from '@/types/workout';

interface DataContextType {
  // Coach Data
  coaches: Coach[];
  selectedCoach: Coach | null;
  isLoadingCoaches: boolean;
  coachError: ApiError | null;
  loadCoaches: () => Promise<void>;
  selectCoach: (coach: Coach) => void;
  sendMessage: (message: string) => Promise<string>;

  // Profile Data
  profile: Profile | null;
  isLoadingProfile: boolean;
  profileError: ApiError | null;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  streakHistory: StreakDay[];
  badges: GymBadge[];

  // Journal Data
  exercises: Exercise[];
  isLoadingExercises: boolean;
  exerciseError: ApiError | null;
  loadExercises: () => Promise<void>;
  updateExercise: (exerciseId: string, count: number) => Promise<void>;
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
  updateWorkoutProgress: (exercises: Record<string, number>, completeBonusTask: boolean) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // Coach State
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [isLoadingCoaches, setIsLoadingCoaches] = useState(false);
  const [coachError, setCoachError] = useState<ApiError | null>(null);

  // Profile State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<ApiError | null>(null);
  const [streakHistory, setStreakHistory] = useState<StreakDay[]>([]);
  const [badges, setBadges] = useState<GymBadge[]>([]);

  // Journal State
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [exerciseError, setExerciseError] = useState<ApiError | null>(null);
  const [penaltyTasks, setPenaltyTasks] = useState<PenaltyTask[]>([]);
  const [bonusTasks, setBonusTasks] = useState<BonusTask[]>([]);

  // Workout State
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null);
  const [isLoadingWorkout, setIsLoadingWorkout] = useState(false);
  const [workoutError, setWorkoutError] = useState<ApiError | null>(null);

  // Coach Methods
  const loadCoaches = async () => {
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
    if (!selectedCoach) throw new Error('No coach selected');
    return dataService.sendMessage(selectedCoach.id, message);
  };

  // Profile Methods
  const loadProfile = async () => {
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
    if (!profile) throw new Error('No profile loaded');
    const updatedProfile = await dataService.updateProfile(updates);
    setProfile(updatedProfile);
  };

  // Journal Methods
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

  const updateExercise = async (exerciseId: string, count: number) => {
    const updatedExercise = await dataService.updateExercise(exerciseId, count);
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

  // Workout Methods
  const loadTodayWorkout = async () => {
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

  const updateWorkoutProgress = async (exercises: Record<string, number>, completeBonusTask: boolean) => {
    try {
      const result = await dataService.updateWorkoutProgress(exercises, completeBonusTask);
      // Reload profile and workout data since they've been updated
      await Promise.all([loadProfile(), loadTodayWorkout()]);
      return result;
    } catch (error) {
      setWorkoutError(error as ApiError);
      throw error;
    }
  };

  // Initial Data Loading
  useEffect(() => {
    loadCoaches();
    loadProfile();
    loadExercises();
  }, []);

  const value = {
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
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
} 