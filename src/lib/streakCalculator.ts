/**
 * Check if a date is yesterday
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate.getTime() === yesterday.getTime();
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate.getTime() === today.getTime();
}

/**
 * Calculate streak status based on last completed date
 */
export function calculateStreakStatus(
  lastCompletedDate: Date | null,
  currentStreak: number
): {
  newStreak: number;
  streakBroken: boolean;
  shouldReset: boolean;
} {
  if (!lastCompletedDate) {
    return {
      newStreak: 0,
      streakBroken: false,
      shouldReset: false,
    };
  }

  // If last completed was today, streak is maintained
  if (isToday(lastCompletedDate)) {
    return {
      newStreak: currentStreak,
      streakBroken: false,
      shouldReset: false,
    };
  }

  // If last completed was yesterday, streak is still active
  if (isYesterday(lastCompletedDate)) {
    return {
      newStreak: currentStreak,
      streakBroken: false,
      shouldReset: false,
    };
  }

  // More than a day has passed - streak is broken
  return {
    newStreak: 0,
    streakBroken: true,
    shouldReset: true,
  };
}

/**
 * Update streak after completing today's workout
 */
export function updateStreakOnComplete(
  lastCompletedDate: Date | null,
  currentStreak: number,
  longestStreak: number
): {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: Date;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let newStreak: number;

  // If already completed today, don't increment
  if (lastCompletedDate && isToday(lastCompletedDate)) {
    newStreak = currentStreak;
  }
  // If completed yesterday, increment streak
  else if (lastCompletedDate && isYesterday(lastCompletedDate)) {
    newStreak = currentStreak + 1;
  }
  // If this is first completion or streak was broken, start at 1
  else {
    newStreak = 1;
  }

  return {
    currentStreak: newStreak,
    longestStreak: Math.max(longestStreak, newStreak),
    lastCompletedDate: today,
  };
}

/**
 * Get streak milestone message
 */
export function getStreakMilestone(streak: number): string | null {
  const milestones: Record<number, string> = {
    3: 'Starting strong! 3 days!',
    7: 'One week streak! Week Warrior!',
    14: 'Two weeks! You\'re a Dedicated Hunter!',
    21: 'Three weeks! Incredible discipline!',
    30: 'One month! Month Master achieved!',
    50: '50 days! You\'re unstoppable!',
    100: '100 days! Shadow Monarch in training!',
    365: 'ONE YEAR! You\'ve become the strongest!',
  };

  return milestones[streak] || null;
}

/**
 * Get streak status text
 */
export function getStreakStatusText(streak: number): string {
  if (streak === 0) return 'Start your journey';
  if (streak === 1) return 'Day 1 - Begin the hunt';
  if (streak < 7) return `${streak} day streak`;
  if (streak < 30) return `${streak} day streak - Rising hunter`;
  if (streak < 100) return `${streak} day streak - Elite hunter`;
  return `${streak} day streak - Shadow Monarch`;
}

/**
 * Get days until next streak milestone
 */
export function getDaysUntilMilestone(currentStreak: number): { days: number; milestone: number } | null {
  const milestones = [3, 7, 14, 21, 30, 50, 100, 365];

  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      return {
        days: milestone - currentStreak,
        milestone,
      };
    }
  }

  return null;
}
