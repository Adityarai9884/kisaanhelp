// models/Transport.js — Mongoose Schema
const mongoose = require('mongoose');

const VEHICLE_TYPES = ['e-rickshaw', 'tata-ace', 'heavy-truck'];

const transportSchema = new mongoose.Schema({
  farmerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerUid:   { type: String, required: true },
  cropId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  weightKg:    { type: Number, required: true },
  vehicleType: { type: String, enum: VEHICLE_TYPES, required: true },
  fromDistrict:{ type: String, required: true },
  toMandi:     { type: String, required: true },
  status:      { type: String, enum: ['requested','confirmed','en-route','arrived','completed'], default: 'requested' },
  arrivedAt:   { type: Date },
  approvedBy:  { type: String },   // Incharge UID
}, { timestamps: true });

// ── Smart vehicle suggestion (static helper) ───
transportSchema.statics.suggestVehicle = function (kg) {
  if (kg <= 500)  return 'e-rickshaw';
  if (kg <= 2000) return 'tata-ace';
  return 'heavy-truck';
};

module.exports = mongoose.model('Transport', transportSchema);
