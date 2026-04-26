from app.schemas.calculators import BudgetRequest
from app.schemas.common import StandardResponse


def calculate_budget(data: BudgetRequest) -> StandardResponse:
    monthly_income = data.monthly_income
    needs = data.needs
    wants = data.wants
    savings = data.savings

    recommended_needs = monthly_income * 0.50
    recommended_wants = monthly_income * 0.30
    recommended_savings = monthly_income * 0.20

    needs_difference = needs - recommended_needs
    wants_difference = wants - recommended_wants
    savings_difference = savings - recommended_savings

    total_spending = needs + wants + savings
    spending_gap = monthly_income - total_spending

    needs_pct = (needs / monthly_income) * 100
    wants_pct = (wants / monthly_income) * 100
    savings_pct = (savings / monthly_income) * 100

    savings_target_status = "meeting" if savings_pct >= 20 else "not meeting"

    return StandardResponse(
        result={
            "recommended_needs": round(recommended_needs, 2),
            "recommended_wants": round(recommended_wants, 2),
            "recommended_savings": round(recommended_savings, 2),
            "needs_difference": round(needs_difference, 2),
            "wants_difference": round(wants_difference, 2),
            "savings_difference": round(savings_difference, 2),
            "needs_pct": round(needs_pct, 2),
            "wants_pct": round(wants_pct, 2),
            "savings_pct": round(savings_pct, 2),
            "spending_gap": round(spending_gap, 2),
            "total_spending": round(total_spending, 2),
        },
        summary=f"On ₹{monthly_income:,.2f}/month income, you are saving {savings_pct:.2f}% ({savings_target_status} the 20% target).",
        insights=[
            f"Needs consume {needs_pct:.2f}% of income vs 50% benchmark.",
            f"Wants consume {wants_pct:.2f}% of income vs 30% benchmark.",
            f"Savings are {savings_pct:.2f}% vs 20% benchmark.",
            "Rebalance categories gradually to improve sustainability.",
            "Positive spending gap indicates surplus; negative indicates overspending.",
        ],
    )
