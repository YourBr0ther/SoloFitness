"use client";

import { useState, useEffect } from "react";
import HeaderSection from "@/components/journal/HeaderSection";
import LevelProgress from "@/components/journal/LevelProgress";
import ExerciseCard from "@/components/journal/ExerciseCard";
import PenaltyTask from "@/components/journal/PenaltyTask";
import BonusTask from "@/components/journal/BonusTask";
import StreakPopup from "@/components/journal/StreakPopup";
import { Exercise, PenaltyTask as PenaltyTaskType, BonusTask as BonusTaskType } from "@/types/journal";
import { useData } from '@/contexts/DataContext';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { User } from '@/types/user';

export default function JournalPage() {
  const { 
    exercises, 
    loadExercises, 
    exerciseError,
    updateExercise,
    profile,
    loadProfile,
    profileError
  } = useData();
  
  const [showCompleteButton, setShowCompleteButton] = useState(false);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [hasPenalty, setHasPenalty] = useState(true);
  const [penaltyTask, setPenaltyTask] = useState<PenaltyTaskType>({
    id: '1',
    exercise: 'Push-ups',
    count: 20,
    unit: 'reps'
  });
  const [bonusTask, setBonusTask] = useState<BonusTaskType>({
    id: '1',
    description: 'Complete an extra set of exercises',
    completed: false
  });
  const [showBonus, setShowBonus] = useState(!hasPenalty);
  const [penaltyProgress, setPenaltyProgress] = useState(0);
  const [showPenaltyComplete, setShowPenaltyComplete] = useState(false);
  const [isPenaltyTransitioning, setIsPenaltyTransitioning] = useState(false);
  const [penalties, setPenalties] = useState<number>(0);
  const [bonuses, setBonuses] = useState<number>(0);

  useEffect(() => {
    loadExercises();
    loadProfile();
  }, [loadExercises, loadProfile]);

  useEffect(() => {
    if (profile?.streakHistory) {
      const completedDays = profile.streakHistory.filter(day => day.completed).length;
      const totalDays = profile.streakHistory.length;
      setPenalties(totalDays - completedDays);
      setBonuses(completedDays);
      setHasPenalty(totalDays > completedDays);
      setShowBonus(completedDays > 0);
    }
  }, [profile]);

  // Check if all exercises have met their daily goals
  useEffect(() => {
    const allGoalsCompleted = exercises.every(exercise => exercise.count >= exercise.dailyGoal);
    setShowCompleteButton(allGoalsCompleted);
  }, [exercises]);

  // Check if penalty is completed
  useEffect(() => {
    if (penaltyProgress >= penaltyTask.count) {
      setShowPenaltyComplete(true);
      // Start with red color
      setIsPenaltyTransitioning(false);
      // After 1 second, transition to blue
      setTimeout(() => {
        setIsPenaltyTransitioning(true);
        // After another second, update the UI state
        setTimeout(() => {
          setHasPenalty(false);
          setShowBonus(true);
          // Keep the popup visible for 2 more seconds
          setTimeout(() => {
            setShowPenaltyComplete(false);
            setIsPenaltyTransitioning(false);
          }, 2000);
        }, 1000);
      }, 1000);
    }
  }, [penaltyProgress, penaltyTask.count]);

  const handleIncrementPenalty = () => {
    setPenaltyProgress(prev => Math.min(prev + 1, penaltyTask.count));
  };

  const handleDecrementPenalty = () => {
    setPenaltyProgress(prev => Math.max(prev - 1, 0));
  };

  const playSuccessSound = () => {
    const audio = new Audio('/success.mp3');
    audio.play().catch(error => console.log('Audio playback failed:', error));
  };

  const handleCompleteTraining = () => {
    // Play success sound
    playSuccessSound();

    // Trigger screen pulse animation
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 1000);

    // Show streak popup
    setShowStreakPopup(true);
    setTimeout(() => {
      setShowStreakPopup(false);
      // Reset exercises after popup closes
      exercises.forEach(exercise => {
        updateExercise(exercise.id, 0);
      });
    }, 3000);
  };

  const handleCompletePenalty = () => {
    setHasPenalty(false);
    setShowBonus(true); // Optionally show bonus after completing penalty
  };

  const handleCompleteBonus = () => {
    setBonusTask({ ...bonusTask, completed: true });
  };

  // Calculate streak count from streakHistory
  const calculateStreakCount = () => {
    if (!profile?.streakHistory) return 0;
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today is completed
    const todayEntry = profile.streakHistory.find(day => day.date === today);
    if (todayEntry?.completed) {
      currentStreak++;
    }
    
    // Check previous days
    for (let i = 1; i < profile.streakHistory.length; i++) {
      const day = profile.streakHistory[i];
      if (day.completed) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  };

  // Calculate daily XP from streakHistory
  const calculateDailyXP = () => {
    if (!profile?.streakHistory) return 0;
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = profile.streakHistory.find(day => day.date === today);
    return todayEntry?.xpEarned || 0;
  };

  // Calculate level and XP progress
  const calculateLevelAndXP = () => {
    if (!profile?.streakHistory) return { level: 1, currentXP: 0, maxXP: 100 };
    
    const totalXP = profile.streakHistory.reduce((sum, day) => sum + day.xpEarned, 0);
    const level = Math.floor(totalXP / 100) + 1;
    const currentXP = totalXP % 100;
    const maxXP = 100;
    
    return { level, currentXP, maxXP };
  };

  if (exerciseError || profileError) {
    return (
      <div className="p-4">
        {exerciseError && (
          <ErrorDisplay 
            error={exerciseError} 
            onRetry={loadExercises}
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
  const streakCount = calculateStreakCount();
  const dailyXP = calculateDailyXP();

  return (
    <>
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
              />
            ))}
          </div>

          {/* Special Tasks Section */}
          <div className="space-y-4">
            {hasPenalty && (
              <PenaltyTask
                task={penaltyTask}
                progress={penaltyProgress}
                onIncrement={handleIncrementPenalty}
                onDecrement={handleDecrementPenalty}
                isTransitioning={isPenaltyTransitioning}
              />
            )}

            {showBonus && (
              <BonusTask
                task={bonusTask}
                onComplete={handleCompleteBonus}
              />
            )}
          </div>

          {showCompleteButton && (
            <button
              onClick={handleCompleteTraining}
              className="w-full bg-[#00A8FF] text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              Complete Training
            </button>
          )}
        </div>
      </main>

      <StreakPopup streakCount={streakCount} isVisible={showStreakPopup} />
    </>
  );
} 