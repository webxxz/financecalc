from typing import Any

from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.services.ai_orchestrator import _dispatch_tool
from app.utils.limiter import limiter

router = APIRouter(tags=["whatif"])


class WhatIfRequest(BaseModel):
    tool: str
    original_inputs: dict[str, Any]
    modified_inputs: dict[str, Any]


class WhatIfResponse(BaseModel):
    original: dict[str, Any]
    modified: dict[str, Any]
    diff: dict[str, Any]


@router.post("/api/whatif")
@limiter.limit("30/minute")
async def whatif_endpoint(request: Request, body: WhatIfRequest):
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
                    "change_pct": round((m - o) / o * 100, 2) if o != 0 else 0,
                }

    return WhatIfResponse(
        original=original_result,
        modified=modified_result,
        diff=diff,
    )
