from fastapi import APIRouter

from app.schemas.ai import AIAssistantRequest
from app.services.ai_orchestrator import execute_tool

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/assistant")
async def ai_assistant_endpoint(payload: AIAssistantRequest) -> dict:
    return await execute_tool(payload)
