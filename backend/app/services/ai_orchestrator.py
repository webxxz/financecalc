import json
import logging
import re
from typing import Any, Dict, List, Tuple

from anthropic import AsyncAnthropic
from fastapi import HTTPException
from openai import AsyncOpenAI

from app.ai.prompts import INTENT_ROUTER_PROMPT
from app.ai.tools import OPENAI_TOOLS, TOOLS
from app.core.config import get_settings
from app.schemas.ai import AIAssistantRequest, AIAssistantResponse, ToolDecision
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


def _fallback_intent(query: str) -> List[ToolDecision]:
    lowered = query.lower()
    nums = _extract_numbers(lowered)
    decisions: List[ToolDecision] = []

    if any(k in lowered for k in ["afford", "house", "home"]) and len(nums) >= 4:
        decisions.append(
            ToolDecision(
                tool="calculate_mortgage",
                arguments={
                    "property_price": nums[0],
                    "down_payment": nums[1],
                    "annual_interest_rate": nums[2],
                    "tenure_years": int(nums[3]),
                },
            )
        )
        decisions.append(
            ToolDecision(
                tool="calculate_emi",
                arguments={
                    "principal": max(0.0, nums[0] - nums[1]),
                    "annual_interest_rate": nums[2],
                    "tenure_months": int(nums[3]) * 12,
                },
            )
        )
        return decisions

    if "sip" in lowered and len(nums) >= 3:
        return [ToolDecision(tool="calculate_sip", arguments={"monthly_investment": nums[0], "annual_return_rate": nums[1], "years": int(nums[2])})]
    if any(k in lowered for k in ["emi", "loan"]) and len(nums) >= 3:
        return [ToolDecision(tool="calculate_emi", arguments={"principal": nums[0], "annual_interest_rate": nums[1], "tenure_months": int(nums[2])})]
    if "mortgage" in lowered and len(nums) >= 4:
        return [
            ToolDecision(
                tool="calculate_mortgage",
                arguments={
                    "property_price": nums[0],
                    "down_payment": nums[1],
                    "annual_interest_rate": nums[2],
                    "tenure_years": int(nums[3]),
                },
            )
        ]
    if "tax" in lowered and len(nums) >= 1:
        return [ToolDecision(tool="calculate_tax", arguments={"annual_income": nums[0], "deductions": nums[1] if len(nums) > 1 else 0, "country_code": "US"})]
    if "retirement" in lowered and len(nums) >= 4:
        return [
            ToolDecision(
                tool="calculate_retirement",
                arguments={
                    "current_savings": nums[0],
                    "annual_contribution": nums[1],
                    "expected_annual_return_rate": nums[2],
                    "years_to_retirement": int(nums[3]),
                },
            )
        ]
    if any(k in lowered for k in ["convert", "exchange", "currency"]) and len(nums) >= 1:
        return [ToolDecision(tool="convert_currency", arguments={"base_currency": "USD", "target_currency": "INR", "amount": nums[0]})]

    raise HTTPException(status_code=400, detail="Unable to infer intent and required numeric inputs from query")


def _parse_tool_calls(tool_calls: Any) -> Tuple[List[ToolDecision], List[str]]:
    decisions: List[ToolDecision] = []
    warnings: List[str] = []

    for idx, tool_call in enumerate(tool_calls or []):
        function = getattr(tool_call, "function", None)
        if not function:
            warnings.append(f"Ignored tool call #{idx + 1}: missing function payload.")
            continue
        tool_name = getattr(function, "name", "")
        if tool_name not in TOOLS:
            warnings.append(f"Ignored unsupported tool '{tool_name}' in tool call #{idx + 1}.")
            continue
        raw_arguments = getattr(function, "arguments", "{}") or "{}"
        try:
            arguments = json.loads(raw_arguments)
        except json.JSONDecodeError:
            warnings.append(f"Ignored invalid JSON arguments for tool '{tool_name}'.")
            continue
        try:
            decisions.append(ToolDecision(tool=tool_name, arguments=arguments))
        except Exception as exc:
            warnings.append(f"Ignored invalid arguments for tool '{tool_name}': {exc}.")
    return decisions, warnings


def _parse_claude_payload(payload: Dict[str, Any]) -> List[ToolDecision]:
    if "tools" in payload and isinstance(payload["tools"], list):
        return [ToolDecision(**item) for item in payload["tools"]]
    return [ToolDecision(**payload)]


