const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const Exercise = require('../models/exercise.model');
const User = require('../models/user.model');
const router = express.Router();

/**
 * @route   POST /api/exercises
 * @desc    Create a new exercise entry
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const {
      type,
      duration,
      sets,
      reps,
      distance,
      calories,
      notes
    } = req.body;
    
    // Calculate XP based on exercise type and volume
    const xpEarned = Exercise.calculateXP(type, sets, reps, duration, distance);
    
    // Create exercise entry
    const exercise = await Exercise.create({
      user: req.user._id,
      type,
      duration,
      sets,
      reps,
      distance,
      calories,
      notes,
      xpEarned
    });
    
    // Update user's XP
    const user = await User.findById(req.user._id);
    user.xp += xpEarned;
    
    // Check if user should level up (simple formula: level up every 1000 XP)
    const newLevel = Math.floor(user.xp / 1000) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }
    
    await user.save();
    
    res.status(201).json({
      exercise,
      userProgress: {
        xp: user.xp,
        level: user.level,
        xpEarned
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/exercises
 * @desc    Get all exercises for logged in user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtering
    const filter = { user: req.user._id };
    
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Get exercises
    const exercises = await Exercise.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await Exercise.countDocuments(filter);
    
    res.json({
      exercises,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/exercises/:id
 * @desc    Get exercise by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    // Check if exercise belongs to user
    if (exercise.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(exercise);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/exercises/:id
 * @desc    Update exercise
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    // Check if exercise belongs to user
    if (exercise.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Calculate previous XP to adjust user's total
    const previousXP = exercise.xpEarned;
    
    // Update exercise fields
    const {
      type,
      duration,
      sets,
      reps,
      distance,
      calories,
      notes
    } = req.body;
    
    exercise.type = type || exercise.type;
    exercise.duration = duration !== undefined ? duration : exercise.duration;
    exercise.sets = sets !== undefined ? sets : exercise.sets;
    exercise.reps = reps !== undefined ? reps : exercise.reps;
    exercise.distance = distance !== undefined ? distance : exercise.distance;
    exercise.calories = calories !== undefined ? calories : exercise.calories;
    exercise.notes = notes !== undefined ? notes : exercise.notes;
    
    // Recalculate XP
    exercise.xpEarned = Exercise.calculateXP(
      exercise.type, 
      exercise.sets, 
      exercise.reps, 
      exercise.duration, 
      exercise.distance
    );
    
    await exercise.save();
    
    // Update user's XP
    const user = await User.findById(req.user._id);
    user.xp = user.xp - previousXP + exercise.xpEarned;
    
    // Check if user should level up or down
    const newLevel = Math.floor(user.xp / 1000) + 1;
    user.level = newLevel;
    
    await user.save();
    
    res.json({
      exercise,
      userProgress: {
        xp: user.xp,
        level: user.level,
        xpDifference: exercise.xpEarned - previousXP
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/exercises/:id
 * @desc    Delete exercise
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    // Check if exercise belongs to user
    if (exercise.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Capture XP before deleting
    const xpToRemove = exercise.xpEarned;
    
    await exercise.remove();
    
    // Update user's XP
    const user = await User.findById(req.user._id);
    user.xp -= xpToRemove;
    if (user.xp < 0) user.xp = 0;
    
    // Update level
    const newLevel = Math.floor(user.xp / 1000) + 1;
    user.level = newLevel;
    
    await user.save();
    
    res.json({ 
      message: 'Exercise removed',
      userProgress: {
        xp: user.xp,
        level: user.level,
        xpRemoved: xpToRemove
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 