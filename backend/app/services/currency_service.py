from typing import Dict

import httpx
from fastapi import HTTPException

from app.core.config import get_settings
from app.utils.cache import InMemoryTTLCache

settings = get_settings()


class CurrencyService:
    def __init__(self) -> None:
        self._cache = InMemoryTTLCache(ttl=settings.exchange_rate_cache_ttl_seconds)

    async def get_latest_rates(self, base_currency: str) -> Dict[str, float]:
        base = base_currency.upper()
        cache_key = f"rates:{base}"
        cached = self._cache.get(cache_key)
        if cached:
            return cached

        if not settings.exchange_rate_api_key:
            raise HTTPException(status_code=503, detail="Exchange rate provider is not configured")

        url = f"{settings.exchange_rate_api_url}/{settings.exchange_rate_api_key}/latest/{base}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)

        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to fetch exchange rates")

        payload = response.json()
        rates = payload.get("conversion_rates")
        if not isinstance(rates, dict):
            raise HTTPException(status_code=502, detail="Invalid exchange rate provider response")

        self._cache.set(cache_key, rates)
        return rates

    async def convert_currency(self, base_currency: str, target_currency: str, amount: float) -> dict:
        rates = await self.get_latest_rates(base_currency)
        target = target_currency.upper()
        rate = rates.get(target)
        if rate is None:
            raise HTTPException(status_code=400, detail=f"Unsupported target currency: {target}")

        converted = amount * float(rate)
        return {
            "base_currency": base_currency.upper(),
            "target_currency": target,
            "amount": round(amount, 2),
            "exchange_rate": round(float(rate), 6),
            "converted_amount": round(converted, 2),
        }


currency_service = CurrencyService()
