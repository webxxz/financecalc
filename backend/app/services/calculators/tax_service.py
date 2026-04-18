from app.schemas.calculators import TaxRequest
from app.schemas.common import StandardResponse


CESS_RATE = 0.04


OLD_SLABS = [
    (250000, 0.0),
    (500000, 0.05),
    (1000000, 0.20),
    (float("inf"), 0.30),
]

NEW_SLABS = [
    (300000, 0.0),
    (700000, 0.05),
    (1000000, 0.10),
    (1200000, 0.15),
    (1500000, 0.20),
    (float("inf"), 0.30),
]


def _slab_tax(taxable_income: float, slabs: list[tuple[float, float]]) -> float:
    tax = 0.0
    lower = 0.0
    for upper, rate in slabs:
        if taxable_income <= lower:
            break
        slab_income = min(taxable_income, upper) - lower
        if slab_income > 0:
            tax += slab_income * rate
        lower = upper
    return tax


def _compute_old_regime_tax(annual_income: float, other_deductions: float) -> tuple[float, float, float, float]:
    taxable_income = max(0.0, annual_income - 50000 - other_deductions)
    tax_before_cess = _slab_tax(taxable_income, OLD_SLABS)
    if taxable_income <= 500000:
        return taxable_income, 0.0, 0.0, 0.0
    cess = tax_before_cess * CESS_RATE
    total_tax = tax_before_cess + cess
    return taxable_income, tax_before_cess, cess, total_tax


def _compute_new_regime_tax(annual_income: float) -> tuple[float, float, float, float]:
    taxable_income = max(0.0, annual_income - 75000)
    tax_before_cess = _slab_tax(taxable_income, NEW_SLABS)
    if taxable_income <= 700000:
        return taxable_income, 0.0, 0.0, 0.0
    cess = tax_before_cess * CESS_RATE
    total_tax = tax_before_cess + cess
    return taxable_income, tax_before_cess, cess, total_tax


def calculate_tax(data: TaxRequest) -> StandardResponse:
    gross_income = data.annual_income
    regime = data.regime.lower()

    old_taxable, old_tax_before_cess, old_cess, old_total_tax = _compute_old_regime_tax(gross_income, data.other_deductions)
    new_taxable, new_tax_before_cess, new_cess, new_total_tax = _compute_new_regime_tax(gross_income)

    if regime == "old":
        taxable_income = old_taxable
        tax_before_cess = old_tax_before_cess
        cess = old_cess
        total_tax = old_total_tax
    else:
        taxable_income = new_taxable
        tax_before_cess = new_tax_before_cess
        cess = new_cess
        total_tax = new_total_tax

    rebate_applies = (regime == "old" and taxable_income <= 500000) or (regime == "new" and taxable_income <= 700000)
    if rebate_applies:
        tax_before_cess = 0.0
        cess = 0.0
        total_tax = 0.0
    net_income_after_tax = gross_income - total_tax
    effective_tax_rate = 0.0 if rebate_applies else ((total_tax / gross_income * 100) if gross_income > 0 else 0.0)
    monthly_take_home = net_income_after_tax / 12 if gross_income > 0 else 0.0

    if old_total_tax < new_total_tax:
        better_regime_note = "For this income and deduction profile, the old regime appears more tax-efficient."
    elif new_total_tax < old_total_tax:
        better_regime_note = "For this income and deduction profile, the new regime appears more tax-efficient."
    else:
        better_regime_note = "Both old and new regimes result in nearly the same tax outgo for this profile."

    if regime == "old":
        rebate_note = (
            "Rebate u/s 87A applied since taxable income is up to ₹5,00,000 under old regime."
            if taxable_income <= 500000
            else "No rebate u/s 87A is available because taxable income exceeds ₹5,00,000 under old regime."
        )
    else:
        rebate_note = (
            "Rebate u/s 87A applied since taxable income is up to ₹7,00,000 under new regime."
            if taxable_income <= 700000
            else "No rebate u/s 87A is available because taxable income exceeds ₹7,00,000 under new regime."
        )

    return StandardResponse(
        result={
            "gross_income": round(gross_income, 2),
            "taxable_income": round(taxable_income, 2),
            "tax_before_cess": round(tax_before_cess, 2),
            "cess": round(cess, 2),
            "total_tax": round(total_tax, 2),
            "net_income_after_tax": round(net_income_after_tax, 2),
            "effective_tax_rate": round(effective_tax_rate, 2),
            "monthly_take_home": round(monthly_take_home, 2),
        },
        summary=(
            f"On ₹{gross_income:,.2f} income under the {regime} regime, your total tax is ₹{total_tax:,.2f} "
            f"(effective rate {effective_tax_rate:.2f}%)."
        ),
        insights=[
            better_regime_note,
            rebate_note,
            "Cess at 4% is applied on tax amount after slab and rebate adjustments.",
            "In old regime, standard deduction ₹50,000 and your declared deductions are considered; in new regime, only ₹75,000 standard deduction is considered.",
        ],
    )


# Test: income=700000, regime=new, deductions=0
#   taxable = 700000 - 75000 = 625000 → tax = 25000*5% = 12500
#   rebate applies (625000 ≤ 700000) → total_tax = 0
# Test: income=700001, regime=new, deductions=0
#   taxable = 700001 - 75000 = 625001 → rebate does NOT apply
#   tax = 25001 * 5% = 1250.05 → cess = 50.002 → total = 1300.05
# Test: income=500000, regime=old, deductions=0
#   taxable = 500000 - 50000 = 450000 → tax = 200000*5% = 10000
#   rebate applies (450000 ≤ 500000) → total_tax = 0
