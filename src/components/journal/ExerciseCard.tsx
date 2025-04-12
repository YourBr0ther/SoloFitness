'use client';

import { Plus, Minus } from "lucide-react";
import { Exercise } from "@/types/journal";
import { useData } from '@/contexts/DataContext';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
  const { updateExercise, exerciseError } = useData();
  const progressPercentage = (exercise.count / exercise.dailyGoal) * 100;
  const progressText = `${Math.round(progressPercentage)}% complete`;

  const handleIncrement = async () => {
    try {
      await updateExercise(exercise.id, exercise.count + (exercise.increment || 1));
    } catch (error) {
      console.error('Failed to update exercise:', error);
    }
  };

  const handleDecrement = async () => {
    if (exercise.count <= 0) return;
    try {
      await updateExercise(exercise.id, exercise.count - (exercise.increment || 1));
    } catch (error) {
      console.error('Failed to update exercise:', error);
    }
  };

  return (
    <div 
      className="bg-gray-900 rounded-lg p-4"
      role="region"
      aria-label={`${exercise.name} progress`}
    >
      {exerciseError && (
        <div className="mb-2">
          <ErrorDisplay 
            error={exerciseError} 
            onRetry={() => updateExercise(exercise.id, exercise.count)}
          />
        </div>
      )}
      
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-medium text-white">{exercise.name}</h3>
          <p className="text-sm text-gray-400">
            {exercise.count.toFixed(exercise.increment === 0.1 ? 1 : 0)}/{exercise.dailyGoal} {exercise.unit}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrement}
            className="bg-gray-800 text-white p-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={exercise.count <= 0}
            aria-label={`Decrease ${exercise.name} count`}
            aria-disabled={exercise.count <= 0}
          >
            <Minus size={20} aria-hidden="true" />
          </button>
          <button
            onClick={handleIncrement}
            className="bg-gray-800 text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
            aria-label={`Increase ${exercise.name} count`}
          >
            <Plus size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-2.5">
        <div
          className="bg-[#00A8FF] h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progressPercentage)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{progressText}</p>
    </div>
  );
};

export default ExerciseCard; 