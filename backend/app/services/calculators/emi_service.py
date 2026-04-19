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
    yearly_schedule: list[dict[str, float | int]] = []
    balance = p
    schedule_months = min(n, 30 * 12)
    yearly_principal = 0.0
    yearly_interest = 0.0
    current_year = 1

    for month in range(1, schedule_months + 1):
        if balance <= 0:
            break

        interest_component = balance * r
        principal_component = emi - interest_component
        if principal_component > balance:
            principal_component = balance

        balance -= principal_component
        if balance < 0:
            balance = 0.0

        yearly_principal += principal_component
        yearly_interest += interest_component

        if month % 12 == 0 or balance <= 0 or month == schedule_months:
            yearly_schedule.append(
                {
                    "year": current_year,
                    "principal_paid": round(yearly_principal, 2),
                    "interest_paid": round(yearly_interest, 2),
                    "balance": round(balance, 2),
                }
            )
            current_year += 1
            yearly_principal = 0.0
            yearly_interest = 0.0

    return StandardResponse(
        result={
            "monthly_emi": round(emi, 2),
            "total_payment": round(total_payment, 2),
            "total_interest": round(total_interest, 2),
            "yearly_schedule": yearly_schedule,
        },
        summary="Your EMI has been computed using principal, annual interest rate, and loan tenure.",
        insights=[
            f"Monthly EMI is {emi:.2f}.",
            f"Total interest outgo is {total_interest:.2f}.",
            "A shorter tenure generally reduces total interest paid.",
        ],
    )
