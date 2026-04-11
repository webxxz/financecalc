from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.routers import ai, calculators, contact, exchange, health, user
from app.utils.rate_limit import InMemoryRateLimiter

settings = get_settings()
app = FastAPI(title=settings.app_name)
global_rate_limiter = InMemoryRateLimiter(requests_per_window=settings.requests_per_minute, window_seconds=60)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_middleware(request: Request, call_next):
    host = request.headers.get("host", "").split(":")[0]
    if settings.allowed_hosts and host not in settings.allowed_hosts:
        return JSONResponse(status_code=400, content={"detail": "Invalid host header"})

    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > 1_000_000:
        return JSONResponse(status_code=413, content={"detail": "Payload too large"})

    global_rate_limiter.check(request)
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


app.include_router(health.router, prefix=settings.api_v1_prefix)
app.include_router(calculators.router, prefix=settings.api_v1_prefix)
app.include_router(exchange.router, prefix=settings.api_v1_prefix)
app.include_router(ai.router, prefix=settings.api_v1_prefix)
app.include_router(contact.router, prefix=settings.api_v1_prefix)
app.include_router(user.router, prefix=settings.api_v1_prefix)
