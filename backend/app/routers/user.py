from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException

from app.schemas.user import SaveCalculationRequest
from app.services.firebase_service import list_user_calculations, save_user_calculation, verify_firebase_token

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
