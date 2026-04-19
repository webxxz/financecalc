"""Compare two loan offers side by side."""


async def run_loan_comparison(inputs: dict) -> dict:
    """
    Inputs:
      loan_amount: float
      loan_a_rate: float    (annual %)
      loan_a_tenure: int    (months)
      loan_a_fees: float    (default 0)
      loan_b_rate: float
      loan_b_tenure: int
      loan_b_fees: float    (default 0)
    """
    principal = inputs["loan_amount"]
    rate_a = inputs["loan_a_rate"]
    tenure_a = inputs["loan_a_tenure"]
    fees_a = inputs.get("loan_a_fees", 0)
    rate_b = inputs["loan_b_rate"]
    tenure_b = inputs["loan_b_tenure"]
    fees_b = inputs.get("loan_b_fees", 0)

    def compute_loan(rate: float, tenure: int, fees: float) -> dict:
        r = rate / 100 / 12
        emi = principal * r * (1 + r) ** tenure / ((1 + r) ** tenure - 1)
        total_payment = emi * tenure + fees
        total_interest = total_payment - principal - fees
        effective_rate = ((total_payment / principal) ** (12 / tenure) - 1) * 100
        return {
            "emi": round(emi, 2),
            "total_payment": round(total_payment, 2),
            "total_interest": round(total_interest, 2),
            "processing_fee": round(fees, 2),
            "total_cost": round(total_payment, 2),
            "effective_annual_rate": round(effective_rate, 2),
        }

    loan_a = compute_loan(rate_a, tenure_a, fees_a)
    loan_b = compute_loan(rate_b, tenure_b, fees_b)
    verdict = "loan_a" if loan_a["total_cost"] <= loan_b["total_cost"] else "loan_b"
    savings = abs(loan_a["total_cost"] - loan_b["total_cost"])
    emi_diff = abs(loan_a["emi"] - loan_b["emi"])

    return {
        "scenario": "loan_comparison",
        "verdict": verdict,
        "verdict_label": (
            f"Loan A is cheaper by {savings:,.0f} over the loan period."
            if verdict == "loan_a"
            else f"Loan B is cheaper by {savings:,.0f} over the loan period."
        ),
        "loan_a": loan_a,
        "loan_b": loan_b,
        "total_savings": round(savings, 2),
        "monthly_emi_difference": round(emi_diff, 2),
        "insights": [
            f"Loan A EMI: {loan_a['emi']:,.0f} vs Loan B: {loan_b['emi']:,.0f}",
            f"Total interest A: {loan_a['total_interest']:,.0f} vs B: {loan_b['total_interest']:,.0f}",
            "Always include processing fees when comparing loan offers",
            "Lower EMI with longer tenure means more total interest paid",
            "Ask about prepayment charges before signing",
        ],
    }
