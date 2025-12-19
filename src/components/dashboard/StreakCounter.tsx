'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
}

export function StreakCounter({
  currentStreak,
  longestStreak,
  isActive,
}: StreakCounterProps) {
  return (
    <div className="card-elevated p-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <motion.div
          animate={isActive ? {
            scale: [1, 1.1, 1],
            filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`${isActive ? 'text-streak' : 'text-gray-500'}`}
        >
          <Flame size={40} fill={isActive ? 'currentColor' : 'none'} />
        </motion.div>
        <motion.span
          key={currentStreak}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-5xl font-bold ${
            isActive ? 'streak-gradient' : 'text-gray-500'
          }`}
        >
          {currentStreak}
        </motion.span>
      </div>

      <p className={`text-lg font-medium ${isActive ? 'text-streak' : 'text-gray-500'}`}>
        {currentStreak === 0 ? 'Start your journey' : 'Day Streak'}
      </p>

      {longestStreak > 0 && (
        <p className="text-sm text-primary-400/60 mt-2">
          Longest: {longestStreak} days
        </p>
      )}

      {/* Streak motivation */}
      {isActive && currentStreak > 0 && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-primary-400/80 mt-3 italic"
        >
          {currentStreak < 7
            ? "Keep going! You're building momentum."
            : currentStreak < 30
            ? "You're becoming a true hunter!"
            : "Shadow Monarch in training!"}
        </motion.p>
      )}
    </div>
  );
}
