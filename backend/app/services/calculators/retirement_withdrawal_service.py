from app.schemas.calculators import RetirementWithdrawalRequest
from app.schemas.common import StandardResponse


def calculate_retirement_withdrawal(data: RetirementWithdrawalRequest) -> StandardResponse:
    withdrawal_rate_decimal = data.safe_withdrawal_rate / 100
    required_nest_egg = data.annual_spending_needed / withdrawal_rate_decimal
    funding_gap = max(0.0, required_nest_egg - data.current_retirement_savings)
    funded_surplus = max(0.0, data.current_retirement_savings - required_nest_egg)
    coverage_ratio = data.current_retirement_savings / required_nest_egg if required_nest_egg else 0.0
    sustainable_annual_withdrawal_from_current = data.current_retirement_savings * withdrawal_rate_decimal

    return StandardResponse(
        result={
            "required_nest_egg": round(required_nest_egg, 2),
            "current_retirement_savings": round(data.current_retirement_savings, 2),
            "funding_gap": round(funding_gap, 2),
            "funded_surplus": round(funded_surplus, 2),
            "portfolio_coverage_ratio": round(coverage_ratio, 4),
            "sustainable_annual_withdrawal_from_current": round(sustainable_annual_withdrawal_from_current, 2),
            "sustainable_monthly_withdrawal_from_current": round(sustainable_annual_withdrawal_from_current / 12, 2),
            "assumed_safe_withdrawal_rate": round(data.safe_withdrawal_rate, 2),
        },
        summary="Retirement withdrawal readiness is estimated using the 4% rule framework (or your selected safe withdrawal rate).",
        insights=[
            "The 4% rule is a planning heuristic, not a guaranteed retirement income contract.",
            "Reassess withdrawal assumptions for inflation, taxes, and market sequence risk.",
            f"Estimated required portfolio for your spending target is {required_nest_egg:.2f}.",
        ],
    )
