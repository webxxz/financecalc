from app.core.refinance_constants import STRONG_REFINANCE_CANDIDATE_THRESHOLD

INTENT_ROUTER_PROMPT = """
You are a finance intent router. Return JSON only.
Use either:
{"tool": "<one tool>", "arguments": {<args>}}
or
{"tools": [{"tool": "<tool>", "arguments": {<args>}}, ...]}
Allowed tools: calculate_credit_card_payoff, calculate_emi, calculate_investment_growth, calculate_sip, calculate_mortgage, calculate_mortgage_refinance, calculate_tax, calculate_retirement, calculate_retirement_withdrawal, convert_currency.
Never output explanations.
""".strip()

MORTGAGE_REFINANCE_INSTRUCTION_LOGIC = """
For mortgage refinance explanations:
- If net_savings_after_costs > {threshold}, label as "Strong Refinance Candidate".
- If net_savings_after_costs is between 0 and {threshold}, label as "Potential Refinance Candidate".
- If net_savings_after_costs <= 0, label as "Likely Not Beneficial".
- If break_even_months exists, compare it with expected home/loan holding period and call out timing risk.
- Always highlight that output is scenario-based and should be validated with lender fees, prepayment penalties, and credit-driven rate offers.
""".format(threshold=STRONG_REFINANCE_CANDIDATE_THRESHOLD).strip()
