"""Pay off debt vs invest — which gives better returns?"""

LTCG_EXEMPTION_AMOUNT = 100000
LTCG_TAX_RATE = 0.10


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
    if monthly_loan_rate == 0:
        baseline_interest = 0.0
        prepay_interest = 0.0
    else:
        baseline_emi = loan * monthly_loan_rate * (1 + monthly_loan_rate) ** tenure_months
        baseline_emi /= ((1 + monthly_loan_rate) ** tenure_months) - 1

        baseline_interest = 0.0
        baseline_balance = loan
        for _ in range(tenure_months):
            baseline_month_interest = baseline_balance * monthly_loan_rate
            baseline_principal = baseline_emi - baseline_month_interest
            baseline_principal = min(baseline_principal, baseline_balance)
            baseline_balance -= baseline_principal
            baseline_interest += baseline_month_interest
            if baseline_balance <= 0:
                break

        prepay_interest = 0.0
        prepay_balance = loan
        for _ in range(tenure_months):
            month_interest = prepay_balance * monthly_loan_rate
            scheduled_principal = baseline_emi - month_interest
            total_principal = min(prepay_balance, scheduled_principal + max(surplus, 0))
            prepay_balance -= total_principal
            prepay_interest += month_interest
            if prepay_balance <= 0:
                break

    interest_saved = max(0.0, baseline_interest - prepay_interest)

    monthly_inv_rate = inv_return / 100 / 12
    if monthly_inv_rate == 0:
        investment_value = surplus * tenure_months
    else:
        investment_value = surplus * ((((1 + monthly_inv_rate) ** tenure_months - 1) / monthly_inv_rate) * (1 + monthly_inv_rate))
    investment_gain = investment_value - (surplus * tenure_months)
    ltcg_tax = max(0, investment_gain - LTCG_EXEMPTION_AMOUNT) * LTCG_TAX_RATE
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
