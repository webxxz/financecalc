from math import pow

from fastapi import HTTPException

from app.schemas.calculators import CreditCardPayoffRequest
from app.schemas.common import StandardResponse


def _payment_for_target_months(balance: float, monthly_rate: float, months: int) -> float:
    if monthly_rate == 0:
        return balance / months
    factor = pow(1 + monthly_rate, months)
    return balance * monthly_rate * factor / (factor - 1)


def calculate_credit_card_payoff(data: CreditCardPayoffRequest) -> StandardResponse:
    balance = data.current_balance
    monthly_rate = data.annual_interest_rate / 12 / 100
    monthly_payment = data.monthly_payment

    if monthly_rate > 0 and monthly_payment <= balance * monthly_rate:
        raise HTTPException(
            status_code=400,
            detail="Monthly payment is too low to reduce principal. Increase payment above monthly interest charge.",
        )

    total_interest = 0.0
    months = 0
    max_months = 1200

    while balance > 0 and months < max_months:
        interest = balance * monthly_rate
        scheduled_payment = min(monthly_payment, balance + interest)
        principal_paid = scheduled_payment - interest
        if principal_paid <= 0:
            raise HTTPException(
                status_code=400,
                detail="Monthly payment does not cover interest. Please increase the payment amount.",
            )
        balance -= principal_paid
        total_interest += interest
        months += 1

    if balance > 0:
        raise HTTPException(
            status_code=400,
            detail="Payoff horizon exceeds supported range. Increase payment to reduce repayment duration.",
        )

    total_paid = data.current_balance + total_interest
    target_36_month_payment = _payment_for_target_months(data.current_balance, monthly_rate, 36)

    return StandardResponse(
        result={
            "months_to_payoff": months,
            "years_to_payoff": round(months / 12, 2),
            "total_interest_paid": round(total_interest, 2),
            "total_amount_paid": round(total_paid, 2),
            "payment_needed_for_36_month_payoff": round(target_36_month_payment, 2),
        },
        summary="Credit card payoff timeline is computed using current balance, APR, and fixed monthly payment assumptions.",
        insights=[
            "Higher fixed monthly payments reduce both payoff time and total interest cost.",
            f"Estimated debt-free timeline is {months} months.",
            "Use the 36-month target payment to evaluate accelerated payoff options.",
        ],
    )
