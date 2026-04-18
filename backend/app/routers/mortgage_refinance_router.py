from fastapi import APIRouter

from app.schemas.common import StandardResponse
from app.schemas.mortgage_refinance_schema import MortgageRefinanceRequest
from app.services.mortgage_refinance_service import calculate_mortgage_refinance

router = APIRouter(tags=["mortgage-refinance"])


@router.post("/mortgage-refinance", response_model=StandardResponse)
async def mortgage_refinance_endpoint(payload: MortgageRefinanceRequest) -> StandardResponse:
    return calculate_mortgage_refinance(payload)
