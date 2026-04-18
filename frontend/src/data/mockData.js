// ═══════════════════════════════════
// mockData.js — All seed data
// Replace with real API calls in Phase 2
// ═══════════════════════════════════

export const ROLE_CODES   = { Farmer: 'FR', Wholesaler: 'WH', Buyer: 'BY', Incharge: 'IN', Admin: 'AD' };
export const DIST_CODES   = { Ayodhya: 'AY', Mathura: 'MT', Agra: 'AG', Delhi: 'DL' };
export const ROLE_NAMES   = { FR: 'Farmer', WH: 'Wholesaler', BY: 'Buyer', IN: 'Mandi Incharge', AD: 'Admin' };
export const DIST_NAMES   = { AY: 'Ayodhya', MT: 'Mathura', AG: 'Agra', DL: 'Delhi' };

// Demo users — map uid prefix to dashboard
export const DEMO_USERS = {
  'FRAY': { role: 'farmer',     name: 'Ramesh Kumar',   uid: 'FRAY0001', district: 'Ayodhya' },
  'WHMT': { role: 'wholesaler', name: 'Suresh Agarwal', uid: 'WHMT0512', district: 'Mathura' },
  'INDL': { role: 'incharge',   name: 'Vijay Singh',    uid: 'INDL0005', district: 'Delhi' },
};

// Live market crops
export const CROPS = [
  { id: 1, name: 'Wheat',     farmer: 'FRAY0001', qty: '45 Qtl',  price: 2840, district: 'Ayodhya', trend: '+10%', up: true  },
  { id: 2, name: 'Mustard',   farmer: 'FRAY0034', qty: '20 Qtl',  price: 5200, district: 'Mathura', trend: '+5%',  up: true  },
  { id: 3, name: 'Rice',      farmer: 'FRAY0089', qty: '60 Qtl',  price: 3100, district: 'Agra',    trend: '-2%',  up: false },
  { id: 4, name: 'Sugarcane', farmer: 'FRAY0012', qty: '100 Qtl', price: 380,  district: 'Ayodhya', trend: '+1%',  up: true  },
  { id: 5, name: 'Cotton',    farmer: 'FRAY0056', qty: '35 Qtl',  price: 7200, district: 'Delhi',   trend: '+8%',  up: true  },
  { id: 6, name: 'Soybean',   farmer: 'FRAY0078', qty: '25 Qtl',  price: 4500, district: 'Mathura', trend: '-3%',  up: false },
];

// Price ticker data
export const TICKER_ITEMS = [
  { crop: 'WHEAT',     price: '₹2,840/qtl', change: '+3.2%', up: true  },
  { crop: 'MUSTARD',   price: '₹5,200/qtl', change: '+5.1%', up: true  },
  { crop: 'RICE',      price: '₹3,100/qtl', change: '-1.2%', up: false },
  { crop: 'SUGARCANE', price: '₹380/qtl',   change: '+0.8%', up: true  },
  { crop: 'COTTON',    price: '₹7,200/qtl', change: '+8.4%', up: true  },
  { crop: 'SOYBEAN',   price: '₹4,500/qtl', change: '-3.1%', up: false },
  { crop: 'TOMATO',    price: '₹2,100/qtl', change: '+12.0%',up: true  },
  { crop: 'ONION',     price: '₹1,800/qtl', change: '-4.5%', up: false },
];

// AI price predictions per crop
export const PRICE_PREDICTIONS = {
  Wheat:     { range: '₹2,800 – ₹3,100', note: '📈 Upward trend — Consider holding 5 days', action: 'HOLD' },
  Rice:      { range: '₹3,000 – ₹3,300', note: '📊 Stable market — Good time to sell',       action: 'SELL' },
  Mustard:   { range: '₹5,000 – ₹5,500', note: '🔥 High demand — Sell immediately!',          action: 'SELL NOW' },
  Sugarcane: { range: '₹350 – ₹420',     note: '➡️ Flat market, no strong signal',            action: 'NEUTRAL' },
  Cotton:    { range: '₹7,000 – ₹7,500', note: '📈 Strong demand from Delhi buyers',          action: 'HOLD' },
  Soybean:   { range: '₹4,200 – ₹4,800', note: '📉 Slight downtrend — Sell soon',             action: 'SELL' },
};

