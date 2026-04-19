"""Rent vs Buy decision scenario."""

from app.services.ai_orchestrator import _run_tools_parallel


async def run_rent_vs_buy(inputs: dict) -> dict:
    """
    Inputs:
      monthly_rent: float
      property_price: float
      down_payment: float
      annual_interest_rate: float
      tenure_years: int
      annual_property_appreciation: float (default 5.0)
      annual_investment_return: float     (default 10.0)
      annual_property_tax: float          (default 0)
      annual_home_insurance: float        (default 0)
    """
    monthly_rent = inputs["monthly_rent"]
    property_price = inputs["property_price"]
    down_payment = inputs["down_payment"]
    annual_rate = inputs["annual_interest_rate"]
    tenure_years = inputs["tenure_years"]
    appreciation_rate = inputs.get("annual_property_appreciation", 5.0)
    investment_return = inputs.get("annual_investment_return", 10.0)
    annual_property_tax = inputs.get("annual_property_tax", 0)
    annual_home_insurance = inputs.get("annual_home_insurance", 0)

    tool_calls = [
        {
            "tool": "calculate_mortgage",
            "arguments": {
                "property_price": property_price,
                "down_payment": down_payment,
                "annual_interest_rate": annual_rate,
                "tenure_years": tenure_years,
                "annual_property_tax": annual_property_tax,
                "annual_home_insurance": annual_home_insurance,
            },
        },
        {
            "tool": "calculate_investment_growth",
            "arguments": {
                "initial_investment": down_payment,
                "monthly_contribution": 0,
                "annual_return_rate": investment_return,
                "tenure_years": tenure_years,
            },
        },
    ]

    results = await _run_tools_parallel(tool_calls)
    mortgage_result = results[0]["result"] or {}
    investment_result = results[1]["result"] or {}

    monthly_mortgage = mortgage_result.get("monthly_mortgage_payment", 0)
    total_mortgage_cost = mortgage_result.get("total_amount_paid", 0)
    future_property_value = property_price * ((1 + appreciation_rate / 100) ** tenure_years)
    investment_value = investment_result.get("future_value", 0)
    monthly_rate = investment_return / 100 / 12
    monthly_difference = max(monthly_mortgage - monthly_rent, 0)
    if monthly_difference > 0:
        if monthly_rate == 0:
            investment_value += monthly_difference * tenure_years * 12
        else:
            investment_value += monthly_difference * (
                (((1 + monthly_rate) ** (tenure_years * 12) - 1) / monthly_rate) * (1 + monthly_rate)
            )
    total_rent_paid = monthly_rent * tenure_years * 12

    buy_net_position = future_property_value - total_mortgage_cost
    rent_net_position = investment_value - total_rent_paid

    break_even_year = None
    for year in range(1, tenure_years + 1):
        prop_val = property_price * ((1 + appreciation_rate / 100) ** year)
        mortgage_paid = down_payment + (monthly_mortgage * year * 12)
        rent_paid_yr = monthly_rent * year * 12
        if monthly_rate == 0:
            inv_val = down_payment + (monthly_difference * year * 12)
        else:
            inv_val = (down_payment * ((1 + investment_return / 100) ** year)) + (
                monthly_difference * ((((1 + monthly_rate) ** (year * 12) - 1) / monthly_rate) * (1 + monthly_rate))
            )
        if (prop_val - mortgage_paid) >= (inv_val - rent_paid_yr):
            break_even_year = year
            break

    verdict = "buy" if buy_net_position > rent_net_position else "rent"

    return {
        "scenario": "rent_vs_buy",
        "verdict": verdict,
        "verdict_label": (
            "Buying makes more financial sense in your situation."
            if verdict == "buy"
            else "Renting and investing the difference makes more sense."
        ),
        "buy": {
            "monthly_cost": round(monthly_mortgage, 2),
            "total_cost_over_period": round(total_mortgage_cost, 2),
            "property_value_at_end": round(future_property_value, 2),
            "net_position": round(buy_net_position, 2),
        },
        "rent": {
            "monthly_cost": round(monthly_rent, 2),
            "total_rent_over_period": round(total_rent_paid, 2),
            "investment_value_at_end": round(investment_value, 2),
            "net_position": round(rent_net_position, 2),
        },
        "break_even_year": break_even_year,
        "insights": [
            f"Monthly cost to buy: {monthly_mortgage:,.0f} vs rent: {monthly_rent:,.0f}",
            f"Property worth {future_property_value:,.0f} after {tenure_years} years at {appreciation_rate}% appreciation",
            f"Down payment invested at {investment_return}% grows to {investment_value:,.0f}",
            (
                f"Break-even: buying beats renting after {break_even_year} years"
                if break_even_year
                else "Buying does not break even within the tenure period"
            ),
            "This analysis excludes maintenance costs, registration fees, and tax benefits",
        ],
    }
