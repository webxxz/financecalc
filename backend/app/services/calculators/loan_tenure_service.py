from math import ceil, log

from app.schemas.calculators import LoanTenureRequest
from app.schemas.common import StandardResponse


def calculate_loan_tenure(data: LoanTenureRequest) -> StandardResponse:
    loan_amount = data.loan_amount
    annual_interest_rate = data.annual_interest_rate
    monthly_emi = data.monthly_emi
    monthly_rate = annual_interest_rate / 1200

    if monthly_rate == 0:
        raw_tenure_months = loan_amount / monthly_emi
    else:
        threshold = loan_amount * monthly_rate
        if monthly_emi <= threshold:
            return StandardResponse(
                result={
                    "tenure_months": None,
                    "tenure_years": None,
                    "tenure_months_remainder": None,
                    "total_payment": None,
                    "total_interest_paid": None,
                },
                summary="The provided EMI is too low to repay this loan at the selected interest rate.",
                insights=[
                    "Error: EMI must be greater than monthly interest (P×r), otherwise the loan will never amortize.",
                    "Increase EMI or reduce interest rate/loan amount to get a valid repayment tenure.",
                    "Even a small EMI increase can materially reduce repayment period and total interest outgo.",
                ],
            )

        raw_tenure_months = -log(1 - (loan_amount * monthly_rate) / monthly_emi) / log(1 + monthly_rate)

    tenure_months = int(ceil(raw_tenure_months))
    tenure_years = tenure_months // 12
    tenure_months_remainder = tenure_months % 12
    total_payment = monthly_emi * tenure_months
    total_interest_paid = total_payment - loan_amount

    return StandardResponse(
        result={
            "tenure_months": tenure_months,
            "tenure_years": tenure_years,
            "tenure_months_remainder": tenure_months_remainder,
            "total_payment": round(total_payment, 2),
            "total_interest_paid": round(total_interest_paid, 2),
        },
        summary=(
            f"With EMI ₹{monthly_emi:,.2f} on a ₹{loan_amount:,.2f} loan at {annual_interest_rate:.2f}%, "
            f"the loan will be repaid in {tenure_years} years and {tenure_months_remainder} months."
        ),
        insights=[
            "Higher EMI directly shortens loan tenure and lowers total interest paid.",
            "Review EMI affordability with emergency savings and other fixed commitments.",
            "If rates fall in future, refinancing may reduce tenure or interest burden further.",
        ],
    )