// 30-day wheat price history (for chart)
export const WHEAT_PRICES_30D = [
  2600,2620,2590,2650,2680,2700,2720,2690,2710,2740,
  2730,2760,2780,2800,2820,2840,2860,2900,2880,2920,
  2940,2960,2980,3020,3000,3040,3060,3080,3100,3120
];

// Transport vehicle rules
export const TRANSPORT_VEHICLES = [
  { id: 'v1', emoji: '🛺', name: 'E-Rickshaw / 3-Wheeler', range: 'Up to 500 kg',  maxKg: 500  },
  { id: 'v2', emoji: '🚐', name: 'Tata Ace (Chota Hathi)', range: '500–2000 kg',   maxKg: 2000 },
  { id: 'v3', emoji: '🚛', name: 'Heavy Duty Truck',       range: '2000 kg+',      maxKg: Infinity },
];

export function getVehicle(kg) {
  return TRANSPORT_VEHICLES.find(v => kg <= v.maxKg);
}

// Mandi gate arrivals
export const GATE_ARRIVALS = [
  { id: 'FRAY0247', crop: 'Wheat',   qty: '45 Qtl', vehicle: 'Tata Ace',    time: '10:32 AM', status: 'waiting' },
  { id: 'FRAY0089', crop: 'Mustard', qty: '20 Qtl', vehicle: 'E-Rickshaw',  time: '11:05 AM', status: 'waiting' },
  { id: 'FRAY0012', crop: 'Rice',    qty: '60 Qtl', vehicle: 'Heavy Truck', time: '09:14 AM', status: 'approved' },
];

// Daily mandi rates
export const MANDI_RATES = [
  { crop: 'Wheat',     price: 2840 },
  { crop: 'Rice',      price: 3100 },
  { crop: 'Mustard',   price: 5200 },
  { crop: 'Sugarcane', price: 380  },
  { crop: 'Cotton',    price: 7200 },
  { crop: 'Soybean',   price: 4500 },
];

// AI chat replies
export const CHAT_REPLIES = {
  wheat:     '🌾 Wheat price in Ayodhya today: ₹2,840/qtl. Trend: 📈 Upward. Gemini AI suggests holding stock for 5–7 days for a ~10% gain.',
  mustard:   '🌼 Mustard demand is HIGH right now in Mathura. 12 buyers searching. Current: ₹5,200/qtl. Recommendation: Sell Now.',
  rice:      '🍚 Rice prices are stable at ₹3,100/qtl in Agra. Good time to sell if you have ready stock.',
  weather:   '🌤️ Today: Sunny 32°C in Ayodhya. Thursday: 🌧️ Heavy rain. Complete harvesting by Thursday morning.',
  harvest:   '⚡ Weather advisory: Heavy rain predicted this Friday in Ayodhya. Harvest by Thursday to avoid crop damage.',
  transport: '🚛 Up to 500kg → E-Rickshaw. 500–2000kg → Tata Ace. 2000kg+ → Heavy Truck. Want me to book one?',
  price:     '📊 Today: Wheat ₹2,840 | Mustard ₹5,200 | Rice ₹3,100 | Cotton ₹7,200. Ask about a specific crop for AI forecast.',
  default:   '🤔 I can help with crop prices, weather, and transport. Try: "wheat price", "weather today", or "book transport".',
};

// Farmer's own mock crops (fallback when API is not connected)
export const MY_CROPS = [
  { name:'Wheat',   harvested:'Apr 2, 2026',  qty:45, listed:2900, ai:'₹2,840–3,100', status:'active'  },
  { name:'Mustard', harvested:'Mar 28, 2026', qty:20, listed:5200, ai:'₹5,000–5,500', status:'pending' },
  { name:'Rice',    harvested:'Mar 20, 2026', qty:60, listed:3100, ai:'₹3,000–3,200', status:'sold'    },
];
