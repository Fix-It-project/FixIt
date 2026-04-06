"""
FixIt — Collaborative Filtering Engine

Matrix Factorization via NMF (Non-negative Matrix Factorization)
on the User–Technician interaction matrix derived from booking
ratings and implicit feedback.
"""

from __future__ import annotations

import logging
from typing import Dict, List, Optional

import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.decomposition import NMF

from app.config import NMF_LATENT_FACTORS, NMF_MAX_ITER

logger = logging.getLogger(__name__)


class CollaborativeEngine:
    """
    Collaborative Filtering via NMF.

    Build phase:
      1. Construct a sparse (n_users × n_technicians) rating matrix.
      2. Augment with implicit signals (completed = 2.5 if unrated).
      3. Fit NMF → user latent factors W, technician factors H.

    Query phase:
      Predict score(u, t) = W[u] · H[:, t]   (normalised to [0, 1])
    """

    def __init__(self) -> None:
        self.W: Optional[np.ndarray] = None               # (n_users, k)
        self.H: Optional[np.ndarray] = None               # (k, n_technicians)

        self._uid_to_idx: Dict[int, int] = {}
        self._tid_to_idx: Dict[int, int] = {}
        self._idx_to_tid: Dict[int, int] = {}

        self._max_pred: float = 1.0                        # for normalisation
        self._ready = False

    # ────────────────────────────────────────────
    #  Build
    # ────────────────────────────────────────────
    def build(
        self,
        users_df: pd.DataFrame,
        technicians_df: pd.DataFrame,
        bookings_df: pd.DataFrame,
    ) -> None:
        """Construct interaction matrix and train NMF model."""

        # --- Index mappings ---
        user_ids = sorted(users_df["user_id"].unique())
        tech_ids = sorted(technicians_df["technician_id"].unique())

        self._uid_to_idx = {uid: i for i, uid in enumerate(user_ids)}
        self._tid_to_idx = {tid: j for j, tid in enumerate(tech_ids)}
        self._idx_to_tid = {j: tid for tid, j in self._tid_to_idx.items()}

        n_users = len(user_ids)
        n_techs = len(tech_ids)

        # --- Populate interaction matrix ---
        rows, cols, vals = [], [], []
        for _, row in bookings_df.iterrows():
            uid = row["user_id"]
            tid = row["technician_id"]
            if uid not in self._uid_to_idx or tid not in self._tid_to_idx:
                continue

            i = self._uid_to_idx[uid]
            j = self._tid_to_idx[tid]

            if row["status"] == "Completed":
                rating = row["rating"] if pd.notna(row["rating"]) else 2.5
                val = float(rating)
            else:
                # Canceled → weak negative / no signal
                val = 0.5

            rows.append(i)
            cols.append(j)
            vals.append(val)

        R = csr_matrix((vals, (rows, cols)), shape=(n_users, n_techs))

        # --- NMF training ---
        logger.info(
            "Training NMF  —  matrix %d×%d  |  nnz=%d  |  k=%d  |  max_iter=%d",
            n_users, n_techs, R.nnz, NMF_LATENT_FACTORS, NMF_MAX_ITER,
        )

        model = NMF(
            n_components=NMF_LATENT_FACTORS,
            init="nndsvda",
            max_iter=NMF_MAX_ITER,
            random_state=42,
        )
        self.W = model.fit_transform(R)          # (n_users, k)
        self.H = model.components_               # (k, n_techs)

        # Predicted matrix for normalisation reference
        pred_all = self.W @ self.H
        self._max_pred = float(pred_all.max()) if pred_all.max() > 0 else 1.0

        self._ready = True
        logger.info(
            "Collaborative engine ready  —  reconstruction error=%.4f  |  max_pred=%.4f",
            model.reconstruction_err_,
            self._max_pred,
        )

    # ────────────────────────────────────────────
    #  Query
    # ────────────────────────────────────────────
    def score(
        self,
        user_id: Optional[int],
        candidate_tids: List[int],
    ) -> Dict[int, float]:
        """
        Return {technician_id: collaborative_score} for candidates.
        Scores normalised to [0, 1].
        """
        if not self._ready or user_id is None:
            return {tid: 0.0 for tid in candidate_tids}

        u_idx = self._uid_to_idx.get(user_id)
        if u_idx is None:
            # Unknown user → no collaborative signal
            return {tid: 0.0 for tid in candidate_tids}

        user_vec = self.W[u_idx]                             # (k,)
        scores: Dict[int, float] = {}
        for tid in candidate_tids:
            t_idx = self._tid_to_idx.get(tid)
            if t_idx is None:
                scores[tid] = 0.0
                continue
            raw = float(np.dot(user_vec, self.H[:, t_idx]))
            scores[tid] = max(0.0, min(1.0, raw / self._max_pred))

        return scores
