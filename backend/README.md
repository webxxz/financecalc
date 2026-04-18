# FinanceCalc Backend (FastAPI)

Production-oriented backend scaffold for FinanceCalc.app.

## Features

- Modular architecture (`routers`, `services`, `schemas`, `ai`, `utils`)
- Calculator APIs with structured JSON response format
- ExchangeRate-API integration with TTL caching
- AI assistant tool-router (OpenAI primary, Claude fallback, deterministic backup parser)
- Firebase Auth token verification + Firestore persistence helpers
- Contact API integration with Resend + spam/rate-limit guardrails
- Security middleware (CORS, host filtering, request-size checks, global and endpoint rate limiting)
- Structured JSON logging for API latency and AI tool-usage events
- Standardized global exception handling with retry hints

## Calculator expansion system

To add a new calculator, follow this repeatable backend pattern:

1. Add a dedicated service module in `app/services/calculators/` (for example, `my_calculator_service.py`)
2. Define the request schema in `app/schemas/calculators.py`
3. Export the service function from `app/services/calculators/__init__.py`
4. Add the API endpoint in `app/routers/calculators.py`
5. Register the slug in the `/api/catalog` response status list

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
- `POST /api/ai/chat`
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
