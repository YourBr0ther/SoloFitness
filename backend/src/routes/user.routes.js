const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
  try {
    // User is already attached to req from auth middleware
    const user = req.user;
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      level: user.level,
      xp: user.xp,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
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
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      // Update only the fields that are sent
      user.username = req.body.username || user.username;
      
      // If email is being updated, check if it already exists
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        user.email = req.body.email;
      }
      
      // If password is being updated
      if (req.body.password) {
        user.password = req.body.password;
      }
      
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        level: updatedUser.level,
        xp: updatedUser.xp
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/users/progress
 * @desc    Get user progress (level and XP)
 * @access  Private
 */
router.get('/progress', protect, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      level: user.level,
      xp: user.xp
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