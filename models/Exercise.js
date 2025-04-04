const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    pushups: {
        count: { type: Number, default: 0 },
        target: { type: Number, default: 100 }
    },
    situps: {
        count: { type: Number, default: 0 },
        target: { type: Number, default: 100 }
    },
    squats: {
        count: { type: Number, default: 0 },
        target: { type: Number, default: 100 }
    },
    running: {
        count: { type: Number, default: 0 },
        target: { type: Number, default: 10 }
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// Create a compound index for userId and date
exerciseSchema.index({ userId: 1, date: 1 }, { unique: true });

// Method to check if daily targets are met
exerciseSchema.methods.areTargetsMet = function() {
    return (
        this.pushups.count >= this.pushups.target &&
        this.situps.count >= this.situps.target &&
        this.squats.count >= this.squats.target &&
        this.running.count >= this.running.target
    );
};

// Method to calculate XP
exerciseSchema.methods.calculateXP = function() {
    let xp = 0;
    if (this.pushups.count >= this.pushups.target) xp += 25;
    if (this.situps.count >= this.situps.target) xp += 25;
    if (this.squats.count >= this.squats.target) xp += 25;
    if (this.running.count >= this.running.target) xp += 25;
    return xp;
};

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise; 