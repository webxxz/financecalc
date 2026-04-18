from math import pow

from fastapi import HTTPException

from app.schemas.calculators import InvestmentGrowthRequest
from app.schemas.common import StandardResponse


def calculate_investment_growth(data: InvestmentGrowthRequest) -> StandardResponse:
    if data.initial_investment == 0 and data.monthly_contribution == 0:
        raise HTTPException(
            status_code=400,
            detail="Provide an initial investment or monthly contribution greater than zero.",
        )

    monthly_rate = data.annual_return_rate / 12 / 100
    total_months = data.years * 12

    future_value_initial = data.initial_investment * pow(1 + monthly_rate, total_months)
    if monthly_rate == 0:
        future_value_contributions = data.monthly_contribution * total_months
    else:
        future_value_contributions = data.monthly_contribution * ((pow(1 + monthly_rate, total_months) - 1) / monthly_rate)

    future_value = future_value_initial + future_value_contributions
    total_contributed = data.initial_investment + (data.monthly_contribution * total_months)
    investment_gain = future_value - total_contributed

    return StandardResponse(
        result={
            "future_value": round(future_value, 2),
            "total_contributed": round(total_contributed, 2),
            "investment_gain": round(investment_gain, 2),
            "future_value_initial_investment": round(future_value_initial, 2),
            "future_value_monthly_contributions": round(future_value_contributions, 2),
        },
        summary="Investment growth projection compounds an initial amount and recurring monthly contributions over the selected horizon.",
        insights=[
            "Time in market and contribution consistency are key growth drivers.",
            f"Projected portfolio value after {data.years} years is {future_value:.2f}.",
            "Increasing contribution cadence can materially improve long-term outcomes.",
        ],
    )
