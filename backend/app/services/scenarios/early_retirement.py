"""Early retirement readiness check."""


async def run_early_retirement(inputs: dict) -> dict:
    """
    Inputs:
      current_age: int
      target_retirement_age: int
      current_savings: float
      monthly_savings: float
      expected_return_rate: float     (default 10)
      post_retirement_return: float   (default 6)
      monthly_expenses_today: float
      inflation_rate: float           (default 6)
      life_expectancy: int            (default 85)
    """
    current_age = inputs["current_age"]
    target_age = inputs["target_retirement_age"]
    current_savings = inputs["current_savings"]
    monthly_savings = inputs["monthly_savings"]
    pre_rate = inputs.get("expected_return_rate", 10.0)
    post_rate = inputs.get("post_retirement_return", 6.0)
    monthly_expenses = inputs["monthly_expenses_today"]
    inflation = inputs.get("inflation_rate", 6.0)
    life_expectancy = inputs.get("life_expectancy", 85)

    years_to_retire = target_age - current_age
    retirement_years = life_expectancy - target_age
    tenure_months = years_to_retire * 12
    monthly_pre_rate = pre_rate / 100 / 12

    corpus_from_savings = current_savings * ((1 + pre_rate / 100) ** years_to_retire)
    corpus_from_monthly = monthly_savings * ((((1 + monthly_pre_rate) ** tenure_months - 1) / monthly_pre_rate) * (1 + monthly_pre_rate))
    projected_corpus = corpus_from_savings + corpus_from_monthly

    expenses_at_retirement = monthly_expenses * ((1 + inflation / 100) ** years_to_retire)
    annual_expenses = expenses_at_retirement * 12
    monthly_post_rate = post_rate / 100 / 12
    retirement_months = retirement_years * 12

    required_corpus = expenses_at_retirement * ((1 - (1 + monthly_post_rate) ** (-retirement_months)) / monthly_post_rate)

    corpus_gap = max(0, required_corpus - projected_corpus)
    is_on_track = projected_corpus >= required_corpus
    coverage_percent = round(projected_corpus / required_corpus * 100, 1)

    additional_monthly_needed = 0.0
    if not is_on_track and tenure_months > 0:
        additional_monthly_needed = corpus_gap / ((((1 + monthly_pre_rate) ** tenure_months - 1) / monthly_pre_rate) * (1 + monthly_pre_rate))

    yearly_growth = []
    for year in range(1, years_to_retire + 1):
        y_months = year * 12
        sv = current_savings * ((1 + pre_rate / 100) ** year)
        mv = monthly_savings * ((((1 + monthly_pre_rate) ** y_months - 1) / monthly_pre_rate) * (1 + monthly_pre_rate))
        yearly_growth.append(
            {
                "year": year,
                "age": current_age + year,
                "corpus": round(sv + mv, 2),
                "invested": round(current_savings + monthly_savings * y_months, 2),
            }
        )

    return {
        "scenario": "early_retirement",
        "verdict": "on_track" if is_on_track else "gap_exists",
        "verdict_label": (
            f"You are on track to retire at {target_age}."
            if is_on_track
            else f"You have a corpus gap of {corpus_gap:,.0f}. Here is how to close it."
        ),
        "projected_corpus": round(projected_corpus, 2),
        "required_corpus": round(required_corpus, 2),
        "corpus_gap": round(corpus_gap, 2),
        "coverage_percent": coverage_percent,
        "monthly_expenses_at_retirement": round(expenses_at_retirement, 2),
        "additional_monthly_savings_needed": round(additional_monthly_needed, 2),
        "years_to_retire": years_to_retire,
        "retirement_years": retirement_years,
        "yearly_growth": yearly_growth,
        "insights": [
            f"Projected corpus covers {coverage_percent}% of what you need",
            f"Monthly expenses of {monthly_expenses:,.0f} grow to {expenses_at_retirement:,.0f} at retirement",
            f"You need {required_corpus:,.0f} to sustain {retirement_years} years of retirement",
            (
                "You are on track."
                if is_on_track
                else f"Save an extra {additional_monthly_needed:,.0f}/month to close the gap."
            ),
            f"Each year you delay retirement reduces required corpus by ~{annual_expenses:,.0f}",
        ],
    }
