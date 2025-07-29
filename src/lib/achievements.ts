interface User {
  id: string;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
}

interface DailyLog {
  id: string;
  pushups: number;
  situps: number;
  squats: number;
  milesRan: number;
  completed: boolean;
  bonusTasks?: { completed: boolean }[];
  penalties?: { completed: boolean }[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  checkCondition: (user: User, logs: DailyLog[]) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-step',
    name: 'First Step',
    description: 'Complete your first day of training',
    icon: '👟',
    requirement: 'Complete 1 day',
    checkCondition: (user: User, logs: DailyLog[]) => logs.length >= 1 && logs.some(log => log.completed),
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🗡️',
    requirement: '7-day streak',
    checkCondition: (user: User) => user.currentStreak >= 7 || user.longestStreak >= 7,
  },
  {
    id: 'month-master',
    name: 'Month Master',
    description: 'Achieve a 30-day streak',
    icon: '🏆',
    requirement: '30-day streak',
    checkCondition: (user: User) => user.currentStreak >= 30 || user.longestStreak >= 30,
  },
  {
    id: 'pushup-pro',
    name: 'Push-up Pro',
    description: 'Complete 1000 total push-ups',
    icon: '💪',
    requirement: '1000 total push-ups',
    checkCondition: (user: User, logs: DailyLog[]) => {
      const totalPushups = logs.reduce((sum, log) => sum + log.pushups, 0);
      return totalPushups >= 1000;
    },
  },
  {
    id: 'marathon-runner',
    name: 'Marathon Runner',
    description: 'Run 100 total miles',
    icon: '🏃‍♂️',
    requirement: '100 total miles',
    checkCondition: (user: User, logs: DailyLog[]) => {
      const totalMiles = logs.reduce((sum, log) => sum + log.milesRan, 0);
      return totalMiles >= 100;
    },
  },
  {
    id: 'level-5-hero',
    name: 'Level 5 Hero',
    description: 'Reach level 5',
    icon: '⭐',
    requirement: 'Reach level 5',
    checkCondition: (user: User) => user.level >= 5,
  },
  {
    id: 'solo-leveling-complete',
    name: 'Solo Leveling Complete',
    description: 'Reach the maximum level 10',
    icon: '👑',
    requirement: 'Reach level 10',
    checkCondition: (user: User) => user.level >= 10,
  },
  {
    id: 'consistency-king',
    name: 'Consistency King',
    description: 'Complete 50 total workout days',
    icon: '🔥',
    requirement: '50 completed days',
    checkCondition: (user: User, logs: DailyLog[]) => {
      const completedDays = logs.filter(log => log.completed).length;
      return completedDays >= 50;
    },
  },
  {
    id: 'bonus-master',
    name: 'Bonus Master',
    description: 'Complete 20 bonus tasks',
    icon: '⭐',
    requirement: '20 bonus tasks',
    checkCondition: (user: User, logs: DailyLog[]) => {
      const completedBonusTasks = logs.reduce((sum, log) => {
        return sum + (log.bonusTasks?.filter(task => task.completed).length || 0);
      }, 0);
      return completedBonusTasks >= 20;
    },
  },
  {
    id: 'penalty-crusher',
    name: 'Penalty Crusher',
    description: 'Complete 10 penalty exercises',
    icon: '⚔️',
    requirement: '10 penalty exercises',
    checkCondition: (user: User, logs: DailyLog[]) => {
      const completedPenalties = logs.reduce((sum, log) => {
        return sum + (log.penalties?.filter(penalty => penalty.completed).length || 0);
      }, 0);
      return completedPenalties >= 10;
    },
  },
];

export const calculateUserAchievements = (user: User, logs: DailyLog[]) => {
  return ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    unlocked: achievement.checkCondition(user, logs),
  }));
};