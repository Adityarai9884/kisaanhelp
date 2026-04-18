# AgriSmart — 4-Phase Development Roadmap

---

## ✅ Phase 1 — Frontend (COMPLETE)
**Goal:** Full interactive UI with mock data. No backend needed.

### Deliverables
- React app with proper folder structure (components / pages / styles / data)
- Landing page (hero, features, roles, UID explainer, stats)
- Live price ticker
- Farmer Dashboard (overview, add crop, my crops, transport, AI price, weather)
- Wholesaler Dashboard (browse market, orders, demand alerts)
- Mandi Incharge Dashboard (gate entry, daily rates, stock inventory)
- Market Page (filterable crop listings)
- Transport Page (smart vehicle calculator)
- Smart ID (UID) Page with interactive generator
- AI Chatbot (Krishi AI — keyword-based, Phase 1)
- Auth Modal (login / register with role selector)
- Toast notifications

### How to Run
```bash
cd frontend
npm install
npm start
```

---

## ✅ Phase 2 — Backend Foundation (COMPLETE)
**Goal:** Real database, real auth, real auto-generated UIDs.

### Deliverables
- `backend/server.js` — Express server with CORS, error handler, request logger
- `backend/models/User.js` — Mongoose schema with auto UID generation (FRAY0001 logic)
- `backend/models/Crop.js` — Crop listings schema with district indexing
- `backend/models/Transport.js` — Transport bookings with vehicle suggestion helper
- `backend/models/MandiRate.js` — Daily mandi rates per crop per district
- `backend/models/Order.js` — Order model for Phase 3
- `backend/routes/auth.js` — Register + Login (UID or mobile) + /me endpoint
- `backend/routes/crops.js` — Full CRUD: create, list, mine, update, delete, status
- `backend/routes/transport.js` — Suggest vehicle, book, arrivals, approve, reject
- `backend/routes/mandi.js` — Get today's rates, publish rates, stock inventory
- `backend/routes/users.js` — Profile, update, UID lookup, admin list
- `backend/middleware/auth.js` — JWT protect + requireRole guard
- `frontend/src/services/api.js` — Central API service (all fetch calls)
- `frontend/src/context/AuthContext.jsx` — Global auth state with React Context
- `App.jsx` upgraded — uses real AuthContext, real login/register
- `AuthModal.jsx` upgraded — sends real payloads {name, mobile, password, role, district}
- `MarketPage.jsx` upgraded — fetches real crops from /api/crops
- `FarmerDashboard.jsx` upgraded — real crop list/submit, real transport booking
- `InchargeDashboard.jsx` upgraded — real gate approve/reject, real rate publishing
- `setup.sh` — one-command install script for the whole project
- `.env.example` files for both frontend and backend
- Graceful fallback to mock data when backend is offline

---

## 🔄 Phase 3 — Marketplace & Orders
**Goal:** Full buyer-seller flow end to end.

### Tasks
- [ ] Crop listing CRUD (farmer creates, buyer sees, wholesaler buys)
- [ ] Order model: `Order.js` with `status: pending → payment → completed`
- [ ] Mandi Incharge: live gate entry pulls from real Transport DB
- [ ] Daily mandi rates stored in MongoDB, fetched on dashboard load
- [ ] Notifications model: demand surge alerts stored and sent to farmers
- [ ] Real-time updates using Socket.io (optional)
- [ ] Payment status tracking (no payment gateway yet — just status flags)

---

## 🔄 Phase 4 — AI Integration + Launch
**Goal:** The "Smart" part — Gemini AI live.

### Tasks
- [ ] Gemini API key setup (`GEMINI_API_KEY` in `.env`)
- [ ] Price Prediction Engine:
  - Pull last 30 days of mandi rates from DB
  - Build prompt: `"Given these Mandi rates for Wheat in Ayodhya: [data], predict next week's price and give a sell/hold recommendation."`
  - Return structured JSON: `{ predictedPrice, trend, recommendation, reasoning }`
- [ ] Weather Integration:
  - Fetch weather via OpenWeatherMap API for farmer's district
  - Feed into Gemini: `"Weather in Ayodhya: [data]. What should the farmer do with their Mustard crop?"`
- [ ] Demand Surge Alerts:
  - Cron job every hour: count buyer searches per crop per district
  - If threshold exceeded → push notification to all farmers in that district
- [ ] Krishi AI chatbot wired to real Gemini API (replace keyword stubs)
- [ ] Final testing, deployment (Vercel frontend + Railway/Render backend)

