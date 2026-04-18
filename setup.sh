#!/bin/bash
# ─────────────────────────────────────────────
# AgriSmart — Phase 2 Setup Script
# Run this once after unzipping the project
# ─────────────────────────────────────────────
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${GREEN}🌿 AgriSmart — Phase 2 Setup${NC}"
echo "────────────────────────────────"

# ── Backend setup ─────────────────────────────
echo ""
echo -e "${YELLOW}[1/3] Installing backend dependencies...${NC}"
cd backend
npm install

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GREEN}✅ Created backend/.env from example${NC}"
  echo -e "${YELLOW}⚠️  Edit backend/.env and set your MONGO_URI before starting the server${NC}"
fi
cd ..

# ── Frontend setup ────────────────────────────
echo ""
echo -e "${YELLOW}[2/3] Installing frontend dependencies...${NC}"
cd frontend
npm install

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GREEN}✅ Created frontend/.env from example${NC}"
fi
cd ..

# ── Done ──────────────────────────────────────
echo ""
echo -e "${GREEN}[3/3] Setup complete!${NC}"
echo ""
echo "────────────────────────────────"
echo -e "  ${GREEN}To start the backend:${NC}"
echo "    cd backend && npm run dev"
echo ""
echo -e "  ${GREEN}To start the frontend (in a new terminal):${NC}"
echo "    cd frontend && npm start"
echo ""
echo -e "  ${YELLOW}Remember:${NC} Set MONGO_URI in backend/.env first!"
echo "  Get a free MongoDB Atlas cluster at https://www.mongodb.com/atlas"
echo "────────────────────────────────"
echo ""
