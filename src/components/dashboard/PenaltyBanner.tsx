'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Check } from 'lucide-react';
import { ExerciseType, DistanceUnit } from '@/types';
import { getExerciseIcon, getExerciseName, formatPenaltyAmount } from '@/lib/penaltySystem';

interface Penalty {
  id: string;
  exercise: string;
  amount: number;
  completed: boolean;
}

interface PenaltyBannerProps {
  penalties: Penalty[];
  distanceUnit: DistanceUnit;
  onToggle: (penaltyId: string, completed: boolean) => void;
}

export function PenaltyBanner({
  penalties,
  distanceUnit,
  onToggle,
}: PenaltyBannerProps) {
  if (penalties.length === 0) return null;

  const incompletePenalties = penalties.filter((p) => !p.completed);
  const allComplete = incompletePenalties.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 mb-4 border ${
        allComplete
          ? 'bg-success/10 border-success/30'
          : 'bg-danger/10 border-danger/30'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        {allComplete ? (
          <Check size={20} className="text-success" />
        ) : (
          <AlertTriangle size={20} className="text-danger" />
        )}
        <span
          className={`font-semibold ${
            allComplete ? 'text-success' : 'text-danger'
          }`}
        >
          {allComplete ? 'Penalties Complete!' : 'Penalty Zone'}
        </span>
      </div>

      <p className="text-sm text-white/70 mb-3">
        {allComplete
          ? 'You\'ve conquered your penalties. Arise!'
          : 'Complete these to redeem yesterday\'s missed exercises.'}
      </p>

      <div className="space-y-2">
        {penalties.map((penalty) => (
          <motion.div
            key={penalty.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onToggle(penalty.id, !penalty.completed)}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              penalty.completed
                ? 'bg-success/20 line-through opacity-60'
                : 'bg-background-card hover:bg-background-elevated'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                penalty.completed
                  ? 'bg-success border-success'
                  : 'border-danger/50'
              }`}
            >
              {penalty.completed && (
                <Check size={14} className="text-background-dark" />
              )}
            </div>
            <span className="text-lg">
              {getExerciseIcon(penalty.exercise as ExerciseType)}
            </span>
            <span className="flex-1">
              {getExerciseName(penalty.exercise as ExerciseType)}
            </span>
            <span className="text-sm font-medium text-primary-400">
              {formatPenaltyAmount(
                penalty.exercise as ExerciseType,
                penalty.amount,
                distanceUnit
              )}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
