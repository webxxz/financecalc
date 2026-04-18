from pydantic import BaseModel, Field, PositiveFloat, PositiveInt


class MortgageRefinanceRequest(BaseModel):
    current_loan_balance: PositiveFloat
    current_annual_interest_rate: float = Field(ge=0, le=100)
    current_remaining_term_months: PositiveInt
    new_annual_interest_rate: float = Field(ge=0, le=100)
    new_loan_term_months: PositiveInt
    closing_costs: float = Field(default=0, ge=0)
