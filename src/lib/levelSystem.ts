import { DailyRequirements, LevelMilestone } from '@/types';

/**
 * Calculate the day number since the user started
 */
export function getDayNumber(startDate: Date): number {
  const now = new Date();
  const start = new Date(startDate);

  // Reset to midnight for accurate day calculation
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);

  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Day 1 is the start date, clamp between 1 and 365
  return Math.max(1, Math.min(365, diffDays + 1));
}

/**
 * Calculate daily requirements based on days since start
 * Uses a smooth curve: starts at 10, ends at 100 for reps
 * Running: starts at 1km, ends at 10km
 */
export function calculateDailyRequirements(dayNumber: number): DailyRequirements {
  // Clamp to 1-365
  const day = Math.max(1, Math.min(365, dayNumber));

  // Polynomial curve for gradual increase
  // Formula: base + (max - base) * (day / 365)^1.3
  // This creates a curve that's gentler early and steeper later
  const repProgress = Math.pow((day - 1) / 364, 1.3);
  const runProgress = Math.pow((day - 1) / 364, 1.4);

  const reps = Math.round(10 + (90 * repProgress));  // 10 -> 100
  const running = +(1 + (9 * runProgress)).toFixed(1);  // 1km -> 10km

  return {
    pushups: reps,
    situps: reps,
    squats: reps,
    runningKm: running,
    dayNumber: day,
  };
}

/**
 * Get the current level (1-10) based on day number
 */
export function getCurrentLevel(dayNumber: number): number {
  const day = Math.max(1, Math.min(365, dayNumber));
  // Each level spans roughly 36.5 days
  return Math.min(10, Math.ceil(day / 36.5));
}

/**
 * Level milestones for UI display
 */
export const LEVEL_MILESTONES: LevelMilestone[] = [
  { level: 1, day: 1, pushups: 10, runningKm: 1.0 },
  { level: 2, day: 37, pushups: 18, runningKm: 1.5 },
  { level: 3, day: 73, pushups: 30, runningKm: 2.3 },
  { level: 4, day: 110, pushups: 42, runningKm: 3.2 },
  { level: 5, day: 146, pushups: 54, runningKm: 4.2 },
  { level: 6, day: 183, pushups: 66, runningKm: 5.3 },
  { level: 7, day: 219, pushups: 76, runningKm: 6.4 },
  { level: 8, day: 256, pushups: 85, runningKm: 7.5 },
  { level: 9, day: 292, pushups: 93, runningKm: 8.6 },
  { level: 10, day: 365, pushups: 100, runningKm: 10.0 },
];

/**
 * Calculate XP earned for a day's workout
 */
export function calculateXP(
  completed: { pushups: number; situps: number; squats: number; runningKm: number },
  requirements: DailyRequirements
): number {
  const baseXP = 25;
  const bonusPerExercise = 10;

  let xp = baseXP;

  // Bonus for each exercise completed
  if (completed.pushups >= requirements.pushups) xp += bonusPerExercise;
  if (completed.situps >= requirements.situps) xp += bonusPerExercise;
  if (completed.squats >= requirements.squats) xp += bonusPerExercise;
  if (completed.runningKm >= requirements.runningKm) xp += bonusPerExercise;

  // Full completion bonus
  const allComplete =
    completed.pushups >= requirements.pushups &&
    completed.situps >= requirements.situps &&
    completed.squats >= requirements.squats &&
    completed.runningKm >= requirements.runningKm;

  if (allComplete) xp += 25;  // 100% completion bonus

  return xp;  // Max: 25 + 40 + 25 = 90 XP per day
}

/**
 * Calculate completion percentage for a workout
 */
export function calculateCompletionPercentage(
  completed: { pushups: number; situps: number; squats: number; runningKm: number },
  requirements: DailyRequirements
): number {
  const pushupPercent = Math.min(100, (completed.pushups / requirements.pushups) * 100);
  const situpPercent = Math.min(100, (completed.situps / requirements.situps) * 100);
  const squatPercent = Math.min(100, (completed.squats / requirements.squats) * 100);
  const runningPercent = Math.min(100, (completed.runningKm / requirements.runningKm) * 100);

  return Math.round((pushupPercent + situpPercent + squatPercent + runningPercent) / 4);
}

/**
 * Check if a workout is fully complete
 */
export function isWorkoutComplete(
  completed: { pushups: number; situps: number; squats: number; runningKm: number },
  requirements: DailyRequirements
): boolean {
  return (
    completed.pushups >= requirements.pushups &&
    completed.situps >= requirements.situps &&
    completed.squats >= requirements.squats &&
    completed.runningKm >= requirements.runningKm
  );
}

/**
 * Get the next level milestone
 */
export function getNextMilestone(currentLevel: number): LevelMilestone | null {
  if (currentLevel >= 10) return null;
  return LEVEL_MILESTONES[currentLevel]; // Index is currentLevel because array is 0-indexed
}

/**
 * Get progress to next level (0-100)
 */
export function getLevelProgress(dayNumber: number): number {
  // Clamp dayNumber to valid range
  const day = Math.max(1, Math.min(365, dayNumber));

  const currentLevel = getCurrentLevel(day);
  if (currentLevel >= 10) return 100;

  const currentMilestone = LEVEL_MILESTONES[currentLevel - 1];
  const nextMilestone = LEVEL_MILESTONES[currentLevel];

  const daysInLevel = nextMilestone.day - currentMilestone.day;
  const daysSinceLevel = day - currentMilestone.day;

  // Clamp result to 0-100
  return Math.max(0, Math.min(100, Math.round((daysSinceLevel / daysInLevel) * 100)));
}
