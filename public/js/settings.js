// DOM Elements
const notificationEnabled = document.getElementById('notifications-enabled');
const reminderTimesContainer = document.getElementById('reminder-times-container');
const addReminderBtn = document.getElementById('add-reminder');
const notificationSound = document.getElementById('notification-sound');
const notificationMessage = document.getElementById('notification-message');
const saveSettingsBtn = document.getElementById('save-settings');
const testNotificationBtn = document.getElementById('test-notification');

// App Preferences
const themePreference = document.getElementById('theme-preference');
const showStreak = document.getElementById('show-streak');
const showAiCoach = document.getElementById('show-ai-coach');

// Profile Settings
const username = document.getElementById('username');
const email = document.getElementById('email');

// User ID (this should be replaced with actual user authentication)
const userId = 'user1';

// Load settings from MongoDB
async function loadSettings() {
    try {
        const response = await fetch(`/api/profile/${userId}`);
        if (!response.ok) {
            if (response.status === 404) {
                // If profile doesn't exist, load defaults
                applyDefaultSettings();
                return;
            }
            throw new Error('Failed to fetch profile');
        }
        
        const profile = await response.json();
        
        // Notification Settings
        notificationEnabled.checked = profile.settings.notifications.enabled;
        notificationSound.value = profile.settings.notifications.sound;
        notificationMessage.value = profile.settings.notifications.message || '';
        
        // App Preferences
        themePreference.value = profile.settings.display.theme;
        showStreak.checked = profile.settings.display.showStreak;
        showAiCoach.checked = profile.settings.display.showAiCoach;
        
        // Profile Settings
        username.value = profile.username;
        email.value = profile.email;
        
        // Load reminder times
        loadReminderTimes(profile.settings.notifications.reminderTimes || []);
        
        // Apply theme
        applyTheme(profile.settings.display.theme);
    } catch (error) {
        console.error('Error loading settings:', error);
        showError('Failed to load settings');
        applyDefaultSettings();
    }
}

// Apply default settings
function applyDefaultSettings() {
    notificationEnabled.checked = false;
    notificationSound.value = 'default';
    notificationMessage.value = '';
    themePreference.value = 'dark';
    showStreak.checked = true;
    showAiCoach.checked = true;
    username.value = '';
    email.value = '';
    loadReminderTimes([]);
    applyTheme('dark');
}

// Save settings to MongoDB
async function saveSettings() {
    try {
        const settings = {
            notifications: {
                enabled: notificationEnabled.checked,
                reminderTimes: getReminderTimes(),
                sound: notificationSound.value,
                message: notificationMessage.value
            },
            display: {
                theme: themePreference.value,
                showStreak: showStreak.checked,
                showAiCoach: showAiCoach.checked
            }
        };

        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                username: username.value,
                email: email.value,
                settings
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save settings');
        }

        showSaveSuccess();
    } catch (error) {
        console.error('Error saving settings:', error);
        showError('Failed to save settings');
    }
}

// Handle reminder times
function loadReminderTimes(times) {
    const reminderTimes = document.querySelector('.reminder-times');
    reminderTimes.innerHTML = '';
    
    times.forEach((time, index) => {
        addReminderTime(time, index + 1);
    });
}

function addReminderTime(time = '', index) {
    const reminderTimes = document.querySelector('.reminder-times');
    const reminderTime = document.createElement('div');
    reminderTime.className = 'reminder-time';
    reminderTime.innerHTML = `
        <input type="time" class="time-input" id="reminder-${index}" value="${time}">
        <button class="remove-time-btn" onclick="removeReminderTime(this)">×</button>
    `;
    reminderTimes.appendChild(reminderTime);
}

function removeReminderTime(button) {
    button.parentElement.remove();
}

function getReminderTimes() {
    const times = [];
    document.querySelectorAll('.time-input').forEach(input => {
        if (input.value) times.push(input.value);
    });
    return times;
}

// Theme handling
function applyTheme(theme) {
    document.body.className = theme;
    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.className = prefersDark ? 'dark' : 'light';
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.settings-container');
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Show success message
function showSaveSuccess() {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.textContent = 'Settings saved successfully!';
    
    const container = document.querySelector('.settings-container');
    container.insertBefore(successDiv, container.firstChild);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Test notification
async function testNotification() {
    if (!notificationEnabled.checked) {
        showError('Notifications are disabled. Please enable them first.');
        return;
    }

    if (!("Notification" in window)) {
        showError('This browser does not support notifications');
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            const notification = new Notification(notificationMessage.value || "Test Notification", {
                body: "This is a test notification",
                icon: "/images/icon.png"
            });

            if (notificationSound.value !== 'none') {
                const audio = new Audio(`/sounds/${notificationSound.value}.mp3`);
                audio.play();
            }
        } else {
            showError('Notification permission denied');
        }
    } catch (error) {
        console.error('Error testing notification:', error);
        showError('Failed to test notification');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', loadSettings);

addReminderBtn.addEventListener('click', () => {
    const index = document.querySelectorAll('.reminder-time').length + 1;
    addReminderTime('', index);
});

saveSettingsBtn.addEventListener('click', saveSettings);
testNotificationBtn.addEventListener('click', testNotification);

themePreference.addEventListener('change', () => {
    applyTheme(themePreference.value);
}); 