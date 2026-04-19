"""
Decision engine — orchestrates multi-tool AI reasoning to answer
"what should I do?" questions.
"""

import json
import logging

from anthropic import AsyncAnthropic
from fastapi import HTTPException

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

DECISION_SYSTEM_PROMPT = """You are an expert AI financial advisor.
Your job is to help users make financial decisions by:
1. Understanding their complete situation
2. Running the right calculations automatically
3. Comparing options side by side
4. Giving a clear, reasoned recommendation

You must ALWAYS:
- Run at least one calculator tool before giving advice
- Show the numbers behind your recommendation
- Give a verdict: a single clear answer to what the user should do
- End with one follow-up question to deepen the advice

Output your response in this exact JSON structure:
{
  "verdict": "one sentence: what the user should do",
  "reasoning": "2-3 sentences explaining why",
  "calculations_run": ["tool1", "tool2"],
  "comparison": [
    {
      "option": "Option A label",
      "key_metric": "the most important number",
      "pros": ["pro1", "pro2"],
      "cons": ["con1"]
    }
  ],
  "recommendation_strength": "strong|moderate|depends",
  "follow_up_question": "one question to refine advice",
  "insights": ["insight1", "insight2", "insight3"]
}

If you cannot extract enough information to run calculations,
set "verdict" to null and set "follow_up_question" to the
information you need. Do not guess at numbers."""


async def run_decision(
    user_message: str,
    conversation_history: list[dict] | None = None,
    context: dict | None = None,
) -> dict:
    """
    Run the decision engine for a user's financial question.
    Returns structured decision output with verdict, reasoning,
    comparisons and follow-up question.
    """
    anthropic_api_key = getattr(settings, "anthropic_api_key", "") or settings.claude_api_key
    client = AsyncAnthropic(api_key=anthropic_api_key)

    messages = []
    if conversation_history:
        messages.extend(conversation_history)

    full_prompt = user_message
    if context:
        full_prompt += f"\n\nUser context: {json.dumps(context)}"

    messages.append({"role": "user", "content": full_prompt})

    try:
        response = await client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            system=DECISION_SYSTEM_PROMPT,
            messages=messages,
        )

        raw = response.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        decision = json.loads(raw)

        if decision.get("verdict") is None:
            return {
                "status": "needs_more_info",
                "follow_up_question": decision.get(
                    "follow_up_question",
                    "Could you share more details about your situation?",
                ),
                "verdict": None,
                "reasoning": None,
                "comparison": [],
                "insights": [],
                "recommendation_strength": None,
                "calculations_run": [],
            }

        return {"status": "complete", **decision}

    except json.JSONDecodeError:
        logger.error("Decision engine returned non-JSON response")
        raise HTTPException(
            status_code=500,
            detail="Decision engine failed to parse response",
        )
    except Exception as e:
        logger.exception("Decision engine error", exc_info=e)
        raise HTTPException(status_code=500, detail=str(e))
