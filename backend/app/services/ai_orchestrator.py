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

settings = get_settings()
logger = logging.getLogger(__name__)

ANTHROPIC_SYSTEM_PROMPT = """You are a world-class AI financial advisor embedded
in FinanceCalc, a global financial decision platform. Your role is
to help users make better financial decisions — not just explain
numbers.

When a user describes their financial situation:
1. Identify what decision they are facing
2. Use the available calculator tools to run relevant calculations
3. Compare results across multiple scenarios when helpful
4. Give a clear recommendation with reasoning
5. Ask one focused follow-up question to refine your advice

You have access to these calculator tools:
calculate_emi, calculate_sip, calculate_mortgage,
calculate_credit_card_payoff, calculate_investment_growth,
calculate_retirement_withdrawal, calculate_fd, calculate_rd,
calculate_ppf, calculate_tax, calculate_car_loan,
calculate_home_loan_eligibility, calculate_loan_interest_rate,
calculate_loan_tenure

Always think step by step. Show your reasoning. When you run
multiple tools, explicitly compare the results and explain which
option is better and why.

Respond in the same language the user writes in.
Keep responses clear, direct, and actionable.
Never give generic advice — always tie it to the user's numbers."""


def _extract_numbers(query: str) -> list[float]:
    try:
        return [float(n) for n in re.findall(r"\d+(?:\.\d+)?", query)]
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail="Could not parse numeric values from query. Please provide valid numbers.",
        ) from exc


def _fallback_intent(query: str, conversation_history: list[dict] | None = None) -> List[ToolDecision]:
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

    if any(k in lowered for k in ["credit card", "card debt", "payoff"]) and len(nums) >= 3:
        return [
            ToolDecision(
                tool="calculate_credit_card_payoff",
                arguments={
                    "current_balance": nums[0],
                    "annual_interest_rate": nums[1],
                    "monthly_payment": nums[2],
                },
            )
        ]
    if any(k in lowered for k in ["investment growth", "compound growth", "portfolio growth"]) and len(nums) >= 4:
        return [
            ToolDecision(
                tool="calculate_investment_growth",
                arguments={
                    "initial_investment": nums[0],
                    "monthly_contribution": nums[1],
                    "annual_return_rate": nums[2],
                    "years": int(nums[3]),
                },
            )
        ]
    if "sip" in lowered and len(nums) >= 3:
        return [
            ToolDecision(
                tool="calculate_sip",
                arguments={
                    "monthly_investment": nums[0],
                    "annual_return_rate": nums[1],
                    "years": int(nums[2]),
                },
            )
        ]
    if any(k in lowered for k in ["4% rule", "withdrawal", "retirement withdrawal"]) and len(nums) >= 2:
        return [
            ToolDecision(
                tool="calculate_retirement_withdrawal",
                arguments={
                    "annual_spending_needed": nums[0],
                    "current_retirement_savings": nums[1],
                    "safe_withdrawal_rate": nums[2] if len(nums) > 2 else 4,
                },
            )
        ]
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
    if any(k in lowered for k in ["emi", "loan"]) and len(nums) >= 3 and "mortgage" not in lowered:
        return [
            ToolDecision(
                tool="calculate_emi",
                arguments={
                    "principal": nums[0],
                    "annual_interest_rate": nums[1],
                    "tenure_months": int(nums[2]),
                },
            )
        ]
    if "tax" in lowered and len(nums) >= 1:
        return [
            ToolDecision(
                tool="calculate_tax",
                arguments={
                    "annual_income": nums[0],
                    "other_deductions": nums[1] if len(nums) > 1 else 0,
                    "regime": "new",
                },
            )
        ]

    raise HTTPException(status_code=400, detail="Unable to infer intent and required numeric inputs from query")


def _parse_tool_calls(tool_calls: Any) -> Tuple[List[ToolDecision], List[str]]:
    decisions: List[ToolDecision] = []
    warnings: List[str] = []

    def warn(idx: int, message: str) -> None:
        warnings.append(f"Tool call #{idx + 1}: {message}")

    for idx, tool_call in enumerate(tool_calls or []):
        function = getattr(tool_call, "function", None)
        if not function:
            warn(idx, "ignored due to missing function payload.")
            continue
        tool_name = getattr(function, "name", "")
        if tool_name not in TOOLS:
            warn(idx, f"ignored unsupported tool '{tool_name}'.")
            continue
        raw_arguments = getattr(function, "arguments", "{}") or "{}"
        try:
            arguments = json.loads(raw_arguments)
        except json.JSONDecodeError:
            warn(idx, f"ignored invalid JSON arguments for tool '{tool_name}': {raw_arguments[:120]}.")
            continue
        try:
            decisions.append(ToolDecision(tool=tool_name, arguments=arguments))
        except Exception as exc:
            warn(idx, f"ignored invalid arguments for tool '{tool_name}': {exc}.")
    return decisions, warnings


