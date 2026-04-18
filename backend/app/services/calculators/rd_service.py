from math import pow

from app.schemas.calculators import RDRequest
from app.schemas.common import StandardResponse


def calculate_rd(data: RDRequest) -> StandardResponse:
    monthly_deposit = data.monthly_deposit
    rate = data.annual_interest_rate
    tenure_months = data.tenure_months

    i = rate / 400
    n = tenure_months / 3

    if i == 0:
        maturity_amount = monthly_deposit * tenure_months
    else:
        maturity_amount = monthly_deposit * ((pow(1 + i, n) - 1) / (1 - pow(1 + i, -1 / 3)))

    total_deposited = monthly_deposit * tenure_months
    total_interest_earned = maturity_amount - total_deposited

    return StandardResponse(
        result={
            "maturity_amount": round(maturity_amount, 2),
            "total_deposited": round(total_deposited, 2),
            "total_interest_earned": round(total_interest_earned, 2),
        },
        summary=(
            f"Depositing ₹{monthly_deposit:,.2f}/month for {tenure_months} months at {rate:.2f}% "
            f"will give you ₹{maturity_amount:,.2f}."
        ),
        insights=[
            "RDs help build disciplined savings with low entry barriers.",
            "Longer tenures typically improve maturity value due to compounding.",
            "Compare RD returns with debt mutual funds and FDs for post-tax outcomes.",
        ],
    )
