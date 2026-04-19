"""Pay off debt vs invest — which gives better returns?"""


async def run_debt_vs_invest(inputs: dict) -> dict:
    """
    Inputs:
      loan_outstanding: float
      loan_interest_rate: float
      monthly_surplus: float
      expected_investment_return: float (default 10)
      loan_tenure_remaining_months: int
      tax_bracket: float                (default 0)
      is_home_loan: bool                (default False)
    """
    loan = inputs["loan_outstanding"]
    loan_rate = inputs["loan_interest_rate"]
    surplus = inputs["monthly_surplus"]
    inv_return = inputs.get("expected_investment_return", 10.0)
    tenure_months = inputs["loan_tenure_remaining_months"]
    tax_bracket = inputs.get("tax_bracket", 0.0)
    is_home_loan = inputs.get("is_home_loan", False)

    effective_loan_rate = loan_rate
    if is_home_loan and tax_bracket > 0:
        effective_loan_rate = loan_rate * (1 - tax_bracket / 100)

    monthly_loan_rate = effective_loan_rate / 100 / 12
    interest_saved = loan * monthly_loan_rate * tenure_months * (surplus / loan)
    interest_saved = min(interest_saved, loan * monthly_loan_rate * tenure_months)

    monthly_inv_rate = inv_return / 100 / 12
    investment_value = surplus * ((((1 + monthly_inv_rate) ** tenure_months - 1) / monthly_inv_rate) * (1 + monthly_inv_rate))
    investment_gain = investment_value - (surplus * tenure_months)
    ltcg_tax = max(0, investment_gain - 100000) * 0.10
    net_investment_gain = investment_gain - ltcg_tax

    verdict = "invest" if net_investment_gain > interest_saved else "prepay"

    return {
        "scenario": "debt_vs_invest",
        "verdict": verdict,
        "verdict_label": (
            f"Investing at {inv_return}% beats prepaying your {loan_rate}% loan."
            if verdict == "invest"
            else f"Prepaying your {loan_rate}% loan beats investing at {inv_return}%."
        ),
        "prepay": {
            "interest_saved": round(interest_saved, 2),
            "effective_loan_rate": round(effective_loan_rate, 2),
            "guaranteed_return": True,
        },
        "invest": {
            "investment_value": round(investment_value, 2),
            "investment_gain": round(investment_gain, 2),
            "ltcg_tax": round(ltcg_tax, 2),
            "net_gain": round(net_investment_gain, 2),
            "guaranteed_return": False,
        },
        "difference": round(abs(net_investment_gain - interest_saved), 2),
        "insights": [
            f"Effective loan cost after tax: {effective_loan_rate:.1f}% vs investment return: {inv_return}%",
            f"Prepaying saves {interest_saved:,.0f} in guaranteed interest",
            f"Investing could earn {net_investment_gain:,.0f} net of taxes (not guaranteed)",
            "Market returns are not guaranteed — prepaying is risk-free",
            "Build a 6-month emergency fund first before either option",
            "Split strategy: prepay high-interest loans, invest the rest",
        ],
    }
