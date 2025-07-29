// Notification utilities for SoloFitness PWA
export class NotificationManager {
  private static instance: NotificationManager;
  
  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Check if notifications are supported
  public isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Get current permission status
  public getPermission(): NotificationPermission {
    return Notification.permission;
  }

  // Request notification permission
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Show immediate notification
  public async showNotification(title: string, options: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    actions?: Array<{
      action: string;
      title: string;
      icon?: string;
    }>;
  } = {}): Promise<void> {
    if (this.getPermission() !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const defaultOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      ...options,
    };

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, defaultOptions);
    } else {
      new Notification(title, defaultOptions);
    }
  }

  // Schedule daily reminder
  public async scheduleDailyReminder(time: string, enabled: boolean): Promise<void> {
    if (!this.isSupported() || this.getPermission() !== 'granted') {
      return;
    }

    // Clear existing reminder
    await this.clearScheduledNotifications('daily-reminder');

    if (!enabled) return;

    // Store reminder settings in localStorage for persistence
    if (enabled) {
      localStorage.setItem('dailyReminderTime', time);
      localStorage.setItem('dailyReminderEnabled', 'true');
    } else {
      localStorage.removeItem('dailyReminderTime');
      localStorage.removeItem('dailyReminderEnabled');
    }

    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    // Use setTimeout for immediate scheduling (will be reset on page reload)
    // Combined with localStorage persistence for recovery
    setTimeout(async () => {
      await this.showNotification('Time to Train! 💪', {
        body: 'Ready to level up? Complete your daily workout to maintain your streak!',
        tag: 'daily-reminder',
        data: { type: 'daily-reminder' },
        actions: [
          { action: 'open', title: 'Start Workout' },
          { action: 'snooze', title: 'Remind Later' }
        ]
      });

      // Reschedule for next day
      this.scheduleDailyReminder(time, true);
    }, delay);
  }

  // Initialize reminders on app start (call this when the app loads)
  public initializeStoredReminders(): void {
    const reminderEnabled = localStorage.getItem('dailyReminderEnabled') === 'true';
    const reminderTime = localStorage.getItem('dailyReminderTime');
    
    if (reminderEnabled && reminderTime && this.getPermission() === 'granted') {
      // Check if we need to show today's reminder
      const [hours, minutes] = reminderTime.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      // If the reminder time hasn't passed today, schedule it
      if (scheduledTime > now) {
        this.scheduleDailyReminder(reminderTime, true);
      } else {
        // Schedule for tomorrow
        this.scheduleDailyReminder(reminderTime, true);
      }
    }
  }

  // Clear scheduled notifications by tag
  private async clearScheduledNotifications(tag: string): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications({ tag });
      notifications.forEach(notification => notification.close());
    }
  }

  // Show achievement unlock notification
  public async showAchievementNotification(achievementName: string, description: string): Promise<void> {
    await this.showNotification('🏆 Achievement Unlocked!', {
      body: `${achievementName}: ${description}`,
      tag: 'achievement',
      data: { type: 'achievement', name: achievementName },
      actions: [
        { action: 'view', title: 'View Profile' }
      ]
    });
  }

  // Show streak milestone notification
  public async showStreakNotification(streak: number): Promise<void> {
    const milestones = [3, 7, 14, 21, 30, 50, 100];
    if (!milestones.includes(streak)) return;

    let message = '';
    let emoji = '🔥';

    if (streak === 3) {
      message = 'You\'re on fire! Keep it going!';
    } else if (streak === 7) {
      message = 'One week streak! You\'re becoming a true hunter!';
      emoji = '⚡';
    } else if (streak === 14) {
      message = 'Two weeks strong! Your dedication is showing!';
      emoji = '💎';
    } else if (streak === 21) {
      message = 'Three weeks! You\'re building an unbreakable habit!';
      emoji = '🌟';
    } else if (streak === 30) {
      message = 'One month streak! You\'ve reached Elite Hunter status!';
      emoji = '👑';
    } else if (streak >= 50) {
      message = `${streak} day streak! You\'re a legendary hunter!`;
      emoji = '🏆';
    }

    await this.showNotification(`${emoji} ${streak} Day Streak!`, {
      body: message,
      tag: 'streak',
      data: { type: 'streak', count: streak }
    });
  }

  // Show workout completion celebration
  public async showWorkoutCompleteNotification(xpGained: number, newLevel?: number): Promise<void> {
    const title = newLevel 
      ? `🎉 Level Up! You're now Level ${newLevel}!`
      : '✅ Workout Complete!';
    
    const body = newLevel
      ? `Amazing work! You gained ${xpGained} XP and leveled up!`
      : `Great job! You earned ${xpGained} XP. Keep pushing!`;

    await this.showNotification(title, {
      body,
      tag: 'workout-complete',
      data: { type: 'workout-complete', xp: xpGained, level: newLevel }
    });
  }

  // Handle notification clicks
  public setupNotificationHandlers(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'notification-click') {
          const { action, data } = event.data;
          
          switch (data?.type) {
            case 'daily-reminder':
              if (action === 'open') {
                window.focus();
                window.location.href = '/';
              } else if (action === 'snooze') {
                // Snooze for 1 hour
                setTimeout(() => {
                  this.showNotification('Workout Reminder 💪', {
                    body: 'Time to get back to training!',
                    tag: 'daily-reminder-snooze'
                  });
                }, 60 * 60 * 1000);
              }
              break;

            case 'achievement':
              window.focus();
              window.location.href = '/profile';
              break;

            case 'streak':
            case 'workout-complete':
              window.focus();
              break;
          }
        }
      });
    }
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();

// Helper functions
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const permission = await notificationManager.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
};

export const isNotificationSupported = (): boolean => {
  return notificationManager.isSupported();
};

export const getNotificationPermission = (): NotificationPermission => {
  return notificationManager.getPermission();
};