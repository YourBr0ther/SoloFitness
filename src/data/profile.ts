import { Profile, StreakDay, NotificationTime } from "@/types/profile";

export const MOCK_PROFILE: Profile = {
  id: "1",
  username: "Solo Warrior",
  avatarUrl: "/default-avatar.svg",
  streakHistory: [
    {
      date: "2024-03-20",
      completed: true,
      xpEarned: 100,
      exercises: {
        pushups: 50,
        situps: 30,
        squats: 40,
        milesRan: 2.5
      }
    },
    {
      date: "2024-03-19",
      completed: true,
      xpEarned: 100,
      exercises: {
        pushups: 45,
        situps: 25,
        squats: 35,
        milesRan: 3.0
      }
    },
    {
      date: "2024-03-18",
      completed: false,
      xpEarned: 0,
      exercises: {
        pushups: 0,
        situps: 0,
        squats: 0,
        milesRan: 0
      }
    },
    {
      date: "2024-03-17",
      completed: true,
      xpEarned: 100,
      exercises: {
        pushups: 40,
        situps: 20,
        squats: 30,
        milesRan: 2.0
      }
    }
  ],
  notifications: [
    {
      id: "1",
      time: "09:00",
      enabled: true
    },
    {
      id: "2",
      time: "18:00",
      enabled: true
    },
    {
      id: "3",
      time: "21:00",
      enabled: false
    }
  ],
  preferences: {
    enablePenalties: true,
    enableBonuses: true
  },
  badges: [
    {
      id: "pushup-master",
      name: "Push-up Master",
      description: "Complete 1000 push-ups",
      icon: "💪",
      unlocked: false,
      progress: 750,
      total: 1000,
      isNew: false
    },
    {
      id: "marathon-runner",
      name: "Marathon Runner",
      description: "Run 26.2 miles total",
      icon: "🏃",
      unlocked: true,
      progress: 26.2,
      total: 26.2,
      isNew: true
    },
    {
      id: "streak-champion",
      name: "Streak Champion",
      description: "Maintain a 7-day streak",
      icon: "🔥",
      unlocked: true,
      progress: 7,
      total: 7,
      isNew: true
    },
    {
      id: "early-bird",
      name: "Early Bird",
      description: "Complete 5 morning workouts",
      icon: "🌅",
      unlocked: false,
      progress: 3,
      total: 5,
      isNew: false
    }
  ]
}; 