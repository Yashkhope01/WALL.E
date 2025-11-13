// backend/controllers/authController.js
/**
 * Controllers for authentication: register and login.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { email, password, role, name } = req.body; // Added role and name
  if (!email || !password || !role || !name) {
    return res.status(400).json({ msg: 'All fields are required' });
  }
  if (!['Citizen', 'Municipal', 'Admin'].includes(role)) {
    return res.status(400).json({ msg: 'Invalid role' });
  }
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ msg: 'Invalid email format' });
  }
  // Password strength (example: at least 8 chars)
  if (password.length < 8) {
    return res.status(400).json({ msg: 'Password must be at least 8 characters long' });
  }
  try {
    let user = await req.sequelize.models.User.findOne({ where: { email } });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await req.sequelize.models.User.create({ email, password: hashedPassword, role, name });

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name }, token }); // Added id and name
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
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ msg: 'Invalid email format' });
  }
  try {
    const user = await req.sequelize.models.User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ msg: 'User not registered' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid password' });

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name }, token }); // Added id and name
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
};