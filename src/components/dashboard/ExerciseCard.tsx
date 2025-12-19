'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Check } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ExerciseType, DistanceUnit } from '@/types';
import { getExerciseIcon, getExerciseName, formatPenaltyAmount } from '@/lib/penaltySystem';
import { formatDistanceValue, getUnitSuffix, displayValueToKm } from '@/lib/unitConversion';

interface ExerciseCardProps {
  type: ExerciseType;
  current: number;
  target: number;
  distanceUnit?: DistanceUnit;
  onUpdate: (value: number) => void;
  penaltyAmount?: number;
  isUpdating?: boolean;
}

export function ExerciseCard({
  type,
  current,
  target,
  distanceUnit = 'km',
  onUpdate,
  penaltyAmount = 0,
  isUpdating = false,
}: ExerciseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(current.toString());

  // Sync inputValue when current changes externally
  useEffect(() => {
    if (!isEditing) {
      setInputValue(current.toString());
    }
  }, [current, isEditing]);

  const isRunning = type === 'running';
  const displayCurrent = isRunning ? formatDistanceValue(current, distanceUnit) : current;
  const displayTarget = isRunning ? formatDistanceValue(target, distanceUnit) : target;
  const unit = isRunning ? getUnitSuffix(distanceUnit) : 'reps';
  const isComplete = current >= target;
  const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 0;

  const handleIncrement = () => {
    if (isRunning) {
      // Increment 0.5 in display unit, convert back to km for storage
      const displayStep = 0.5;
      const currentDisplay = formatDistanceValue(current, distanceUnit);
      const newDisplay = currentDisplay + displayStep;
      const newKm = displayValueToKm(newDisplay, distanceUnit);
      onUpdate(Math.min(newKm, 50)); // Max 50 km
    } else {
      onUpdate(Math.min(current + 5, 500));
    }
  };

  const handleDecrement = () => {
    if (isRunning) {
      // Decrement 0.5 in display unit, convert back to km for storage
      const displayStep = 0.5;
      const currentDisplay = formatDistanceValue(current, distanceUnit);
      const newDisplay = Math.max(0, currentDisplay - displayStep);
      const newKm = displayValueToKm(newDisplay, distanceUnit);
      onUpdate(newKm);
    } else {
      onUpdate(Math.max(0, current - 5));
    }
  };

  const handleInputSubmit = () => {
    const value = parseFloat(inputValue);
    if (!isNaN(value)) {
      const maxValue = isRunning ? 50 : 500; // Max in storage unit (km for running)
      // Convert display value back to km for storage
      const valueToStore = isRunning ? displayValueToKm(value, distanceUnit) : value;
      onUpdate(Math.max(0, Math.min(valueToStore, maxValue)));
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card p-4 ${isComplete ? 'border-success/50' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getExerciseIcon(type)}</span>
          <span className="font-semibold text-lg">{getExerciseName(type)}</span>
          {penaltyAmount > 0 && (
            <span className="text-xs bg-danger/20 text-danger px-2 py-0.5 rounded-full">
              +{formatPenaltyAmount(type, penaltyAmount, distanceUnit)} penalty
            </span>
          )}
        </div>
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-8 h-8 rounded-full bg-success flex items-center justify-center"
            >
              <Check size={20} className="text-background-dark" />
            </motion.div>
          ) : (
            <motion.span
              key={current}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-primary-400 font-medium"
            >
              {displayCurrent} / {displayTarget} {unit}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={current}
        max={target}
        size="md"
        color={isComplete ? 'success' : 'blue'}
        showGlow={isComplete}
        className="mb-4"
      />

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Decrement button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleDecrement}
          disabled={current <= 0 || isUpdating}
          className="w-14 h-14 rounded-full bg-background-elevated border border-primary-400/30
                     flex items-center justify-center text-primary-400
                     disabled:opacity-30 disabled:cursor-not-allowed
                     active:bg-primary-900/50 transition-colors touch-target"
        >
          <Minus size={24} />
        </motion.button>

        {/* Center value (tap to edit) */}
        {isEditing ? (
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleInputSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
            autoFocus
            className="flex-1 text-center text-3xl font-bold bg-background-elevated
                       border border-primary-400/50 rounded-lg py-2 text-white
                       focus:outline-none focus:border-accent-cyan select-text"
            step={isRunning ? '0.1' : '1'}
          />
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setInputValue(displayCurrent.toString());
              setIsEditing(true);
            }}
            className="flex-1 text-center"
          >
            <motion.span
              key={current}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={`text-4xl font-bold ${
                isComplete ? 'text-success text-glow' : 'gradient-text'
              }`}
            >
              {displayCurrent}
            </motion.span>
            <p className="text-xs text-primary-400/60 mt-1">tap to edit</p>
          </motion.button>
        )}

        {/* Increment button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleIncrement}
          disabled={isUpdating}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-primary-400
                     flex items-center justify-center text-white shadow-glow-blue
                     disabled:opacity-50 disabled:cursor-not-allowed
                     active:from-primary-500 active:to-primary-300 transition-colors touch-target"
        >
          <Plus size={24} />
        </motion.button>
      </div>
    </motion.div>
  );
}
