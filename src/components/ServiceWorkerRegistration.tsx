'use client';

import { useEffect } from 'react';
import { notificationManager } from '@/lib/notifications';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/custom-sw.js')
        .then((registration) => {
          console.log('Custom service worker registered:', registration);
          
          // Initialize stored reminders after service worker is ready
          notificationManager.setupNotificationHandlers();
          notificationManager.initializeStoredReminders();
        })
        .catch((error) => {
          console.error('Custom service worker registration failed:', error);
        });
    }
  }, []);

  return null;
}