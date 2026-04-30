"""
FixIt Recommendation System — Pydantic Schemas
Strict data validation for incoming Node.js / frontend requests.

Accepts both integer IDs (local/CSV mode) and UUID strings (Supabase mode).
"""

from __future__ import annotations

from typing import Any, List, Optional, Union
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


# ──────────────────────────────────────────────
# Flexible ID type: accepts int, UUID string, or plain string
# ──────────────────────────────────────────────
FlexibleId = Union[int, str, UUID]


# ──────────────────────────────────────────────
# Request
# ──────────────────────────────────────────────
class RecommendationRequest(BaseModel):
    """Payload accepted by POST /api/recommend."""

    user_id: Optional[Any] = Field(
        default=None,
        description="Existing user ID (int or UUID string). Omit for anonymous / cold-start.",
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

    @field_validator("user_id", mode="before")
    @classmethod
    def coerce_user_id(cls, v: Any) -> Any:
        """Accept int, UUID string, or None."""
        if v is None:
            return None
        # Try int first
        if isinstance(v, int):
            return v
        # Try UUID string
        if isinstance(v, str):
            try:
                return UUID(v)
            except ValueError:
                # Not a UUID, try int
                try:
                    return int(v)
                except ValueError:
                    return v
        return v


# ──────────────────────────────────────────────
# Response sub-model
# ──────────────────────────────────────────────
class TechnicianMatch(BaseModel):
    """A single technician recommendation with match metadata."""

    technician_id: Any
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

    user_id: Optional[Any] = None
    is_cold_start: bool = Field(
        ...,
        description="True when the user has little or no booking history.",
    )
    recommendations: List[TechnicianMatch]
    engine_used: str = Field(
        ...,
        description="Which engine produced the result: 'content_based', 'collaborative', or 'hybrid'.",
    )

# ──────────────────────────────────────────────
# Audio STT Request
# ──────────────────────────────────────────────
class AudioTranscriptionRequest(BaseModel):
    audio_base64: str = Field(
        ...,
        description="Base64 encoded audio string (e.g. from mobile app voice note).",
    )

class AudioTranscriptionResponse(BaseModel):
    text: str = Field(
        ...,
        description="The transcribed text from the audio.",
    )

