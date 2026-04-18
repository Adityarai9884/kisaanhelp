// routes/notifications.js — In-app notification system
const express      = require('express');
const Notification = require('../models/Notification');
const { protect }  = require('../middleware/auth');
const router       = express.Router();

// GET /api/notifications — get my notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ notifications: notifs, unreadCount });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true }
    );
    res.json({ message: 'Marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
