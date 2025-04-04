// Exercise tracking
const exercises = {
    pushups: { count: 0, target: 100 },
    situps: { count: 0, target: 100 },
    squats: { count: 0, target: 100 },
    running: { count: 0, target: 10 }
};

// Level system
let currentLevel = 1;
let currentXP = 0;
const XP_PER_LEVEL = 1000;
const userId = 'user1'; // This should be replaced with actual user authentication

// DOM Elements
const exerciseButtons = document.querySelectorAll('.add-btn, .decrease-btn');
const levelDisplay = document.getElementById('current-level');
const xpProgress = document.getElementById('xp-progress');

// API Functions
async function fetchExerciseData() {
    try {
        const response = await fetch(`/api/exercises/${userId}`);
        const data = await response.json();
        
        // Update local state
        exercises.pushups.count = data.pushups.count;
        exercises.situps.count = data.situps.count;
        exercises.squats.count = data.squats.count;
        exercises.running.count = data.running.count;
        currentLevel = data.level;
        currentXP = data.xp;
        
        // Update UI
        updateUI();
    } catch (error) {
        console.error('Error fetching exercise data:', error);
    }
}

async function updateExerciseData(exerciseType, count) {
    try {
        // Ensure count doesn't go below 0
        count = Math.max(0, count);
        
        const response = await fetch(`/api/exercises/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ exerciseType, count })
        });
        const data = await response.json();
        
        // Update local state
        exercises[exerciseType].count = data[exerciseType].count;
        currentLevel = data.level;
        currentXP = data.xp;
        
        // Update UI
        updateUI();
    } catch (error) {
        console.error('Error updating exercise data:', error);
    }
}

// UI Update Functions
function updateUI() {
    // Update exercise counters
    Object.keys(exercises).forEach(exercise => {
        const countElement = document.getElementById(`${exercise}-count`);
        if (countElement) {
            countElement.textContent = exercises[exercise].count;
        }
    });
    
    // Update level and XP
    levelDisplay.textContent = currentLevel;
    const xpPercentage = (currentXP % XP_PER_LEVEL) / XP_PER_LEVEL * 100;
    xpProgress.style.width = `${xpPercentage}%`;
}

// Initialize exercise counters
function initializeCounters() {
    Object.keys(exercises).forEach(exercise => {
        const countElement = document.getElementById(`${exercise}-count`);
        if (countElement) {
            countElement.textContent = exercises[exercise].count;
        }
    });
}

// Event listeners
exerciseButtons.forEach(button => {
    button.addEventListener('click', () => {
        const exercise = button.dataset.exercise;
        const isDecrease = button.classList.contains('decrease-btn');
        const currentCount = exercises[exercise].count;
        const newCount = isDecrease ? currentCount - 1 : currentCount + 1;
        updateExerciseData(exercise, newCount);
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await fetchExerciseData();
    
    // Request notification permission
    if ('Notification' in window) {
        Notification.requestPermission();
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
} 