from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException

from app.schemas.user import SaveCalculationRequest, SaveGoalRequest, UpdateGoalRequest
from app.services.firebase_service import (
    delete_user_goal,
    list_user_calculations,
    list_user_goals,
    save_user_calculation,
    save_user_goal,
    update_user_goal,
    verify_firebase_token,
)

router = APIRouter(prefix="/user", tags=["user"])


def require_firebase_user(authorization: str = Header(default="")) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    id_token = authorization.removeprefix("Bearer ").strip()
    claims = verify_firebase_token(id_token)
    uid = claims.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid token claims")
    return uid


@router.post("/calculations")
async def save_calculation(payload: SaveCalculationRequest, uid: str = Depends(require_firebase_user)) -> dict:
    record = {
        "calculator_type": payload.calculator_type,
        "input_data": payload.input_data,
        "output_data": payload.output_data,
        "created_at": datetime.now(timezone.utc),
    }
    doc_id = save_user_calculation(uid, record)
    return {
        "result": {"id": doc_id},
        "summary": "Calculation saved to your account history.",
        "insights": ["Use dashboard history to compare scenarios over time."],
    }


@router.get("/calculations")
async def get_calculation_history(uid: str = Depends(require_firebase_user)) -> dict:
    items = list_user_calculations(uid)
    return {
        "result": {"items": items},
        "summary": "Retrieved your saved calculation history.",
        "insights": ["History helps track financial assumptions and decisions."],
    }


@router.post("/goals")
async def save_goal(payload: SaveGoalRequest, uid: str = Depends(require_firebase_user)) -> dict:
    record = {
        "title": payload.title,
        "target_amount": payload.target_amount,
        "current_amount": payload.current_amount,
        "target_date": payload.target_date,
        "notes": payload.notes,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    doc_id = save_user_goal(uid, record)
    return {
        "result": {"id": doc_id},
        "summary": "Goal saved to your dashboard.",
        "insights": ["Track progress regularly to improve target completion."],
    }


@router.get("/goals")
async def get_goals(uid: str = Depends(require_firebase_user)) -> dict:
    items = list_user_goals(uid)
    return {
        "result": {"items": items},
        "summary": "Retrieved your financial goals.",
        "insights": ["Update current amount to keep projections accurate."],
    }


@router.patch("/goals/{goal_id}")
async def patch_goal(goal_id: str, payload: UpdateGoalRequest, uid: str = Depends(require_firebase_user)) -> dict:
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    updates["updated_at"] = datetime.now(timezone.utc)
    update_user_goal(uid, goal_id, updates)
    return {
        "result": {"id": goal_id},
        "summary": "Goal updated successfully.",
        "insights": ["Review your milestone progress after each update."],
    }


@router.delete("/goals/{goal_id}")
async def remove_goal(goal_id: str, uid: str = Depends(require_firebase_user)) -> dict:
    delete_user_goal(uid, goal_id)
    return {
        "result": {"id": goal_id},
        "summary": "Goal removed from dashboard.",
        "insights": ["Keep active goals focused on your top priorities."],
    }


@router.get("/dashboard")
async def get_dashboard(uid: str = Depends(require_firebase_user)) -> dict:
    goals = list_user_goals(uid)
    calculations = list_user_calculations(uid)
    history = sorted(
        [
            {"type": "goal", "id": g["id"], "created_at": g.get("created_at"), "title": g.get("title")}
            for g in goals
        ]
        + [
            {
                "type": "calculation",
                "id": c["id"],
                "created_at": c.get("created_at"),
                "title": c.get("calculator_type"),
            }
            for c in calculations
        ],
        key=lambda item: item.get("created_at") or datetime.now(timezone.utc),
        reverse=True,
    )
    return {
        "result": {"goals": goals, "calculations": calculations, "history": history},
        "summary": "Dashboard data loaded.",
        "insights": ["Use your history feed to compare assumptions and improve financial planning."],
    }
