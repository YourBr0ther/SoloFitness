const express = require('express');
const { body } = require('express-validator');
const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt');
const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('username').trim().isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters'),
  body('email').isEmail().normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password').exists()
    .withMessage('Password is required')
];

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (userExists) {
      return res.status(400).json({ 
        message: 'User already exists with that email or username' 
      });
    }
    
    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });
    
    if (user) {
      // Generate token
      const token = generateToken({ id: user._id });
      
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        createdAt: user.createdAt,
        token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
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
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Generate token
      const token = generateToken({ id: user._id });
      
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 