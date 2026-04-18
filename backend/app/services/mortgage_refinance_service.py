from math import pow

from app.core.refinance_constants import STRONG_REFINANCE_CANDIDATE_THRESHOLD
from app.schemas.common import StandardResponse
from app.schemas.mortgage_refinance_schema import MortgageRefinanceRequest


def _monthly_payment(principal: float, annual_interest_rate: float, tenure_months: int) -> float:
    monthly_rate = annual_interest_rate / 12 / 100
    if monthly_rate == 0:
        return principal / tenure_months
    factor = pow(1 + monthly_rate, tenure_months)
    return principal * monthly_rate * factor / (factor - 1)


def calculate_mortgage_refinance(data: MortgageRefinanceRequest) -> StandardResponse:
    balance = data.current_loan_balance

    current_payment = _monthly_payment(
        principal=balance,
        annual_interest_rate=data.current_annual_interest_rate,
        tenure_months=data.current_remaining_term_months,
    )
    new_payment = _monthly_payment(
        principal=balance,
        annual_interest_rate=data.new_annual_interest_rate,
        tenure_months=data.new_loan_term_months,
    )

    current_total_payment = current_payment * data.current_remaining_term_months
    new_total_payment = new_payment * data.new_loan_term_months

    current_total_interest = max(0.0, current_total_payment - balance)
    new_total_interest = max(0.0, new_total_payment - balance)

    gross_interest_saved = current_total_interest - new_total_interest
    net_savings_after_costs = gross_interest_saved - data.closing_costs
    monthly_payment_change = current_payment - new_payment
    if monthly_payment_change > 0 and data.closing_costs > 0:
        break_even_months = data.closing_costs / monthly_payment_change
    elif data.closing_costs == 0 and monthly_payment_change >= 0:
        break_even_months = 0.0
    else:
        break_even_months = None

    if net_savings_after_costs > STRONG_REFINANCE_CANDIDATE_THRESHOLD:
        candidate_band = "Strong Refinance Candidate"
    elif net_savings_after_costs > 0:
        candidate_band = "Needs Closer Review"
    else:
        candidate_band = "Likely Not Beneficial"

    insights = [
        f"Net savings after closing costs: {net_savings_after_costs:.2f}.",
        f"Monthly payment change: {monthly_payment_change:.2f} (positive means lower new payment).",
        f"Decision band: {candidate_band}.",
    ]
    if break_even_months is None:
        insights.append("No break-even point is reached because the refinance does not reduce monthly payment.")
    else:
        insights.append(
            f"Estimated break-even is {break_even_months:.1f} months; compare this with how long you expect to keep the loan."
        )

    return StandardResponse(
        result={
            "current_monthly_payment": round(current_payment, 2),
            "new_monthly_payment": round(new_payment, 2),
            "monthly_payment_change": round(monthly_payment_change, 2),
            "current_total_interest_remaining": round(current_total_interest, 2),
            "new_total_interest": round(new_total_interest, 2),
            "gross_interest_saved": round(gross_interest_saved, 2),
            "closing_costs": round(data.closing_costs, 2),
            "net_savings_after_costs": round(net_savings_after_costs, 2),
            "break_even_months": round(break_even_months, 1) if break_even_months is not None else None,
            "recommendation_band": candidate_band,
        },
        summary="Mortgage refinance analysis compares remaining-loan costs against a new loan scenario including closing costs.",
        insights=insights,
    )
