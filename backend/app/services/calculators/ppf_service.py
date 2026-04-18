from app.schemas.calculators import PPFRequest
from app.schemas.common import StandardResponse


PPF_ANNUAL_CAP = 150000


def calculate_ppf(data: PPFRequest) -> StandardResponse:
    annual_investment = data.annual_investment
    tenure_years = data.tenure_years
    annual_rate = data.current_ppf_rate / 100

    effective_annual_investment = min(annual_investment, PPF_ANNUAL_CAP)
    balance = 0.0

    for _ in range(tenure_years):
        balance = (balance + effective_annual_investment) * (1 + annual_rate)

    total_invested = effective_annual_investment * tenure_years
    total_interest_earned = balance - total_invested
    tax_saved_80c = min(annual_investment * 0.3, 45000)

    cap_note = (
        "Your entered annual investment exceeds ₹1,50,000, so projection uses the PPF contribution cap."
        if annual_investment > PPF_ANNUAL_CAP
        else "PPF contribution is within the ₹1,50,000 annual limit, so full input amount is used in projection."
    )

    return StandardResponse(
        result={
            "maturity_amount": round(balance, 2),
            "total_invested": round(total_invested, 2),
            "total_interest_earned": round(total_interest_earned, 2),
            "tax_saved_80c": round(tax_saved_80c, 2),
        },
        summary=(
            f"Investing ₹{annual_investment:,.2f}/year in PPF for {tenure_years} years at "
            f"{data.current_ppf_rate:.2f}% will yield ₹{balance:,.2f} tax-free."
        ),
        insights=[
            f"Section 80C deduction can save up to ₹45,000 annually (estimated here as ₹{tax_saved_80c:,.2f}).",
            "PPF maturity proceeds and interest are tax-free under current rules.",
            "PPF account holders can typically access loan facility after year 3 and partial withdrawals after year 7.",
            cap_note,
        ],
    )
