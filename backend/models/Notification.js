// models/Notification.js — In-app notifications for all roles
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userUid:   { type: String, required: true },
  type: {
    type: String,
    enum: ['offer_received', 'offer_accepted', 'offer_rejected',
           'order_confirmed', 'payment_received', 'demand_surge',
           'weather_alert', 'gate_approved', 'gate_rejected', 'rate_published'],
    required: true,
  },
  title:    { type: String, required: true },
  message:  { type: String, required: true },
  read:     { type: Boolean, default: false },
  link:     { type: String },           // which panel to open
  meta:     { type: mongoose.Schema.Types.Mixed }, // orderId, cropId etc
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
