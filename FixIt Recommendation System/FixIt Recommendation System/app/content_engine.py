"""
FixIt — Content-Based Filtering Engine

Uses TF-IDF embeddings of problem descriptions and a FAISS index
to find technicians whose past work is most similar to the user's
current problem.
"""

from __future__ import annotations

import logging
from collections import defaultdict
from typing import Dict, List, Optional, Tuple

import faiss
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import normalize

from app.config import SERVICE_CATEGORIES

logger = logging.getLogger(__name__)


class ContentEngine:
    """
    Content-Based Filtering via TF-IDF + FAISS.

    Build phase (called once at startup):
      1. Aggregate every technician's completed-booking descriptions
         into a single "profile document".
      2. Fit a TF-IDF vectorizer on the full corpus.
      3. Build a FAISS inner-product index over L2-normalised
         technician vectors for fast cosine-similarity search.

    Query phase (called per request):
      1. Transform the user's problem_description → TF-IDF vector.
      2. Query FAISS for top-K most similar technicians.
    """

    def __init__(self) -> None:
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.faiss_index: Optional[faiss.IndexFlatIP] = None

        # Maps FAISS row position → technician_id
        self._idx_to_tid: Dict[int, int] = {}
        self._tid_to_idx: Dict[int, int] = {}

        # Stored vectors for debugging / hybrid blending
        self.technician_vectors: Optional[np.ndarray] = None

        self._ready = False

    # ────────────────────────────────────────────
    #  Build
    # ────────────────────────────────────────────
    def build(
        self,
        technicians_df: pd.DataFrame,
        bookings_df: pd.DataFrame,
    ) -> None:
        """Fit TF-IDF and build the FAISS index."""

        completed = bookings_df[bookings_df["status"] == "Completed"].copy()

        # --- 1. Build per-technician text profiles ---
        # Combine all problem descriptions a technician has handled,
        # weighted by the rating the user gave (higher-rated jobs
        # are more representative of the technician's strength).
        tech_docs: Dict[int, str] = {}
        for tid in technicians_df["technician_id"]:
            rows = completed[completed["technician_id"] == tid]
            if rows.empty:
                # Fallback: use category name as seed text
                cat = technicians_df.loc[
                    technicians_df["technician_id"] == tid, "category"
                ].iloc[0]
                tech_docs[tid] = f"{cat} maintenance repair service"
            else:
                # Repeat high-rated descriptions more often (implicit boost)
                parts: List[str] = []
                for _, row in rows.iterrows():
                    rating = row["rating"] if pd.notna(row["rating"]) else 3.0
                    repeat = max(1, int(rating))
                    parts.extend([row["problem_description"]] * repeat)
                tech_docs[tid] = " . ".join(parts)

        # Ordered list so we can map FAISS indices ↔ technician_ids
        ordered_tids = sorted(tech_docs.keys())
        corpus = [tech_docs[tid] for tid in ordered_tids]

        self._idx_to_tid = {i: tid for i, tid in enumerate(ordered_tids)}
        self._tid_to_idx = {tid: i for i, tid in enumerate(ordered_tids)}

        # --- 2. Fit TF-IDF ---
        self.vectorizer = TfidfVectorizer(
            max_features=500,
            stop_words="english",
            ngram_range=(1, 2),
            sublinear_tf=True,
        )
        tfidf_matrix = self.vectorizer.fit_transform(corpus).toarray().astype(np.float32)

        # L2 normalise so inner product == cosine similarity
        self.technician_vectors = normalize(tfidf_matrix, norm="l2").astype(np.float32)

        # --- 3. Build FAISS index ---
        dim = self.technician_vectors.shape[1]
        self.faiss_index = faiss.IndexFlatIP(dim)            # inner-product
        self.faiss_index.add(self.technician_vectors)        # type: ignore[arg-type]

        self._ready = True
        logger.info(
            "Content engine ready  —  %d technicians  ×  %d TF-IDF features  |  FAISS index size=%d",
            len(ordered_tids),
            dim,
            self.faiss_index.ntotal,
        )

    # ────────────────────────────────────────────
    #  Query
    # ────────────────────────────────────────────
    def score(
        self,
        problem_description: str,
        candidate_tids: List[int],
        top_k: int = 20,
    ) -> Dict[int, float]:
        """
        Return a dict {technician_id: content_similarity_score} for the
        given candidates, scored against the problem description.

        Scores are in [0, 1] (cosine similarity).
        """
        if not self._ready or self.vectorizer is None or self.faiss_index is None:
            # Fallback: uniform scores
            return {tid: 0.5 for tid in candidate_tids}

        # Transform query
        q_vec = self.vectorizer.transform([problem_description]).toarray().astype(np.float32)
        q_vec = normalize(q_vec, norm="l2").astype(np.float32)

        # Search full index (we'll filter to candidates after)
        k = min(self.faiss_index.ntotal, max(top_k, len(candidate_tids)))
        distances, indices = self.faiss_index.search(q_vec, k)

        # Build result map (only for candidates that appear in results)
        candidate_set = set(candidate_tids)
        scores: Dict[int, float] = {}
        for dist, idx in zip(distances[0], indices[0]):
            if idx < 0:
                continue
            tid = self._idx_to_tid.get(int(idx))
            if tid is not None and tid in candidate_set:
                # Clamp to [0, 1]
                scores[tid] = float(max(0.0, min(1.0, dist)))

        # Any candidate not found in FAISS results gets a baseline
        for tid in candidate_tids:
            if tid not in scores:
                scores[tid] = self._compute_single(problem_description, tid)

        return scores

    def _compute_single(self, problem_description: str, tid: int) -> float:
        """Direct cosine similarity for a single technician (fallback)."""
        if not self._ready or self.vectorizer is None or self.technician_vectors is None:
            return 0.5
        idx = self._tid_to_idx.get(tid)
        if idx is None:
            return 0.5
        q_vec = self.vectorizer.transform([problem_description]).toarray().astype(np.float32)
        q_vec = normalize(q_vec, norm="l2").astype(np.float32)
        sim = float(np.dot(q_vec[0], self.technician_vectors[idx]))
        return max(0.0, min(1.0, sim))
