const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'coach'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema],
  coachType: {
    type: String,
    enum: ['motivational', 'technical', 'nutrition', 'general'],
    default: 'general'
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add method to add new message to chat
chatSchema.methods.addMessage = function(sender, content) {
  this.messages.push({ sender, content });
  this.lastInteraction = Date.now();
  return this.save();
};

// Static method to get recent chats for a user
chatSchema.statics.getUserRecentChats = async function(userId, limit = 20) {
  return this.findOne({ user: userId })
    .sort({ lastInteraction: -1 })
    .select('messages')
    .slice('messages', -limit);
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat; 