// models/MandiRate.js — Daily mandi rates per crop per district
const mongoose = require('mongoose');

const mandiRateSchema = new mongoose.Schema({
  district:  { type: String, required: true },
  crop:      { type: String, required: true },
  price:     { type: Number, required: true },   // ₹ per quintal
  updatedBy: { type: String },                   // Incharge UID
  date:      { type: String, required: true },   // YYYY-MM-DD
}, { timestamps: true });

// Compound index — one rate per district+crop+date
mandiRateSchema.index({ district: 1, crop: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MandiRate', mandiRateSchema);
