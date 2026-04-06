"""
FixIt — Hybrid Recommendation Engine (v2)

Combines Content-Based and Collaborative Filtering with:
  • Dynamic α/β weighting based on user history depth
  • Distance decay factor (proximity is critical in service marketplaces)
  • Category preference boost from user profile
  • Experience-aware scoring for complex problems
"""

from __future__ import annotations

import logging
import math
from typing import Dict, List, Optional, Tuple

from app.collaborative_engine import CollaborativeEngine
from app.config import COLD_START_BOOKING_THRESHOLD
from app.content_engine import ContentEngine
from app.data_pipeline import DataPipeline
from app.schemas import TechnicianMatch

logger = logging.getLogger(__name__)


class HybridEngine:
    """
    Orchestrates sub-engines and computes the final ranked list.

    Scoring formula (v2):
      raw = α × content_score + β × collab_score
      final = raw × market_trust × distance_boost × category_boost
    """

    def __init__(
        self,
        pipeline: DataPipeline,
        content_engine: ContentEngine,
        collab_engine: CollaborativeEngine,
    ) -> None:
        self.pipeline = pipeline
        self.content = content_engine
        self.collab = collab_engine

    # ────────────────────────────────────────────
    #  Dynamic weight calculation
    # ────────────────────────────────────────────
    @staticmethod
    def _compute_weights(booking_count: int) -> Tuple[float, float]:
        """Return (α_content, β_collab)."""
        if booking_count < COLD_START_BOOKING_THRESHOLD:
            return 0.85, 0.15
        ratio = min(booking_count / 15.0, 1.0)
        alpha = 0.85 - 0.55 * ratio   # 0.85 → 0.30
        beta = 0.15 + 0.55 * ratio    # 0.15 → 0.70
        return alpha, beta

    # ────────────────────────────────────────────
    #  Scoring helper functions
    # ────────────────────────────────────────────
    @staticmethod
    def _distance_boost(distance_km: float, max_radius_km: float) -> float:
        """
        Exponential distance decay — nearby technicians get a massive boost.
        Returns a multiplier in [0.3, 1.0].
        """
        if distance_km <= 0:
            return 1.0
        # Exponential decay: e^(-distance/scale)
        scale = max_radius_km / 3.0  # at 1/3 the max radius, boost is ~37%
        decay = math.exp(-distance_km / max(scale, 1.0))
        return 0.3 + 0.7 * decay  # floor at 0.3 so far techs aren't eliminated

    @staticmethod
    def _category_boost(
        tech_category: str,
        user_profile: dict,
        inferred_category: Optional[str],
    ) -> float:
        """
        Boost technicians whose category matches:
          1. The inferred category from the problem description
          2. The user's historically preferred category
        Returns a multiplier in [0.5, 1.3].
        """
        boost = 1.0

        # Match with inferred category from problem text
        if inferred_category and tech_category == inferred_category:
            boost += 0.2

        # Match with user's historical preference
        cat_dist = user_profile.get("category_distribution", {})
        if cat_dist:
            user_pref = cat_dist.get(tech_category, 0.0)
            if user_pref > 0.4:       # strong preference
                boost += 0.1

        return min(max(boost, 0.5), 1.3)

    # ────────────────────────────────────────────
    #  Main recommendation function
    # ────────────────────────────────────────────
    def recommend(
        self,
        user_id: Optional[int],
        problem_description: str,
        latitude: float,
        longitude: float,
        radius_km: float,
        top_k: int,
    ) -> Tuple[List[TechnicianMatch], bool, str]:
        """Run the full hybrid pipeline."""

        # ── 1. User profile ───────────────────
        profile = self.pipeline.get_user_profile(user_id) if user_id else None
        if profile is None:
            profile = {
                "booking_count": 0,
                "is_cold_start": True,
                "category_distribution": {},
                "avg_rating_given": 0.0,
            }
        is_cold_start = profile["is_cold_start"]
        booking_count = profile["booking_count"]

        # ── 2. Category inference ─────────────
        inferred_cat = self.pipeline.infer_category(problem_description)

        # ── 3. Geo-filter candidates ──────────
        nearby = self.pipeline.get_nearby_technicians(
            lat=latitude,
            lon=longitude,
            radius_km=radius_km,
            category=inferred_cat,
        )

        # Widen if too few results
        if len(nearby) < top_k:
            nearby = self.pipeline.get_nearby_technicians(
                lat=latitude,
                lon=longitude,
                radius_km=radius_km * 2,
                category=inferred_cat,
            )
        if len(nearby) < top_k:
            nearby = self.pipeline.get_nearby_technicians(
                lat=latitude,
                lon=longitude,
                radius_km=radius_km * 3,
            )

        if nearby.empty:
            return [], is_cold_start, "none"

        candidate_tids = nearby["technician_id"].tolist()

        # ── 4. Content-based scores ───────────
        content_scores = self.content.score(
            problem_description=problem_description,
            candidate_tids=candidate_tids,
            top_k=top_k * 3,
        )

        # ── 5. Collaborative scores ──────────
        collab_scores = self.collab.score(
            user_id=user_id,
            candidate_tids=candidate_tids,
        )

        # ── 6. Dynamic weighting ─────────────
        alpha, beta = self._compute_weights(booking_count)

        # ── 7. Multi-factor scoring ──────────
        results: List[TechnicianMatch] = []
        for _, tech in nearby.iterrows():
            tid = str(tech["technician_id"])
            trust = self.pipeline.get_market_trust(tid)
            dist_km = tech["distance_km"]

            c_score = content_scores.get(tid, 0.5)
            f_score = collab_scores.get(tid, 0.0)

            # Hybrid blend
            hybrid_raw = alpha * c_score + beta * f_score

            # Distance boost (closer = much higher score)
            d_boost = self._distance_boost(dist_km, radius_km)

            # Category boost (matching category = bonus)
            cat_boost = self._category_boost(
                tech["category"], profile, inferred_cat
            )

            # Final score:  hybrid × trust × distance × category
            final = hybrid_raw * trust * d_boost * cat_boost
            final = round(min(max(final, 0.0), 1.0), 4)

            results.append(
                TechnicianMatch(
                    technician_id=tid,
                    name=tech["name"],
                    category=tech["category"],
                    match_score=final,
                    distance_km=round(dist_km, 2),
                    market_trust_score=round(trust, 4),
                    base_hourly_rate=int(tech["base_hourly_rate"]),
                )
            )

        results.sort(key=lambda r: r.match_score, reverse=True)
        top_results = results[:top_k]

        # Determine engine label
        if is_cold_start:
            engine = "content_based"
        elif alpha > beta:
            engine = "hybrid_content_leaning"
        else:
            engine = "hybrid_collaborative_leaning"

        logger.info(
            "Hybrid recommend  user=%s  cold=%s  α=%.2f  β=%.2f  candidates=%d  engine=%s",
            user_id, is_cold_start, alpha, beta, len(candidate_tids), engine,
        )

        return top_results, is_cold_start, engine
