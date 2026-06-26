// backend/controllers/authController.js
/**
 * Controllers for authentication: register and login.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const tokenSecret = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production';

exports.register = async (req, res) => {
  console.log('Register request received:', req.body);
  const { email, password, role, name } = req.body;
  if (!email || !password || !role || !name) {
    console.warn('Registration failed validation: missing fields:', { email: !!email, password: !!password, role: !!role, name: !!name });
    return res.status(400).json({ msg: 'All fields are required' });
  }
  if (!['Citizen', 'Municipal', 'Admin'].includes(role)) {
    console.warn('Registration failed validation: invalid role:', role);
    return res.status(400).json({ msg: 'Invalid role' });
  }
  const normalizedEmail = email.toLowerCase().trim();
  const trimmedName = name.trim();

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    console.warn('Registration failed validation: invalid email format:', normalizedEmail);
    return res.status(400).json({ msg: 'Invalid email format' });
  }
  // Password strength (example: at least 8 chars)
  if (password.length < 8) {
    console.warn('Registration failed validation: password length < 8');
    return res.status(400).json({ msg: 'Password must be at least 8 characters long' });
  }
  try {
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      console.warn('Registration failed validation: user already exists:', normalizedEmail);
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({ email: normalizedEmail, password: hashedPassword, role, name: trimmedName });

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, tokenSecret, { expiresIn: '7d' });

    res.json({ user: { id: user._id, email: user.email, role: user.role, name: user.name }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: 'Email and password are required' });
  }
  const normalizedEmail = email.toLowerCase().trim();

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ msg: 'Invalid email format' });
  }
  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ msg: 'User not registered' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid password' });

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, tokenSecret, { expiresIn: '7d' });

    res.json({ user: { id: user._id, email: user.email, role: user.role, name: user.name }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
};