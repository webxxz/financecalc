from fastapi import APIRouter, Request

from app.core.config import get_settings
from app.schemas.contact import ContactRequest
from app.services.email_service import send_contact_email
from app.utils.limiter import limiter

router = APIRouter(tags=["contact"])
settings = get_settings()


@router.post("/contact")
@limiter.limit(settings.contact_rate_limit)
async def contact_endpoint(payload: ContactRequest, request: Request) -> dict:
    # request is required for slowapi's limiter key function.
    del request
    await send_contact_email(payload)
    return {
        "result": {"status": "queued"},
        "summary": "Your message has been submitted successfully.",
        "insights": ["Our team will respond to your query soon."],
    }
