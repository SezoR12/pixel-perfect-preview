# B2B Complete Software Engineering Onboarding & Workflow Guide

**Document Reference:** `DOC_TECH_ONBOARDING_2026_04`  
**Classification:** Internal Developer Blueprint & Architecture Walkthrough  
**Target Community:** Tureep Full-Stack Engineers & Security Officers

---

## 🏛️ Welcome to Tureep AI+

As an accredited software engineer or compliance specialist joining the **Tureep Desk**, you are building the ultimate hybrid MENA cross-border commodity trade intelligence platform. This codebase operates an exceptionally high-performance stack architecture: **FastAPI (Python Backend)**, **TanStack Start with React Router & Vite (React 19 Frontend)**, **Tailwind CSS**, and **Supabase Enterprise**.

---

## 🚀 1. Pristine Workspace Initialization (Quick Start)

### 1.1 Clone the Active GitHub Repository
Pull the latest verified source code from your remote repository:
```bash
git clone https://github.com/SezoR12/pixel-perfect-preview.git tureep-ai-plus
cd tureep-ai-plus
```

### 1.2 Initialize the Highly Resilient Python FastAPI Backend
The backend operates inside isolated Python 3.11/3.12 virtual environments. Ensure your system does not execute synchronous queries over synchronous `psycopg2` --- we use fully decoupled multi-tenant `AsyncSession` setups.

```bash
# 1. Access backend folder
cd backend

# 2. Formulate isolated Python Virtual Environment (.venv is correctly ignored in .gitignore)
python3 -m venv .venv
source .venv/bin/activate

# 3. Shipped dependencies install (including slowapi, bleach, alembic, pytest)
pip install --upgrade pip
pip install -r requirements.txt

# 4. Initialize Database & Verify Connection
# Production must point to Supabase Transaction Pooler (*.pooler.supabase.com:6543)
# Local development securely falls back to in-memory SQLite (tureep_dev.db)
python -m app.seed
python app/supabase_verify.py
```

### 1.3 Implement Institutional Pre-Commit Hooks (`detect-secrets`)
To guarantee that you never commit live cryptographical keys or `.env` files into your remote branch:
```bash
# Execute directly from repository root
pip install pre-commit detect-secrets
pre-commit install
```
Your local Git tree will now automatically scan your staged modifications against `.secrets.baseline` prior to allowing a `git commit`.

### 1.4 Initialize the TanStack Start Frontend Runtime (`Bun` or `Node.js`)
We explicitly recommend **Bun** for lightning-fast module resolution and test runs, though standard `npm` / `Node.js` operates flawlessly.

```bash
# From repository root
bun install || npm install

# Execute Local Development Server with active Proxy mappings
VITE_API_BASE_URL="http://localhost:8000" bun run dev
```
The TanStack trade terminal will render instantly at `http://localhost:8080/` (or `:3000`).

---

## 🧪 2. Automated Testing Gatekeepers (Mandatory Pre-Push Checks)

Before declaring any feature epic complete or requesting a Pull Request evaluation, you MUST assert that your code clears our dual-mode automated automated test gatekeepers.

### 2.1 Full 25-Item Pytest Testing Suite (Backend Architecture)
Our authoritative Pytest framework (`backend/tests/`) asserts valid registration structures, rate limits, multi-tenant RLS gatekeepers, and XSS input regex rejections with absolute precision.

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v --cov=app --cov-report=html
```
*Target Metric:* Test coverage strictly above **80%+**. Shipped continuous Load assertions verifying p95 latency under **500 ms**.

### 2.2 Programmatic JS Route Tree Smoke Runner (Frontend Desk)
We enforce an automated 18-route Node.js verification script confirming every TanStack Start page loads perfectly with zero `"building..."` stalls indefinitely forever.

```bash
# From repository root
node tests/smoke-test.js
```
*Target Metric:* Exactly 18/18 routes returning `[PASS]` verified. Hitting the `/dashboard`, `/profile`, `/deals`, and `/workflow` screens must never return unhandled LocalStorage or session initialization Exceptions.

---

## 📐 3. Code Hardening Standards & Architecture Rules

### Rule 1: Never Summarize Away Cryptographic Strings or Exact API Paths
When authoring code, tests, or documentation, never use lazy comments like `/* key here */` or `/* exact error message */`. Provide self-contained newly rotated keys, exact environment variable names (`VITE_SUPABASE_URL`, `DATABASE_URL`), exact API Swagger paths (`/api/v1/auth/login`), and specific database check constraints (`quantity >= 0`).

### Rule 2: Absolute Institutional ML Honesty
Never inject copy or Swagger claims stating *"XGBoost production models"* or *"LSTM price predictions"*. Use museum-grade pure honest MENA operational phrases: **"Smart Trade Matching Engine"**, **"Rule-Based Heuristic Scoring"**, and **"Statistical Market Trends"**.

### Rule 3: Maintain Multilingual BiDi Mirroring LTR Contexts
When mixing Left-to-Right commercial brands (`Tureep AI+`, `$4.2B+`) inside Right-to-Left active commercial desks (`ar`, `fa`, `ku`), wrap active English brands or target numerals inside explicit isolation frames to prevent bidi punctuation flips (`"+AI تريب"`):
```tsx
// Shipped highly optimized Multilingual UI component execution:
<h1 className="text-foreground" dir={dir}>
  {t("trade.title")} <span dir="ltr" className="font-mono">Tureep AI+</span>
</h1>
```

**Happy Engineering! Let's automate cross-border trade end-to-end!**
