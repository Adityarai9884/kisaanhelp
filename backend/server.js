// server.js — AgriSmart Express Server (Phase 4 — Final)
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app = express();

// ── Middleware ────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ── Routes ────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/crops',         require('./routes/crops'));
app.use('/api/transport',     require('./routes/transport'));
app.use('/api/mandi',         require('./routes/mandi'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ai',            require('./routes/ai'));

// ── Health check ──────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    phase: 4,
    message: 'AgriSmart API — Phase 4 (AI + Weather + Cron)',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    gemini: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here',
    weather: !!process.env.WEATHER_API_KEY && process.env.WEATHER_API_KEY !== 'your_openweather_api_key_here',
  });
});

// ── 404 handler ───────────────────────────────
app.use((req, res) => res.status(404).json({ message: `Route ${req.path} not found` }));

// ── Global error handler ──────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Connect DB then start ─────────────────────
const PORT      = process.env.PORT      || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agrismart';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected:', MONGO_URI.split('@').pop() || 'localhost');
    app.listen(PORT, () => {
      console.log(`🌿 AgriSmart API  →  http://localhost:${PORT}`);
      console.log(`📋 Health check   →  http://localhost:${PORT}/api/health`);

      // Start demand surge cron job
      const { startDemandCron } = require('./services/demandCron');
      startDemandCron();
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
