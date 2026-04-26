from math import floor, pow

from fastapi import HTTPException

from app.schemas.calculators import CompoundInterestRequest
from app.schemas.common import StandardResponse


def calculate_compound_interest(data: CompoundInterestRequest) -> StandardResponse:
    principal = data.principal
    annual_rate = data.annual_rate / 100
    years = data.tenure_years
    frequency = data.compounding_frequency

    if principal <= 0 or years <= 0 or frequency <= 0:
        raise HTTPException(status_code=400, detail="Principal, tenure, and compounding frequency must be greater than zero.")

    maturity_amount = principal * pow(1 + annual_rate / frequency, frequency * years)
    total_interest = maturity_amount - principal
    effective_annual_rate = pow(1 + annual_rate / frequency, frequency) - 1

    yearly_growth: list[dict[str, float | int]] = []
    for year in range(1, floor(years) + 1):
        yearly_value = principal * pow(1 + annual_rate / frequency, frequency * year)
        yearly_growth.append({"year": year, "invested": round(principal, 2), "value": round(yearly_value, 2)})

    return StandardResponse(
        result={
            "maturity_amount": round(maturity_amount, 2),
            "total_interest": round(total_interest, 2),
            "effective_annual_rate": round(effective_annual_rate * 100, 4),
            "principal": round(principal, 2),
            "yearly_growth": yearly_growth,
        },
        summary=f"₹{principal:,.2f} invested at {data.annual_rate}% for {years} years grows to ₹{maturity_amount:,.2f}.",
        insights=[
            "Higher compounding frequency increases maturity value for the same nominal annual rate.",
            "Monthly compounding typically yields more than quarterly or yearly compounding.",
            "Longer tenure magnifies compounding impact on returns.",
            f"Effective annual rate at the selected frequency is {effective_annual_rate * 100:.2f}%.",
        ],
    )
