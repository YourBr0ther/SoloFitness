import { Plus, Minus } from "lucide-react";
import { Exercise } from "@/types/journal";

interface ExerciseCardProps {
  exercise: Exercise;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

const ExerciseCard = ({ exercise, onIncrement, onDecrement }: ExerciseCardProps) => {
  const progressPercentage = (exercise.count / exercise.dailyGoal) * 100;
  const progressText = `${Math.round(progressPercentage)}% complete`;

  return (
    <div 
      className="bg-gray-900 rounded-lg p-4"
      role="region"
      aria-label={`${exercise.name} progress`}
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
            onClick={() => onDecrement(exercise.id)}
            className="bg-gray-800 text-white p-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={exercise.count <= 0}
            aria-label={`Decrease ${exercise.name} count`}
            aria-disabled={exercise.count <= 0}
          >
            <Minus size={20} aria-hidden="true" />
          </button>
          <button
            onClick={() => onIncrement(exercise.id)}
            className="bg-gray-800 text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
            aria-label={`Increase ${exercise.name} count`}
          >
            <Plus size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div 
        className="w-full bg-gray-800 rounded-full h-2"
        role="progressbar"
        aria-valuenow={exercise.count}
        aria-valuemin={0}
        aria-valuemax={exercise.dailyGoal}
        aria-valuetext={progressText}
      >
        <div
          className="bg-[#00A8FF] h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ExerciseCard; 