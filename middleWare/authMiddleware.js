const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header is present and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from 'Bearer <token>' format
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the SECRET_KEY
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      // Find the user associated with the token
      req.user = await User.findById(decoded.id).select('-password'); // Exclude the password from user details

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // If no token is present, send an error
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
