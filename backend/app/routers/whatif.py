"""Router for what-if comparisons using calculator tools."""

from typing import Any

from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.services.ai_orchestrator import _dispatch_tool
from app.utils.limiter import limiter

router = APIRouter(tags=["whatif"])
PERCENT_CHANGE_EPSILON = 1e-9


class WhatIfRequest(BaseModel):
    """Request payload for what-if comparison."""

    tool: str
    original_inputs: dict[str, Any]
    modified_inputs: dict[str, Any]


class WhatIfResponse(BaseModel):
    """Response payload for what-if comparison results."""

    original: dict[str, Any]
    modified: dict[str, Any]
    diff: dict[str, Any]


@router.post("/api/whatif")
@limiter.limit("30/minute")
async def whatif_endpoint(request: Request, body: WhatIfRequest) -> WhatIfResponse:
    """Run a side-by-side tool comparison and return numeric diffs."""
    original_result = await _dispatch_tool(body.tool, body.original_inputs)
    modified_result = await _dispatch_tool(body.tool, body.modified_inputs)

    diff = {}
    for key in original_result:
        if key in modified_result:
            o = original_result[key]
            m = modified_result[key]
            if isinstance(o, (int, float)) and isinstance(m, (int, float)):
                diff[key] = {
                    "original": o,
                    "modified": m,
                    "change": round(m - o, 2),
                    "change_pct": round((m - o) / o * 100, 2) if abs(o) > PERCENT_CHANGE_EPSILON else 0,
                }

    return WhatIfResponse(
        original=original_result,
        modified=modified_result,
        diff=diff,
    )
