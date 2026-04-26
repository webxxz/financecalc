from fastapi import APIRouter, Request

from app.core.config import get_settings
from app.schemas.calculators import (
    BudgetRequest,
    CarLoanRequest,
    CompoundInterestRequest,
    CreditCardPayoffRequest,
    DebtPayoffRequest,
    EMIRequest,
    FDRequest,
    HomeLoanEligibilityRequest,
    InflationRequest,
    InvestmentGrowthRequest,
    LoanInterestRateRequest,
    LoanTenureRequest,
    MortgageRequest,
    NetWorthRequest,
    PPFRequest,
    RDRequest,
    RetirementRequest,
    RetirementWithdrawalRequest,
    SIPRequest,
    TaxRequest,
)
from app.schemas.common import StandardResponse
from app.services.calculators import (
    calculate_budget,
    calculate_car_loan,
    calculate_compound_interest,
    calculate_credit_card_payoff,
    calculate_debt_payoff,
    calculate_emi,
    calculate_fd,
    calculate_home_loan_eligibility,
    calculate_inflation,
    calculate_investment_growth,
    calculate_loan_interest_rate,
    calculate_loan_tenure,
    calculate_mortgage,
    calculate_net_worth,
    calculate_ppf,
    calculate_rd,
    calculate_retirement,
    calculate_retirement_withdrawal,
    calculate_sip,
    calculate_tax,
)
from app.utils.limiter import limiter

router = APIRouter(tags=["calculators"])
settings = get_settings()
calculator_rate_limit = f"{settings.requests_per_minute}/minute"


@router.post("/emi", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def emi_endpoint(request: Request, payload: EMIRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_emi(payload)


@router.post("/sip", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def sip_endpoint(request: Request, payload: SIPRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_sip(payload)


@router.post("/api/fd", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def fd_endpoint(request: Request, payload: FDRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_fd(payload)


@router.post("/api/rd", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def rd_endpoint(request: Request, payload: RDRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_rd(payload)


@router.post("/api/ppf", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def ppf_endpoint(request: Request, payload: PPFRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_ppf(payload)


@router.post("/mortgage", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def mortgage_endpoint(request: Request, payload: MortgageRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_mortgage(payload)


@router.post("/api/tax", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def tax_endpoint(request: Request, payload: TaxRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_tax(payload)


@router.post("/api/car-loan", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def car_loan_endpoint(request: Request, payload: CarLoanRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_car_loan(payload)


@router.post("/api/home-loan-eligibility", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def home_loan_eligibility_endpoint(request: Request, payload: HomeLoanEligibilityRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_home_loan_eligibility(payload)


@router.post("/api/loan-interest-rate", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def loan_interest_rate_endpoint(request: Request, payload: LoanInterestRateRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_loan_interest_rate(payload)


@router.post("/api/loan-tenure", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def loan_tenure_endpoint(request: Request, payload: LoanTenureRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_loan_tenure(payload)


@router.post("/retirement", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def retirement_endpoint(request: Request, payload: RetirementRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_retirement(payload)


@router.post("/credit-card-payoff", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def credit_card_payoff_endpoint(request: Request, payload: CreditCardPayoffRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_credit_card_payoff(payload)


@router.post("/investment-growth", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def investment_growth_endpoint(request: Request, payload: InvestmentGrowthRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_investment_growth(payload)


@router.post("/retirement-withdrawal", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def retirement_withdrawal_endpoint(request: Request, payload: RetirementWithdrawalRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_retirement_withdrawal(payload)


@router.post("/compound-interest", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def compound_interest_endpoint(request: Request, payload: CompoundInterestRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_compound_interest(payload)


@router.post("/inflation", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def inflation_endpoint(request: Request, payload: InflationRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_inflation(payload)


@router.post("/net-worth", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def net_worth_endpoint(request: Request, payload: NetWorthRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_net_worth(payload)


@router.post("/budget", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def budget_endpoint(request: Request, payload: BudgetRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_budget(payload)


@router.post("/debt-payoff", response_model=StandardResponse)
@limiter.limit(calculator_rate_limit)
async def debt_payoff_endpoint(request: Request, payload: DebtPayoffRequest) -> StandardResponse:
    # request is required for slowapi's limiter key function.
    return calculate_debt_payoff(payload)


@router.get("/catalog")
async def calculator_catalog() -> dict:
    implemented = {
        "budget",
        "car-loan",
        "compound-interest",
        "credit-card-payoff",
        "currency-converter",
        "debt-payoff",
        "emi",
        "fd",
        "home-loan-eligibility",
        "inflation",
        "investment-growth",
        "loan-interest-rate",
        "loan-tenure",
        "sip",
        "mortgage",
        "mortgage-refinance",
        "net-worth",
        "ppf",
        "rd",
        "tax",
        "retirement",
        "retirement-withdrawal",
        "exchange-rate",
    }

    def with_status(items: list[str]) -> list[dict]:
        return [{"slug": item, "status": "implemented" if item in implemented else "planned"} for item in items]

    return {
        "categories": {
            "Personal Finance": with_status(["budget", "net-worth", "credit-card-payoff", "debt-payoff", "tax"]),
            "Loans & Mortgages": with_status(
                ["emi", "car-loan", "mortgage", "mortgage-refinance", "home-loan-eligibility", "loan-interest-rate", "loan-tenure"]
            ),
            "Investments & Wealth": with_status(["sip", "fd", "rd", "ppf", "investment-growth", "compound-interest"]),
            "Retirement": with_status(["retirement", "retirement-withdrawal"]),
            "Taxation": with_status(["tax"]),
            "Business & Corporate": with_status(["roi", "break-even"]),
            "Real Estate": with_status(["rental-yield", "property-affordability"]),
            "Insurance": with_status(["life-cover", "health-premium"]),
            "Currency & Global Tools": with_status(["exchange-rate", "currency-converter", "purchasing-power"]),
            "Advanced Finance": with_status(["irr", "npv"]),
            "Utilities": with_status(["inflation", "unit-converter"]),
        }
    }
