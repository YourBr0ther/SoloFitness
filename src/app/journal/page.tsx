"use client";

import { useState, useEffect, useCallback } from "react";
import HeaderSection from "@/components/journal/HeaderSection";
import LevelProgress from "@/components/journal/LevelProgress";
import ExerciseCard from "@/components/journal/ExerciseCard";
import PenaltyTask from "@/components/journal/PenaltyTask";
import BonusTask from "@/components/journal/BonusTask";
import StreakPopup from "@/components/journal/StreakPopup";
import { DailyExercise, PenaltyTask as PenaltyTaskType, BonusTask as BonusTaskType } from "@/types/journal";
import { useApi } from '@/contexts/ApiContext';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { User } from '@/types/user';
import type { Workout } from '@/types/workout';
import type { Profile } from '@/types/profile';

export default function JournalPage() {
  const { api } = useApi();
  
  // Data states
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Loading states
  const [isLoadingWorkout, setIsLoadingWorkout] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Error states
  const [workoutError, setWorkoutError] = useState<Error | null>(null);
  const [profileError, setProfileError] = useState<Error | null>(null);
  
  const [showCompleteButton, setShowCompleteButton] = useState(false);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [exercises, setExercises] = useState<DailyExercise[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [penaltyTask, setPenaltyTask] = useState<PenaltyTaskType | null>(null);
  const [bonusTask, setBonusTask] = useState<BonusTaskType | null>(null);
  const [penaltyProgress, setPenaltyProgress] = useState(0);
  const [showPenaltyComplete, setShowPenaltyComplete] = useState(false);
  const [isPenaltyTransitioning, setIsPenaltyTransitioning] = useState(false);
  const [completedBonusTask, setCompletedBonusTask] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastLoadedDate, setLastLoadedDate] = useState<string | null>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastLoadedDate');
    }
    return null;
  });

  // Load workout data
  const loadTodayWorkout = useCallback(async () => {
    try {
      setIsLoadingWorkout(true);
      setWorkoutError(null);
      const response = await api.getTodayWorkout();
      setTodayWorkout(response.data);
    } catch (error) {
      setWorkoutError(error as Error);
      console.error('Error loading workout:', error);
    } finally {
      setIsLoadingWorkout(false);
    }
  }, [api]);

  // Load profile data
  const loadProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true);
      setProfileError(null);
      const response = await api.getProfile();
      setProfile(response.data);
    } catch (error) {
      setProfileError(error as Error);
      console.error('Error loading profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [api]);

  // Initial data loading
  useEffect(() => {
    loadTodayWorkout();
    loadProfile();
  }, [loadTodayWorkout, loadProfile]);

  // Check for new day and set up exercises
  useEffect(() => {
    if (todayWorkout && (!isInitialized || (lastLoadedDate && lastLoadedDate !== new Date().toISOString().split('T')[0]))) {
      // Get today's date in user's local timezone
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Check if this is our first load or if it's a new day
      if (lastLoadedDate && lastLoadedDate !== todayStr) {
        // Show notification in multiple ways to ensure user awareness
        try {
          // 1. Play notification sound
          const audio = new Audio('/notification.mp3');
          audio.play().catch(error => console.log('Audio playback failed:', error));
          
          // 2. Try system notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Day Started!', {
              body: 'Your daily exercise progress has been reset. Ready for a new day of training?',
              icon: '/icon.png'
            });
          }
        } catch (error) {
          console.error('Notification error:', error);
        }

        // 3. Show UI toast or alert as fallback
        alert('New day started! Your exercise progress has been reset.');
      }
      
      // Persist last loaded date
      setLastLoadedDate(todayStr);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastLoadedDate', todayStr);
      }

      // Set up exercises with error boundary
      try {
        const newExercises: DailyExercise[] = [
          {
            id: 'pushups',
            name: 'Push-ups',
            count: todayWorkout.currentProgress.pushups,
            dailyGoal: todayWorkout.requirements.pushups,
            increment: 1,
            unit: 'reps'
          },
          {
            id: 'situps',
            name: 'Sit-ups',
            count: todayWorkout.currentProgress.situps,
            dailyGoal: todayWorkout.requirements.situps,
            increment: 1,
            unit: 'reps'
          },
          {
            id: 'squats',
            name: 'Squats',
            count: todayWorkout.currentProgress.squats,
            dailyGoal: todayWorkout.requirements.squats,
            increment: 1,
            unit: 'reps'
          },
          {
            id: 'milesRan',
            name: 'Running',
            count: todayWorkout.currentProgress.milesRan,
            dailyGoal: todayWorkout.requirements.milesRan,
            increment: 0.1,
            unit: 'miles'
          }
        ];
        
        setExercises(newExercises);
        setIsInitialized(true);
        
        // Check if there's a penalty
        if (todayWorkout.hasPenalty) {
          // Find the first exercise with a penalty
          if (todayWorkout.penalties.pushups > 0) {
            setPenaltyTask({
              id: 'pushups-penalty',
              exercise: 'Push-ups',
              count: todayWorkout.penalties.pushups,
              unit: 'reps'
            });
          } else if (todayWorkout.penalties.situps > 0) {
            setPenaltyTask({
              id: 'situps-penalty',
              exercise: 'Sit-ups',
              count: todayWorkout.penalties.situps,
              unit: 'reps'
            });
          } else if (todayWorkout.penalties.squats > 0) {
            setPenaltyTask({
              id: 'squats-penalty',
              exercise: 'Squats',
              count: todayWorkout.penalties.squats,
              unit: 'reps'
            });
          } else if (todayWorkout.penalties.milesRan > 0) {
            setPenaltyTask({
              id: 'running-penalty',
              exercise: 'Running',
              count: todayWorkout.penalties.milesRan,
              unit: 'miles'
            });
          }
        } else {
          setPenaltyTask(null);
        }
        
        // Check if there's a bonus task
        if (todayWorkout.bonusTask) {
          setBonusTask({
            id: 'daily-bonus',
            description: todayWorkout.bonusTask,
            completed: false
          });
        } else {
          setBonusTask(null);
        }
      } catch (error) {
        console.error('Error setting up exercises:', error);
        setExercises([]);
      }
    }
  }, [todayWorkout, lastLoadedDate, isInitialized]);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check if all exercises have met their daily goals
  useEffect(() => {
    if (exercises.length > 0) {
      const allGoalsCompleted = exercises.every(exercise => exercise.count >= exercise.dailyGoal);
      setShowCompleteButton(allGoalsCompleted);
    }
  }, [exercises]);

  // Check if penalty is completed
  useEffect(() => {
    if (penaltyTask && penaltyProgress >= penaltyTask.count) {
      setShowPenaltyComplete(true);
      // Start with red color
      setIsPenaltyTransitioning(false);
      // After 1 second, transition to blue
      setTimeout(() => {
        setIsPenaltyTransitioning(true);
        // After another second, update the UI state
        setTimeout(() => {
          setPenaltyTask(null);
          // Keep the popup visible for 2 more seconds
          setTimeout(() => {
            setShowPenaltyComplete(false);
            setIsPenaltyTransitioning(false);
          }, 2000);
        }, 1000);
      }, 1000);
    }
  }, [penaltyProgress, penaltyTask]);

  const handleIncrementPenalty = () => {
    setPenaltyProgress(prev => Math.min(prev + 1, penaltyTask?.count || 0));
  };

  const handleDecrementPenalty = () => {
    setPenaltyProgress(prev => Math.max(prev - 1, 0));
  };

  const playSuccessSound = () => {
    try {
      const audio = new Audio('/success.mp3');
      audio.play().catch(error => console.log('Audio playback failed:', error));
    } catch (error) {
      console.error('Error playing success sound:', error);
    }
  };

  const handleUpdateExercise = useCallback(async (id: string, count: number) => {
    const updatedExercises = exercises.map(exercise =>
      exercise.id === id ? { ...exercise, count } : exercise
    );
    setExercises(updatedExercises);

    // Clear any existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set a new timeout to save changes
    const timeout = setTimeout(async () => {
      try {
        const exerciseData = updatedExercises.reduce((acc, exercise) => ({
          ...acc,
          [exercise.id]: exercise.count
        }), {});

        await api.updateWorkoutProgress(exerciseData, completedBonusTask);
        
        // Refresh workout data after successful update
        loadTodayWorkout();
      } catch (error) {
        console.error('Error saving exercise progress:', error);
        // Optionally show error to user
      }
    }, 1000); // Debounce for 1 second

    setSaveTimeout(timeout);
  }, [exercises, saveTimeout, completedBonusTask, api, loadTodayWorkout]);

  const handleCompleteTraining = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Prepare exercise data
      const exerciseData = exercises.reduce((acc, exercise) => ({
        ...acc,
        [exercise.id]: exercise.count
      }), {});

      // Submit workout completion
      const result = await api.updateWorkoutProgress(exerciseData, completedBonusTask);

      // Handle successful completion
      if (result.data) {
        setShowStreakPopup(true);
        playSuccessSound();
        setIsPulsing(true);

        // Refresh data
        await Promise.all([
          loadProfile(),
          loadTodayWorkout()
        ]);
      }
    } catch (error) {
      console.error('Error completing training:', error);
      // Show error to user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteBonus = () => {
    setCompletedBonusTask(true);
    if (bonusTask) {
      setBonusTask({
        ...bonusTask,
        completed: true
      });
    }
  };

  // Show loading state
  if (isLoadingWorkout || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state
  if (workoutError || profileError) {
    return (
      <div className="p-4">
        <ErrorDisplay 
          error={workoutError || profileError} 
          onRetry={() => {
            loadTodayWorkout();
            loadProfile();
          }} 
        />
      </div>
    );
  }

  // Calculate XP progress
  const currentXP = profile?.xp ? profile.xp % 100 : 0;
  const maxXP = 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <HeaderSection 
        streakCount={profile?.currentStreak || 0}
        dailyXP={profile?.xp || 0}
        profile={profile}
      />
      
      <LevelProgress 
        currentLevel={profile?.level || 1}
        currentXP={currentXP}
        maxXP={maxXP}
      />

      <div className="mt-8 space-y-6">
        {exercises.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onUpdateCount={(count) => handleUpdateExercise(exercise.id, count)}
          />
        ))}
      </div>

      {penaltyTask && !showPenaltyComplete && (
        <PenaltyTask
          task={penaltyTask}
          progress={penaltyProgress}
          onIncrement={handleIncrementPenalty}
          onDecrement={handleDecrementPenalty}
          isTransitioning={isPenaltyTransitioning}
        />
      )}

      {bonusTask && !completedBonusTask && (
        <BonusTask
          task={bonusTask}
          onComplete={handleCompleteBonus}
        />
      )}

      {showCompleteButton && (
        <button
          onClick={handleCompleteTraining}
          disabled={isSubmitting}
          className={`
            w-full mt-8 py-4 px-6 rounded-lg bg-blue-600 text-white font-semibold
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}
            transition-colors duration-200
          `}
        >
          {isSubmitting ? 'Completing...' : 'Complete Training'}
        </button>
      )}

      {showStreakPopup && (
        <StreakPopup
          streakCount={profile?.currentStreak || 0}
          onClose={() => setShowStreakPopup(false)}
        />
      )}
    </div>
  );
} 