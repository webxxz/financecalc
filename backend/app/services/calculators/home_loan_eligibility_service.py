from math import pow

from app.schemas.calculators import HomeLoanEligibilityRequest
from app.schemas.common import StandardResponse


def calculate_home_loan_eligibility(data: HomeLoanEligibilityRequest) -> StandardResponse:
    monthly_income = data.monthly_income
    monthly_obligations = data.monthly_obligations
    monthly_rate = data.annual_interest_rate / 1200
    total_months = data.tenure_years * 12

    available_emi = max(monthly_income * 0.5 - monthly_obligations, 0)

    if available_emi == 0:
        max_eligible_loan = 0.0
    elif monthly_rate == 0:
        max_eligible_loan = available_emi * total_months
    else:
        factor = pow(1 + monthly_rate, total_months)
        max_eligible_loan = available_emi * (factor - 1) / (monthly_rate * factor)

    max_property_value = max_eligible_loan * 1.25
    recommended_down_payment = max_property_value - max_eligible_loan

    return StandardResponse(
        result={
            "max_eligible_loan": round(max_eligible_loan, 2),
            "max_property_value": round(max_property_value, 2),
            "recommended_down_payment": round(recommended_down_payment, 2),
            "monthly_emi_at_max": round(available_emi, 2),
        },
        summary=(
            f"Based on your income of ₹{monthly_income:,.2f} and existing obligations of ₹{monthly_obligations:,.2f}, "
            f"you are eligible for a home loan of up to ₹{max_eligible_loan:,.2f}."
        ),
        insights=[
            "This estimate follows a 50% FOIR approach where total EMIs are limited to half of monthly income.",
            "Property affordability is estimated at 80% LTV, so loan amount is treated as roughly 80% of property value.",
            "Building a larger down payment improves approval comfort and lowers long-term interest cost.",
            "Lenders also evaluate credit score, employment stability, and repayment history before final sanction.",
        ],
    )