def _parse_claude_payload(payload: Dict[str, Any]) -> List[ToolDecision]:
    if "tools" in payload and isinstance(payload["tools"], list):
        return [ToolDecision(**item) for item in payload["tools"]]
    return [ToolDecision(**payload)]


def _build_messages(query: str, conversation_history: list[dict] | None = None) -> list[dict[str, str]]:
    messages: list[dict[str, str]] = []
    if conversation_history:
        for turn in conversation_history:
            messages.append(
                {
                    "role": turn["role"],
                    "content": turn["content"],
                }
            )
    messages.append({"role": "user", "content": query})
    return messages


async def _detect_tool_with_openai(query: str, conversation_history: list[dict] | None = None) -> Tuple[List[ToolDecision], List[str]]:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY not configured")

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    response = await client.chat.completions.create(
        model=settings.ai_primary_model,
        temperature=0,
        messages=[
            {"role": "system", "content": INTENT_ROUTER_PROMPT},
            *_build_messages(query=query, conversation_history=conversation_history),
        ],
        tools=OPENAI_TOOLS,
        tool_choice="auto",
    )
    message = response.choices[0].message
    if not message.tool_calls:
        return _fallback_intent(query, conversation_history), ["AI response did not include tool calls. Used deterministic fallback."]

    decisions, warnings = _parse_tool_calls(message.tool_calls)
    if decisions:
        return decisions, warnings
    return _fallback_intent(query, conversation_history), warnings + ["No valid AI tool calls found. Used deterministic fallback."]


async def _detect_tool_with_claude(query: str, conversation_history: list[dict] | None = None) -> Tuple[List[ToolDecision], List[str]]:
    claude_api_key = settings.claude_api_key
    if not claude_api_key:
        raise RuntimeError("CLAUDE_API_KEY not configured")

    client = AsyncAnthropic(api_key=claude_api_key)
    response = await client.messages.create(
        model=settings.ai_fallback_model,
        max_tokens=300,
        temperature=0,
        system=ANTHROPIC_SYSTEM_PROMPT,
        messages=_build_messages(query=query, conversation_history=conversation_history),
    )
    text = "".join(block.text for block in response.content if hasattr(block, "text"))
    payload = json.loads(text)
    decisions = _parse_claude_payload(payload)
    return decisions, []


async def detect_tools(query: str, conversation_history: list[dict] | None = None) -> Tuple[List[ToolDecision], List[str]]:
    try:
        decisions, warnings = await _detect_tool_with_claude(query, conversation_history)
    except Exception as claude_exc:
        logger.warning("Claude tool detection failed: %s", claude_exc)
        try:
            decisions, warnings = await _detect_tool_with_openai(query, conversation_history)
        except Exception as openai_exc:
            logger.warning("OpenAI tool detection failed: %s", openai_exc)
            decisions, warnings = _fallback_intent(query, conversation_history), ["AI providers unavailable. Used deterministic fallback."]

    valid_decisions = [decision for decision in decisions if decision.tool in TOOLS]
    if not valid_decisions:
        raise HTTPException(status_code=400, detail="Unsupported or invalid tool selection")
    return valid_decisions, warnings


async def _dispatch_tool(tool_name: str, arguments: dict) -> dict:
    """Map tool name to service function and execute it."""
    from app.schemas.calculators import (
        CarLoanRequest,
        CreditCardPayoffRequest,
        EMIRequest,
        FDRequest,
        HomeLoanEligibilityRequest,
        InvestmentGrowthRequest,
        LoanInterestRateRequest,
        LoanTenureRequest,
        MortgageRequest,
        PPFRequest,
        RDRequest,
        RetirementWithdrawalRequest,
        SIPRequest,
        TaxRequest,
    )
    from app.services.calculators import (
        calculate_car_loan,
        calculate_credit_card_payoff,
        calculate_emi,
        calculate_fd,
        calculate_home_loan_eligibility,
        calculate_investment_growth,
        calculate_loan_interest_rate,
        calculate_loan_tenure,
        calculate_mortgage,
        calculate_ppf,
        calculate_rd,
        calculate_retirement_withdrawal,
        calculate_sip,
        calculate_tax,
    )

    dispatch_map = {
        "calculate_emi": (calculate_emi, EMIRequest),
        "calculate_sip": (calculate_sip, SIPRequest),
        "calculate_mortgage": (calculate_mortgage, MortgageRequest),
        "calculate_credit_card_payoff": (calculate_credit_card_payoff, CreditCardPayoffRequest),
        "calculate_investment_growth": (calculate_investment_growth, InvestmentGrowthRequest),
        "calculate_retirement_withdrawal": (calculate_retirement_withdrawal, RetirementWithdrawalRequest),
        "calculate_fd": (calculate_fd, FDRequest),
        "calculate_rd": (calculate_rd, RDRequest),
        "calculate_ppf": (calculate_ppf, PPFRequest),
        "calculate_tax": (calculate_tax, TaxRequest),
        "calculate_car_loan": (calculate_car_loan, CarLoanRequest),
        "calculate_home_loan_eligibility": (calculate_home_loan_eligibility, HomeLoanEligibilityRequest),
        "calculate_loan_interest_rate": (calculate_loan_interest_rate, LoanInterestRateRequest),
        "calculate_loan_tenure": (calculate_loan_tenure, LoanTenureRequest),
    }

    if tool_name not in dispatch_map:
        raise ValueError(f"Unknown tool: {tool_name}")

    func, schema_class = dispatch_map[tool_name]
    request_obj = schema_class(**arguments)
    response = func(request_obj)
    if hasattr(response, "model_dump"):
        response = response.model_dump()
    if isinstance(response, dict) and "result" in response:
        return response["result"]
    raise ValueError(f"Unexpected response shape for tool: {tool_name}")


