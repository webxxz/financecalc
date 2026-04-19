from typing import Any

from pydantic import BaseModel


class DecisionRequest(BaseModel):
    message: str
    conversation_history: list[dict] | None = None
    context: dict | None = None


class DecisionResponse(BaseModel):
    status: str
    verdict: str | None
    verdict_label: str | None = None
    reasoning: str | None = None
    comparison: list[dict] = []
    insights: list[str] = []
    recommendation_strength: str | None = None
    follow_up_question: str | None = None
    calculations_run: list[str] = []


class ScenarioRequest(BaseModel):
    scenario: str
    inputs: dict[str, Any]


class ScenarioResponse(BaseModel):
    scenario: str
    verdict: str
    verdict_label: str
    insights: list[str]
    data: dict[str, Any] = {}
