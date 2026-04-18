// models/Order.js — Full buyer-seller order lifecycle
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  cropId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  farmerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerUid:    { type: String, required: true },
  buyerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerUid:     { type: String, required: true },
  cropName:     { type: String, required: true },
  quantity:     { type: Number, required: true },
  pricePerQtl:  { type: Number, required: true },
  totalAmount:  { type: Number, required: true },
  district:     { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'payment_pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'bank'], default: 'cash' },
  paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
  paidAmount:    { type: Number, default: 0 },
  buyerNote:     { type: String },
  farmerNote:    { type: String },
  completedAt:   { type: Date },
}, { timestamps: true });

orderSchema.index({ farmerId: 1, status: 1 });
orderSchema.index({ buyerId:  1, status: 1 });
orderSchema.index({ district: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
