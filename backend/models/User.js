// models/User.js — Mongoose Schema
// ─────────────────────────────────────────────
// Includes the custom UID generation logic (FRAY0001 system)
// ─────────────────────────────────────────────
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── Role & District maps ───────────────────────
const ROLE_CODES = { farmer: 'FR', wholesaler: 'WH', buyer: 'BY', incharge: 'IN', admin: 'AD' };
const DIST_CODES = { Ayodhya: 'AY', Mathura: 'MT', Agra: 'AG', Delhi: 'DL' };

// ── Schema ─────────────────────────────────────
const userSchema = new mongoose.Schema({
  uid:       { type: String, unique: true },          // e.g. FRAY0001
  role:      { type: String, enum: Object.keys(ROLE_CODES), required: true },
  district:  { type: String, enum: Object.keys(DIST_CODES), required: true },
  name:      { type: String, required: true },
  mobile:    { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

// ── Auto-generate UID before save ──────────────
userSchema.pre('save', async function (next) {
  if (this.uid) return next(); // already set

  const roleCode = ROLE_CODES[this.role];
  const distCode = DIST_CODES[this.district];

  // Count existing users with same role + district
  const count = await mongoose.model('User').countDocuments({
    role: this.role,
    district: this.district,
  });

  const serial = String(count + 1).padStart(4, '0');
  this.uid = `${roleCode}${distCode}${serial}`; // e.g. FRAY0001
  next();
});

// ── Hash password before save ──────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Compare password ───────────────────────────
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// ── Hide password in JSON ──────────────────────
userSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.password; return ret; },
});

module.exports = mongoose.model('User', userSchema);
