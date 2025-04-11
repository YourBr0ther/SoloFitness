import { Check, X } from "lucide-react";
import { BonusTask as BonusTaskType } from "@/types/journal";

interface BonusTaskProps {
  task: BonusTaskType;
  onComplete: () => void;
}

const BonusTask = ({ task, onComplete }: BonusTaskProps) => {
  return (
    <div 
      className="bg-gray-900 rounded-lg p-4 mb-4 border-2 border-green-500"
      role="region"
      aria-label="Bonus challenge"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium uppercase tracking-wider text-sm mb-1 text-green-500">
            Bonus Challenge
          </h3>
          <p className="text-white">{task.description}</p>
          <p className="text-sm text-gray-400 mt-1">Complete for extra XP!</p>
        </div>
        <button
          onClick={onComplete}
          className={`p-2 rounded-md transition-colors ${
            task.completed
              ? "bg-green-500 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
          disabled={task.completed}
          aria-label={task.completed ? "Bonus challenge completed" : "Complete bonus challenge"}
          aria-disabled={task.completed}
        >
          {task.completed ? (
            <Check size={20} aria-hidden="true" />
          ) : (
            <X size={20} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
};

export default BonusTask; 