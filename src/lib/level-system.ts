import { LevelRequirement } from '@/types';

export const LEVEL_REQUIREMENTS: Record<number, LevelRequirement> = {
  1: { pushups: 10, situps: 10, squats: 10, miles: 0.5, xpRequired: 0 },
  2: { pushups: 15, situps: 15, squats: 15, miles: 0.75, xpRequired: 100 },
  3: { pushups: 20, situps: 20, squats: 20, miles: 1, xpRequired: 300 },
  4: { pushups: 30, situps: 30, squats: 30, miles: 1.5, xpRequired: 600 },
  5: { pushups: 40, situps: 40, squats: 40, miles: 2, xpRequired: 1000 },
  6: { pushups: 50, situps: 50, squats: 50, miles: 2.5, xpRequired: 1500 },
  7: { pushups: 65, situps: 65, squats: 65, miles: 3, xpRequired: 2100 },
  8: { pushups: 80, situps: 80, squats: 80, miles: 3.5, xpRequired: 2800 },
  9: { pushups: 90, situps: 90, squats: 90, miles: 4, xpRequired: 3600 },
  10: { pushups: 100, situps: 100, squats: 100, miles: 5, xpRequired: 4500 }
};

export const calculateDailyXP = (level: number, completionPercentage: number): number => {
  // Clamp level between 1 and 10
  const clampedLevel = Math.max(1, Math.min(10, level));
  const baseXP = 20 + (clampedLevel * 5);
  return Math.floor(baseXP * completionPercentage);
};

export const calculateCompletionPercentage = (
  level: number,
  pushups: number,
  situps: number,
  squats: number,
  miles: number
): number => {
  // Clamp level between 1 and 10
  const clampedLevel = Math.max(1, Math.min(10, level));
  const requirements = LEVEL_REQUIREMENTS[clampedLevel];
  
  if (!requirements) {
    console.error(`Invalid level: ${level}, using level 1 requirements`);
    return 0;
  }

  const pushupsPercent = requirements.pushups > 0 ? Math.min(Math.max(0, pushups) / requirements.pushups, 1) : 0;
  const situpsPercent = requirements.situps > 0 ? Math.min(Math.max(0, situps) / requirements.situps, 1) : 0;
  const squatsPercent = requirements.squats > 0 ? Math.min(Math.max(0, squats) / requirements.squats, 1) : 0;
  const milesPercent = requirements.miles > 0 ? Math.min(Math.max(0, miles) / requirements.miles, 1) : 0;

  return (pushupsPercent + situpsPercent + squatsPercent + milesPercent) / 4;
};

export const getNextLevelXP = (currentXP: number): { currentLevel: number; nextLevelXP: number; progress: number } => {
  let currentLevel = 1;
  
  for (let level = 1; level <= 10; level++) {
    if (currentXP >= LEVEL_REQUIREMENTS[level].xpRequired) {
      currentLevel = level;
    } else {
      break;
    }
  }

  const nextLevel = Math.min(currentLevel + 1, 10);
  const nextLevelXP = LEVEL_REQUIREMENTS[nextLevel].xpRequired;
  const currentLevelXP = LEVEL_REQUIREMENTS[currentLevel].xpRequired;
  const progress = nextLevel === 10 && currentLevel === 10 
    ? 1 
    : (currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP);

  return {
    currentLevel,
    nextLevelXP,
    progress: Math.max(0, Math.min(1, progress))
  };
};

export const checkLevelUp = (oldXP: number, newXP: number): boolean => {
  const oldLevel = getNextLevelXP(oldXP).currentLevel;
  const newLevel = getNextLevelXP(newXP).currentLevel;
  return newLevel > oldLevel;
};