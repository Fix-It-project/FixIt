"""
FixIt — Offline Evaluation Metrics (v2)

Evaluates the recommendation system against historical booking data:
  • Precision@K   — fraction of recommendations the user actually booked
  • MRR           — Mean Reciprocal Rank of the first relevant result
  • Category Hit  — did we recommend the right service category?

Key improvements over v1:
  - Uses ACTUAL test booking problem descriptions (not generic text)
  - Evaluates per-booking rather than per-user for finer signal
  - Realistic search radius matching production behavior
"""

from __future__ import annotations

import logging
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from app.config import EVAL_K_VALUES, EVAL_TEST_SPLIT

logger = logging.getLogger(__name__)


def precision_at_k(recommended: List[int], relevant: set, k: int) -> float:
    """Precision@K = |recommended[:k] ∩ relevant| / k"""
    top_k = recommended[:k]
    if not top_k:
        return 0.0
    hits = sum(1 for tid in top_k if tid in relevant)
    return hits / k


def reciprocal_rank(recommended: List[int], relevant: set) -> float:
    """Reciprocal Rank = 1 / rank_of_first_relevant_result"""
    for i, tid in enumerate(recommended, start=1):
        if tid in relevant:
            return 1.0 / i
    return 0.0


def category_hit_at_k(
    recommended_categories: List[str],
    target_category: str,
    k: int,
) -> float:
    """Fraction of top-K recommendations matching the target category."""
    top_k = recommended_categories[:k]
    if not top_k:
        return 0.0
    return sum(1 for c in top_k if c == target_category) / k


class OfflineEvaluator:
    """
    Per-booking evaluation: for each test booking, ask the engine
    to recommend using the ACTUAL problem description and location,
    then check if the actually-booked technician appears in top-K.
    """

    def __init__(self, bookings_df: pd.DataFrame, seed: int = 42) -> None:
        self.bookings_df = bookings_df
        self.seed = seed

    def train_test_split(self) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Chronological split per user."""
        bookings = self.bookings_df.copy()
        bookings = bookings.sort_values(["user_id", "booking_date"])

        train_parts, test_parts = [], []
        for uid, group in bookings.groupby("user_id"):
            n = len(group)
            split_idx = max(1, int(n * (1 - EVAL_TEST_SPLIT)))
            train_parts.append(group.iloc[:split_idx])
            test_parts.append(group.iloc[split_idx:])

        train_df = pd.concat(train_parts, ignore_index=True)
        test_df = pd.concat(test_parts, ignore_index=True)

        logger.info(
            "Train/test split  —  train=%d  test=%d  (%.0f%% held out)",
            len(train_df), len(test_df),
            100 * len(test_df) / max(len(bookings), 1),
        )
        return train_df, test_df

    def evaluate(
        self,
        hybrid_engine,
        test_df: pd.DataFrame,
        users_df: pd.DataFrame,
    ) -> Dict[str, float]:
        """
        Per-booking evaluation:
          For each completed test booking:
            1. Use the ACTUAL problem_description from that booking
            2. Use the user's actual location
            3. Get recommendations from the hybrid engine
            4. Check if the booked technician appears in top-K

        This tests: can the engine predict who the user will actually book?
        """
        completed_test = test_df[test_df["status"] == "Completed"].copy()

        if completed_test.empty:
            logger.warning("No completed test bookings — evaluation skipped")
            return {"precision@3": 0.0, "precision@5": 0.0, "mrr": 0.0}

        # Also build per-user ground truth (all technicians they booked in test)
        user_all_booked: Dict[int, set] = {}
        for uid, group in completed_test.groupby("user_id"):
            user_all_booked[int(uid)] = set(group["technician_id"].unique())

        # Per-booking evaluation
        all_precisions: Dict[int, List[float]] = {k: [] for k in EVAL_K_VALUES}
        all_rrs: List[float] = []
        all_cat_hits: Dict[int, List[float]] = {k: [] for k in EVAL_K_VALUES}
        n_evaluated = 0

        for _, booking in completed_test.iterrows():
            uid = int(booking["user_id"])
            booked_tid = int(booking["technician_id"])
            booked_cat = booking["service_category"]
            problem_desc = booking["problem_description"]

            # Get user location
            user_row = users_df[users_df["user_id"] == uid]
            if user_row.empty:
                continue

            lat = float(user_row.iloc[0]["latitude"])
            lon = float(user_row.iloc[0]["longitude"])

            # The relevant set: the technician they actually booked
            # PLUS any other technicians they booked in the test set
            relevant = user_all_booked.get(uid, {booked_tid})

            try:
                recommendations, _, _ = hybrid_engine.recommend(
                    user_id=uid,
                    problem_description=problem_desc,     # ← ACTUAL description
                    latitude=lat,
                    longitude=lon,
                    radius_km=15.0,                       # ← realistic radius
                    top_k=max(EVAL_K_VALUES),
                )
            except Exception:
                continue

            rec_tids = [r.technician_id for r in recommendations]
            rec_cats = [r.category for r in recommendations]

            for k in EVAL_K_VALUES:
                all_precisions[k].append(precision_at_k(rec_tids, relevant, k))
                all_cat_hits[k].append(
                    category_hit_at_k(rec_cats, booked_cat, k)
                )
            all_rrs.append(reciprocal_rank(rec_tids, relevant))
            n_evaluated += 1

        # Aggregate
        metrics: Dict[str, float] = {}
        for k in EVAL_K_VALUES:
            vals = all_precisions[k]
            metrics[f"precision@{k}"] = float(np.mean(vals)) if vals else 0.0
            cat_vals = all_cat_hits[k]
            metrics[f"category_hit@{k}"] = float(np.mean(cat_vals)) if cat_vals else 0.0
        metrics["mrr"] = float(np.mean(all_rrs)) if all_rrs else 0.0
        metrics["bookings_evaluated"] = n_evaluated

        logger.info("Evaluation results: %s", metrics)
        return metrics
