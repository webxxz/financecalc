from pydantic import BaseModel, Field


class ExchangeRateRequest(BaseModel):
    base_currency: str = Field(min_length=3, max_length=3)
    target_currency: str = Field(min_length=3, max_length=3)
    amount: float = Field(default=1, gt=0)
