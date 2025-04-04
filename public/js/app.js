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

// DOM Elements
const exerciseButtons = document.querySelectorAll('.add-btn');
const levelDisplay = document.getElementById('current-level');
const xpProgress = document.getElementById('xp-progress');

// Initialize exercise counters
function initializeCounters() {
    Object.keys(exercises).forEach(exercise => {
        const countElement = document.getElementById(`${exercise}-count`);
        if (countElement) {
            countElement.textContent = exercises[exercise].count;
        }
    });
}

// Update exercise count
function updateExerciseCount(exercise) {
    exercises[exercise].count++;
    const countElement = document.getElementById(`${exercise}-count`);
    if (countElement) {
        countElement.textContent = exercises[exercise].count;
    }
    
    // Check if target is reached
    if (exercises[exercise].count >= exercises[exercise].target) {
        addXP(100); // Add XP for completing an exercise
    }
}

// Add XP and handle leveling
function addXP(amount) {
    currentXP += amount;
    const xpPercentage = (currentXP % XP_PER_LEVEL) / XP_PER_LEVEL * 100;
    xpProgress.style.width = `${xpPercentage}%`;
    
    // Check for level up
    if (currentXP >= currentLevel * XP_PER_LEVEL) {
        levelUp();
    }
}

// Handle level up
function levelUp() {
    currentLevel++;
    levelDisplay.textContent = currentLevel;
    currentXP = 0;
    xpProgress.style.width = '0%';
    
    // Show level up animation
    const levelUpEvent = new CustomEvent('levelUp', { detail: { level: currentLevel } });
    document.dispatchEvent(levelUpEvent);
}

// Event listeners
exerciseButtons.forEach(button => {
    button.addEventListener('click', () => {
        const exercise = button.dataset.exercise;
        updateExerciseCount(exercise);
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeCounters();
    
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