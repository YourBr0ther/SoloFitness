import { BonusTask } from '@/types';

interface BonusTaskCardProps {
  bonusTask?: BonusTask;
  onToggleComplete: () => void;
}

export default function BonusTaskCard({ bonusTask, onToggleComplete }: BonusTaskCardProps) {
  if (!bonusTask) {
    return null;
  }

  return (
    <div className="bg-accent-cyan/10 border border-accent-cyan/30 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-2xl">⭐</span>
        <h3 className="font-semibold text-accent-cyan">Bonus Challenge</h3>
      </div>
      
      <div className="flex items-start space-x-3">
        <button
          onClick={onToggleComplete}
          className={`
            w-6 h-6 rounded border-2 flex items-center justify-center text-sm mt-1 flex-shrink-0
            ${bonusTask.completed
              ? 'border-accent-cyan bg-accent-cyan text-background-dark'
              : 'border-accent-cyan hover:border-accent-cyan/80'
            }
          `}
        >
          {bonusTask.completed && '✓'}
        </button>
        
        <div className="flex-1">
          <p className={`
            text-sm leading-relaxed
            ${bonusTask.completed 
              ? 'text-accent-cyan/80 line-through' 
              : 'text-gray-300'
            }
          `}>
            {bonusTask.task}
          </p>
          
          {bonusTask.completed && (
            <div className="text-xs text-accent-cyan mt-2 font-medium">
              🎉 Bonus completed! Extra XP earned!
            </div>
          )}
        </div>
      </div>
      
      {!bonusTask.completed && (
        <div className="mt-3 text-xs text-gray-400">
          Complete for bonus XP and achievements
        </div>
      )}
    </div>
  );
}