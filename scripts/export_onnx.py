"""
Export Veil V2 TF-IDF + Logistic Regression weights from frontend/public/model.json
into an ONNX model consumable by onnxruntime-web.

Output:
    frontend/public/model.onnx

This script does NOT modify any existing V2 runtime files.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.linear_model import LogisticRegression
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

ONNX_INPUT_SIZE = 3000


def _load_model_json(path: Path) -> dict[str, Any]:
    """Load and validate the exported V2 JSON model payload."""
    if not path.exists():
        raise FileNotFoundError(f"Required model file was not found: {path}")

    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    required_keys = [
        "vocabulary",
        "idf_values",
        "coef",
        "intercept",
        "n_features",
    ]
    missing = [k for k in required_keys if k not in data]
    if missing:
        raise ValueError(f"model.json is missing required keys: {missing}")

    return data


def _build_tfidf_transformer(idf_values: list[float]) -> TfidfTransformer:
    """Reconstruct a fitted TF-IDF transformer from persisted IDF values."""
    transformer = TfidfTransformer(norm="l2", use_idf=True, smooth_idf=True, sublinear_tf=True)
    n = len(idf_values)

    # Fit once on a synthetic non-zero corpus to initialize required internals.
    synthetic = np.eye(n, dtype=np.float32)
    transformer.fit(synthetic)

    transformer.idf_ = np.asarray(idf_values, dtype=np.float64)
    transformer._idf_diag = None
    return transformer


def _build_logreg(coef: list[float], intercept: float) -> LogisticRegression:
    """Reconstruct a fitted binary LogisticRegression estimator from raw weights."""
    model = LogisticRegression(max_iter=1000)
    n_features = len(coef)

    # Fit once on a synthetic balanced dataset so sklearn marks estimator as fitted.
    x = np.vstack([
        np.linspace(0.0, 1.0, n_features, dtype=np.float64),
        np.linspace(1.0, 0.0, n_features, dtype=np.float64),
    ])
    y = np.array([0, 1], dtype=np.int64)
    model.fit(x, y)

    model.classes_ = np.array([0, 1], dtype=np.int64)
    model.coef_ = np.asarray([coef], dtype=np.float64)
    model.intercept_ = np.asarray([intercept], dtype=np.float64)
    model.n_features_in_ = n_features
    return model


def _verify_sklearn_consistency(logreg: LogisticRegression, vector: np.ndarray, expected_coef: np.ndarray, expected_intercept: float) -> None:
    """Verify reconstructed sklearn model produces expected sigmoid probability."""
    expected_logit = float(np.dot(vector, expected_coef) + expected_intercept)
    expected_prob = 1.0 / (1.0 + np.exp(-expected_logit))

    predicted_prob = float(logreg.predict_proba(vector.reshape(1, -1))[0, 1])

    if abs(predicted_prob - expected_prob) > 1e-6:
        raise RuntimeError(
            "Reconstructed LogisticRegression verification failed: "
            f"expected={expected_prob:.8f}, got={predicted_prob:.8f}"
        )


def main() -> None:
    """Convert V2 vectorized LR model into ONNX with FloatTensor input [None, 3000]."""
    repo_root = Path(__file__).resolve().parent.parent
    model_json_path = repo_root / "frontend" / "public" / "model.json"
    onnx_out_path = repo_root / "frontend" / "public" / "model.onnx"

    data = _load_model_json(model_json_path)

    n_features = int(data["n_features"])
    idf_values = data["idf_values"]
    coef = np.asarray(data["coef"], dtype=np.float64)
    intercept = float(data["intercept"])

    if n_features != 3000:
        print(
            "Warning: model.json n_features is not 3000. "
            f"Found {n_features}. Export will still proceed with n_features={n_features}."
        )

    if len(idf_values) != len(coef):
        raise ValueError(
            "Mismatched idf/coef lengths in model.json: "
            f"idf={len(idf_values)}, coef={len(coef)}"
        )

    if len(coef) != n_features:
        raise ValueError(
            "Mismatched coefficient length vs n_features in model.json: "
            f"coef={len(coef)}, n_features={n_features}"
        )

    if n_features > ONNX_INPUT_SIZE:
        raise ValueError(
            f"model.json has {n_features} features, exceeds ONNX input size {ONNX_INPUT_SIZE}."
        )

    padded_coef = np.zeros(ONNX_INPUT_SIZE, dtype=np.float64)
    padded_coef[:n_features] = coef

    logreg = _build_logreg(padded_coef.tolist(), intercept)

    # Verify with a deterministic test vector.
    test_vector = np.zeros(ONNX_INPUT_SIZE, dtype=np.float64)
    test_vector[: min(8, ONNX_INPUT_SIZE)] = np.array([0.2, 0.05, 0.1, 0.0, 0.12, 0.03, 0.17, 0.08], dtype=np.float64)

    _verify_sklearn_consistency(logreg, test_vector, padded_coef, intercept)

    # Export only the classification stage because TF-IDF vectorization already exists in TS runtime.
    initial_type = [("input", FloatTensorType([None, ONNX_INPUT_SIZE]))]
    onnx_model = convert_sklearn(logreg, initial_types=initial_type, target_opset=12)

    onnx_out_path.parent.mkdir(parents=True, exist_ok=True)
    with onnx_out_path.open("wb") as f:
        f.write(onnx_model.SerializeToString())

    size_kb = onnx_out_path.stat().st_size / 1024.0
    print(f"ONNX export complete: {onnx_out_path} ({size_kb:.2f} KB)")


if __name__ == "__main__":
    main()
