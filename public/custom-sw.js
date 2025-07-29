// Custom service worker for handling notifications
// This runs alongside the generated PWA service worker

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  const notification = event.notification;
  const data = notification.data || {};
  const action = event.action;

  notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          // Focus existing window and navigate if needed
          return client.focus().then(() => {
            // Send message to the client about the notification click
            client.postMessage({
              type: 'notification-click',
              action: action,
              data: data
            });
            
            // Navigate based on notification type
            switch (data.type) {
              case 'daily-reminder':
                if (action === 'open') {
                  return client.navigate('/');
                }
                break;
              case 'achievement':
                return client.navigate('/profile');
              case 'streak':
              case 'workout-complete':
                return client.focus();
            }
          });
        }
      }
      
      // If no window is open, open a new one
      let url = '/';
      if (data.type === 'achievement') {
        url = '/profile';
      }
      
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// Handle background sync for scheduled notifications (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(
      // Future: Handle background sync for reminders
      Promise.resolve()
    );
  }
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    // Future: Handle notification scheduling
    console.log('Schedule notification request:', event.data);
  }
});

console.log('Custom service worker loaded for SoloFitness notifications');