# 🌿 AgriSmart — AI-Powered Digital Mandi System

## Phase 2 — Backend + Database integrated

## Project Structure
```
agrismart/
├── setup.sh                ← Run this first after unzipping
├── frontend/               ← React app (Phase 1 UI + Phase 2 API wiring)
│   ├── .env.example        ← Copy to .env
│   ├── public/index.html
│   └── src/
│       ├── index.js
│       ├── App.jsx         ← Uses real AuthContext (Phase 2)
│       ├── context/
│       │   └── AuthContext.jsx   ← Global auth state + JWT
│       ├── services/
│       │   └── api.js            ← All fetch() calls (Phase 2)
│       ├── data/
│       │   └── mockData.js       ← Fallback when backend offline
│       ├── styles/
│       │   ├── globals.css
│       │   └── components.css
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── PriceTicker.jsx
│       │   ├── AIChat.jsx
│       │   ├── AuthModal.jsx     ← Sends real payloads (Phase 2)
│       │   ├── Toast.jsx
│       │   ├── TransportCalc.jsx
│       │   └── UIDGenerator.jsx
│       └── pages/
│           ├── Landing.jsx
│           ├── MarketPage.jsx          ← Fetches real crops
│           ├── TransportPage.jsx
│           ├── UIDPage.jsx
│           ├── farmer/FarmerDashboard.jsx      ← Real crop CRUD
│           ├── wholesaler/WholesalerDashboard.jsx
│           └── incharge/InchargeDashboard.jsx  ← Real gate entry
│
├── backend/                ← Node.js + Express + MongoDB
│   ├── .env.example        ← Copy to .env, fill MONGO_URI
│   ├── server.js           ← Express server
│   ├── models/
│   │   ├── User.js         ← Auto UID generation (FRAY0001)
│   │   ├── Crop.js
│   │   ├── Transport.js
│   │   ├── MandiRate.js    ← Daily rates
│   │   └── Order.js        ← Phase 3
│   ├── routes/
│   │   ├── auth.js         ← /api/auth/register + /login + /me
│   │   ├── crops.js        ← Full CRUD
│   │   ├── users.js        ← Profile + UID lookup
│   │   ├── transport.js    ← Booking + gate entry
│   │   └── mandi.js        ← Daily rates + stock
│   └── middleware/
│       └── auth.js         ← JWT protect + requireRole
│
└── docs/
    └── PHASES.md
```

## Quick Start

### Step 1 — One-time setup
```bash
chmod +x setup.sh && ./setup.sh
```

### Step 2 — Configure MongoDB
Edit `backend/.env`:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/agrismart
JWT_SECRET=your_long_random_secret
```
Get a free cluster at https://www.mongodb.com/atlas (free tier, no credit card)

### Step 3 — Start both servers

Terminal 1 (backend):
```bash
cd backend && npm run dev
# Runs on http://localhost:5000
```

Terminal 2 (frontend):
```bash
cd frontend && npm start
# Runs on http://localhost:3000
```

## How Phase 2 works

| Feature | Phase 1 | Phase 2 |
|---------|---------|---------|
| Auth | Demo UIDs hardcoded | Real JWT from MongoDB |
| UID generation | Frontend random | Backend auto-increments |
| Crop listing | Mock data | POST to /api/crops |
| Market browse | Mock data | GET /api/crops |
| Gate entry | Local state | PATCH /api/transport/:id/approve |
| Daily rates | Local state | POST /api/mandi/rates |
| Password | None | bcryptjs hashed |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Register new user, get UID + JWT |
| POST | /api/auth/login | — | Login with UID/mobile + password |
| GET | /api/auth/me | JWT | Get current user |
| GET | /api/crops | — | Browse active crop listings |
| POST | /api/crops | Farmer | List a new crop |
| GET | /api/crops/mine | Farmer | My own listings |
| POST | /api/transport/suggest | — | Get vehicle for given weight |
| POST | /api/transport/book | Farmer | Book transport |
| GET | /api/transport/arrivals | Incharge | Pending gate arrivals |
| PATCH | /api/transport/:id/approve | Incharge | Approve gate entry |
| GET | /api/mandi/rates | — | Today's mandi prices |
| POST | /api/mandi/rates | Incharge | Publish daily rates |

## Offline / Demo Mode
The frontend gracefully falls back to mock data if the backend is not running.
All UI functionality works without a database — errors are caught silently.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React.js, CSS Variables |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| AI (Phase 4) | Google Gemini API |
