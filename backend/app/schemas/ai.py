from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class AIAssistantRequest(BaseModel):
    query: str = Field(min_length=3, max_length=2000)
    locale: Optional[str] = None
    preferred_currency: Optional[str] = Field(default=None, min_length=3, max_length=3)


class ToolDecision(BaseModel):
    tool: str
    arguments: Dict[str, Any]
