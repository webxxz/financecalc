import logging
from time import perf_counter
from typing import Optional

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import get_settings
from app.core.logging import configure_logging
from app.routers import ai, calculators, contact, exchange, health, mortgage_refinance_router, user
from app.schemas.common import ErrorResponse
from app.utils.limiter import limiter
from app.utils.rate_limit import InMemoryRateLimiter

settings = get_settings()
configure_logging(settings.log_level)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.app_name)
global_rate_limiter = InMemoryRateLimiter(requests_per_window=settings.requests_per_minute, window_seconds=60)
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_middleware(request: Request, call_next):
    start = perf_counter()
    host = request.headers.get("host", "").split(":")[0]
    if settings.allowed_hosts and host not in settings.allowed_hosts:
        return JSONResponse(
            status_code=400,
            content=ErrorResponse(
                error_code="INVALID_HOST_HEADER",
                message="Invalid host header",
                retry_allowed=False,
            ).model_dump(),
        )

    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > 1_000_000:
                return JSONResponse(
                    status_code=413,
                    content=ErrorResponse(
                        error_code="PAYLOAD_TOO_LARGE",
                        message="Payload too large",
                        retry_allowed=False,
                    ).model_dump(),
                )
        except ValueError:
            return JSONResponse(
                status_code=400,
                content=ErrorResponse(
                    error_code="INVALID_CONTENT_LENGTH",
                    message="Invalid content length header",
                    retry_allowed=False,
                ).model_dump(),
            )

    status_code: Optional[int] = None
    try:
        global_rate_limiter.check(request)
        response = await call_next(request)
        status_code = response.status_code
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
    except HTTPException as exc:
        status_code = exc.status_code
        raise
    except Exception:
        status_code = 500
        raise
    finally:
        latency_ms = round((perf_counter() - start) * 1000, 2)
        logger.info(
            "api_request_completed",
            extra={
                "event": "api_request_completed",
                "method": request.method,
                "path": request.url.path,
                "status_code": status_code or 500,
                "latency_ms": latency_ms,
                "client_ip": get_remote_address(request),
            },
        )
    return response


def _retry_allowed(status_code: int) -> bool:
    return status_code >= 500 or status_code == 429


def _error_code_from_status(status_code: int) -> str:
    if status_code == 400:
        return "BAD_REQUEST"
    if status_code == 401:
        return "UNAUTHORIZED"
    if status_code == 403:
        return "FORBIDDEN"
    if status_code == 404:
        return "NOT_FOUND"
    if status_code == 422:
        return "VALIDATION_ERROR"
    if status_code == 429:
        return "RATE_LIMIT_EXCEEDED"
    return "INTERNAL_ERROR" if status_code >= 500 else "REQUEST_ERROR"


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException):
    status_code = exc.status_code
    return JSONResponse(
        status_code=status_code,
        content=ErrorResponse(
            error_code=_error_code_from_status(status_code),
            message=str(exc.detail),
            retry_allowed=_retry_allowed(status_code),
        ).model_dump(),
    )


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error_code="VALIDATION_ERROR",
            message=str(exc.errors()),
            retry_allowed=False,
        ).model_dump(),
    )


@app.exception_handler(RateLimitExceeded)
async def rate_limit_exception_handler(_: Request, __: RateLimitExceeded):
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content=ErrorResponse(
            error_code="RATE_LIMIT_EXCEEDED",
            message="Rate limit exceeded",
            retry_allowed=True,
        ).model_dump(),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    logger.exception("unhandled_exception", exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error_code="INTERNAL_ERROR",
            message="Unexpected server error",
            retry_allowed=True,
        ).model_dump(),
    )


app.include_router(health.router, prefix=settings.api_v1_prefix)
app.include_router(calculators.router, prefix=settings.api_v1_prefix)
app.include_router(mortgage_refinance_router.router, prefix=settings.api_v1_prefix)
app.include_router(exchange.router, prefix=settings.api_v1_prefix)
app.include_router(ai.router, prefix=settings.api_v1_prefix)
app.include_router(contact.router, prefix=settings.api_v1_prefix)
app.include_router(user.router, prefix=settings.api_v1_prefix)
