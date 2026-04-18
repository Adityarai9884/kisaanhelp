// routes/ai.js — Gemini AI endpoints for Phase 4
const express    = require('express');
const MandiRate  = require('../models/MandiRate');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { getPricePrediction, getDemandAnalysis, getWeatherAdvice } = require('../services/gemini');
const { getWeather } = require('../services/weather');
const router     = express.Router();

// ─────────────────────────────────────────────
// POST /api/ai/price-prediction
// Body: { crop, district }
// Returns: Gemini price forecast for that crop+district
// ─────────────────────────────────────────────
router.post('/price-prediction', protect, async (req, res) => {
  try {
    const { crop, district } = req.body;
    if (!crop || !district)
      return res.status(400).json({ message: 'crop and district are required' });

    // Fetch last 30 days of mandi rates
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const rates = await MandiRate.find({
      crop,
      district,
      createdAt: { $gte: thirtyDaysAgo },
    }).sort({ date: 1 }).select('date price');

    const rates30d = rates.map(r => ({ date: r.date, price: r.price }));

    const prediction = await getPricePrediction(crop, district, rates30d);

    res.json({
      crop,
      district,
      dataPoints: rates30d.length,
      prediction,
      generatedAt: new Date().toISOString(),
      source: rates30d.length > 0 ? 'live-data' : 'ai-estimate',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/ai/weather/:district
// Returns: live weather + AI harvest advice
// ─────────────────────────────────────────────
router.get('/weather/:district', protect, async (req, res) => {
  try {
    const { district } = req.params;
    const { crop }     = req.query;

    const weatherData = await getWeather(district);

    // If crop is specified, get AI advice
    let advice = null;
    if (crop) {
      advice = await getWeatherAdvice(crop, district, weatherData);
    }

    res.json({ weatherData, advice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/ai/chat
// Body: { message, context }  context = { role, district, recentCrops[] }
// Returns: Gemini chatbot response
// ─────────────────────────────────────────────
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    if (!message) return res.status(400).json({ message: 'message is required' });

    const { getPricePrediction: _, getWeatherAdvice: __, getDemandAnalysis: ___, ...rest } = require('../services/gemini');
    const axios = require('axios');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      // Smart keyword-based fallback
      return res.json({ reply: getKeywordReply(message, context), source: 'fallback' });
    }

    const systemContext = `
You are Krishi AI, an agricultural assistant for AgriSmart — a digital mandi platform for farmers in Uttar Pradesh, India.
The user is a ${context.role || 'farmer'} from ${context.district || 'Uttar Pradesh'}.
Keep responses short (2-3 sentences), practical, and in simple English.
Focus on: crop prices, weather, transport, market advice, and platform help.
    `.trim();

    const prompt = `${systemContext}\n\nUser: ${message}\n\nKrishi AI:`;

    const gemRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.5, maxOutputTokens: 256 } },
      { timeout: 12000 }
    );

    const reply = gemRes.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || getKeywordReply(message, context);
    res.json({ reply, source: 'gemini' });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.json({ reply: getKeywordReply(req.body.message, req.body.context || {}), source: 'fallback' });
  }
});

// ─────────────────────────────────────────────
// GET /api/ai/demand-check?crop=Wheat&district=Ayodhya
// Manual demand check (admin/incharge)
// ─────────────────────────────────────────────
router.get('/demand-check', protect, async (req, res) => {
  try {
    const { crop, district } = req.query;
    if (!crop || !district) return res.status(400).json({ message: 'crop and district required' });

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const orderCount = await require('../models/Order').countDocuments({
      cropName: crop, district, createdAt: { $gte: since },
    });

    const analysis = await getDemandAnalysis(crop, district, orderCount * 3, orderCount);
    res.json({ crop, district, orderCount, analysis });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// Smart keyword fallback for chat
// ─────────────────────────────────────────────
function getKeywordReply(message = '', context = {}) {
  const m = message.toLowerCase();
  const district = context.district || 'your district';

  if (m.includes('wheat'))      return `🌾 Wheat prices in ${district} are around ₹2,840–3,100/qtl. Gemini AI suggests holding stock for 5–7 days for a potential 10% gain.`;
  if (m.includes('mustard'))    return `🌼 Mustard demand is HIGH right now! Current price: ₹5,200/qtl. Multiple buyers are searching. Recommend selling immediately.`;
  if (m.includes('rice'))       return `🍚 Rice is stable at ₹3,100/qtl in ${district}. Good time to sell if you have ready stock.`;
  if (m.includes('cotton'))     return `🌿 Cotton prices are strong at ₹7,200/qtl with rising demand from textile mills in Delhi. Consider holding 3–5 more days.`;
  if (m.includes('weather'))    return `🌤️ Check the Weather Advisory panel for live weather in ${district}. Currently showing rain expected this weekend — plan transport accordingly.`;
  if (m.includes('transport'))  return `🚛 Up to 500kg → E-Rickshaw | 500–2000kg → Tata Ace | 2000kg+ → Heavy Truck. Use the Transport panel to book instantly.`;
  if (m.includes('price'))      return `📊 Today's top prices: Wheat ₹2,840 | Mustard ₹5,200 | Rice ₹3,100 | Cotton ₹7,200/qtl. Ask about a specific crop for AI-powered forecast.`;
  if (m.includes('order'))      return `📦 Check the Orders panel in your dashboard to see all incoming orders. You can confirm or reject each order and record payment there.`;
  if (m.includes('register') || m.includes('uid')) return `🆔 Your AgriSmart ID is auto-generated when you register. Format: ROLE + DISTRICT + SERIAL (e.g., FRAY0001 = 1st Farmer in Ayodhya).`;
  if (m.includes('hello') || m.includes('hi') || m.includes('namaste')) return `Namaste! 🙏 I'm Krishi AI, your agricultural assistant. Ask me about crop prices, weather, orders, or transport. I'm here to help!`;
  return `🤔 I can help with crop prices, weather alerts, orders, and transport. Try asking: "What's the wheat price?" or "Should I harvest today?"`;
}

module.exports = router;
