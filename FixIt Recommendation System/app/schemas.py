"""
FixIt Recommendation System — Pydantic Schemas
Strict data validation for incoming Node.js / frontend requests.
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field
from uuid import UUID


# ──────────────────────────────────────────────
# Request
# ──────────────────────────────────────────────
class RecommendationRequest(BaseModel):
    """Payload accepted by POST /api/recommend."""

    user_id: Optional[UUID] = Field(
        default=None,
        description="Existing user ID. Omit for anonymous / cold-start requests.",
    )
    problem_description: str = Field(
        ...,
        min_length=5,
        max_length=1000,
        description="Free-text description of the maintenance problem.",
        examples=["My kitchen sink is leaking continuously."],
    )
    latitude: float = Field(
        ...,
        ge=-90,
        le=90,
        description="User latitude (WGS-84).",
        examples=[30.06],
    )
    longitude: float = Field(
        ...,
        ge=-180,
        le=180,
        description="User longitude (WGS-84).",
        examples=[31.32],
    )
    radius_km: float = Field(
        default=10.0,
        gt=0,
        le=100,
        description="Maximum search radius in kilometres.",
    )
    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of technicians to return.",
    )


# ──────────────────────────────────────────────
# Response sub-model
# ──────────────────────────────────────────────
class TechnicianMatch(BaseModel):
    """A single technician recommendation with match metadata."""

    technician_id: UUID
    name: str
    category: str
    match_score: float = Field(
        ...,
        ge=0,
        le=1,
        description="Hybrid confidence score (0-1).",
    )
    distance_km: float = Field(
        ...,
        ge=0,
        description="Straight-line distance from user in km.",
    )
    market_trust_score: float = Field(
        ...,
        ge=0,
        le=1,
        description="MarketTrust reliability score (0-1).",
    )
    base_hourly_rate: int


# ──────────────────────────────────────────────
# Response
# ──────────────────────────────────────────────
class RecommendationResponse(BaseModel):
    """Payload returned by POST /api/recommend."""

    user_id: Optional[UUID] = None
    is_cold_start: bool = Field(
        ...,
        description="True when the user has little or no booking history.",
    )
    recommendations: List[TechnicianMatch]
    engine_used: str = Field(
        ...,
        description="Which engine produced the result: 'content_based', 'collaborative', or 'hybrid'.",
    )
