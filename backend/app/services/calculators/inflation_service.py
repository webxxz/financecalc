from math import pow

from app.schemas.calculators import InflationRequest
from app.schemas.common import StandardResponse


def calculate_inflation(data: InflationRequest) -> StandardResponse:
    rate = data.annual_inflation_rate / 100
    years = data.tenure_years
    current_amount = data.current_amount

    growth_factor = pow(1 + rate, years)
    future_value = current_amount * growth_factor
    purchasing_power_loss = future_value - current_amount
    todays_equivalent = current_amount / growth_factor

    yearly_growth: list[dict[str, float | int]] = []
    for year in range(1, years + 1):
        value = current_amount * pow(1 + rate, year)
        yearly_growth.append({"year": year, "invested": round(current_amount, 2), "value": round(value, 2)})

    return StandardResponse(
        result={
            "future_equivalent": round(future_value, 2),
            "purchasing_power_loss": round(purchasing_power_loss, 2),
            "todays_purchasing_power": round(todays_equivalent, 2),
            "real_return_needed": round(data.annual_inflation_rate, 2),
            "yearly_growth": yearly_growth,
        },
        summary=f"₹{current_amount:,.2f} today will require ₹{future_value:,.2f} in {years} years at {data.annual_inflation_rate}% inflation.",
        insights=[
            "Inflation steadily raises the future amount required to buy the same basket of goods.",
            "Longer time horizons amplify purchasing power erosion.",
            "Your investments should target returns above inflation for real wealth growth.",
            f"A return of about {data.annual_inflation_rate:.2f}% is needed to maintain purchasing power.",
        ],
    )
