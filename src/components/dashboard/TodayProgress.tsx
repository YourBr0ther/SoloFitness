'use client';

import { motion } from 'framer-motion';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Zap } from 'lucide-react';

interface TodayProgressProps {
  completedExercises: number;
  totalExercises: number;
  xpEarned: number;
  percentage: number;
}

export function TodayProgress({
  completedExercises,
  totalExercises,
  xpEarned,
  percentage,
}: TodayProgressProps) {
  const isComplete = completedExercises >= totalExercises;

  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <ProgressRing value={percentage} max={100} size={100} strokeWidth={8}>
        <div className="text-center">
          <motion.span
            key={percentage}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-2xl font-bold ${
              isComplete ? 'text-success' : 'text-white'
            }`}
          >
            {percentage}%
          </motion.span>
        </div>
      </ProgressRing>

      <div className="text-left">
        <p className="text-sm text-primary-400/80">Today&apos;s Progress</p>
        <p className="text-lg font-semibold">
          {completedExercises} of {totalExercises} complete
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Zap size={16} className="text-accent-cyan" />
          <motion.span
            key={xpEarned}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-accent-cyan font-medium"
          >
            +{xpEarned} XP
          </motion.span>
        </div>
      </div>
    </div>
  );
}
