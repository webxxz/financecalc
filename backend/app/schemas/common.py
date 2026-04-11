from typing import Any, Dict, List

from pydantic import BaseModel, Field


class StandardResponse(BaseModel):
    result: Dict[str, Any] = Field(default_factory=dict)
    summary: str
    insights: List[str] = Field(default_factory=list)
