'use client';

import { useEffect, useState } from 'react';

interface LevelProgressBarProps {
  currentLevel: number;
  progress: number;
  nextLevelXP: number;
}

export default function LevelProgressBar({ currentLevel, progress, nextLevelXP }: LevelProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="bg-primary-800/50 border border-primary-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">Level {currentLevel}</span>
        <span className="text-sm text-gray-400">
          {currentLevel === 10 ? 'Max Level' : `Next: ${nextLevelXP} XP`}
        </span>
      </div>
      
      <div className="w-full bg-primary-900 rounded-full h-3 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${animatedProgress * 100}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
      
      <div className="text-center mt-2">
        <span className="text-xs text-gray-400">
          {Math.round(animatedProgress * 100)}% to next level
        </span>
      </div>
    </div>
  );
}