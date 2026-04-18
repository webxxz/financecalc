from math import pow

from app.schemas.calculators import EMIRequest
from app.schemas.common import StandardResponse


def calculate_emi(data: EMIRequest) -> StandardResponse:
    p = data.principal
    r = data.annual_interest_rate / 12 / 100
    n = data.tenure_months

    if r == 0:
        emi = p / n
    else:
        emi = p * r * pow(1 + r, n) / (pow(1 + r, n) - 1)

    total_payment = emi * n
    total_interest = total_payment - p

    return StandardResponse(
        result={
            "monthly_emi": round(emi, 2),
            "total_payment": round(total_payment, 2),
            "total_interest": round(total_interest, 2),
        },
        summary="Your EMI has been computed using principal, annual interest rate, and loan tenure.",
        insights=[
            f"Monthly EMI is {emi:.2f}.",
            f"Total interest outgo is {total_interest:.2f}.",
            "A shorter tenure generally reduces total interest paid.",
        ],
    )
