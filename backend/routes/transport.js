// routes/transport.js — Smart transport booking & gate management
const express   = require('express');
const Transport = require('../models/Transport');
const { protect, requireRole } = require('../middleware/auth');
const router    = express.Router();

// POST /api/transport/suggest — returns vehicle type (no auth)
router.post('/suggest', (req, res) => {
  const { kg } = req.body;
  if (!kg || isNaN(kg)) return res.status(400).json({ message: 'kg is required' });
  const vehicle = Transport.suggestVehicle(Number(kg));
  const label = {
    'e-rickshaw':   'E-Rickshaw / 3-Wheeler',
    'tata-ace':     'Tata Ace (Chota Hathi)',
    'heavy-truck':  'Heavy Duty Truck',
  }[vehicle];
  res.json({ kg: Number(kg), vehicle, label });
});

// POST /api/transport/book — farmer books transport
router.post('/book', protect, requireRole('farmer'), async (req, res) => {
  try {
    const { cropId, weightKg, toMandi } = req.body;
    if (!weightKg || !toMandi)
      return res.status(400).json({ message: 'weightKg and toMandi are required' });

    const vehicleType = Transport.suggestVehicle(Number(weightKg));
    const booking = await Transport.create({
      farmerId:     req.user._id,
      farmerUid:    req.user.uid,
      cropId:       cropId || null,
      weightKg:     Number(weightKg),
      vehicleType,
      fromDistrict: req.user.district,
      toMandi,
    });
    res.status(201).json(booking);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/transport/mine — farmer sees their own bookings
router.get('/mine', protect, requireRole('farmer'), async (req, res) => {
  try {
    const bookings = await Transport.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/transport/arrivals — incharge sees pending arrivals
router.get('/arrivals', protect, requireRole('incharge', 'admin'), async (req, res) => {
  try {
    const arrivals = await Transport.find({
      status: { $in: ['requested', 'confirmed', 'en-route'] }
    }).populate('farmerId', 'name uid district').populate('cropId', 'name quantity');
    res.json(arrivals);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/transport/:id/approve — incharge approves gate entry
router.patch('/:id/approve', protect, requireRole('incharge'), async (req, res) => {
  try {
    const t = await Transport.findByIdAndUpdate(
      req.params.id,
      { status: 'arrived', arrivedAt: new Date(), approvedBy: req.user.uid },
      { new: true }
    );
    if (!t) return res.status(404).json({ message: 'Booking not found' });
    res.json(t);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PATCH /api/transport/:id/reject — incharge rejects gate entry
router.patch('/:id/reject', protect, requireRole('incharge'), async (req, res) => {
  try {
    const t = await Transport.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!t) return res.status(404).json({ message: 'Booking not found' });
    res.json(t);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
