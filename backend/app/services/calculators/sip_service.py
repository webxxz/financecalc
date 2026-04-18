from math import pow

from app.schemas.calculators import SIPRequest
from app.schemas.common import StandardResponse


def calculate_sip(data: SIPRequest) -> StandardResponse:
    p = data.monthly_investment
    i = data.annual_return_rate / 12 / 100
    n = data.years * 12

    if i == 0:
        future_value = p * n
    else:
        future_value = p * (((pow(1 + i, n) - 1) / i) * (1 + i))

    total_invested = p * n
    estimated_returns = future_value - total_invested

    return StandardResponse(
        result={
            "future_value": round(future_value, 2),
            "total_invested": round(total_invested, 2),
            "estimated_returns": round(estimated_returns, 2),
        },
        summary="Your SIP projection is based on monthly contribution, expected return rate, and duration.",
        insights=[
            f"Projected corpus is {future_value:.2f}.",
            f"Estimated growth over principal is {estimated_returns:.2f}.",
            "Increasing monthly contribution can significantly improve long-term outcomes.",
        ],
    )
