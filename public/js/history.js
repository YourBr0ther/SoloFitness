const userId = 'user1'; // This should be replaced with actual user authentication
const STREAK_TARGET = 30;

// DOM Elements
const currentStreakElement = document.getElementById('current-streak');
const streakProgressBar = document.getElementById('streak-progress-bar');
const historyList = document.getElementById('history-list');
const timePeriodSelect = document.getElementById('time-period');
const totalPushupsElement = document.getElementById('total-pushups');
const totalSitupsElement = document.getElementById('total-situps');
const totalSquatsElement = document.getElementById('total-squats');
const totalRunningElement = document.getElementById('total-running');

// Fetch history data
async function fetchHistoryData(days = 30) {
    try {
        const response = await fetch(`/api/history/${userId}?days=${days}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching history data:', error);
        return null;
    }
}

// Calculate streak
function calculateStreak(history) {
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Sort history by date in descending order
    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

    for (const day of sortedHistory) {
        const dayDate = new Date(day.date);
        dayDate.setHours(0, 0, 0, 0);

        // Check if the day is consecutive
        if (dayDate.getTime() === currentDate.getTime()) {
            if (day.areTargetsMet()) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        } else {
            break;
        }
    }

    return streak;
}

// Update streak display
function updateStreakDisplay(streak) {
    currentStreakElement.textContent = streak;
    const progress = (streak / STREAK_TARGET) * 100;
    streakProgressBar.style.width = `${Math.min(progress, 100)}%`;
}

// Update total statistics
function updateTotalStats(history) {
    const totals = {
        pushups: 0,
        situps: 0,
        squats: 0,
        running: 0
    };

    history.forEach(day => {
        totals.pushups += day.pushups.count;
        totals.situps += day.situps.count;
        totals.squats += day.squats.count;
        totals.running += day.running.count;
    });

    totalPushupsElement.textContent = totals.pushups;
    totalSitupsElement.textContent = totals.situps;
    totalSquatsElement.textContent = totals.squats;
    totalRunningElement.textContent = `${totals.running} km`;
}

// Create history item element
function createHistoryItem(day) {
    const date = new Date(day.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
        <div class="history-date">${formattedDate}</div>
        <div class="history-stats">
            <div class="history-stat">
                <span>Push-ups:</span>
                <span>${day.pushups.count}/${day.pushups.target}</span>
            </div>
            <div class="history-stat">
                <span>Sit-ups:</span>
                <span>${day.situps.count}/${day.situps.target}</span>
            </div>
            <div class="history-stat">
                <span>Squats:</span>
                <span>${day.squats.count}/${day.squats.target}</span>
            </div>
            <div class="history-stat">
                <span>Running:</span>
                <span>${day.running.count}/${day.running.target} km</span>
            </div>
        </div>
    `;

    return item;
}

// Update history list
function updateHistoryList(history) {
    historyList.innerHTML = '';
    history.forEach(day => {
        const item = createHistoryItem(day);
        historyList.appendChild(item);
    });
}

// Initialize
async function initialize() {
    const days = parseInt(timePeriodSelect.value) || 30;
    const history = await fetchHistoryData(days);
    
    if (history) {
        const streak = calculateStreak(history);
        updateStreakDisplay(streak);
        updateTotalStats(history);
        updateHistoryList(history);
    }
}

// Event Listeners
timePeriodSelect.addEventListener('change', async () => {
    const days = parseInt(timePeriodSelect.value) || 30;
    const history = await fetchHistoryData(days);
    
    if (history) {
        updateHistoryList(history);
        updateTotalStats(history);
    }
});

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initialize); 