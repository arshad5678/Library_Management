const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // 1. Read Authorization header
    const authHeader = req.headers.authorization;

    // 2. Check if header is missing or does not start with Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // 3. Extract the token
    const token = authHeader.split(' ')[1];

    // 4. Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // 10. Handle invalid or expired tokens
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // 6. Find user from MongoDB using id
    const user = await User.findById(decoded.id).select('-password');
    
    // 7. If user doesn't exist
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // 8. Attach user object to req.user
    req.user = user;

    // 9. Call next()
    next();
  } catch (error) {
    console.error(`Auth Middleware Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = auth;
