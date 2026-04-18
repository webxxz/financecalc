from math import pow

from fastapi import HTTPException

from app.schemas.calculators import LoanInterestRateRequest
from app.schemas.common import StandardResponse


def _emi_for_rate(principal: float, monthly_rate: float, tenure_months: int) -> float:
    if monthly_rate == 0:
        return principal / tenure_months
    factor = pow(1 + monthly_rate, tenure_months)
    return principal * monthly_rate * factor / (factor - 1)


def calculate_loan_interest_rate(data: LoanInterestRateRequest) -> StandardResponse:
    principal = data.loan_amount
    monthly_emi = data.monthly_emi
    tenure_months = data.tenure_months

    min_emi = principal / tenure_months
    if monthly_emi < min_emi:
        raise HTTPException(
            status_code=400,
            detail="Monthly EMI is too low for the selected loan amount and tenure.",
        )

    if abs(monthly_emi - min_emi) < 1e-9:
        monthly_rate = 0.0
    else:
        monthly_rate = 0.01
        converged = False
        h = 1e-6

        for _ in range(100):
            f = _emi_for_rate(principal, monthly_rate, tenure_months) - monthly_emi
            if abs(f) < 1e-7:
                converged = True
                break

            upper = monthly_rate + h
            lower = max(monthly_rate - h, 1e-9)
            derivative = (
                _emi_for_rate(principal, upper, tenure_months) - _emi_for_rate(principal, lower, tenure_months)
            ) / (upper - lower)

            if abs(derivative) < 1e-12:
                break

            next_rate = monthly_rate - (f / derivative)
            monthly_rate = max(next_rate, 1e-9)

        if not converged:
            final_error = abs(_emi_for_rate(principal, monthly_rate, tenure_months) - monthly_emi)
            if final_error > 1e-5:
                raise HTTPException(status_code=400, detail="Unable to infer a valid interest rate from the given inputs.")

    annual_interest_rate = monthly_rate * 12 * 100
    total_payment = monthly_emi * tenure_months
    total_interest_paid = total_payment - principal

    return StandardResponse(
        result={
            "annual_interest_rate": round(annual_interest_rate, 4),
            "monthly_interest_rate": round(monthly_rate * 100, 4),
            "total_payment": round(total_payment, 2),
            "total_interest_paid": round(total_interest_paid, 2),
        },
        summary=(
            f"Your loan of ₹{principal:,.2f} with EMI ₹{monthly_emi:,.2f} over {tenure_months} months "
            f"implies an annual interest rate of {annual_interest_rate:.2f}%."
        ),
        insights=[
            "Compare the implied annual rate with current market offers before signing.",
            "Part prepayments can lower effective interest burden and shorten tenure.",
            "Always compare reducing-balance rates against flat-rate quotes to avoid misleading pricing.",
        ],
    )
