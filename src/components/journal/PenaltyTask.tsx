import { Plus, Minus } from "lucide-react";
import { PenaltyTask as PenaltyTaskType } from "@/types/journal";

interface PenaltyTaskProps {
  task: PenaltyTaskType;
  progress: number;
  onIncrement: () => void;
  onDecrement: () => void;
  isTransitioning: boolean;
}

const PenaltyTask = ({ task, progress, onIncrement, onDecrement, isTransitioning }: PenaltyTaskProps) => {
  const progressPercentage = (progress / task.count) * 100;
  const progressText = `${Math.round(progressPercentage)}% complete`;

  return (
    <div 
      className={`bg-gray-900 rounded-lg p-4 mb-4 border-2 transition-colors duration-300 ${
        isTransitioning ? 'border-[#00A8FF] animate-pulse-slow' : 'border-red-500'
      }`}
      role="region"
      aria-label="Penalty task"
    >
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className={`font-medium uppercase tracking-wider text-sm mb-1 transition-colors duration-300 ${
            isTransitioning ? 'text-[#00A8FF] animate-fade-in' : 'text-red-500'
          }`}>
            Penalty Task
          </h3>
          <p className="text-white">
            Complete {task.count} {task.exercise} to remove penalty
          </p>
          <p className="text-sm text-gray-400 mt-1">Missed from previous day</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDecrement}
            className="bg-gray-800 text-white p-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={progress <= 0}
            aria-label={`Decrease ${task.exercise} count`}
            aria-disabled={progress <= 0}
          >
            <Minus size={20} aria-hidden="true" />
          </button>
          <button
            onClick={onIncrement}
            className="bg-gray-800 text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
            aria-label={`Increase ${task.exercise} count`}
          >
            <Plus size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div 
        className="w-full bg-gray-800 rounded-full h-2"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={task.count}
        aria-valuetext={progressText}
      >
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isTransitioning ? 'bg-[#00A8FF] animate-fade-in' : 'bg-red-500'
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default PenaltyTask; 