const { verifyToken } = require('../utils/jwt');
const User = require('../models/user.model');

/**
 * Middleware to protect routes that require authentication
 */
const protect = async (req, res, next) => {
  let token;
  
  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
      
      // Find user with the ID from the token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect }; 