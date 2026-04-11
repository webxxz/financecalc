from typing import Dict

from app.services.currency_service import currency_service

async def get_latest_rates(base_currency: str) -> Dict[str, float]:
    return await currency_service.get_latest_rates(base_currency)


async def convert_currency(base_currency: str, target_currency: str, amount: float) -> dict:
    return await currency_service.convert_currency(base_currency, target_currency, amount)
