"""
FixIt Recommendation System — Configuration & Constants
"""

from pathlib import Path

# ──────────────────────────────────────────────
# File paths
# ──────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "Data"

USERS_CSV = DATA_DIR / "fixit_users.csv"
TECHNICIANS_CSV = DATA_DIR / "fixit_technicians.csv"
BOOKINGS_CSV = DATA_DIR / "fixit_bookings.csv"

# ──────────────────────────────────────────────
# Geospatial defaults
# ──────────────────────────────────────────────
DEFAULT_RADIUS_KM = 10.0          # max search radius in km
EARTH_RADIUS_KM = 6_371.0        # mean Earth radius for Haversine

# ──────────────────────────────────────────────
# Recommendation engine defaults
# ──────────────────────────────────────────────
DEFAULT_TOP_K = 5                 # number of technicians to return
COLD_START_BOOKING_THRESHOLD = 3  # users with fewer bookings are "cold"

# ──────────────────────────────────────────────
# MarketTrust score weights
# ──────────────────────────────────────────────
MT_WEIGHT_COMPLETION = 0.40
MT_WEIGHT_RATING = 0.40
MT_WEIGHT_VOLUME = 0.20

# ──────────────────────────────────────────────
# Service categories (canonical order)
# ──────────────────────────────────────────────
SERVICE_CATEGORIES = [
    "home cleaning",
    "air condition",
    "plumbing",
    "electrical",
    "carpentry",
    "painter",
    "dish",
    "oven/cooker",
    "fridge/freezer",
    "fan",
]

# ──────────────────────────────────────────────
# NMF (Collaborative Filtering) hyperparameters
# ──────────────────────────────────────────────
NMF_LATENT_FACTORS = 15           # number of latent dimensions
NMF_MAX_ITER = 300                # max training iterations

# ──────────────────────────────────────────────
# TF-IDF (Content-Based) settings
# ──────────────────────────────────────────────
TFIDF_MAX_FEATURES = 500
TFIDF_NGRAM_RANGE = (1, 2)

# ──────────────────────────────────────────────
# Database
# ──────────────────────────────────────────────
import os
DATABASE_URL = (
    os.getenv("DATABASE_URL")
    or os.getenv("SUPABASE_CONNECTION_STRING")
    or f"sqlite:///{BASE_DIR / 'fixit.db'}"
)

# ──────────────────────────────────────────────
# MLOps / Experiment tracking
# ──────────────────────────────────────────────
MLRUNS_DIR = BASE_DIR / "mlruns"
MODELS_DIR = BASE_DIR / "models"

# ──────────────────────────────────────────────
# Evaluation
# ──────────────────────────────────────────────
EVAL_TEST_SPLIT = 0.2              # hold-out fraction for offline eval
EVAL_K_VALUES = [3, 5]             # Precision@K evaluated at these K
