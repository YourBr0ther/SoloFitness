'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Star, Zap } from 'lucide-react';
import { 
  notificationManager, 
  requestNotificationPermission, 
  isNotificationSupported,
  getNotificationPermission 
} from '@/lib/notifications';

interface NotificationSettingsProps {
  settings: {
    notificationsEnabled?: boolean;
    dailyReminderTime?: string;
    weekendReminders?: boolean;
    achievementNotifications?: boolean;
    streakReminders?: boolean;
  };
  onSettingsChange: (key: string, value: boolean | string) => void;
}

export default function NotificationSettings({ settings, onSettingsChange }: NotificationSettingsProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    setIsSupported(isNotificationSupported());
    setPermission(getNotificationPermission());
    
    // Setup notification handlers
    notificationManager.setupNotificationHandlers();
  }, []);

  const handleEnableNotifications = async () => {
    if (permission === 'granted') {
      // Already granted, just toggle the setting
      onSettingsChange('notificationsEnabled', !settings.notificationsEnabled);
      
      // Schedule or cancel daily reminders
      if (!settings.notificationsEnabled && settings.dailyReminderTime) {
        await notificationManager.scheduleDailyReminder(
          settings.dailyReminderTime, 
          true
        );
      }
      return;
    }

    if (permission === 'denied') {
      alert('Notifications are blocked. Please enable them in your browser settings.');
      return;
    }

    // Request permission
    setIsRequesting(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        setPermission('granted');
        onSettingsChange('notificationsEnabled', true);
        
        // Show welcome notification
        await notificationManager.showNotification('🎉 Notifications Enabled!', {
          body: 'You\'ll now receive workout reminders and achievement updates!',
          tag: 'welcome'
        });
        
        // Schedule daily reminders if time is set
        if (settings.dailyReminderTime) {
          await notificationManager.scheduleDailyReminder(
            settings.dailyReminderTime, 
            true
          );
        }
      } else {
        alert('Notification permission denied. You can enable it later in your browser settings.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      alert('Failed to enable notifications. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTimeChange = async (time: string) => {
    onSettingsChange('dailyReminderTime', time);
    
    // Reschedule notifications if enabled
    if (settings.notificationsEnabled && permission === 'granted') {
      await notificationManager.scheduleDailyReminder(time, true);
    }
  };

  const testNotification = async () => {
    if (permission !== 'granted') {
      alert('Please enable notifications first!');
      return;
    }

    try {
      await notificationManager.showNotification('🧪 Test Notification', {
        body: 'This is how your workout reminders will look!',
        tag: 'test'
      });
    } catch (error) {
      console.error('Error showing test notification:', error);
      alert('Failed to show test notification.');
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-yellow-400">
          <BellOff className="w-5 h-5" />
          <span>Notifications are not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5 text-primary-400" />
          <div>
            <div className="text-white font-medium">Push Notifications</div>
            <div className="text-sm text-gray-400">
              Get workout reminders and achievement alerts
            </div>
          </div>
        </div>
        <button
          onClick={handleEnableNotifications}
          disabled={isRequesting}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${settings.notificationsEnabled && permission === 'granted'
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }
            ${isRequesting ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isRequesting ? 'Requesting...' : 
           settings.notificationsEnabled && permission === 'granted' ? 'Enabled' : 'Enable'}
        </button>
      </div>

      {permission === 'denied' && (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
          <div className="text-red-400 text-sm">
            Notifications are blocked. To enable them:
            <br />• Click the bell icon in your browser's address bar
            <br />• Or go to Settings → Privacy → Notifications
          </div>
        </div>
      )}

      {settings.notificationsEnabled && permission === 'granted' && (
        <div className="space-y-4 pl-8 border-l-2 border-primary-700">
          <button
            onClick={testNotification}
            className="text-sm text-primary-400 hover:text-primary-300 underline"
          >
            Send test notification
          </button>

          {/* Daily Reminder Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-primary-400" />
              <div>
                <div className="text-white text-sm font-medium">Daily Reminder</div>
                <div className="text-xs text-gray-400">When to remind you to workout</div>
              </div>
            </div>
            <input
              type="time"
              value={settings.dailyReminderTime || '09:00'}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="
                bg-primary-800 border border-primary-600 rounded px-3 py-1
                text-white text-sm focus:outline-none focus:border-primary-500
              "
            />
          </div>

          {/* Weekend Reminders */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-primary-400" />
              <div>
                <div className="text-white text-sm font-medium">Weekend Reminders</div>
                <div className="text-xs text-gray-400">Get reminders on weekends too</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.weekendReminders ?? true}
                onChange={(e) => onSettingsChange('weekendReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-primary-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          {/* Achievement Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-primary-400" />
              <div>
                <div className="text-white text-sm font-medium">Achievement Alerts</div>
                <div className="text-xs text-gray-400">Celebrate when you unlock achievements</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.achievementNotifications ?? true}
                onChange={(e) => onSettingsChange('achievementNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-primary-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          {/* Streak Reminders */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-primary-400" />
              <div>
                <div className="text-white text-sm font-medium">Streak Milestones</div>
                <div className="text-xs text-gray-400">Get notified at streak milestones</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.streakReminders ?? true}
                onChange={(e) => onSettingsChange('streakReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-primary-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}