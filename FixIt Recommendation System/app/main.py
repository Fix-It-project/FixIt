"""
FixIt Recommendation System — FastAPI Application

Entry-point for the REST API.  Exposes:
  • GET  /health          → liveness probe
  • POST /api/recommend   → hybrid technician recommendations
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.collaborative_engine import CollaborativeEngine
from app.content_engine import ContentEngine
from app.data_pipeline import DataPipeline
from app.database import DatabaseManager
from app.hybrid_engine import HybridEngine
from app.schemas import (
    RecommendationRequest,
    RecommendationResponse,
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
db_manager = DatabaseManager()
pipeline = DataPipeline()
content_engine = ContentEngine()
collab_engine = CollaborativeEngine()
hybrid_engine: Optional[HybridEngine] = None


# ──────────────────────────────────────────────
#  FastAPI lifespan
# ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load data and train models on startup."""
    global hybrid_engine

    logger.info("🚀  Starting FixIt Recommendation Engine …")

    # 1. Database — create tables & seed from CSV
    db_manager.create_tables()
    db_manager.seed_from_csv()

    # 2. Data pipeline — load from DB → feature engineering
    users_df, techs_df, bookings_df = db_manager.load_to_dataframes()
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
        "MarketTrust reliability scoring.  Backed by SQLAlchemy ORM."
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
        "engines": {
            "database": db_manager._ready,
            "data_pipeline": pipeline._loaded,
            "content_engine": content_engine._ready,
            "collaborative_engine": collab_engine._ready,
            "hybrid_engine": hybrid_engine is not None,
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
