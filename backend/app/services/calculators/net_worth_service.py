from app.schemas.calculators import NetWorthRequest
from app.schemas.common import StandardResponse


def calculate_net_worth(data: NetWorthRequest) -> StandardResponse:
    total_assets = data.cash_and_savings + data.investments + data.property_value + data.vehicle_value + data.other_assets
    total_liabilities = (
        data.home_loan_outstanding
        + data.personal_loan_outstanding
        + data.car_loan_outstanding
        + data.credit_card_debt
        + data.other_liabilities
    )
    net_worth = total_assets - total_liabilities
    debt_to_asset_ratio = (total_liabilities / total_assets * 100) if total_assets > 0 else 0.0

    if net_worth > 0 and debt_to_asset_ratio < 30:
        financial_health = "Excellent"
    elif net_worth > 0 and debt_to_asset_ratio < 50:
        financial_health = "Good"
    elif net_worth > 0:
        financial_health = "Fair"
    else:
        financial_health = "Needs Attention"

    return StandardResponse(
        result={
            "total_assets": round(total_assets, 2),
            "total_liabilities": round(total_liabilities, 2),
            "net_worth": round(net_worth, 2),
            "debt_to_asset_ratio": round(debt_to_asset_ratio, 2),
            "financial_health": financial_health,
        },
        summary=f"Your net worth is ₹{net_worth:,.2f}. Your debt-to-asset ratio is {debt_to_asset_ratio:.2f}% ({financial_health}).",
        insights=[
            "Net worth improves when assets grow faster than liabilities.",
            "Lower debt-to-asset ratio generally indicates stronger financial resilience.",
            "Track net worth periodically to measure long-term progress.",
            "Prioritize high-interest debt repayment to improve financial health faster.",
        ],
    )