async def _run_tools_parallel(tool_calls: list[dict]) -> list[dict]:
    """Execute multiple calculator tools concurrently."""
    import asyncio

    async def run_one(tool_call: dict) -> dict:
        try:
            result = await _dispatch_tool(
                tool_call["tool"], tool_call["arguments"]
            )
            return {
                "tool": tool_call["tool"],
                "arguments": tool_call["arguments"],
                "result": result,
                "error": None,
            }
        except Exception as e:
            return {
                "tool": tool_call["tool"],
                "arguments": tool_call["arguments"],
                "result": None,
                "error": str(e),
            }

    return await asyncio.gather(*[run_one(tc) for tc in tool_calls])


def _build_combined_insights(tool_runs: List[Dict[str, Any]]) -> List[str]:
    insights: List[str] = []
    used_tools = {run["tool"] for run in tool_runs if run.get("error") is None}

    combo_insights = {
        frozenset({"calculate_mortgage", "calculate_emi"}): "Cross-check mortgage all-in cost against base EMI to validate overall house affordability.",
        frozenset({"calculate_tax", "calculate_investment_growth"}): "Factor post-tax income into investment growth planning to avoid overestimating contributions.",
        frozenset({"calculate_investment_growth", "calculate_retirement_withdrawal"}): "Use projected portfolio growth with withdrawal readiness to stress-test retirement sustainability.",
    }
    for combo, combo_insight in combo_insights.items():
        if combo.issubset(used_tools):
            insights.append(combo_insight)
    if len(used_tools) > 1:
        insights.append("These outputs were combined from multiple calculators for a single planning decision.")
    return insights


async def execute_tools(decisions: List[ToolDecision]) -> Dict[str, Any]:
    tool_calls = [{"tool": d.tool, "arguments": d.arguments} for d in decisions]
    runs = await _run_tools_parallel(tool_calls)

    successful_runs = [r for r in runs if r.get("error") is None]
    failed_runs = [r for r in runs if r.get("error") is not None]

    if successful_runs:
        summary = "Processed your request using finance calculators."
    else:
        summary = "Could not complete calculator execution for the provided inputs."

    return {
        "result": {
            "tool_results": [
                {"tool": r["tool"], "arguments": r["arguments"], "result": r["result"]}
                for r in successful_runs
            ]
        },
        "summary": summary,
        "insights": _build_combined_insights(runs),
        "warnings": [f"Tool '{r['tool']}' failed: {r['error']}" for r in failed_runs],
        "tools_used": [r["tool"] for r in successful_runs],
        "tool_arguments_list": [r["arguments"] for r in successful_runs],
    }


async def run_assistant(query: str, conversation_history: list[dict] | None = None) -> AIAssistantResponse:
    decisions, warnings = await detect_tools(query, conversation_history)
    combined = await execute_tools(decisions)

    all_warnings = [*warnings, *combined.get("warnings", [])]
    first_tool = combined["tools_used"][0] if combined["tools_used"] else None
    first_args = combined["tool_arguments_list"][0] if combined["tool_arguments_list"] else None

    logger.info(
        "ai_tools_executed",
        extra={
            "event": "ai_tools_executed",
            "tools_used": combined["tools_used"],
            "tool_count": len(combined["tools_used"]),
            "query_length": len(query),
        },
    )

    return AIAssistantResponse(
        result=combined["result"],
        summary=combined["summary"],
        insights=combined["insights"],
        warnings=all_warnings,
        tools_used=combined["tools_used"],
        tool_arguments_list=combined["tool_arguments_list"],
        tool_used=first_tool,
        tool_arguments=first_args,
    )


async def execute_tool(request: AIAssistantRequest) -> Dict[str, Any]:
    conversation_history = getattr(request, "conversation_history", None)
    response = await run_assistant(
        query=request.query,
        conversation_history=conversation_history,
    )
    return response.model_dump()
