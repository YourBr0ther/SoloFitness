const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['pushup', 'situp', 'squat', 'running', 'other'],
    required: true
  },
  duration: {
    type: Number,  // in minutes
    default: 0
  },
  sets: {
    type: Number,
    default: 0
  },
  reps: {
    type: Number,
    default: 0
  },
  distance: {
    type: Number,  // in meters
    default: 0
  },
  calories: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for calculating total volume (sets * reps)
exerciseSchema.virtual('volume').get(function() {
  return this.sets * this.reps;
});

// Static method to calculate XP based on exercise type and volume
exerciseSchema.statics.calculateXP = function(type, sets, reps, duration, distance) {
  let baseXP = 0;
  
  switch(type) {
    case 'pushup':
      baseXP = 1;
      return baseXP * sets * reps;
    case 'situp':
      baseXP = 0.8;
      return baseXP * sets * reps;
    case 'squat':
      baseXP = 1.2;
      return baseXP * sets * reps;
    case 'running':
      // XP per km (distance is in meters)
      return Math.floor(distance / 100);
    default:
      // Default calculation based on duration (minutes)
      return Math.floor(duration / 5);
  }
};

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise; 