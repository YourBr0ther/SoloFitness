"use client";

import { useState, useEffect, useCallback } from "react";
import HeaderSection from "@/components/journal/HeaderSection";
import LevelProgress from "@/components/journal/LevelProgress";
import ExerciseCard from "@/components/journal/ExerciseCard";
import PenaltyTask from "@/components/journal/PenaltyTask";
import BonusTask from "@/components/journal/BonusTask";
import StreakPopup from "@/components/journal/StreakPopup";
import { DailyExercise, PenaltyTask as PenaltyTaskType, BonusTask as BonusTaskType } from "@/types/journal";
import { useData } from '@/contexts/DataContext';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { User } from '@/types/user';

export default function JournalPage() {
  const { 
    todayWorkout,
    loadTodayWorkout,
    updateWorkoutProgress,
    workoutError,
    profile,
    loadProfile,
    profileError
  } = useData();
  
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
    const audio = new Audio('/success.mp3');
    audio.play().catch(error => console.log('Audio playback failed:', error));
  };

  // Debounced save function with retry mechanism
  const debouncedSave = useCallback((newExercises: DailyExercise[]) => {
    console.log('debouncedSave called with:', newExercises);
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(async () => {
      let retries = 3;
      while (retries > 0) {
        try {
          const exerciseData = {
            pushups: newExercises.find(ex => ex.id === 'pushups')?.count || 0,
            situps: newExercises.find(ex => ex.id === 'situps')?.count || 0,
            squats: newExercises.find(ex => ex.id === 'squats')?.count || 0,
            milesRan: newExercises.find(ex => ex.id === 'milesRan')?.count || 0
          };
          
          console.log('Attempting to save exercise data:', exerciseData);
          await updateWorkoutProgress(exerciseData, completedBonusTask);
          console.log('Exercise data saved successfully');
          break; // Success, exit retry loop
        } catch (error) {
          console.error(`Failed to save exercise progress (${retries} retries left):`, error);
          retries--;
          if (retries === 0) {
            // Show error to user on final retry
            alert('Failed to save your progress. Please check your connection and try again.');
          } else {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    }, 1000);

    setSaveTimeout(timeout);
  }, [updateWorkoutProgress, completedBonusTask, saveTimeout]);

  const handleUpdateExercise = (id: string, count: number) => {
    const newExercises = exercises.map(ex => 
      ex.id === id ? { ...ex, count } : ex
    );
    setExercises(newExercises);
    
    // Trigger debounced save
    debouncedSave(newExercises);
  };

  const handleCompleteTraining = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Convert exercises array to the format expected by the API
      const exerciseData = {
        pushups: exercises.find(ex => ex.id === 'pushups')?.count || 0,
        situps: exercises.find(ex => ex.id === 'situps')?.count || 0,
        squats: exercises.find(ex => ex.id === 'squats')?.count || 0,
        milesRan: exercises.find(ex => ex.id === 'milesRan')?.count || 0
      };
      
      // Update workout progress
      await updateWorkoutProgress(exerciseData, completedBonusTask);
      
      // Play success sound
      playSuccessSound();

      // Trigger screen pulse animation
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);

      // Show streak popup
      setShowStreakPopup(true);
      setTimeout(() => {
        setShowStreakPopup(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to complete training:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteBonus = () => {
    setCompletedBonusTask(true);
    setBonusTask(bonusTask ? { ...bonusTask, completed: true } : null);
  };

  // Calculate level and XP progress
  const calculateLevelAndXP = () => {
    if (!profile) return { level: 1, currentXP: 0, maxXP: 100 };
    
    const level = profile.level || 1;
    const currentXP = profile.xp % 100;
    const maxXP = 100;
    
    return { level, currentXP, maxXP };
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  if (workoutError || profileError) {
    return (
      <div className="p-4">
        {workoutError && (
          <ErrorDisplay 
            error={workoutError} 
            onRetry={loadTodayWorkout}
            className="mb-4"
          />
        )}
        {profileError && (
          <ErrorDisplay 
            error={profileError} 
            onRetry={loadProfile}
          />
        )}
      </div>
    );
  }

  const { level, currentXP, maxXP } = calculateLevelAndXP();
  const streakCount = profile?.currentStreak || 0;
  const dailyXP = 0; // We'll calculate this from the completed workout

  return (
    <>
      {showStreakPopup && (
        <StreakPopup streakCount={streakCount} onClose={() => setShowStreakPopup(false)} />
      )}
      
      <main 
        className={`flex min-h-screen flex-col items-center p-4 pb-20 transition-all duration-300 
          ${isPulsing ? 'scale-105' : 'scale-100'}
          ${showStreakPopup ? 'opacity-20 pointer-events-none' : 'opacity-100'}
          ${showPenaltyComplete ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="w-full max-w-4xl space-y-4">
          <HeaderSection 
            streakCount={streakCount} 
            dailyXP={dailyXP} 
          />
          
          <LevelProgress 
            currentLevel={level} 
            currentXP={currentXP} 
            maxXP={maxXP} 
          />

          {/* Daily Tasks Section */}
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onUpdateCount={(count) => handleUpdateExercise(exercise.id, count)}
              />
            ))}
          </div>

          {/* Special Tasks Section */}
          <div className="space-y-4">
            {penaltyTask && (
              <PenaltyTask
                task={penaltyTask}
                progress={penaltyProgress}
                onIncrement={handleIncrementPenalty}
                onDecrement={handleDecrementPenalty}
                isTransitioning={isPenaltyTransitioning}
              />
            )}

            {bonusTask && !penaltyTask && (
              <BonusTask
                task={bonusTask}
                onComplete={handleCompleteBonus}
              />
            )}
          </div>

          {/* Complete Button */}
          {showCompleteButton && (
            <button
              onClick={handleCompleteTraining}
              disabled={isSubmitting}
              className="w-full py-4 bg-[#00A8FF] text-black font-bold text-xl rounded-lg
                      hover:bg-[#00B8FF] transform hover:scale-105 transition-all duration-300
                      shadow-[0_0_20px_rgba(0,168,255,0.5)] hover:shadow-[0_0_30px_rgba(0,168,255,0.7)]
                      disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 
                "Completing Training..." : 
                "Complete Today's Training"
              }
            </button>
          )}
        </div>
      </main>
    </>
  );
} 