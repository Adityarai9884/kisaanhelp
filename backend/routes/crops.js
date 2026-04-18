// routes/crops.js — Full CRUD for crop listings
const express  = require('express');
const Crop     = require('../models/Crop');
const { protect, requireRole } = require('../middleware/auth');
const router   = express.Router();

// GET /api/crops — browse active listings (public)
router.get('/', async (req, res) => {
  try {
    const { district, name, page = 1, limit = 20 } = req.query;
    const filter = { status: 'active' };
    if (district) filter.district = district;
    if (name)     filter.name = new RegExp(name, 'i');

    const crops = await Crop.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Crop.countDocuments(filter);
    res.json({ crops, total, page: Number(page) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/crops/mine — farmer's own listings
router.get('/mine', protect, requireRole('farmer'), async (req, res) => {
  try {
    const crops = await Crop.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
    res.json(crops);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/crops/:id — single crop detail
router.get('/:id', async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json(crop);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/crops — farmer lists a crop
router.post('/', protect, requireRole('farmer'), async (req, res) => {
  try {
    const crop = await Crop.create({
      ...req.body,
      farmerId:  req.user._id,
      farmerUid: req.user.uid,
      district:  req.user.district,
    });
    res.status(201).json(crop);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PATCH /api/crops/:id — farmer updates own listing
router.patch('/:id', protect, requireRole('farmer'), async (req, res) => {
  try {
    const crop = await Crop.findOne({ _id: req.params.id, farmerId: req.user._id });
    if (!crop) return res.status(404).json({ message: 'Not found or not your crop' });
    Object.assign(crop, req.body);
    await crop.save();
    res.json(crop);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/crops/:id — farmer removes listing
router.delete('/:id', protect, requireRole('farmer'), async (req, res) => {
  try {
    const crop = await Crop.findOneAndDelete({ _id: req.params.id, farmerId: req.user._id });
    if (!crop) return res.status(404).json({ message: 'Not found or not your crop' });
    res.json({ message: 'Crop listing removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/crops/:id/status — incharge/admin update status
router.patch('/:id/status', protect, requireRole('incharge', 'admin'), async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(crop);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
