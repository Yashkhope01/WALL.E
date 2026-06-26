// backend/middleware/auth.js
/**
 * Authentication middleware to verify JWT token.
 */

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const tokenSecret = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production';
    const decoded = jwt.verify(token, tokenSecret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};