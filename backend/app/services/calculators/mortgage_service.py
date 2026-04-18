from app.schemas.calculators import EMIRequest, MortgageRequest
from app.schemas.common import StandardResponse
from app.services.calculators.emi_service import calculate_emi


def calculate_mortgage(data: MortgageRequest) -> StandardResponse:
    loan_principal = data.property_price - data.down_payment
    annual_interest_rate = data.annual_interest_rate
    tenure_months = data.tenure_years * 12

    emi_response = calculate_emi(
        EMIRequest(
            principal=loan_principal,
            annual_interest_rate=annual_interest_rate,
            tenure_months=tenure_months,
        )
    )

    monthly_tax = data.annual_property_tax / 12
    monthly_insurance = data.annual_home_insurance / 12
    monthly_housing_cost = emi_response.result["monthly_emi"] + monthly_tax + monthly_insurance

    return StandardResponse(
        result={
            "loan_principal": round(loan_principal, 2),
            "monthly_mortgage_payment": emi_response.result["monthly_emi"],
            "monthly_property_tax": round(monthly_tax, 2),
            "monthly_home_insurance": round(monthly_insurance, 2),
            "total_monthly_housing_cost": round(monthly_housing_cost, 2),
            "total_interest": emi_response.result["total_interest"],
        },
        summary="Mortgage cost is calculated from financed amount, loan terms, and recurring ownership expenses.",
        insights=[
            "Include tax and insurance for realistic affordability checks.",
            "Higher down payment usually lowers monthly obligations.",
            f"Estimated monthly all-in housing cost is {monthly_housing_cost:.2f}.",
        ],
    )
