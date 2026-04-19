"""Schemas for decision and scenario endpoints."""

from typing import Any

from pydantic import BaseModel


class DecisionRequest(BaseModel):
    """Request payload for AI decision endpoint."""

    message: str
    conversation_history: list[dict] | None = None
    context: dict | None = None


class DecisionResponse(BaseModel):
    """Response payload for AI decision endpoint."""

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
    """Request payload for scenario handler endpoint."""

    scenario: str
    inputs: dict[str, Any]


class ScenarioResponse(BaseModel):
    """Response payload for scenario handler endpoint."""

    scenario: str
    verdict: str
    verdict_label: str
    insights: list[str]
    data: dict[str, Any] = {}
