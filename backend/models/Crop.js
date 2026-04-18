// models/Crop.js — Mongoose Schema
const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farmerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerUid:   { type: String, required: true },          // denormalized for fast display
  name:        { type: String, required: true },          // Wheat, Rice, Mustard…
  quantity:    { type: Number, required: true },          // in Quintals
  grade:       { type: String, enum: ['A','B','C'], default: 'A' },
  harvestDate: { type: Date,   required: true },
  district:    { type: String, required: true },
  askedPrice:  { type: Number },                          // ₹/qtl set by farmer
  aiSuggestedPrice: { type: Number },                     // from Gemini (Phase 4)
  status:      { type: String, enum: ['active','sold','pending','expired'], default: 'active' },
  transportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transport' },
}, { timestamps: true });

// Index for fast district + crop filtering
cropSchema.index({ district: 1, name: 1, status: 1 });

module.exports = mongoose.model('Crop', cropSchema);