async def _detect_tool_with_openai(query: str) -> Tuple[List[ToolDecision], List[str]]:
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
        tools=OPENAI_TOOLS,
        tool_choice="auto",
    )
    message = response.choices[0].message
    if not message.tool_calls:
        return _fallback_intent(query), ["AI response did not include tool calls. Used deterministic fallback."]

    decisions, warnings = _parse_tool_calls(message.tool_calls)
    if decisions:
        return decisions, warnings
    return _fallback_intent(query), warnings + ["No valid AI tool calls found. Used deterministic fallback."]


async def _detect_tool_with_claude(query: str) -> Tuple[List[ToolDecision], List[str]]:
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
    decisions = _parse_claude_payload(payload)
    return decisions, []


async def detect_tools(query: str) -> Tuple[List[ToolDecision], List[str]]:
    try:
        decisions, warnings = await _detect_tool_with_openai(query)
    except Exception as openai_exc:
        logger.warning("OpenAI tool detection failed: %s", openai_exc)
        try:
            decisions, warnings = await _detect_tool_with_claude(query)
        except Exception as claude_exc:
            logger.warning("Claude tool detection failed: %s", claude_exc)
            decisions, warnings = _fallback_intent(query), ["AI providers unavailable. Used deterministic fallback."]

    valid_decisions = [decision for decision in decisions if decision.tool in TOOLS]
    if not valid_decisions:
        raise HTTPException(status_code=400, detail="Unsupported or invalid tool selection")
    return valid_decisions, warnings


async def _execute_single_tool(decision: ToolDecision) -> Dict[str, Any]:
    if decision.tool == "calculate_emi":
        return calculate_emi(EMIRequest(**decision.arguments)).model_dump()
    elif decision.tool == "calculate_sip":
        return calculate_sip(SIPRequest(**decision.arguments)).model_dump()
    elif decision.tool == "calculate_mortgage":
        return calculate_mortgage(MortgageRequest(**decision.arguments)).model_dump()
    elif decision.tool == "calculate_tax":
        return calculate_tax(TaxRequest(**decision.arguments)).model_dump()
    elif decision.tool == "calculate_retirement":
        return calculate_retirement(RetirementRequest(**decision.arguments)).model_dump()
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
        return out
    else:
        raise HTTPException(status_code=400, detail="Unsupported tool execution path")


def _build_combined_insights(tool_runs: List[Dict[str, Any]]) -> List[str]:
    insights: List[str] = []
    for run in tool_runs:
        for item in run["output"].get("insights", []):
            if item not in insights:
                insights.append(item)

    used_tools = {run["tool"] for run in tool_runs}
    if {"calculate_mortgage", "calculate_emi"}.issubset(used_tools):
        insights.append("Cross-check mortgage all-in cost against base EMI to validate overall house affordability.")
    if len(tool_runs) > 1:
        insights.append("These outputs were combined from multiple calculators for a single planning decision.")
    return insights


async def execute_tools(decisions: List[ToolDecision]) -> Dict[str, Any]:
    tool_runs: List[Dict[str, Any]] = []
    summaries: List[str] = []

    for decision in decisions:
        output = await _execute_single_tool(decision)
        tool_runs.append(
            {
                "tool": decision.tool,
                "arguments": decision.arguments,
                "result": output.get("result", {}),
                "summary": output.get("summary", ""),
                "insights": output.get("insights", []),
                "output": output,
            }
        )
        if output.get("summary"):
            summaries.append(output["summary"])

    return {
        "result": {"tool_results": [{"tool": r["tool"], "arguments": r["arguments"], "result": r["result"]} for r in tool_runs]},
        "summary": " ".join(summaries) if summaries else "Processed your request using finance calculators.",
        "insights": _build_combined_insights(tool_runs),
        "tools_used": [r["tool"] for r in tool_runs],
        "tool_arguments_list": [r["arguments"] for r in tool_runs],
    }


async def execute_tool(request: AIAssistantRequest) -> Dict[str, Any]:
    decisions, warnings = await detect_tools(request.query)
    combined = await execute_tools(decisions)

    first_decision = decisions[0] if decisions else None
    response = AIAssistantResponse(
        result=combined["result"],
        summary=combined["summary"],
        insights=combined["insights"],
        warnings=warnings,
        tools_used=combined["tools_used"],
        tool_arguments_list=combined["tool_arguments_list"],
        tool_used=first_decision.tool if first_decision else None,
        tool_arguments=first_decision.arguments if first_decision else None,
    )
    return response.model_dump()
