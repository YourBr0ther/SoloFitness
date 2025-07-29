'use client';

import { useState } from 'react';

interface ExerciseCardProps {
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: string;
  onUpdate: (newValue: number) => void;
}

export default function ExerciseCard({ 
  title, 
  current, 
  target, 
  unit, 
  icon, 
  onUpdate 
}: ExerciseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(current.toString());

  const progress = Math.min(current / target, 1);
  const isComplete = current >= target;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newValue = parseFloat(editValue) || 0;
    onUpdate(Math.max(0, newValue));
    setIsEditing(false);
  };

  const handleIncrement = () => {
    const increment = unit === 'miles' ? 0.1 : 1;
    onUpdate(current + increment);
  };

  const handleDecrement = () => {
    const decrement = unit === 'miles' ? 0.1 : 1;
    onUpdate(Math.max(0, current - decrement));
  };

  return (
    <div className={`
      bg-primary-800/50 border rounded-lg p-4 transition-all duration-200
      ${isComplete 
        ? 'border-green-500 shadow-lg shadow-green-500/20' 
        : 'border-primary-700 hover:border-primary-600'
      }
    `}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        {isComplete && (
          <div className="text-green-400 text-sm font-medium">✓ Complete</div>
        )}
      </div>

      <div className="mb-3">
        <div className={`
          w-full bg-primary-900 rounded-full h-2 overflow-hidden
          ${isComplete ? 'bg-green-900' : ''}
        `}>
          <div 
            className={`
              h-full rounded-full transition-all duration-500
              ${isComplete 
                ? 'bg-gradient-to-r from-green-500 to-green-400' 
                : 'bg-gradient-to-r from-primary-500 to-accent-cyan'
              }
            `}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-16 px-2 py-1 bg-primary-700 border border-primary-600 rounded text-white text-sm"
                step={unit === 'miles' ? '0.1' : '1'}
                min="0"
                autoFocus
              />
              <button
                type="submit"
                className="text-green-400 hover:text-green-300 text-sm"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditValue(current.toString());
                }}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                ✕
              </button>
            </form>
          ) : (
            <div 
              className="cursor-pointer hover:text-primary-300 transition-colors"
              onClick={() => {
                setIsEditing(true);
                setEditValue(current.toString());
              }}
            >
              <span className="text-lg font-bold text-white">
                {unit === 'miles' ? current.toFixed(1) : current}
              </span>
              <span className="text-sm text-gray-400 ml-1">
                / {unit === 'miles' ? target.toFixed(1) : target} {unit}
              </span>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center space-x-1">
            <button
              onClick={handleDecrement}
              className="w-8 h-8 bg-primary-700 hover:bg-primary-600 border border-primary-600 rounded text-white text-sm flex items-center justify-center transition-colors"
              disabled={current <= 0}
            >
              -
            </button>
            <button
              onClick={handleIncrement}
              className="w-8 h-8 bg-primary-700 hover:bg-primary-600 border border-primary-600 rounded text-white text-sm flex items-center justify-center transition-colors"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}