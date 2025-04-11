"use client";

import { useState, useEffect } from "react";
import HeaderSection from "@/components/journal/HeaderSection";
import LevelProgress from "@/components/journal/LevelProgress";
import ExerciseCard from "@/components/journal/ExerciseCard";
import PenaltyTask from "@/components/journal/PenaltyTask";
import BonusTask from "@/components/journal/BonusTask";
import StreakPopup from "@/components/journal/StreakPopup";
import { Exercise, PenaltyTask as PenaltyTaskType, BonusTask as BonusTaskType } from "@/types/journal";
import { EXERCISES, MOCK_PENALTY, MOCK_BONUS } from "@/data/journal";

export default function JournalPage() {
  const [exercises, setExercises] = useState<Exercise[]>(EXERCISES);
  const [showCompleteButton, setShowCompleteButton] = useState(false);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [streakCount, setStreakCount] = useState(7);
  const [isPulsing, setIsPulsing] = useState(false);
  const [dailyXP, setDailyXP] = useState(150);
  const [hasPenalty, setHasPenalty] = useState(true);
  const [penaltyTask, setPenaltyTask] = useState<PenaltyTaskType>(MOCK_PENALTY);
  const [bonusTask, setBonusTask] = useState<BonusTaskType>(MOCK_BONUS);
  const [showBonus, setShowBonus] = useState(!hasPenalty);
  const [penaltyProgress, setPenaltyProgress] = useState(0);
  const [showPenaltyComplete, setShowPenaltyComplete] = useState(false);
  const [isPenaltyTransitioning, setIsPenaltyTransitioning] = useState(false);

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

  const handleIncrement = (id: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === id) {
        const increment = exercise.increment || 1;
        // Round to 1 decimal place for floating point precision
        const newCount = Math.round((exercise.count + increment) * 10) / 10;
        return { ...exercise, count: newCount };
      }
      return exercise;
    }));
  };

  const handleDecrement = (id: string) => {
    setExercises(exercises.map(exercise => {
      if (exercise.id === id && exercise.count > 0) {
        const increment = exercise.increment || 1;
        // Round to 1 decimal place for floating point precision
        const newCount = Math.round((exercise.count - increment) * 10) / 10;
        return { ...exercise, count: Math.max(0, newCount) };
      }
      return exercise;
    }));
  };

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
      setExercises(EXERCISES.map(exercise => ({ ...exercise, count: 0 })));
    }, 3000);
  };

  const handleCompletePenalty = () => {
    setHasPenalty(false);
    setShowBonus(true); // Optionally show bonus after completing penalty
  };

  const handleCompleteBonus = () => {
    setBonusTask({ ...bonusTask, completed: true });
  };

  return (
    <>
      <main 
        className={`flex min-h-screen flex-col items-center p-4 pb-20 transition-all duration-300 
          ${isPulsing ? 'scale-105' : 'scale-100'}
          ${showStreakPopup ? 'opacity-20 pointer-events-none' : 'opacity-100'}
          ${showPenaltyComplete ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="w-full max-w-4xl space-y-4">
          <HeaderSection streakCount={streakCount} dailyXP={dailyXP} />
          
          <LevelProgress currentLevel={1} currentXP={0} maxXP={100} />

          {/* Daily Tasks Section */}
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
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