from fastapi import APIRouter, HTTPException, Request

from app.schemas.decision import DecisionRequest, DecisionResponse, ScenarioRequest, ScenarioResponse
from app.services.decision_engine import run_decision
from app.services.scenarios import (
    run_debt_vs_invest,
    run_early_retirement,
    run_loan_comparison,
    run_lumpsum_vs_sip,
    run_rent_vs_buy,
)
from app.utils.limiter import limiter

router = APIRouter(tags=["decision"])

SCENARIO_MAP = {
    "rent_vs_buy": run_rent_vs_buy,
    "debt_vs_invest": run_debt_vs_invest,
    "lumpsum_vs_sip": run_lumpsum_vs_sip,
    "early_retirement": run_early_retirement,
    "loan_comparison": run_loan_comparison,
}


@router.post("/api/ai/decision", response_model=DecisionResponse)
@limiter.limit("10/minute")
async def decision_endpoint(request: Request, body: DecisionRequest):
    result = await run_decision(
        user_message=body.message,
        conversation_history=body.conversation_history,
        context=body.context,
    )
    return result


@router.post("/api/ai/scenario", response_model=ScenarioResponse)
@limiter.limit("20/minute")
async def scenario_endpoint(request: Request, body: ScenarioRequest):
    scenario_fn = SCENARIO_MAP.get(body.scenario)
    if not scenario_fn:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown scenario: {body.scenario}. Valid: {list(SCENARIO_MAP.keys())}",
        )
    result = await scenario_fn(body.inputs)
    return ScenarioResponse(
        scenario=result["scenario"],
        verdict=result["verdict"],
        verdict_label=result["verdict_label"],
        insights=result["insights"],
        data={
            k: v
            for k, v in result.items()
            if k not in ["scenario", "verdict", "verdict_label", "insights"]
        },
    )
