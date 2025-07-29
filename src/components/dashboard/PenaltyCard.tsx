import { Penalty } from '@/types';

interface PenaltyCardProps {
  penalties: Penalty[];
  onToggleComplete: (penaltyId: string) => void;
}

export default function PenaltyCard({ penalties, onToggleComplete }: PenaltyCardProps) {
  if (!penalties || penalties.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-2xl">⚠️</span>
        <h3 className="font-semibold text-red-400">Penalty Exercises</h3>
      </div>
      
      <p className="text-sm text-gray-300 mb-3">
        Make up for yesterday's missed exercises:
      </p>

      <div className="space-y-2">
        {penalties.map((penalty) => (
          <div
            key={penalty.id}
            className={`
              flex items-center justify-between p-2 rounded border
              ${penalty.completed 
                ? 'bg-green-900/20 border-green-800' 
                : 'bg-red-900/30 border-red-700'
              }
            `}
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleComplete(penalty.id)}
                className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center text-xs
                  ${penalty.completed
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-red-500 hover:border-red-400'
                  }
                `}
              >
                {penalty.completed && '✓'}
              </button>
              <span className={`
                ${penalty.completed ? 'text-green-400 line-through' : 'text-red-400'}
              `}>
                {penalty.amount} {penalty.exercise}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-gray-400">
        Complete these to avoid future penalties
      </div>
    </div>
  );
}