---

## 🏁 Success Metric (from spec)
> A farmer in Ayodhya (ID: FRAY001) should be able to list 10 Quintals of Rice,
> see an AI-predicted price, and have a truck suggested automatically —
> **all within 2 minutes.**

---

## ✅ Phase 3 — Marketplace & Orders (COMPLETE)
**Goal:** Full buyer-seller flow end to end.

### Deliverables

**Backend:**
- `models/Order.js` — full order lifecycle (pending → confirmed → payment → completed)
- `models/Notification.js` — in-app notifications for all roles
- `routes/orders.js` — place, confirm, reject, cancel, payment recording
- `routes/notifications.js` — get, mark read, mark all read
- `server.js` upgraded — /api/orders and /api/notifications routes added

**Frontend:**
- `components/NotificationBell.jsx` — live bell with unread badge, auto-polls every 30s
- `components/OrderCard.jsx` — reusable order display with actions per role
- `components/PaymentModal.jsx` — record cash/UPI/bank payments with progress bar
- `pages/farmer/FarmerDashboard.jsx` — Orders panel: confirm/reject incoming orders, record payments
- `pages/wholesaler/WholesalerDashboard.jsx` — Browse market, enter qty, place real orders, track them
- `services/api.js` — ordersAPI and notificationsAPI added

### Full Order Flow
1. Wholesaler browses market → enters quantity → clicks Place Order
2. Order created in MongoDB with status "pending"
3. Farmer gets notification 🔔
4. Farmer opens Orders panel → Confirm or Reject
5. If confirmed → crop marked sold, buyer notified
6. Farmer records payment → progress bar updates
7. On full payment → order marked completed automatically

---

## ✅ Phase 4 — AI Integration + Launch (COMPLETE)
**Goal:** Real Gemini AI, live weather, demand cron, and production-ready.

### New backend files (4)
- `services/gemini.js` — Gemini API wrapper: price prediction, demand analysis, weather advice, chatbot. Includes realistic fallback data when API key not set.
- `services/weather.js` — OpenWeatherMap integration for all 4 districts (Ayodhya, Mathura, Agra, Delhi). Falls back to realistic mock weather.
- `services/demandCron.js` — Hourly cron job. Detects order surges per crop+district, calls Gemini for analysis, auto-notifies farmers.
- `routes/ai.js` — 4 endpoints: `/price-prediction`, `/weather/:district`, `/chat`, `/demand-check`
- `server.js` — Updated to Phase 4. Starts demand cron on boot. `/api/health` shows Gemini + weather API status.
- `backend/package.json` — Added `node-cron` and `axios` dependencies.

### New frontend files (3)
- `pages/AIPricePage.jsx` — Full Gemini price prediction UI. Select crop + district → get predicted price, range, trend, sell/hold recommendation, reasoning.
- `pages/WeatherPage.jsx` — Live weather for all districts + AI harvest/transport advice from Gemini.
- `components/AIChat.jsx` — Upgraded to real Gemini chatbot via backend. Has quick action buttons, shows "Gemini" source tag. Falls back to keywords if offline.

### Upgraded files (4)
- `Navbar.jsx` — Added "🤖 AI Price" and "🌤️ Weather" nav links.
- `App.jsx` — Added routes for `ai-price` and `weather` pages, passes user to AIChat.
- `FarmerDashboard.jsx` — Price Forecast panel now calls real Gemini API. Weather panel shows live weather + AI advice.
- `services/api.js` — Added `aiAPI` with price-prediction, weather, chat, demand-check calls.

### Phase 4 setup (2 API keys needed)
```
# backend/.env — add these two lines:
GEMINI_API_KEY=your_key_from_aistudio.google.com
WEATHER_API_KEY=your_key_from_openweathermap.org
```
Both have free tiers — no credit card needed for basic usage.

### What works without API keys
Everything still works in demo/offline mode:
- Gemini → returns pre-built realistic fallback predictions
- Weather → returns realistic mock weather for each district
- Chatbot → falls back to smart keyword replies
- Demand cron → still runs but analysis uses fallback

### Full project summary
| Phase | Status | What it adds |
|-------|--------|--------------|
| 1 | ✅ Done | Full React frontend, all dashboards, mock data |
| 2 | ✅ Done | MongoDB, JWT auth, real UID generation, API wiring |
| 3 | ✅ Done | Order lifecycle, notifications, payment tracking |
| 4 | ✅ Done | Gemini AI, live weather, demand cron, real chatbot |
