# Tureep AI+

AI-powered B2B trade platform connecting sellers in Iraq/Iran to buyers in Turkey and global markets. This repo implements the **Phase 1 MVP** of the Tureep AI+ specification: user authentication, product/demand management, AI-powered pre-deal matching, and a tiered Master Account priority system.

## Architecture

- **Frontend:** TanStack Start + Vite + React + TypeScript + Tailwind CSS (existing Lovable template, extended with trade terminal pages)
- **Backend:** FastAPI (Python) + SQLAlchemy + Pydantic
- **Database:** PostgreSQL (production) / SQLite (local dev) — configurable via `DATABASE_URL`
- **Queue:** Redis (prepared for future notifications/priority queue)
- **AI Matching:** Rule-based scoring engine with weighted price, distance, reputation, urgency, and category alignment
- **Orchestration:** Docker Compose for PostgreSQL, Redis, backend, and frontend

## Project Structure

```
pixel-perfect-preview/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── ai/matching.py   # AI matching engine
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── security.py      # JWT + bcrypt auth
│   │   ├── routers/         # API routes (auth, users, products, demands, deals)
│   │   └── main.py          # FastAPI app entrypoint
│   ├── requirements.txt
│   ├── Dockerfile
│   └── seed.py              # Demo data seeding
├── docker-compose.yml
├── Dockerfile.frontend
├── src/                     # TanStack Start frontend
│   ├── lib/api.ts           # API client
│   ├── routes/              # Pages (login, dashboard, products, pre-deals)
│   └── routeTree.gen.ts     # TanStack route tree
└── .env.example
```

## Quick Start (Local Development)

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# SQLite is used by default for local dev (see backend/.env)
python -m app.seed
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Connect to Supabase (Production Database)

The `backend/.env` file is already configured with the Supabase connection string:

```env
DATABASE_URL=postgresql://postgres:Syriatel%4075%40@db.nfzowljlswwbfdzitkrc.supabase.co:5432/postgres?sslmode=require
```

The password is URL-encoded (`@` → `%40`).

**To run migrations and seed data on Supabase, execute from a machine with internet access:**

```bash
cd backend
source .venv/bin/activate
python -m app.seed
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

> **Note:** This sandbox environment has outbound network restrictions, so the Supabase connection could not be tested here. Run the commands above on your local machine or a server with internet access. If Supabase still blocks direct connections, use the **Connection Pooler** URL from your Supabase dashboard instead.

### Frontend

```bash
# From repo root
npm install
VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

The frontend will be available at `http://localhost:8080/` (or `3000` depending on the port setup).

### Docker Compose (Full Stack)

```bash
docker-compose up --build
```

This starts PostgreSQL, Redis, backend (`:8000`), and frontend (`:3000`).

## Demo Accounts

Seeded by `backend/app/seed.py`:

| Email | Password | Role | Tier |
|---|---|---|---|
| seller.iraq@tureep.ai | password123 | Seller (Iraq) | Silver |
| buyer.turkey@tureep.ai | password123 | Buyer (Turkey) | Gold |
| seller.iran@tureep.ai | password123 | Seller (Iran) | Bronze |
| buyer.global@tureep.ai | password123 | Buyer (Turkey) | Platinum |

## Implemented MVP Features

- [x] User registration & JWT login
- [x] Master Account tier system (Free, Bronze, Silver, Gold, Platinum, Black)
- [x] Product CRUD (sellers)
- [x] Demand CRUD (buyers)
- [x] AI matching engine with scoring (price, distance, reputation, urgency, category)
- [x] Pre-deal generation with suggested price, shipping cost, payment terms, expiry
- [x] Tier-based pre-deal visibility delay (Free +120h → Black instant)
- [x] Accept/reject pre-deal workflow
- [x] Dashboard with stats and active pre-deals
- [x] Docker Compose setup

## Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login (form-data) |
| GET | `/api/auth/me` | Current user |
| GET | `/api/users/dashboard` | Dashboard stats |
| GET | `/api/products/` | List products |
| POST | `/api/products/` | Create product |
| GET | `/api/demands/` | List demands |
| POST | `/api/demands/` | Create demand |
| GET | `/api/deals/pre-deals` | List visible pre-deals for user |
| POST | `/api/deals/generate-pre-deals` | Run AI matching and create pre-deals |
| POST | `/api/deals/pre-deals/{id}/{accept\|reject}` | Accept/reject a pre-deal |
| POST | `/api/deals/match` | Run matching without creating deals |

## Next Steps (Roadmap)

1. **Payments & Escrow:** Integrate Stripe + L/C/D/P workflows
2. **Logistics:** DHL / Maersk shipping quotes and tracking
3. **Notifications:** Firebase push, email (SendGrid), WebSocket in-app alerts
4. **Compliance:** OFAC sanctions screening + Iraq-Turkey FTA tariff rules
5. **ML Models:** Price prediction (LSTM), demand forecasting (Prophet), fraud detection
6. **Auctions & Long-term Contracts:** Enterprise features
7. **Multi-market Expansion:** Multi-currency, multi-language, additional regions

## Security Notes

- The `SECRET_KEY` in the provided `.env` files is a development-only value. Change it in production.
- The GitHub token used to clone this repo was exposed in the chat. **Revoke/regenerate it immediately** in GitHub Settings → Developer settings → Personal access tokens.
