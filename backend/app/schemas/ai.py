from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AIAssistantRequest(BaseModel):
    query: str = Field(min_length=3, max_length=2000)
    locale: Optional[str] = None
    preferred_currency: Optional[str] = Field(default=None, min_length=3, max_length=3)


class ToolDecision(BaseModel):
    tool: str
    arguments: Dict[str, Any]


class AIAssistantResponse(BaseModel):
    result: Dict[str, Any] = Field(default_factory=dict)
    summary: str
    insights: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    tools_used: List[str] = Field(default_factory=list)
    tool_arguments_list: List[Dict[str, Any]] = Field(default_factory=list)
    tool_used: Optional[str] = None
    tool_arguments: Optional[Dict[str, Any]] = None
