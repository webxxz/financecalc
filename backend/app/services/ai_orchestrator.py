import json
import logging
import re
from typing import Any, Dict

from anthropic import AsyncAnthropic
from fastapi import HTTPException
from openai import AsyncOpenAI

from app.ai.prompts import INTENT_ROUTER_PROMPT
from app.ai.tools import TOOLS
from app.core.config import get_settings
from app.schemas.ai import AIAssistantRequest, ToolDecision
from app.schemas.calculators import EMIRequest, MortgageRequest, RetirementRequest, SIPRequest, TaxRequest
from app.services.calculators import (
    calculate_emi,
    calculate_mortgage,
    calculate_retirement,
    calculate_sip,
    calculate_tax,
)
from app.services.exchange_rates import convert_currency

settings = get_settings()
logger = logging.getLogger(__name__)


def _extract_numbers(query: str) -> list[float]:
    try:
        return [float(n) for n in re.findall(r"\d+(?:\.\d+)?", query)]
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail="Could not parse numeric values from query. Please provide valid numbers.",
        ) from exc


def _fallback_intent(query: str) -> ToolDecision:
    lowered = query.lower()
    nums = _extract_numbers(lowered)

    if "sip" in lowered and len(nums) >= 3:
        return ToolDecision(tool="calculate_sip", arguments={"monthly_investment": nums[0], "annual_return_rate": nums[1], "years": int(nums[2])})
    if any(k in lowered for k in ["emi", "loan"]) and len(nums) >= 3:
        return ToolDecision(tool="calculate_emi", arguments={"principal": nums[0], "annual_interest_rate": nums[1], "tenure_months": int(nums[2])})
    if "mortgage" in lowered and len(nums) >= 4:
        return ToolDecision(
            tool="calculate_mortgage",
            arguments={
                "property_price": nums[0],
                "down_payment": nums[1],
                "annual_interest_rate": nums[2],
                "tenure_years": int(nums[3]),
            },
        )
    if "tax" in lowered and len(nums) >= 1:
        return ToolDecision(tool="calculate_tax", arguments={"annual_income": nums[0], "deductions": nums[1] if len(nums) > 1 else 0, "country_code": "US"})
    if "retirement" in lowered and len(nums) >= 4:
        return ToolDecision(
            tool="calculate_retirement",
            arguments={
                "current_savings": nums[0],
                "annual_contribution": nums[1],
                "expected_annual_return_rate": nums[2],
                "years_to_retirement": int(nums[3]),
            },
        )
    if any(k in lowered for k in ["convert", "exchange", "currency"]) and len(nums) >= 1:
        return ToolDecision(tool="convert_currency", arguments={"base_currency": "USD", "target_currency": "INR", "amount": nums[0]})

    raise HTTPException(status_code=400, detail="Unable to infer intent and required numeric inputs from query")


async def _detect_tool_with_openai(query: str) -> ToolDecision:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY not configured")

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    response = await client.chat.completions.create(
        model=settings.ai_primary_model,
        temperature=0,
        messages=[
            {"role": "system", "content": INTENT_ROUTER_PROMPT},
            {"role": "user", "content": query},
        ],
        response_format={"type": "json_object"},
    )
    payload = json.loads(response.choices[0].message.content)
    return ToolDecision(**payload)


async def _detect_tool_with_claude(query: str) -> ToolDecision:
    if not settings.claude_api_key:
        raise RuntimeError("CLAUDE_API_KEY not configured")

    client = AsyncAnthropic(api_key=settings.claude_api_key)
    response = await client.messages.create(
        model=settings.ai_fallback_model,
        max_tokens=300,
        temperature=0,
        system=INTENT_ROUTER_PROMPT,
        messages=[{"role": "user", "content": query}],
    )
    text = "".join(block.text for block in response.content if hasattr(block, "text"))
    payload = json.loads(text)
    return ToolDecision(**payload)


async def detect_tool(query: str) -> ToolDecision:
    try:
        decision = await _detect_tool_with_openai(query)
    except Exception as openai_exc:
        logger.warning("OpenAI tool detection failed: %s", openai_exc)
        try:
            decision = await _detect_tool_with_claude(query)
        except Exception as claude_exc:
            logger.warning("Claude tool detection failed: %s", claude_exc)
            decision = _fallback_intent(query)

    if decision.tool not in TOOLS:
        raise HTTPException(status_code=400, detail="Unsupported tool selected")
    return decision


async def execute_tool(request: AIAssistantRequest) -> Dict[str, Any]:
    decision = await detect_tool(request.query)

    if decision.tool == "calculate_emi":
        out = calculate_emi(EMIRequest(**decision.arguments)).model_dump()
    elif decision.tool == "calculate_sip":
        out = calculate_sip(SIPRequest(**decision.arguments)).model_dump()
    elif decision.tool == "calculate_mortgage":
        out = calculate_mortgage(MortgageRequest(**decision.arguments)).model_dump()
    elif decision.tool == "calculate_tax":
        out = calculate_tax(TaxRequest(**decision.arguments)).model_dump()
    elif decision.tool == "calculate_retirement":
        out = calculate_retirement(RetirementRequest(**decision.arguments)).model_dump()
    elif decision.tool == "convert_currency":
        converted = await convert_currency(
            base_currency=decision.arguments["base_currency"],
            target_currency=decision.arguments["target_currency"],
            amount=float(decision.arguments["amount"]),
        )
        out = {
            "result": converted,
            "summary": "Currency conversion completed using the latest provider rates.",
            "insights": [
                "Rates are cached to reduce API calls and improve latency.",
                "FX rates can change frequently throughout the day.",
            ],
        }
    else:
        raise HTTPException(status_code=400, detail="Unsupported tool execution path")

    return {
        "tool_used": decision.tool,
        "tool_arguments": decision.arguments,
        **out,
    }
