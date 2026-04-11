import re

import httpx
from fastapi import HTTPException

from app.core.config import get_settings
from app.schemas.contact import ContactRequest

settings = get_settings()

_SPAM_PATTERNS = [r"https?://", r"\bbitcoin\b", r"\bcasino\b", r"\bloan\s+approval\b"]


def _is_spam(message: str) -> bool:
    lowered = message.lower()
    return any(re.search(pattern, lowered) for pattern in _SPAM_PATTERNS)


async def send_contact_email(payload: ContactRequest) -> None:
    if _is_spam(payload.message):
        raise HTTPException(status_code=400, detail="Message flagged by spam protection")

    if not settings.resend_api_key:
        raise HTTPException(status_code=503, detail="Email service is not configured")

    resend_payload = {
        "from": settings.contact_from_email,
        "to": [settings.contact_to_email],
        "subject": f"FinanceCalc Contact: {payload.name}",
        "reply_to": payload.email,
        "text": f"Name: {payload.name}\nEmail: {payload.email}\n\nMessage:\n{payload.message}",
    }

    headers = {
        "Authorization": f"Bearer {settings.resend_api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post("https://api.resend.com/emails", json=resend_payload, headers=headers)

    if response.status_code not in {200, 202}:
        raise HTTPException(status_code=502, detail="Failed to send contact email")
