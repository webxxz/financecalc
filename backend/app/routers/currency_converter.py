from datetime import UTC, datetime

from fastapi import APIRouter

from app.schemas.calculators import CurrencyConvertRequest
from app.schemas.common import StandardResponse
from app.services.currency_service import currency_service

router = APIRouter(tags=["currency-converter"])


@router.post("/currency-convert", response_model=StandardResponse)
async def currency_convert_endpoint(payload: CurrencyConvertRequest) -> StandardResponse:
    converted = await currency_service.convert_currency(payload.from_currency, payload.to_currency, payload.amount)
    return StandardResponse(
        result={
            "converted_amount": converted["converted_amount"],
            "exchange_rate": converted["exchange_rate"],
            "from_currency": converted["base_currency"],
            "to_currency": converted["target_currency"],
            "last_updated": datetime.now(UTC).isoformat(),
        },
        summary="Currency conversion completed using latest available rates.",
        insights=[
            "Rates can change during market hours.",
            "For large transfers, verify with your bank or broker before execution.",
        ],
    )
