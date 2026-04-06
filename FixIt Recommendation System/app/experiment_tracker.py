"""
FixIt — Experiment Tracker

MLflow-compatible experiment tracking with local JSON fallback.
Tries to use MLflow if installed; otherwise logs to local files.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

from app.config import MLRUNS_DIR

logger = logging.getLogger(__name__)

# ── MLflow backend ────────────────────────────
# Disabled: MLflow has path validation issues on Windows with spaces
# in the project directory. Using local JSON tracker instead.
# To re-enable: set _mlflow_available = True and ensure the project
# path has no spaces.
_mlflow_available = False
try:
    import mlflow
except ImportError:
    pass
logger.info("Using local JSON experiment tracker")


class ExperimentTracker:
    """
    Logs training parameters, evaluation metrics, and model metadata.

    Backend priority:
      1. MLflow (if installed)
      2. Local JSON files in MLRUNS_DIR/
    """

    def __init__(self, experiment_name: str = "fixit-recommendation") -> None:
        self.experiment_name = experiment_name
        self._run_dir: Optional[Path] = None

    # ────────────────────────────────────────────
    #  Context manager for a training run
    # ────────────────────────────────────────────
    def start_run(self, run_name: Optional[str] = None) -> "ExperimentTracker":
        """Begin a new tracked run."""
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        run_name = run_name or f"run_{ts}"

        if _mlflow_available:
            mlflow.start_run(run_name=run_name)
            logger.info("MLflow run started: %s", run_name)
        else:
            self._run_dir = MLRUNS_DIR / run_name
            self._run_dir.mkdir(parents=True, exist_ok=True)
            logger.info("Local run started: %s", self._run_dir)

        return self

    def end_run(self) -> None:
        """End the current run."""
        if _mlflow_available:
            mlflow.end_run()
        self._run_dir = None
        logger.info("Experiment run ended")

    # ────────────────────────────────────────────
    #  Logging
    # ────────────────────────────────────────────
    def log_params(self, params: Dict[str, Any]) -> None:
        """Log hyperparameters."""
        if _mlflow_available:
            mlflow.log_params({k: str(v) for k, v in params.items()})
        elif self._run_dir:
            self._append_json("params.json", params)
        logger.info("Logged params: %s", list(params.keys()))

    def log_metrics(self, metrics: Dict[str, float]) -> None:
        """Log evaluation metrics."""
        if _mlflow_available:
            mlflow.log_metrics(metrics)
        elif self._run_dir:
            self._append_json("metrics.json", metrics)
        logger.info("Logged metrics: %s", metrics)

    def log_model_info(self, model_info: Dict[str, Any]) -> None:
        """Log model metadata (artifact paths, version, etc.)."""
        if _mlflow_available:
            mlflow.log_params({f"model_{k}": str(v) for k, v in model_info.items()})
        elif self._run_dir:
            self._append_json("model_info.json", model_info)
        logger.info("Logged model info: %s", list(model_info.keys()))

    # ────────────────────────────────────────────
    #  Local file helpers
    # ────────────────────────────────────────────
    def _append_json(self, filename: str, data: Dict) -> None:
        """Write a JSON file into the current run directory."""
        if self._run_dir is None:
            return
        filepath = self._run_dir / filename
        # Serialise Path objects to strings
        serializable = {}
        for k, v in data.items():
            if isinstance(v, Path):
                serializable[k] = str(v)
            else:
                serializable[k] = v

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(serializable, f, indent=2, default=str)
