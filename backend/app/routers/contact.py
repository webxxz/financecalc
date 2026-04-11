from fastapi import APIRouter, Request

from app.schemas.contact import ContactRequest
from app.services.email_service import send_contact_email
from app.utils.rate_limit import InMemoryRateLimiter

router = APIRouter(tags=["contact"])
rate_limiter = InMemoryRateLimiter(requests_per_window=10, window_seconds=60)


@router.post("/contact")
async def contact_endpoint(payload: ContactRequest, request: Request) -> dict:
    rate_limiter.check(request)
    await send_contact_email(payload)
    return {
        "result": {"status": "queued"},
        "summary": "Your message has been submitted successfully.",
        "insights": ["Our team will respond to your query soon."],
    }
