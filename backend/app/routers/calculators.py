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
    implemented = {
        "emi",
        "sip",
        "mortgage",
        "mortgage-refinance",
        "tax",
        "retirement",
        "exchange-rate",
    }

    def with_status(items: list[str]) -> list[dict]:
        return [{"slug": item, "status": "implemented" if item in implemented else "planned"} for item in items]

    return {
        "categories": {
            "Personal Finance": with_status(["budget-planner", "net-worth"]),
            "Loans & Mortgages": with_status(["emi", "mortgage", "mortgage-refinance", "loan-tenure"]),
            "Investments & Wealth": with_status(["sip", "fd", "rd"]),
            "Retirement": with_status(["retirement"]),
            "Taxation": with_status(["tax"]),
            "Business & Corporate": with_status(["roi", "break-even"]),
            "Real Estate": with_status(["rental-yield", "property-affordability"]),
            "Insurance": with_status(["life-cover", "health-premium"]),
            "Currency & Global Tools": with_status(["exchange-rate", "purchasing-power"]),
            "Advanced Finance": with_status(["irr", "npv"]),
            "Utilities": with_status(["inflation", "unit-converter"]),
        }
    }
