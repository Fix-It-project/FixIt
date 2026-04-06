"""
FixIt Recommendation System — Data Pipeline & Feature Engineering

Handles:
  • CSV ingestion (users, technicians, bookings)
  • Geospatial distance computation (Haversine)
  • Technician skill-vector creation
  • User preference-vector aggregation
  • MarketTrust reliability scoring
"""

from __future__ import annotations

import logging
import math
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from app.config import (
    BOOKINGS_CSV,
    COLD_START_BOOKING_THRESHOLD,
    EARTH_RADIUS_KM,
    MT_WEIGHT_COMPLETION,
    MT_WEIGHT_RATING,
    MT_WEIGHT_VOLUME,
    SERVICE_CATEGORIES,
    TECHNICIANS_CSV,
    USERS_CSV,
)

logger = logging.getLogger(__name__)


# ════════════════════════════════════════════════
#  Haversine helpers
# ════════════════════════════════════════════════

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return the great-circle distance in km between two WGS-84 points."""
    rlat1, rlon1, rlat2, rlon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = rlat2 - rlat1
    dlon = rlon2 - rlon1
    a = math.sin(dlat / 2) ** 2 + math.cos(rlat1) * math.cos(rlat2) * math.sin(dlon / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))


def haversine_km_vectorized(
    lat1: np.ndarray,
    lon1: np.ndarray,
    lat2: float,
    lon2: float,
) -> np.ndarray:
    """Vectorized Haversine for filtering many technicians against one user location."""
    rlat1 = np.radians(lat1)
    rlon1 = np.radians(lon1)
    rlat2 = math.radians(lat2)
    rlon2 = math.radians(lon2)
    dlat = rlat2 - rlat1
    dlon = rlon2 - rlon1
    a = np.sin(dlat / 2) ** 2 + np.cos(rlat1) * math.cos(rlat2) * np.sin(dlon / 2) ** 2
    return 2 * EARTH_RADIUS_KM * np.arcsin(np.sqrt(a))


# ════════════════════════════════════════════════
#  DataPipeline class
# ════════════════════════════════════════════════

class DataPipeline:
    """
    Singleton-style pipeline that loads CSVs, engineers features, and
    exposes query helpers used by the recommendation endpoints.
    """

    def __init__(self) -> None:
        # Raw DataFrames
        self.users_df: pd.DataFrame = pd.DataFrame()
        self.technicians_df: pd.DataFrame = pd.DataFrame()
        self.bookings_df: pd.DataFrame = pd.DataFrame()

        # Engineered features
        self.technician_skill_vectors: np.ndarray = np.array([])
        self.technician_market_trust: Dict[int, float] = {}
        self.user_profiles: Dict[int, dict] = {}

        self._loaded = False

    # ────────────────────────────────────────────
    #  1. Data ingestion
    # ────────────────────────────────────────────

    def load_data(self) -> None:
        """Read CSVs and parse types."""
        logger.info("Loading CSV data …")

        self.users_df = pd.read_csv(USERS_CSV, parse_dates=["join_date"])
        self.technicians_df = pd.read_csv(TECHNICIANS_CSV)
        self.bookings_df = pd.read_csv(BOOKINGS_CSV, parse_dates=["booking_date"])

        logger.info(
            "Loaded  %d users  |  %d technicians  |  %d bookings",
            len(self.users_df),
            len(self.technicians_df),
            len(self.bookings_df),
        )

        # Run feature engineering
        self._run_feature_engineering()

    def load_from_db(
        self,
        users_df: pd.DataFrame,
        technicians_df: pd.DataFrame,
        bookings_df: pd.DataFrame,
    ) -> None:
        """Load data from pre-fetched DataFrames (database source)."""
        logger.info("Loading data from database …")
        self.users_df = users_df
        self.technicians_df = technicians_df
        self.bookings_df = bookings_df

        logger.info(
            "Loaded  %d users  |  %d technicians  |  %d bookings",
            len(self.users_df),
            len(self.technicians_df),
            len(self.bookings_df),
        )

        self._run_feature_engineering()

    def _run_feature_engineering(self) -> None:
        """Run all feature engineering steps."""
        self._build_technician_skill_vectors()
        self._compute_market_trust()
        self._build_user_profiles()

        self._loaded = True
        logger.info("Data pipeline initialised ✓")

    # ────────────────────────────────────────────
    #  2. Technician skill vectors
    # ────────────────────────────────────────────

    def _build_technician_skill_vectors(self) -> None:
        """
        Create a feature vector per technician:
          [one-hot category (3)] + [normalized rate (1)] + [avg_rating (1)] + [completion_rate (1)]
        Total: 6 dimensions
        """
        df = self.technicians_df.copy()
        bookings = self.bookings_df.copy()

        # One-hot category
        for cat in SERVICE_CATEGORIES:
            df[f"cat_{cat}"] = (df["category"] == cat).astype(float)

        # Normalise hourly rate to [0, 1]
        rate_min = df["base_hourly_rate"].min()
        rate_max = df["base_hourly_rate"].max()
        df["norm_rate"] = (df["base_hourly_rate"] - rate_min) / max(rate_max - rate_min, 1)

        # Aggregate booking stats per technician
        completed = bookings[bookings["status"] == "Completed"]
        tech_stats = (
            completed.groupby("technician_id")
            .agg(avg_rating=("rating", "mean"), total_completed=("booking_id", "count"))
            .reset_index()
        )
        tech_total = (
            bookings.groupby("technician_id")["booking_id"]
            .count()
            .reset_index()
            .rename(columns={"booking_id": "total_bookings"})
        )
        tech_stats = tech_stats.merge(tech_total, on="technician_id", how="left")
        tech_stats["completion_rate"] = tech_stats["total_completed"] / tech_stats["total_bookings"]

        # Merge into technicians DF
        df = df.merge(tech_stats[["technician_id", "avg_rating", "completion_rate"]], on="technician_id", how="left")
        df["avg_rating"] = df["avg_rating"].fillna(3.0) / 5.0          # normalise to [0, 1]
        df["completion_rate"] = df["completion_rate"].fillna(0.5)

        feature_cols = [f"cat_{c}" for c in SERVICE_CATEGORIES] + ["norm_rate", "avg_rating", "completion_rate"]
        self.technician_skill_vectors = df[feature_cols].values.astype(np.float32)

        # Store enriched DF
        self.technicians_df = df
        logger.info("Built technician skill vectors  shape=%s", self.technician_skill_vectors.shape)

    # ────────────────────────────────────────────
    #  3. MarketTrust reliability score
    # ────────────────────────────────────────────

    def _compute_market_trust(self) -> None:
        """
        MarketTrust = 0.4 × completion_rate + 0.4 × norm_avg_rating + 0.2 × volume_bonus
        volume_bonus = log2(1 + total_completed) / log2(1 + max_completed)
        """
        bookings = self.bookings_df
        completed = bookings[bookings["status"] == "Completed"]

        stats = (
            completed.groupby("technician_id")
            .agg(avg_rating=("rating", "mean"), total_completed=("booking_id", "count"))
            .reset_index()
        )
        total = (
            bookings.groupby("technician_id")["booking_id"]
            .count()
            .reset_index()
            .rename(columns={"booking_id": "total_bookings"})
        )
        stats = stats.merge(total, on="technician_id", how="left")
        stats["completion_rate"] = stats["total_completed"] / stats["total_bookings"]
        stats["norm_rating"] = stats["avg_rating"] / 5.0

        max_completed = stats["total_completed"].max() if len(stats) else 1
        stats["volume_bonus"] = np.log2(1 + stats["total_completed"]) / np.log2(1 + max_completed)

        stats["market_trust"] = (
            MT_WEIGHT_COMPLETION * stats["completion_rate"]
            + MT_WEIGHT_RATING * stats["norm_rating"]
            + MT_WEIGHT_VOLUME * stats["volume_bonus"]
        )

        self.technician_market_trust = dict(zip(stats["technician_id"], stats["market_trust"]))

        # Assign a default score for technicians with zero bookings
        for tid in self.technicians_df["technician_id"]:
            if tid not in self.technician_market_trust:
                self.technician_market_trust[tid] = 0.3          # conservative default

        logger.info("Computed MarketTrust for %d technicians", len(self.technician_market_trust))

    # ────────────────────────────────────────────
    #  4. User preference profiles
    # ────────────────────────────────────────────

    def _build_user_profiles(self) -> None:
        """
        Per user, aggregate:
          • category_distribution  — normalised counts of bookings per category
          • avg_rating_given       — mean rating the user assigns
          • booking_count          — total bookings (cold-start flag)
        """
        bookings = self.bookings_df
        completed = bookings[bookings["status"] == "Completed"]

        for uid in self.users_df["user_id"].unique():
            user_bookings = completed[completed["user_id"] == uid]
            n_bookings = len(user_bookings)

            if n_bookings == 0:
                self.user_profiles[uid] = {
                    "category_distribution": {c: 1 / len(SERVICE_CATEGORIES) for c in SERVICE_CATEGORIES},
                    "avg_rating_given": 0.0,
                    "booking_count": 0,
                    "is_cold_start": True,
                }
                continue

            cat_counts = user_bookings["service_category"].value_counts()
            cat_dist = {c: cat_counts.get(c, 0) / n_bookings for c in SERVICE_CATEGORIES}

            self.user_profiles[uid] = {
                "category_distribution": cat_dist,
                "avg_rating_given": float(user_bookings["rating"].mean()),
                "booking_count": n_bookings,
                "is_cold_start": n_bookings < COLD_START_BOOKING_THRESHOLD,
            }

        logger.info("Built user profiles for %d users", len(self.user_profiles))

    # ────────────────────────────────────────────
    #  5. Query helpers (used by the API layer)
    # ────────────────────────────────────────────

    def get_nearby_technicians(
        self,
        lat: float,
        lon: float,
        radius_km: float,
        category: Optional[str] = None,
    ) -> pd.DataFrame:
        """Return technicians within *radius_km* of (lat, lon), optionally filtered by category."""
        df = self.technicians_df.copy()
        df["distance_km"] = haversine_km_vectorized(
            df["latitude"].values,
            df["longitude"].values,
            lat,
            lon,
        )
        df = df[df["distance_km"] <= radius_km]

        if category and category in SERVICE_CATEGORIES:
            df = df[df["category"] == category]

        return df.sort_values("distance_km")

    def get_user_profile(self, user_id: int) -> dict:
        """Return the pre-built user profile (or a cold-start default)."""
        return self.user_profiles.get(user_id, {
            "category_distribution": {c: 1 / len(SERVICE_CATEGORIES) for c in SERVICE_CATEGORIES},
            "avg_rating_given": 0.0,
            "booking_count": 0,
            "is_cold_start": True,
        })

    def get_market_trust(self, technician_id: int) -> float:
        """Return the MarketTrust score for a technician."""
        return self.technician_market_trust.get(technician_id, 0.3)

    def infer_category(self, problem_description: str) -> Optional[str]:
        """
        Simple keyword-based category inference from the problem description.
        Phase 2 will replace this with NLP embeddings + FAISS.
        """
        text = problem_description.lower()

        keywords = {
            "plumbing": [
                "plumb", "pipe", "leak", "drain", "toilet", "faucet",
                "sink", "flush", "water pressure", "washing machine",
                "water flow", "tap", "shower", "sewage",
            ],
            "home cleaning": [
                "clean", "cleaning", "mop", "sweep", "dust", "vacuum",
                "sanitize", "carpet", "housekeep", "scrub", "polish",
                "deep clean", "move out", "move in",
            ],
            "air condition": [
                "ac", "air condition", "aircon", "freon", "cooling",
                "split unit", "hvac", "air con", "not cooling", "air filter",
                "cool", "conditioner",
            ],
            "painter": [
                "paint", "painting", "repaint", "wall", "ceiling",
                "peeling", "lacquer", "color", "colour", "primer",
                "coat", "brush", "roller",
            ],
            "dish": [
                "dish", "satellite", "signal", "receiver", "channel",
                "antenna", "tv mount", "hang tv", "wall mount", "aerial",
                "cable", "decoder",
            ],
            "oven/cooker": [
                "oven", "cooker", "stove", "burner", "gas cooker",
                "baking", "heating element", "ignit", "hob", "grill",
                "microwave",
            ],
            "fridge/freezer": [
                "fridge", "freezer", "refrigerator", "compressor",
                "thermostat", "frost", "ice maker", "defrost",
                "not cold", "food spoil",
            ],
            "fan": [
                "fan", "ceiling fan", "blade", "rotat", "spinning",
                "ventilation", "exhaust", "stand fan", "wobbl",
            ],
            "electrical": [
                "electric", "wire", "wiring", "outlet", "fuse", "light",
                "spark", "circuit", "tv setup", "smart tv"
            ],
            "carpentry": [
                "carpent", "wood", "furniture", "door", "window",
                "cabinet", "shelf", "table", "chair", "drawer",
                "assemble", "disassemble", "hinge", "lock",
                "ikea", "hinge",
            ],
        }

        scores = {
            cat: sum(1 for kw in kws if kw in text)
            for cat, kws in keywords.items()
        }
        best = max(scores, key=scores.get)
        return best if scores[best] > 0 else None