from math import pow

from app.schemas.calculators import EMIRequest, MortgageRequest, RetirementRequest, SIPRequest, TaxRequest
from app.schemas.common import StandardResponse


TAX_RATE_BY_COUNTRY = {
    "US": 0.22,
    "IN": 0.20,
    "GB": 0.20,
    "DE": 0.25,
    "FR": 0.25,
    "CA": 0.24,
}


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


def calculate_sip(data: SIPRequest) -> StandardResponse:
    p = data.monthly_investment
    i = data.annual_return_rate / 12 / 100
    n = data.years * 12

    if i == 0:
        future_value = p * n
    else:
        future_value = p * (((pow(1 + i, n) - 1) / i) * (1 + i))

    total_invested = p * n
    estimated_returns = future_value - total_invested

    return StandardResponse(
        result={
            "future_value": round(future_value, 2),
            "total_invested": round(total_invested, 2),
            "estimated_returns": round(estimated_returns, 2),
        },
        summary="Your SIP projection is based on monthly contribution, expected return rate, and duration.",
        insights=[
            f"Projected corpus is {future_value:.2f}.",
            f"Estimated growth over principal is {estimated_returns:.2f}.",
            "Increasing monthly contribution can significantly improve long-term outcomes.",
        ],
    )


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


def calculate_tax(data: TaxRequest) -> StandardResponse:
    country = data.country_code.upper()
    tax_rate = TAX_RATE_BY_COUNTRY.get(country, 0.22)
    taxable_income = max(0.0, data.annual_income - data.deductions)
    estimated_tax = taxable_income * tax_rate
    net_income = data.annual_income - estimated_tax

    return StandardResponse(
        result={
            "country_code": country,
            "tax_rate": tax_rate,
            "taxable_income": round(taxable_income, 2),
            "estimated_tax": round(estimated_tax, 2),
            "net_income_after_tax": round(net_income, 2),
        },
        summary="Tax estimate uses a simplified country-level effective rate for quick planning.",
        insights=[
            "This estimate is for planning and not a legal tax filing output.",
            "Adding eligible deductions can reduce taxable income.",
            "Use country-specific slabs in later iterations for precision.",
        ],
    )


def calculate_retirement(data: RetirementRequest) -> StandardResponse:
    r = data.expected_annual_return_rate / 100
    years = data.years_to_retirement

    future_current = data.current_savings * pow(1 + r, years)
    if r == 0:
        future_contrib = data.annual_contribution * years
    else:
        future_contrib = data.annual_contribution * ((pow(1 + r, years) - 1) / r)

    projected_corpus = future_current + future_contrib

    return StandardResponse(
        result={
            "projected_retirement_corpus": round(projected_corpus, 2),
            "future_value_current_savings": round(future_current, 2),
            "future_value_contributions": round(future_contrib, 2),
        },
        summary="Retirement corpus projection compounds current savings and planned annual contributions.",
        insights=[
            "Starting early amplifies compounding benefits.",
            "Consistent annual contributions can materially improve retirement readiness.",
            f"Projected retirement corpus is {projected_corpus:.2f}.",
        ],
    )
