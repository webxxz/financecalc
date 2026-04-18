from pydantic import BaseModel, Field, PositiveFloat, PositiveInt


class EMIRequest(BaseModel):
    principal: PositiveFloat
    annual_interest_rate: float = Field(ge=0, le=100)
    tenure_months: PositiveInt


class SIPRequest(BaseModel):
    monthly_investment: PositiveFloat
    annual_return_rate: float = Field(ge=0, le=100)
    years: PositiveInt


class MortgageRequest(BaseModel):
    property_price: PositiveFloat
    down_payment: float = Field(ge=0)
    annual_interest_rate: float = Field(ge=0, le=100)
    tenure_years: PositiveInt
    annual_property_tax: float = Field(default=0, ge=0)
    annual_home_insurance: float = Field(default=0, ge=0)


class TaxRequest(BaseModel):
    annual_income: float = Field(gt=0)
    deductions: float = Field(default=0, ge=0)
    country_code: str = Field(default="US", min_length=2, max_length=2)


class RetirementRequest(BaseModel):
    current_savings: float = Field(ge=0)
    annual_contribution: float = Field(ge=0)
    expected_annual_return_rate: float = Field(ge=0, le=100)
    years_to_retirement: PositiveInt


class CreditCardPayoffRequest(BaseModel):
    current_balance: PositiveFloat
    annual_interest_rate: float = Field(ge=0, le=100)
    monthly_payment: PositiveFloat


class InvestmentGrowthRequest(BaseModel):
    initial_investment: float = Field(ge=0)
    monthly_contribution: float = Field(ge=0)
    annual_return_rate: float = Field(ge=0, le=100)
    years: PositiveInt


class RetirementWithdrawalRequest(BaseModel):
    annual_spending_needed: PositiveFloat
    current_retirement_savings: float = Field(ge=0)
    safe_withdrawal_rate: float = Field(default=4, ge=1, le=10)
