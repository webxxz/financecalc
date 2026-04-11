from fastapi import APIRouter

from app.schemas.exchange import ExchangeRateRequest
from app.services.exchange_rates import convert_currency

router = APIRouter(tags=["exchange"])


@router.post("/exchange-rate")
async def exchange_rate_endpoint(payload: ExchangeRateRequest) -> dict:
    converted = await convert_currency(payload.base_currency, payload.target_currency, payload.amount)
    return {
        "result": converted,
        "summary": "Converted amount using latest available exchange rates.",
        "insights": [
            "Exchange rates are cached to reduce provider usage and latency.",
            "Recalculate before high-value transfers to reduce FX drift.",
        ],
    }
