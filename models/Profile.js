const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    settings: {
        notifications: {
            enabled: { type: Boolean, default: false },
            reminderTimes: [String],
            sound: { type: String, default: 'default' },
            message: String
        },
        display: {
            theme: { type: String, default: 'dark' },
            showStreak: { type: Boolean, default: true },
            showAiCoach: { type: Boolean, default: true }
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema); 