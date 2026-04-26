from pydantic import AliasChoices, BaseModel, Field, PositiveFloat, PositiveInt


class EMIRequest(BaseModel):
    principal: PositiveFloat
    annual_interest_rate: float = Field(ge=0, le=100)
    tenure_months: PositiveInt


class SIPRequest(BaseModel):
    monthly_investment: PositiveFloat
    annual_return_rate: float = Field(ge=0, le=100)
    tenure_years: PositiveInt = Field(validation_alias=AliasChoices("tenure_years", "years"))


class FDRequest(BaseModel):
    principal: PositiveFloat
    annual_interest_rate: float = Field(ge=0, le=100)
    tenure_years: PositiveFloat
    compounding_frequency: PositiveInt = Field(default=4)


class RDRequest(BaseModel):
    monthly_deposit: PositiveFloat
    annual_interest_rate: float = Field(ge=0, le=100)
    tenure_months: PositiveInt


class PPFRequest(BaseModel):
    annual_investment: PositiveFloat
    tenure_years: int = Field(ge=15, le=50)
    current_ppf_rate: float = Field(default=7.1, ge=0, le=100)


class MortgageRequest(BaseModel):
    property_price: PositiveFloat
    down_payment: float = Field(ge=0)
    annual_interest_rate: float = Field(ge=0, le=100)
    tenure_years: PositiveInt
    annual_property_tax: float = Field(default=0, ge=0)
    annual_home_insurance: float = Field(default=0, ge=0)


class TaxRequest(BaseModel):
    annual_income: float = Field(ge=0)
    other_deductions: float = Field(default=0, ge=0)
    regime: str = Field(default="new", pattern="^(old|new)$")


class CarLoanRequest(BaseModel):
    car_price: PositiveFloat
    down_payment: float = Field(ge=0)
    annual_interest_rate: float = Field(ge=0, le=100)
    tenure_months: PositiveInt


class HomeLoanEligibilityRequest(BaseModel):
    monthly_income: PositiveFloat
    monthly_obligations: float = Field(ge=0)
    annual_interest_rate: float = Field(ge=0, le=100)
    tenure_years: PositiveInt


class LoanInterestRateRequest(BaseModel):
    loan_amount: PositiveFloat
    monthly_emi: PositiveFloat
    tenure_months: PositiveInt


class LoanTenureRequest(BaseModel):
    loan_amount: PositiveFloat
    annual_interest_rate: float = Field(ge=0, le=100)
    monthly_emi: PositiveFloat


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


class CompoundInterestRequest(BaseModel):
    principal: float = Field(gt=0)
    annual_rate: float = Field(ge=0, le=100)
    tenure_years: float = Field(gt=0)
    compounding_frequency: int = Field(default=12, ge=1)


class InflationRequest(BaseModel):
    current_amount: float = Field(gt=0)
    annual_inflation_rate: float = Field(ge=0, le=100)
    tenure_years: int = Field(ge=1)


class NetWorthRequest(BaseModel):
    cash_and_savings: float = Field(default=0, ge=0)
    investments: float = Field(default=0, ge=0)
    property_value: float = Field(default=0, ge=0)
    vehicle_value: float = Field(default=0, ge=0)
    other_assets: float = Field(default=0, ge=0)
    home_loan_outstanding: float = Field(default=0, ge=0)
    personal_loan_outstanding: float = Field(default=0, ge=0)
    car_loan_outstanding: float = Field(default=0, ge=0)
    credit_card_debt: float = Field(default=0, ge=0)
    other_liabilities: float = Field(default=0, ge=0)


class BudgetRequest(BaseModel):
    monthly_income: float = Field(gt=0)
    needs: float = Field(ge=0)
    wants: float = Field(ge=0)
    savings: float = Field(ge=0)


class DebtPayoffRequest(BaseModel):
    monthly_payment_budget: float = Field(gt=0)
    debt_1_name: str = Field(default="Debt 1")
    debt_1_balance: float = Field(ge=0)
    debt_1_rate: float = Field(ge=0, le=100)
    debt_2_name: str = Field(default="Debt 2")
    debt_2_balance: float = Field(default=0, ge=0)
    debt_2_rate: float = Field(default=0, ge=0, le=100)
    debt_3_name: str = Field(default="Debt 3")
    debt_3_balance: float = Field(default=0, ge=0)
    debt_3_rate: float = Field(default=0, ge=0, le=100)


class CurrencyConvertRequest(BaseModel):
    amount: float = Field(gt=0)
    from_currency: str = Field(min_length=3, max_length=3)
    to_currency: str = Field(min_length=3, max_length=3)
