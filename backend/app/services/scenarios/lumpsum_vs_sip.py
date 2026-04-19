"""Lump sum investment vs monthly SIP — which strategy wins?"""


async def run_lumpsum_vs_sip(inputs: dict) -> dict:
    """
    Inputs:
      total_amount: float
      expected_return_rate: float
      tenure_years: int
    """
    total = inputs["total_amount"]
    annual_rate = inputs["expected_return_rate"]
    tenure_years = inputs["tenure_years"]
    monthly_rate = annual_rate / 100 / 12
    tenure_months = tenure_years * 12
    monthly_sip = total / tenure_months

    lumpsum_value = total * ((1 + annual_rate / 100) ** tenure_years)
    sip_value = monthly_sip * ((((1 + monthly_rate) ** tenure_months - 1) / monthly_rate) * (1 + monthly_rate))
    lumpsum_gain = lumpsum_value - total
    sip_gain = sip_value - total
    verdict = "lumpsum" if lumpsum_value > sip_value else "sip"

    yearly_comparison = []
    for year in range(1, tenure_years + 1):
        y_months = year * 12
        ls_val = total * ((1 + annual_rate / 100) ** year)
        sip_val = monthly_sip * ((((1 + monthly_rate) ** y_months - 1) / monthly_rate) * (1 + monthly_rate))
        yearly_comparison.append(
            {
                "year": year,
                "lumpsum": round(ls_val, 2),
                "sip": round(sip_val, 2),
                "sip_invested": round(monthly_sip * y_months, 2),
            }
        )

    return {
        "scenario": "lumpsum_vs_sip",
        "verdict": verdict,
        "verdict_label": (
            "Investing the full amount now (lump sum) yields more."
            if verdict == "lumpsum"
            else "Spreading investments monthly (SIP) yields more."
        ),
        "lumpsum": {
            "invested": round(total, 2),
            "final_value": round(lumpsum_value, 2),
            "total_gain": round(lumpsum_gain, 2),
        },
        "sip": {
            "monthly_amount": round(monthly_sip, 2),
            "total_invested": round(total, 2),
            "final_value": round(sip_value, 2),
            "total_gain": round(sip_gain, 2),
        },
        "difference": round(abs(lumpsum_value - sip_value), 2),
        "yearly_comparison": yearly_comparison,
        "insights": [
            "Lump sum wins when markets trend upward — money compounds longer",
            "SIP wins in volatile markets — cost averaging reduces risk",
            f"Difference after {tenure_years} years: {abs(lumpsum_value - sip_value):,.0f}",
            "If you cannot time the market, SIP removes psychological burden",
            "Hybrid: invest 50% as lump sum + 50% as SIP over 12 months",
        ],
    }
