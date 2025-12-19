'use client';

import { motion } from 'framer-motion';
import { getLevelProgress, getNextMilestone } from '@/lib/levelSystem';

interface LevelBadgeProps {
  level: number;
  dayNumber: number;
  showProgress?: boolean;
}

export function LevelBadge({
  level,
  dayNumber,
  showProgress = false,
}: LevelBadgeProps) {
  const progress = getLevelProgress(dayNumber);
  const nextMilestone = getNextMilestone(level);

  return (
    <div className="flex items-center gap-2">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="level-badge px-3 py-1 rounded-full flex items-center gap-1"
      >
        <span className="text-sm font-bold">LV.</span>
        <motion.span
          key={level}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          className="text-lg font-bold"
        >
          {level}
        </motion.span>
      </motion.div>

      {showProgress && nextMilestone && (
        <div className="text-xs text-primary-400/60">
          <span>Day {dayNumber}</span>
          <span className="mx-1">&bull;</span>
          <span>{progress}% to LV.{level + 1}</span>
        </div>
      )}
    </div>
  );
}
