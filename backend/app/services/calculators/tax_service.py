from app.schemas.calculators import TaxRequest
from app.schemas.common import StandardResponse

# Simplified effective planning rates (not legal/marginal slab rates).
# These are used only for quick product-level estimates and should be
# replaced with jurisdiction-specific slab engines for compliance use cases.
TAX_RATE_BY_COUNTRY = {
    "US": 0.22,
    "IN": 0.20,
    "GB": 0.20,
    "DE": 0.25,
    "FR": 0.25,
    "CA": 0.24,
}


def calculate_tax(data: TaxRequest) -> StandardResponse:
    country = data.country_code.upper()
    tax_rate = TAX_RATE_BY_COUNTRY.get(country, 0.22)
    taxable_income = max(0.0, data.annual_income - data.deductions)
    estimated_tax = taxable_income * tax_rate
    net_income = data.annual_income - estimated_tax

    return StandardResponse(
        result={
            "country_code": country,
            "tax_rate": tax_rate,
            "taxable_income": round(taxable_income, 2),
            "estimated_tax": round(estimated_tax, 2),
            "net_income_after_tax": round(net_income, 2),
        },
        summary="Tax estimate uses a simplified country-level effective rate for quick planning.",
        insights=[
            "This estimate is for planning and not a legal tax filing output.",
            "Adding eligible deductions can reduce taxable income.",
            "Use country-specific slabs in later iterations for precision.",
        ],
    )
