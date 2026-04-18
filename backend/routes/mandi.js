// routes/mandi.js — Daily mandi rates & stock inventory
const express    = require('express');
const MandiRate  = require('../models/MandiRate');
const Crop       = require('../models/Crop');
const { protect, requireRole } = require('../middleware/auth');
const router     = express.Router();

// GET /api/mandi/rates?district=Ayodhya — today's rates for a district
router.get('/rates', async (req, res) => {
  try {
    const { district } = req.query;
    const today = new Date().toISOString().split('T')[0];
    const filter = { date: today };
    if (district) filter.district = district;
    const rates = await MandiRate.find(filter).sort({ crop: 1 });

    // If no rates today, fall back to most recent
    if (rates.length === 0) {
      const latest = await MandiRate.find(district ? { district } : {})
        .sort({ date: -1 }).limit(20);
      return res.json(latest);
    }
    res.json(rates);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/mandi/rates — incharge publishes daily rates (bulk upsert)
router.post('/rates', protect, requireRole('incharge', 'admin'), async (req, res) => {
  try {
    const { district, rates } = req.body;
    if (!district || !Array.isArray(rates))
      return res.status(400).json({ message: 'district and rates[] are required' });

    const today = new Date().toISOString().split('T')[0];
    const ops = rates.map(r => ({
      updateOne: {
        filter: { district, crop: r.crop, date: today },
        update: { $set: { price: r.price, updatedBy: req.user.uid } },
        upsert: true,
      }
    }));
    await MandiRate.bulkWrite(ops);
    res.json({ message: `${rates.length} rates published for ${district} on ${today}` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/mandi/stock?district=Ayodhya — active crop inventory in mandi
router.get('/stock', protect, requireRole('incharge', 'admin'), async (req, res) => {
  try {
    const { district } = req.query;
    const filter = { status: 'active' };
    if (district) filter.district = district;
    const stock = await Crop.find(filter)
      .populate('farmerId', 'name uid')
      .sort({ createdAt: -1 });
    res.json(stock);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
