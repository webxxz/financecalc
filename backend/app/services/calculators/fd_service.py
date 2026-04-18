from math import pow

from app.schemas.calculators import FDRequest
from app.schemas.common import StandardResponse


def calculate_fd(data: FDRequest) -> StandardResponse:
    principal = data.principal
    annual_rate = data.annual_interest_rate / 100
    n = data.compounding_frequency
    t = data.tenure_years

    maturity_amount = principal * pow(1 + (annual_rate / n), n * t)
    total_interest_earned = maturity_amount - principal
    effective_annual_yield = (pow(maturity_amount / principal, 1 / t) - 1) * 100

    return StandardResponse(
        result={
            "maturity_amount": round(maturity_amount, 2),
            "total_interest_earned": round(total_interest_earned, 2),
            "effective_annual_yield": round(effective_annual_yield, 2),
        },
        summary=(
            f"Your ₹{principal:,.2f} FD at {data.annual_interest_rate:.2f}% for {t:.2f} years "
            f"will grow to ₹{maturity_amount:,.2f}, earning ₹{total_interest_earned:,.2f} in interest."
        ),
        insights=[
            "FDs provide predictable returns, while SIPs may offer higher long-term growth with market risk.",
            "Consider reinvesting maturity proceeds to compound wealth further.",
            "Interest above ₹40,000 in a financial year may attract TDS depending on your tax profile.",
        ],
    )
