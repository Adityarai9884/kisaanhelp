// routes/users.js — User profile & lookup
const express = require('express');
const User    = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');
const router  = express.Router();

// GET /api/users/me — current user profile
router.get('/me', protect, (req, res) => res.json(req.user));

// PATCH /api/users/me — update own profile
router.patch('/me', protect, async (req, res) => {
  try {
    const allowed = ['name', 'mobile'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json(user);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/users/:uid — look up any user by UID (incharge/admin only)
router.get('/:uid', protect, requireRole('incharge', 'admin'), async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid.toUpperCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/users — list all users (admin only)
router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const { role, district } = req.query;
    const filter = {};
    if (role)     filter.role = role;
    if (district) filter.district = district;
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
