from fastapi import APIRouter, Request

from app.core.config import get_settings
from app.schemas.ai import AIAssistantRequest, AIAssistantResponse
from app.services.ai_orchestrator import execute_tool
from app.utils.limiter import limiter

router = APIRouter(prefix="/ai", tags=["ai"])
settings = get_settings()


@router.post("/assistant", response_model=AIAssistantResponse)
@limiter.limit(settings.ai_chat_rate_limit)
async def ai_assistant_endpoint(request: Request, payload: AIAssistantRequest) -> dict:
    _ = request
    return await execute_tool(payload)


@router.post("/chat", response_model=AIAssistantResponse)
@limiter.limit(settings.ai_chat_rate_limit)
async def ai_chat_endpoint(request: Request, payload: AIAssistantRequest) -> dict:
    _ = request
    return await execute_tool(payload)
