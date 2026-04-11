from fastapi import APIRouter

from app.schemas.calculators import EMIRequest, MortgageRequest, RetirementRequest, SIPRequest, TaxRequest
from app.schemas.common import StandardResponse
from app.services.calculators import (
    calculate_emi,
    calculate_mortgage,
    calculate_retirement,
    calculate_sip,
    calculate_tax,
)

router = APIRouter(tags=["calculators"])


@router.post("/emi", response_model=StandardResponse)
async def emi_endpoint(payload: EMIRequest) -> StandardResponse:
    return calculate_emi(payload)


@router.post("/sip", response_model=StandardResponse)
async def sip_endpoint(payload: SIPRequest) -> StandardResponse:
    return calculate_sip(payload)


@router.post("/mortgage", response_model=StandardResponse)
async def mortgage_endpoint(payload: MortgageRequest) -> StandardResponse:
    return calculate_mortgage(payload)


@router.post("/tax", response_model=StandardResponse)
async def tax_endpoint(payload: TaxRequest) -> StandardResponse:
    return calculate_tax(payload)


@router.post("/retirement", response_model=StandardResponse)
async def retirement_endpoint(payload: RetirementRequest) -> StandardResponse:
    return calculate_retirement(payload)


@router.get("/catalog")
async def calculator_catalog() -> dict:
    return {
        "categories": {
            "Personal Finance": ["budget-planner", "net-worth"],
            "Loans & Mortgages": ["emi", "mortgage", "loan-tenure"],
            "Investments & Wealth": ["sip", "fd", "rd"],
            "Retirement": ["retirement-corpus", "pension-planner"],
            "Taxation": ["tax"],
            "Business & Corporate": ["roi", "break-even"],
            "Real Estate": ["rental-yield", "property-affordability"],
            "Insurance": ["life-cover", "health-premium"],
            "Currency & Global Tools": ["exchange-rate", "purchasing-power"],
            "Advanced Finance": ["irr", "npv"],
            "Utilities": ["inflation", "unit-converter"],
        }
    }
