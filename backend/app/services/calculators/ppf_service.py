from app.schemas.calculators import PPFRequest
from app.schemas.common import StandardResponse


PPF_ANNUAL_CAP = 150000


def _format_indian_number(value: float) -> str:
    rounded = round(value, 2)
    sign = "-" if rounded < 0 else ""
    amount = abs(rounded)
    whole, fractional = f"{amount:.2f}".split(".")
    if len(whole) > 3:
        last_three = whole[-3:]
        leading = whole[:-3]
        groups = []
        while len(leading) > 2:
            groups.insert(0, leading[-2:])
            leading = leading[:-2]
        if leading:
            groups.insert(0, leading)
        grouped_whole = ",".join(groups + [last_three])
    else:
        grouped_whole = whole
    if fractional == "00":
        return f"{sign}{grouped_whole}"
    return f"{sign}{grouped_whole}.{fractional}"


def calculate_ppf(data: PPFRequest) -> StandardResponse:
    annual_investment = data.annual_investment
    tenure_years = data.tenure_years
    annual_rate = data.current_ppf_rate / 100
    effective_investment = min(annual_investment, 150000)

    balance = 0.0
    yearly_growth: list[dict[str, float | int]] = []

    for year in range(1, tenure_years + 1):
        balance = (balance + effective_investment) * (1 + annual_rate)
        yearly_growth.append(
            {
                "year": year,
                "invested": round(effective_investment * year, 2),
                "value": round(balance, 2),
            }
        )

    total_invested = effective_investment * tenure_years
    total_interest_earned = balance - total_invested
    tax_saved_80c = min(annual_investment * 0.3, 45000)
    insights = [
        f"Section 80C deduction can save up to ₹45,000 annually (estimated here as ₹{tax_saved_80c:,.2f}).",
        "PPF maturity proceeds and interest are tax-free under current rules.",
        "PPF account holders can typically access loan facility after year 3 and partial withdrawals after year 7.",
    ]

    cap_note = (
        "Your entered annual investment exceeds ₹1,50,000, so projection uses the PPF contribution cap."
        if annual_investment > PPF_ANNUAL_CAP
        else "PPF contribution is within the ₹1,50,000 annual limit, so full input amount is used in projection."
    )
    insights.append(cap_note)

    if annual_investment > 150000:
        excess = annual_investment - 150000
        insights.insert(
            0,
            (
                f"⚠️ PPF annual investment is capped at ₹1,50,000. "
                f"Your excess contribution of ₹{_format_indian_number(excess)} will be returned without interest."
            ),
        )

    return StandardResponse(
        result={
            "maturity_amount": round(balance, 2),
            "total_invested": round(total_invested, 2),
            "total_interest_earned": round(total_interest_earned, 2),
            "tax_saved_80c": round(tax_saved_80c, 2),
            "yearly_growth": yearly_growth,
        },
        summary=(
            f"Investing ₹{annual_investment:,.2f}/year in PPF for {tenure_years} years at "
            f"{data.current_ppf_rate:.2f}% will yield ₹{balance:,.2f} tax-free."
        ),
        insights=insights,
    )
