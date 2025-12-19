'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showGlow?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'purple' | 'success' | 'streak';
}

const colorClasses = {
  blue: 'bg-gradient-to-r from-primary-600 via-primary-400 to-accent-cyan',
  purple: 'bg-gradient-to-r from-primary-600 via-accent-purple to-accent-magenta',
  success: 'bg-gradient-to-r from-green-600 to-success',
  streak: 'bg-gradient-to-r from-orange-600 via-streak to-yellow-400',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

const glowClasses = {
  blue: 'shadow-glow-blue',
  purple: 'shadow-glow-purple',
  success: 'shadow-glow-success',
  streak: 'shadow-glow-streak',
};

export function ProgressBar({
  value,
  max,
  className = '',
  showGlow = false,
  size = 'md',
  color = 'blue',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const isComplete = percentage >= 100;

  return (
    <div
      className={`progress-bar ${sizeClasses[size]} ${className}`}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`h-full rounded-full ${colorClasses[color]} ${
          showGlow && isComplete ? glowClasses[color] : ''
        }`}
      />
    </div>
  );
}
