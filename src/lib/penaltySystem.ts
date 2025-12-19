import { ExerciseType, PenaltyCalculation, DailyRequirements } from '@/types';

/**
 * Calculate penalties from an incomplete day
 * 25% of the shortfall becomes a penalty for the next day
 */
export function calculatePenalties(
  completed: { pushups: number; situps: number; squats: number; runningKm: number },
  requirements: DailyRequirements
): PenaltyCalculation[] {
  const penalties: PenaltyCalculation[] = [];

  const exercises: Array<{
    type: ExerciseType;
    completed: number;
    required: number;
    isRunning?: boolean;
  }> = [
    { type: 'pushups', completed: completed.pushups, required: requirements.pushups },
    { type: 'situps', completed: completed.situps, required: requirements.situps },
    { type: 'squats', completed: completed.squats, required: requirements.squats },
    { type: 'running', completed: completed.runningKm, required: requirements.runningKm, isRunning: true },
  ];

  for (const ex of exercises) {
    if (ex.completed < ex.required) {
      const shortfall = ex.required - ex.completed;

      // 25% penalty, rounded up
      // For running, we keep it in km but convert to meters for storage (as Int)
      let penaltyAmount: number;
      if (ex.isRunning) {
        // Convert km shortfall to meters, then 25%
        const shortfallMeters = shortfall * 1000;
        penaltyAmount = Math.max(100, Math.ceil(shortfallMeters * 0.25)); // Minimum 100 meters
      } else {
        penaltyAmount = Math.max(1, Math.ceil(shortfall * 0.25)); // Minimum 1 rep
      }

      penalties.push({
        exercise: ex.type,
        shortfall,
        penaltyAmount,
      });
    }
  }

  return penalties;
}

/**
 * Convert penalty amount to display format
 * For running, converts meters back to km for display
 */
export function formatPenaltyAmount(exercise: ExerciseType, amount: number, distanceUnit: 'km' | 'miles' = 'km'): string {
  if (exercise === 'running') {
    // Amount is stored in meters
    const km = amount / 1000;
    if (distanceUnit === 'miles') {
      const miles = km * 0.621371;
      return `${miles.toFixed(2)} mi`;
    }
    return `${km.toFixed(2)} km`;
  }
  return `${amount} reps`;
}

/**
 * Get total penalty count by exercise type
 */
export function getPenaltySummary(
  penalties: Array<{ exercise: string; amount: number; completed: boolean }>
): Record<ExerciseType, { total: number; remaining: number }> {
  const summary: Record<ExerciseType, { total: number; remaining: number }> = {
    pushups: { total: 0, remaining: 0 },
    situps: { total: 0, remaining: 0 },
    squats: { total: 0, remaining: 0 },
    running: { total: 0, remaining: 0 },
  };

  for (const penalty of penalties) {
    const type = penalty.exercise as ExerciseType;
    if (summary[type]) {
      summary[type].total += penalty.amount;
      if (!penalty.completed) {
        summary[type].remaining += penalty.amount;
      }
    }
  }

  return summary;
}

/**
 * Check if all penalties are completed
 */
export function areAllPenaltiesComplete(
  penalties: Array<{ completed: boolean }>
): boolean {
  return penalties.every(p => p.completed);
}

/**
 * Get exercise icon emoji
 */
export function getExerciseIcon(exercise: ExerciseType): string {
  switch (exercise) {
    case 'pushups':
      return '💪';
    case 'situps':
      return '🔄';
    case 'squats':
      return '🦵';
    case 'running':
      return '🏃';
    default:
      return '🏋️';
  }
}

/**
 * Get exercise display name
 */
export function getExerciseName(exercise: ExerciseType): string {
  switch (exercise) {
    case 'pushups':
      return 'Push-ups';
    case 'situps':
      return 'Sit-ups';
    case 'squats':
      return 'Squats';
    case 'running':
      return 'Running';
    default:
      return exercise;
  }
}
