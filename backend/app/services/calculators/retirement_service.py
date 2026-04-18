from math import pow

from app.schemas.calculators import RetirementRequest
from app.schemas.common import StandardResponse


def calculate_retirement(data: RetirementRequest) -> StandardResponse:
    r = data.expected_annual_return_rate / 100
    years = data.years_to_retirement

    future_current = data.current_savings * pow(1 + r, years)
    if r == 0:
        future_contrib = data.annual_contribution * years
    else:
        future_contrib = data.annual_contribution * ((pow(1 + r, years) - 1) / r)

    projected_corpus = future_current + future_contrib

    return StandardResponse(
        result={
            "projected_retirement_corpus": round(projected_corpus, 2),
            "future_value_current_savings": round(future_current, 2),
            "future_value_contributions": round(future_contrib, 2),
        },
        summary="Retirement corpus projection compounds current savings and planned annual contributions.",
        insights=[
            "Starting early amplifies compounding benefits.",
            "Consistent annual contributions can materially improve retirement readiness.",
            f"Projected retirement corpus is {projected_corpus:.2f}.",
        ],
    )
