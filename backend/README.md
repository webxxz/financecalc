# FinanceCalc Backend (FastAPI)

Production-oriented backend scaffold for FinanceCalc.app.

## Features

- Modular architecture (`routers`, `services`, `schemas`, `ai`, `utils`)
- Calculator APIs with structured JSON response format
- ExchangeRate-API integration with TTL caching
- AI assistant tool-router (OpenAI primary, Claude fallback, deterministic backup parser)
- Firebase Auth token verification + Firestore persistence helpers
- Contact API integration with Resend + spam/rate-limit guardrails
- Security middleware (CORS, host filtering, request-size checks, rate limiting)

## Run locally

```bash
cd /home/runner/work/financecalc/financecalc/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Core endpoints

- `GET /api/health`
- `POST /api/emi`
- `POST /api/sip`
- `POST /api/mortgage`
- `POST /api/tax`
- `POST /api/retirement`
- `POST /api/exchange-rate`
- `POST /api/ai/assistant`
- `POST /api/contact`
- `POST /api/user/calculations` (Firebase Bearer token required)
- `GET /api/user/calculations` (Firebase Bearer token required)
- `POST /api/user/goals` (Firebase Bearer token required)
- `GET /api/user/goals` (Firebase Bearer token required)
- `PATCH /api/user/goals/{goal_id}` (Firebase Bearer token required)
- `DELETE /api/user/goals/{goal_id}` (Firebase Bearer token required)
- `GET /api/user/dashboard` (Firebase Bearer token required)

## Render deployment notes

- Runtime: Python 3.11+
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Set environment variables from `.env.example`
