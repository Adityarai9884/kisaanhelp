// routes/orders.js — Full order lifecycle for Phase 3
const express      = require('express');
const Order        = require('../models/Order');
const Crop         = require('../models/Crop');
const Notification = require('../models/Notification');
const { protect, requireRole } = require('../middleware/auth');
const router       = express.Router();

// ── Helper: create notification ───────────────
async function notify(userId, userUid, type, title, message, meta = {}) {
  try {
    await Notification.create({ userId, userUid, type, title, message, meta });
  } catch (_) {}
}

// ── POST /api/orders — buyer places an order ──
router.post('/', protect, requireRole('buyer', 'wholesaler'), async (req, res) => {
  try {
    const { cropId, quantity, buyerNote } = req.body;
    if (!cropId || !quantity)
      return res.status(400).json({ message: 'cropId and quantity are required' });

    const crop = await Crop.findById(cropId).populate('farmerId');
    if (!crop)         return res.status(404).json({ message: 'Crop not found' });
    if (crop.status !== 'active')
      return res.status(400).json({ message: 'Crop is no longer available' });
    if (quantity > crop.quantity)
      return res.status(400).json({ message: `Only ${crop.quantity} qtl available` });

    const pricePerQtl = crop.askedPrice;
    const totalAmount = pricePerQtl * quantity;

    const order = await Order.create({
      cropId:      crop._id,
      farmerId:    crop.farmerId._id,
      farmerUid:   crop.farmerUid,
      buyerId:     req.user._id,
      buyerUid:    req.user.uid,
      cropName:    crop.name,
      quantity,
      pricePerQtl,
      totalAmount,
      district:    crop.district,
      buyerNote:   buyerNote || '',
    });

    // Mark crop as pending
    crop.status = 'pending';
    await crop.save();

    // Notify farmer
    await notify(
      crop.farmerId._id, crop.farmerUid,
      'offer_received',
      '🛒 New Order Received',
      `${req.user.uid} wants to buy ${quantity} qtl of ${crop.name} for ₹${totalAmount.toLocaleString()}`,
      { orderId: order._id }
    );

    res.status(201).json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/orders/mine — buyer's own orders ─
router.get('/mine', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'farmer'
      ? { farmerId: req.user._id }
      : { buyerId:  req.user._id };

    const orders = await Order.find(filter)
      .populate('cropId', 'name quantity district')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/orders — admin sees all ──────────
router.get('/', protect, requireRole('admin', 'incharge'), async (req, res) => {
  try {
    const { district, status, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (district) filter.district = district;
    if (status)   filter.status   = status;
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await Order.countDocuments(filter);
    res.json({ orders, total });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/orders/:id ───────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('cropId').populate('farmerId', 'name uid mobile')
      .populate('buyerId', 'name uid mobile');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/orders/:id/confirm — farmer confirms ─
router.patch('/:id/confirm', protect, requireRole('farmer'), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, farmerId: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'pending')
      return res.status(400).json({ message: 'Order cannot be confirmed now' });

    order.status = 'confirmed';
    await order.save();

    // Update crop status to sold
    await Crop.findByIdAndUpdate(order.cropId, { status: 'sold' });

    // Notify buyer
    await notify(
      order.buyerId, order.buyerUid,
      'order_confirmed',
      '✅ Order Confirmed by Farmer',
      `Your order for ${order.quantity} qtl of ${order.cropName} has been confirmed. Total: ₹${order.totalAmount.toLocaleString()}`,
      { orderId: order._id }
    );

    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/orders/:id/reject — farmer rejects ─
router.patch('/:id/reject', protect, requireRole('farmer'), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, farmerId: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status    = 'cancelled';
    order.farmerNote = req.body.reason || '';
    await order.save();

    // Re-activate the crop
    await Crop.findByIdAndUpdate(order.cropId, { status: 'active' });

    // Notify buyer
    await notify(
      order.buyerId, order.buyerUid,
      'offer_rejected',
      '❌ Order Rejected by Farmer',
      `Your order for ${order.cropName} was not accepted. ${order.farmerNote ? 'Reason: ' + order.farmerNote : ''}`,
      { orderId: order._id }
    );

    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/orders/:id/payment — record payment ─
router.patch('/:id/payment', protect, requireRole('farmer', 'admin'), async (req, res) => {
  try {
    const { paidAmount, paymentMethod } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paidAmount    += Number(paidAmount || 0);
    order.paymentMethod  = paymentMethod || order.paymentMethod;
    order.paymentStatus  = order.paidAmount >= order.totalAmount ? 'paid'
                         : order.paidAmount > 0 ? 'partial' : 'unpaid';

    if (order.paymentStatus === 'paid') {
      order.status      = 'completed';
      order.completedAt = new Date();
      await notify(
        order.buyerId, order.buyerUid,
        'payment_received',
        '💰 Payment Recorded',
        `Payment of ₹${order.paidAmount.toLocaleString()} recorded for ${order.cropName}. Order completed!`,
        { orderId: order._id }
      );
    }

    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/orders/:id/cancel — buyer cancels ─
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'buyer' || req.user.role === 'wholesaler'
      ? { _id: req.params.id, buyerId: req.user._id }
      : { _id: req.params.id };

    const order = await Order.findOne(filter);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (['completed', 'cancelled'].includes(order.status))
      return res.status(400).json({ message: 'Cannot cancel this order' });

    order.status = 'cancelled';
    await order.save();

    // Re-activate crop
    await Crop.findByIdAndUpdate(order.cropId, { status: 'active' });

    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
