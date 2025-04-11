"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, Trophy, Flame, User } from "lucide-react";
import Link from "next/link";

interface Exercise {
  id: string;
  name: string;
  count: number;
  dailyGoal: number;
  increment?: number;
  unit?: string;
}

const EXERCISES: Exercise[] = [
  { id: "pushups", name: "Push-ups", count: 3, dailyGoal: 20, increment: 1, unit: "reps" },
  { id: "situps", name: "Sit-ups", count: 3, dailyGoal: 25, increment: 1, unit: "reps" },
  { id: "squats", name: "Squats", count: 3, dailyGoal: 30, increment: 1, unit: "reps" },
  { id: "running", name: "Running", count: 0, dailyGoal: 2, increment: 0.1, unit: "miles" },
];

export default function JournalPage() {
  const [exercises, setExercises] = useState<Exercise[]>(EXERCISES);
  const [showCompleteButton, setShowCompleteButton] = useState(false);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [streakCount, setStreakCount] = useState(7); // Mock streak count
  const [isPulsing, setIsPulsing] = useState(false);
  const [dailyXP, setDailyXP] = useState(150); // Mock daily XP

  // Check if all exercises have met their daily goals
  useEffect(() => {
    const allGoalsCompleted = exercises.every(exercise => exercise.count >= exercise.dailyGoal);
    setShowCompleteButton(allGoalsCompleted);
  }, [exercises]);

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

  const getDayLetters = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return days.map((day, index) => (
      <div 
        key={index} 
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
          ${index < streakCount ? 'bg-[#00A8FF] text-white' : 'bg-gray-800 text-gray-400'}`}
      >
        {day}
      </div>
    ));
  };

  return (
    <>
      <main 
        className={`flex min-h-screen flex-col items-center p-4 pb-20 transition-all duration-300 
          ${isPulsing ? 'scale-105' : 'scale-100'}
          ${showStreakPopup ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="w-full max-w-4xl">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            {/* Streak Counter */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-900 rounded-lg p-3 mb-1">
                <Flame className="text-[#00A8FF] w-6 h-6" />
              </div>
              <span className="text-white font-bold">{streakCount}</span>
              <span className="text-xs text-gray-400">STREAK</span>
            </div>

            {/* Player Icon - Now Clickable */}
            <Link href="/profile" className="relative group">
              <div className="w-20 h-20 rounded-full bg-gray-900 border-2 border-[#00A8FF] flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-hover:border-opacity-80">
                <User className="text-[#00A8FF] w-10 h-10 transition-opacity duration-200 group-hover:opacity-80" />
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                <span className="text-xs text-gray-400 whitespace-nowrap">SOLO WARRIOR</span>
              </div>
            </Link>

            {/* Daily XP */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-900 rounded-lg p-3 mb-1">
                <Trophy className="text-[#00A8FF] w-6 h-6" />
              </div>
              <span className="text-white font-bold">{dailyXP}</span>
              <span className="text-xs text-gray-400">TODAY'S XP</span>
            </div>
          </div>

          {/* Level and XP Bar */}
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-[#00A8FF]">Level 1</h2>
              <span className="text-gray-400">0/100 XP</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4">
              <div
                className="bg-[#00A8FF] h-4 rounded-full transition-all duration-300"
                style={{ width: "0%" }}
              />
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-gray-900 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-medium text-white">{exercise.name}</h3>
                    <p className="text-sm text-gray-400">
                      {exercise.count.toFixed(exercise.increment === 0.1 ? 1 : 0)}/{exercise.dailyGoal} {exercise.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecrement(exercise.id)}
                      className="bg-gray-800 text-white p-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={exercise.count === 0}
                    >
                      <Minus size={20} />
                    </button>
                    <button
                      onClick={() => handleIncrement(exercise.id)}
                      className="bg-[#00A8FF] text-white p-2 rounded-md hover:bg-[#0095E6] transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      exercise.count >= exercise.dailyGoal ? 'bg-green-500' : 'bg-[#00A8FF]'
                    }`}
                    style={{ 
                      width: `${Math.min((exercise.count / exercise.dailyGoal) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Complete Training Button */}
          {showCompleteButton && (
            <button
              onClick={handleCompleteTraining}
              className="mt-6 w-full bg-[#00A8FF] text-white py-3 px-4 rounded-lg hover:bg-[#0095E6] transition-colors flex items-center justify-center gap-2"
            >
              <Trophy size={20} />
              Complete Training
            </button>
          )}
        </div>
      </main>

      {/* Enhanced Streak Popup with cooler messaging */}
      {showStreakPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gray-900 border-2 border-[#00A8FF] rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-[#00A8FF] rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame size={48} className="text-white animate-pulse" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-3">UNSTOPPABLE</h2>
              <div className="text-[#00A8FF] text-xl font-bold mb-2">{streakCount} DAYS STRONG</div>
              <p className="text-gray-400 text-sm uppercase tracking-wider">No Excuses. No Limits.</p>
            </div>
            
            <div className="flex justify-center gap-2 mb-6">
              {getDayLetters()}
            </div>

            <div className="text-[#00A8FF] text-lg font-bold uppercase tracking-wider">
              Strength Builds Daily ⚡
            </div>
          </div>
        </div>
      )}
    </>
  );
} 