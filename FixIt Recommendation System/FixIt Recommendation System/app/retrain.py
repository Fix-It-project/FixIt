"""
FixIt — Batch Retraining Pipeline

Standalone script for periodic model retraining.
Can be scheduled via cron / Task Scheduler for weekly updates.

Supports two modes:
  - LOCAL (default): Loads from CSV files in Data/ folder
  - PRODUCTION: Loads from Supabase via DATABASE_URL (set env var)

Usage:
    python -m app.retrain
"""

from __future__ import annotations

import logging
import os
import pickle
from datetime import datetime
from pathlib import Path

import pandas as pd

from app.collaborative_engine import CollaborativeEngine
from app.config import (
    BOOKINGS_CSV,
    EVAL_K_VALUES,
    MODELS_DIR,
    NMF_LATENT_FACTORS,
    NMF_MAX_ITER,
    TECHNICIANS_CSV,
    TFIDF_MAX_FEATURES,
    USERS_CSV,
)
from app.content_engine import ContentEngine
from app.data_pipeline import DataPipeline
from app.evaluation import OfflineEvaluator
from app.experiment_tracker import ExperimentTracker
from app.hybrid_engine import HybridEngine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)-7s │ %(name)s │ %(message)s",
)
logger = logging.getLogger(__name__)


def _load_from_csv() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Load data directly from CSV files (local training mode)."""
    logger.info("Loading data from CSV files …")
    users_df = pd.read_csv(USERS_CSV, parse_dates=["join_date"])
    techs_df = pd.read_csv(TECHNICIANS_CSV)
    bookings_df = pd.read_csv(BOOKINGS_CSV, parse_dates=["booking_date"])

    logger.info(
        "  CSV loaded  —  %d users  |  %d technicians  |  %d bookings",
        len(users_df), len(techs_df), len(bookings_df),
    )
    return users_df, techs_df, bookings_df


def _load_from_db() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Load data from the production database (Supabase)."""
    from app.database import DatabaseManager
    db = DatabaseManager()
    db.create_tables()
    db.seed_from_csv()
    return db.load_to_dataframes()


def retrain() -> None:
    """
    Full retraining pipeline:
      1. Load data (CSV or DB)
      2. Split into train/test
      3. Train engines on train set
      4. Evaluate on test set
      5. Log experiment
      6. Save model artifacts
    """
    logger.info("=" * 60)
    logger.info("  FixIt Batch Retraining Pipeline")
    logger.info("  Started at %s", datetime.now().isoformat())
    logger.info("=" * 60)

    # ── 1. Load data ──────────────────────────
    # Use DB if DATABASE_URL or SUPABASE_CONNECTION_STRING is set,
    # otherwise default to CSV files for local training.
    use_db = bool(os.getenv("DATABASE_URL") or os.getenv("SUPABASE_CONNECTION_STRING"))

    if use_db:
        logger.info("Mode: PRODUCTION (loading from database)")
        users_df, techs_df, bookings_df = _load_from_db()
    else:
        logger.info("Mode: LOCAL (loading from CSV files)")
        users_df, techs_df, bookings_df = _load_from_csv()

    # ── 2. Train/test split ───────────────────
    evaluator = OfflineEvaluator(bookings_df)
    train_df, test_df = evaluator.train_test_split()

    # ── 3. Train on train set ─────────────────
    pipeline = DataPipeline()
    pipeline.load_from_db(users_df, techs_df, train_df)

    content_engine = ContentEngine()
    content_engine.build(
        technicians_df=pipeline.technicians_df,
        bookings_df=train_df,
    )

    collab_engine = CollaborativeEngine()
    collab_engine.build(
        users_df=pipeline.users_df,
        technicians_df=pipeline.technicians_df,
        bookings_df=train_df,
    )

    hybrid_engine = HybridEngine(
        pipeline=pipeline,
        content_engine=content_engine,
        collab_engine=collab_engine,
    )

    # ── 4. Evaluate on test set ───────────────
    metrics = evaluator.evaluate(
        hybrid_engine=hybrid_engine,
        test_df=test_df,
        users_df=users_df,
    )

    # ── 5. Log experiment ─────────────────────
    tracker = ExperimentTracker()
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    tracker.start_run(run_name=f"retrain_{ts}")

    tracker.log_params({
        "nmf_latent_factors": NMF_LATENT_FACTORS,
        "nmf_max_iter": NMF_MAX_ITER,
        "tfidf_max_features": TFIDF_MAX_FEATURES,
        "train_bookings": len(train_df),
        "test_bookings": len(test_df),
        "eval_k_values": EVAL_K_VALUES,
        "data_source": "database" if use_db else "csv",
        "num_categories": len(techs_df["category"].unique()),
    })

    tracker.log_metrics(metrics)

    # ── 6. Save model artifacts ───────────────
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model_path = MODELS_DIR / f"model_{ts}"
    model_path.mkdir(parents=True, exist_ok=True)

    # Save NMF factors
    if collab_engine.W is not None and collab_engine.H is not None:
        with open(model_path / "nmf_W.pkl", "wb") as f:
            pickle.dump(collab_engine.W, f)
        with open(model_path / "nmf_H.pkl", "wb") as f:
            pickle.dump(collab_engine.H, f)

    # Save FAISS index
    if content_engine.faiss_index is not None:
        import faiss
        faiss.write_index(content_engine.faiss_index, str(model_path / "faiss.index"))

    # Save TF-IDF vectorizer
    if content_engine.vectorizer is not None:
        with open(model_path / "tfidf_vectorizer.pkl", "wb") as f:
            pickle.dump(content_engine.vectorizer, f)

    tracker.log_model_info({
        "model_dir": model_path,
        "timestamp": ts,
        "artifacts": ["nmf_W.pkl", "nmf_H.pkl", "faiss.index", "tfidf_vectorizer.pkl"],
    })

    tracker.end_run()

    # ── Summary ───────────────────────────────
    logger.info("=" * 60)
    logger.info("  Retraining complete!")
    logger.info("  Metrics: %s", metrics)
    logger.info("  Artifacts saved to: %s", model_path)
    logger.info("=" * 60)


if __name__ == "__main__":
    retrain()
