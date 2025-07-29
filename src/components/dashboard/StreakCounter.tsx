'use client';

import { useState } from 'react';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div 
        className="bg-primary-800/50 border border-primary-700 rounded-lg p-4 cursor-pointer hover:bg-primary-800/70 transition-all duration-200 transform hover:scale-105"
        onClick={() => setShowModal(true)}
      >
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-400 mb-1">
            🔥 {currentStreak}
          </div>
          <div className="text-sm text-gray-300">Day Streak</div>
          <div className="text-xs text-gray-400 mt-1">
            Best: {longestStreak} days
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary-900 border border-primary-700 rounded-lg p-6 max-w-md w-full">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">Streak Calendar</h3>
              <p className="text-gray-400 text-sm">Track your daily progress</p>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-6">
              {/* Calendar placeholder - would implement with actual dates */}
              {Array.from({ length: 35 }, (_, i) => (
                <div
                  key={i}
                  className={`
                    w-8 h-8 rounded border text-xs flex items-center justify-center
                    ${i < currentStreak 
                      ? 'bg-primary-500 border-primary-400 text-white' 
                      : 'bg-primary-800 border-primary-700 text-gray-400'
                    }
                  `}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-primary-400">{currentStreak}</div>
                <div className="text-xs text-gray-400">Current</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-accent-cyan">{longestStreak}</div>
                <div className="text-xs text-gray-400">Best Ever</div>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}