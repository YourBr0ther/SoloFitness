'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  glowing?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  elevated = false,
  glowing = false,
  onClick,
}: CardProps) {
  const baseClasses = elevated ? 'card-elevated' : 'card';
  const glowClasses = glowing ? 'shadow-glow-blue' : '';
  const clickClasses = onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${baseClasses} ${glowClasses} ${clickClasses} p-4 ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
