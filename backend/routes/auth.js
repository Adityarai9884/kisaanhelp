// routes/auth.js — Register, Login, Me
console.log("🔥 AUTH.JS LOADED");
const express        = require('express');
const jwt            = require('jsonwebtoken');
const User           = require('../models/User');
const { protect }    = require('../middleware/auth');
const router         = express.Router();

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  console.log("✅ REGISTER ROUTE HIT");
   console.log("🚀 REGISTER API CALLED");
  try {
    const { name, mobile, password, role, district } = req.body;

    if (!name || !mobile || !password || !role || !district)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ mobile });
    if (exists) return res.status(409).json({ message: 'Mobile already registered' });

    const user  = await User.create({ name, mobile, password, role, district });
    const token = signToken(user._id);

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login  (accepts UID or mobile)
router.post('/login', async (req, res) => {
  try {
    const { uid, mobile, password } = req.body;

    if ((!uid && !mobile) || !password)
      return res.status(400).json({ message: 'UID/mobile and password required' });

    const query = uid ? { uid: uid.toUpperCase() } : { mobile };
    const user  = await User.findOne(query).select('+password');

    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isActive)
      return res.status(403).json({ message: 'Account suspended' });

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me  — returns logged-in user from token
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
