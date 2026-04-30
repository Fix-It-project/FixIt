"""
FixIt Recommendation System — FastAPI Application (v2)

Entry-point for the REST API.  Exposes:
  • GET  /health          → liveness probe
  • POST /api/recommend   → hybrid technician recommendations

Data loading modes:
  • LOCAL (default): Loads from CSV files in Data/
  • PRODUCTION: Loads from Supabase via DATABASE_URL env var
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from typing import Optional

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.collaborative_engine import CollaborativeEngine
from app.config import BOOKINGS_CSV, TECHNICIANS_CSV, USERS_CSV
from app.content_engine import ContentEngine
from app.data_pipeline import DataPipeline
from app.hybrid_engine import HybridEngine
from app.audio_engine import AudioEngine
from app.schemas import (
    RecommendationRequest,
    RecommendationResponse,
    AudioTranscriptionRequest,
    AudioTranscriptionResponse,
)

# ──────────────────────────────────────────────
#  Logging
# ──────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)-7s │ %(name)s │ %(message)s",
)
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
#  Engine singletons
# ──────────────────────────────────────────────
pipeline = DataPipeline()
content_engine = ContentEngine()
collab_engine = CollaborativeEngine()
hybrid_engine: Optional[HybridEngine] = None
audio_engine = AudioEngine(model_name="base")
_data_source: str = "unknown"


# ──────────────────────────────────────────────
#  Data loading helpers
# ──────────────────────────────────────────────
def _load_csv() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Load data from local CSV files."""
    users_df = pd.read_csv(USERS_CSV, parse_dates=["join_date"])
    techs_df = pd.read_csv(TECHNICIANS_CSV)
    bookings_df = pd.read_csv(BOOKINGS_CSV, parse_dates=["booking_date"])
    return users_df, techs_df, bookings_df


def _load_db() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Load data from production database (Supabase)."""
    from app.database import DatabaseManager
    db = DatabaseManager()
    db.create_tables()
    db.seed_from_csv()
    return db.load_to_dataframes()


# ──────────────────────────────────────────────
#  FastAPI lifespan
# ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load data and train models on startup."""
    global hybrid_engine, _data_source

    logger.info("🚀  Starting FixIt Recommendation Engine …")

    # 1. Load data (DB if DATABASE_URL is set, else CSV)
    use_db = bool(os.getenv("DATABASE_URL") or os.getenv("SUPABASE_CONNECTION_STRING"))

    if use_db:
        _data_source = "database"
        logger.info("Mode: PRODUCTION (loading from database)")
        users_df, techs_df, bookings_df = _load_db()
    else:
        _data_source = "csv"
        logger.info("Mode: LOCAL (loading from CSV files)")
        users_df, techs_df, bookings_df = _load_csv()

    # 2. Data pipeline — feature engineering
    pipeline.load_from_db(users_df, techs_df, bookings_df)

    # 3. Content-Based engine — TF-IDF + FAISS
    content_engine.build(
        technicians_df=pipeline.technicians_df,
        bookings_df=pipeline.bookings_df,
    )

    # 4. Collaborative engine — NMF matrix factorization
    collab_engine.build(
        users_df=pipeline.users_df,
        technicians_df=pipeline.technicians_df,
        bookings_df=pipeline.bookings_df,
    )

    # 5. Hybrid engine — orchestrator
    hybrid_engine = HybridEngine(
        pipeline=pipeline,
        content_engine=content_engine,
        collab_engine=collab_engine,
    )

    # 6. Audio STT engine
    audio_engine.build()

    logger.info("✅  All engines ready — serving requests")
    yield
    logger.info("🛑  Shutting down FixIt Recommendation Engine")


# ──────────────────────────────────────────────
#  Application instance
# ──────────────────────────────────────────────
app = FastAPI(
    title="FixIt Recommendation System",
    description=(
        "Hybrid AI recommendation engine for matching Egyptian households "
        "with verified home-maintenance technicians.  Combines Content-Based "
        "Filtering (TF-IDF + FAISS), Collaborative Filtering (NMF), and "
        "MarketTrust reliability scoring."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════
#  Health check
# ═══════════════════════════════════════════════
@app.get("/health", tags=["system"])
async def health():
    """Liveness / readiness probe."""
    return {
        "status": "ok",
        "version": "1.0.0",
        "data_source": _data_source,
        "engines": {
            "data_pipeline": pipeline._loaded,
            "content_engine": content_engine._ready,
            "collaborative_engine": collab_engine._ready,
            "hybrid_engine": hybrid_engine is not None,
            "audio_engine": audio_engine._ready,
        },
        "data": {
            "users": len(pipeline.users_df),
            "technicians": len(pipeline.technicians_df),
            "bookings": len(pipeline.bookings_df),
        },
    }


# ═══════════════════════════════════════════════
#  Recommendation endpoint
# ═══════════════════════════════════════════════
@app.post(
    "/api/recommend",
    response_model=RecommendationResponse,
    tags=["recommendations"],
    summary="Get top-K technician recommendations",
)
async def recommend(req: RecommendationRequest):
    """
    **Hybrid Recommendation Engine**

    Pipeline:
      1. Infers service category from `problem_description` (keyword NLP).
      2. Geo-filters technicians within `radius_km` using Haversine.
      3. **Content-Based score** — TF-IDF cosine similarity via FAISS.
      4. **Collaborative score** — NMF latent-factor dot product.
      5. **Dynamic blending** — weights shift from content→collab
         as the user accumulates more booking history.
      6. **MarketTrust multiplier** — reliability × hybrid score.
      7. Returns top-K sorted by final score.
    """
    if hybrid_engine is None:
        raise HTTPException(status_code=503, detail="Engine not ready.")

    recommendations, is_cold_start, engine_used = hybrid_engine.recommend(
        user_id=req.user_id,
        problem_description=req.problem_description,
        latitude=req.latitude,
        longitude=req.longitude,
        radius_km=req.radius_km,
        top_k=req.top_k,
    )

    if not recommendations:
        raise HTTPException(
            status_code=404,
            detail="No technicians found within the search radius.",
        )

    return RecommendationResponse(
        user_id=req.user_id,
        is_cold_start=is_cold_start,
        recommendations=recommendations,
        engine_used=engine_used,
    )

# ═══════════════════════════════════════════════
#  Audio Transcription endpoint
# ═══════════════════════════════════════════════
@app.post(
    "/api/transcribe",
    response_model=AudioTranscriptionResponse,
    tags=["multimodal"],
    summary="Transcribe base64 audio to text using local Whisper model",
)
async def transcribe_audio(req: AudioTranscriptionRequest):
    """
    **Speech-to-Text Pipeline**

    Takes base64 encoded audio from a mobile client and runs it through
    the local Whisper 'base' model.
    """
    if not audio_engine._ready:
        raise HTTPException(status_code=503, detail="Audio STT engine not ready.")

    try:
        text = await audio_engine.transcribe_base64(req.audio_base64)
        return AudioTranscriptionResponse(text=text)
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=400, detail=f"Audio processing failed: {str(e)}")
