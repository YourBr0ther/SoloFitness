const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const Chat = require('../models/chat.model');
const router = express.Router();

/**
 * @route   GET /api/coach/chat
 * @desc    Get user's chat history
 * @access  Private
 */
router.get('/chat', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    // Find chat for user or create if doesn't exist
    let chat = await Chat.findOne({ user: req.user._id });
    
    if (!chat) {
      chat = await Chat.create({
        user: req.user._id,
        messages: [
          {
            sender: 'coach',
            content: 'Welcome to SoloFitness! I\'m your coach. How can I help you today?'
          }
        ]
      });
    }
    
    // Return only the most recent messages based on limit
    const recentMessages = chat.messages.slice(-limit);
    
    res.json({
      chat: {
        _id: chat._id,
        coachType: chat.coachType,
        lastInteraction: chat.lastInteraction,
        messages: recentMessages
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
 * @route   POST /api/coach/chat
 * @desc    Send a message to the coach
 * @access  Private
 */
router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    // Find or create chat
    let chat = await Chat.findOne({ user: req.user._id });
    
    if (!chat) {
      chat = await Chat.create({
        user: req.user._id,
        messages: [
          {
            sender: 'coach',
            content: 'Welcome to SoloFitness! I\'m your coach. How can I help you today?'
          }
        ]
      });
    }
    
    // Add user message
    await chat.addMessage('user', message);
    
    // In a real app, here would be AI integration
    // For now, we'll just return a simple coach response
    const coachResponse = getSimpleCoachResponse(message, req.user);
    
    // Add coach response
    await chat.addMessage('coach', coachResponse);
    
    // Return updated chat
    const updatedChat = await Chat.findById(chat._id);
    
    res.json({
      chat: {
        _id: updatedChat._id,
        coachType: updatedChat.coachType,
        lastInteraction: updatedChat.lastInteraction,
        messages: updatedChat.messages.slice(-20) // Return last 20 messages
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
 * @route   PUT /api/coach/preferences
 * @desc    Update coach preferences
 * @access  Private
 */
router.put('/preferences', protect, async (req, res) => {
  try {
    const { coachType } = req.body;
    
    // Validate coach type
    if (!['motivational', 'technical', 'nutrition', 'general'].includes(coachType)) {
      return res.status(400).json({ message: 'Invalid coach type' });
    }
    
    // Find or create chat
    let chat = await Chat.findOne({ user: req.user._id });
    
    if (!chat) {
      chat = await Chat.create({
        user: req.user._id,
        coachType,
        messages: [
          {
            sender: 'coach',
            content: `Welcome to SoloFitness! I'm your ${coachType} coach. How can I help you today?`
          }
        ]
      });
    } else {
      // Update coach type
      chat.coachType = coachType;
      
      // Add message about coach type change
      await chat.addMessage('coach', `I've switched to ${coachType} coaching mode. How can I help you?`);
    }
    
    await chat.save();
    
    res.json({
      coachType: chat.coachType,
      message: `Coach type updated to ${coachType}`
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
 * Simple function to generate coach responses
 * In a real app, this would be replaced with an AI integration
 */
function getSimpleCoachResponse(message, user) {
  const lowerMessage = message.toLowerCase();
  
  // Check for common queries and return appropriate responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return `Hello there! How's your fitness journey going today?`;
  }
  
  if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
    return `For effective workouts, make sure to focus on form and consistent progressive overload. What specific exercises are you planning today?`;
  }
  
  if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted')) {
    return `Remember, rest and recovery are essential parts of progress. Make sure you're getting enough sleep and proper nutrition.`;
  }
  
  if (lowerMessage.includes('motivat') || lowerMessage.includes('inspire')) {
    return `"The only person you should try to be better than is the person you were yesterday." Keep pushing your limits!`;
  }
  
  if (lowerMessage.includes('level') || lowerMessage.includes('xp')) {
    return `You're currently at level ${user.level} with ${user.xp} XP. Keep exercising to level up and become stronger!`;
  }
  
  // Default response
  return `Thanks for reaching out! As your fitness coach, I'm here to help you achieve your goals. What specific assistance do you need today?`;
}

module.exports = router; 