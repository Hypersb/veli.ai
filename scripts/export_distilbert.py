"""
Train and export a DistilBERT 4-class email threat model to ONNX.

Output:
    frontend/public/model-bert.onnx

Notes:
- Uses local dataset only (no external inference API).
- Exports ONNX for client-side execution.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
import inspect
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import torch
from datasets import Dataset
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from transformers import (
    DistilBertForSequenceClassification,
    DistilBertTokenizerFast,
    Trainer,
    TrainingArguments,
)

LABEL_TO_ID = {
    "Safe": 0,
    "Suspicious": 1,
    "Spam": 2,
    "Phishing": 3,
}
ID_TO_LABEL = {v: k for k, v in LABEL_TO_ID.items()}
MAX_TRAINING_ROWS = 1200


@dataclass
class DataConfig:
    """Configuration for local training data and export destinations."""

    dataset_path_candidates: list[Path]
    output_dir: Path
    onnx_output_path: Path


def weak_label(text: str, raw_label: str) -> int:
    """Map available labels into a 4-class taxonomy using deterministic threat cues."""
    lower = str(text).lower()

    phishing_markers = [
        "verify now",
        "account suspended",
        "click here",
        "confirm your",
        "routing number",
        "ssn",
        "wire transfer",
        "gift card",
    ]

    suspicious_markers = [
        "urgent",
        "act now",
        "limited time",
        "final notice",
        "winner",
        "prize",
        "selected",
    ]

    if raw_label == "spam":
        if any(marker in lower for marker in phishing_markers):
            return LABEL_TO_ID["Phishing"]
        if any(marker in lower for marker in suspicious_markers):
            return LABEL_TO_ID["Suspicious"]
        return LABEL_TO_ID["Spam"]

    if any(marker in lower for marker in suspicious_markers):
        return LABEL_TO_ID["Suspicious"]

    return LABEL_TO_ID["Safe"]


def resolve_dataset_path(candidates: list[Path]) -> Path:
    """Resolve the first existing dataset path from configured candidates."""
    for candidate in candidates:
        if candidate.exists():
            return candidate
    joined = "\n".join(str(c) for c in candidates)
    raise FileNotFoundError(f"Dataset not found in any expected location:\n{joined}")


def load_dataframe(path: Path) -> pd.DataFrame:
    """Load and validate source CSV containing message text and coarse labels."""
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found at {path}")

    df = pd.read_csv(path, encoding="latin-1")
    required_columns = {"v1", "v2"}
    if not required_columns.issubset(df.columns):
        raise ValueError("Dataset must include columns: v1, v2")

    df = df[["v1", "v2"]].rename(columns={"v1": "label", "v2": "text"})
    df["label"] = df["label"].astype(str).str.lower().str.strip()
    df["text"] = df["text"].astype(str)
    df["class_id"] = df.apply(lambda row: weak_label(row["text"], row["label"]), axis=1)

    return df


def tokenize_batch(examples: dict[str, list[str]], tokenizer: DistilBertTokenizerFast) -> dict[str, Any]:
    """Tokenize text batch for DistilBERT training/inference."""
    return tokenizer(
        examples["text"],
        truncation=True,
        padding="max_length",
        max_length=256,
    )


def compute_metrics(eval_pred: Any) -> dict[str, float]:
    """Compute multiclass accuracy from Trainer predictions."""
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    return {"accuracy": accuracy_score(labels, preds)}


def export_to_onnx(model_dir: Path, output_path: Path) -> None:
    """Export trained DistilBERT checkpoint to ONNX format for browser inference."""
    model = DistilBertForSequenceClassification.from_pretrained(model_dir)
    tokenizer = DistilBertTokenizerFast.from_pretrained(model_dir)
    model.eval()

    sample = tokenizer(
        "security verification email",
        truncation=True,
        padding="max_length",
        max_length=256,
        return_tensors="pt",
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    torch.onnx.export(
        model,
        (sample["input_ids"], sample["attention_mask"]),
        str(output_path),
        input_names=["input_ids", "attention_mask"],
        output_names=["logits"],
        dynamic_axes={
            "input_ids": {0: "batch_size", 1: "sequence"},
            "attention_mask": {0: "batch_size", 1: "sequence"},
            "logits": {0: "batch_size"},
        },
        opset_version=12,
    )

    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"ONNX model exported to {output_path} ({size_mb:.2f} MB)")


def main() -> None:
    """Train DistilBERT for 4-class threat detection and export ONNX artifact."""
    parser = argparse.ArgumentParser(description="Train and export DistilBERT ONNX model")
    parser.add_argument("--export-only", action="store_true", help="Skip training and export from existing checkpoint")
    cli_args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    config = DataConfig(
        dataset_path_candidates=[
            repo_root / "scripts" / "data" / "spam.csv",
            repo_root / "data" / "raw" / "spam.csv",
            repo_root / "backend" / "data" / "raw" / "spam.csv",
        ],
        output_dir=repo_root / "scripts" / "_distilbert_checkpoint",
        onnx_output_path=repo_root / "frontend" / "public" / "model-bert.onnx",
    )

    if not cli_args.export_only:
        dataset_path = resolve_dataset_path(config.dataset_path_candidates)
        print(f"Using dataset: {dataset_path}")
        df = load_dataframe(dataset_path)

        if len(df) > MAX_TRAINING_ROWS:
            print(f"Downsampling dataset from {len(df)} to {MAX_TRAINING_ROWS} rows for practical local training time.")
            sample_by_class = []
            per_class = max(1, MAX_TRAINING_ROWS // max(len(LABEL_TO_ID), 1))
            for class_id, group in df.groupby("class_id"):
                take = min(len(group), per_class)
                sample_by_class.append(group.sample(n=take, random_state=42))
            df = pd.concat(sample_by_class, ignore_index=True)
            if len(df) > MAX_TRAINING_ROWS:
                df = df.sample(n=MAX_TRAINING_ROWS, random_state=42)

        class_counts = df["class_id"].value_counts()
        stratify_target = df["class_id"] if int(class_counts.min()) >= 2 else None
        if stratify_target is None:
            print("Warning: class distribution too sparse for stratified split; using non-stratified split.")

        train_df, test_df = train_test_split(
            df,
            test_size=0.2,
            random_state=42,
            stratify=stratify_target,
        )

        tokenizer = DistilBertTokenizerFast.from_pretrained("distilbert-base-uncased")

        train_dataset = Dataset.from_pandas(train_df[["text", "class_id"]].rename(columns={"class_id": "labels"}), preserve_index=False)
        test_dataset = Dataset.from_pandas(test_df[["text", "class_id"]].rename(columns={"class_id": "labels"}), preserve_index=False)

        train_dataset = train_dataset.map(lambda ex: tokenize_batch(ex, tokenizer), batched=True)
        test_dataset = test_dataset.map(lambda ex: tokenize_batch(ex, tokenizer), batched=True)

        train_dataset.set_format(type="torch", columns=["input_ids", "attention_mask", "labels"])
        test_dataset.set_format(type="torch", columns=["input_ids", "attention_mask", "labels"])

        model = DistilBertForSequenceClassification.from_pretrained(
            "distilbert-base-uncased",
            num_labels=4,
            id2label=ID_TO_LABEL,
            label2id=LABEL_TO_ID,
        )

        arg_candidates: dict[str, Any] = {
            "output_dir": str(config.output_dir),
            "overwrite_output_dir": True,
            "num_train_epochs": 3,
            "per_device_train_batch_size": 16,
            "per_device_eval_batch_size": 16,
            "learning_rate": 2e-5,
            "weight_decay": 0.01,
            "logging_steps": 50,
            "eval_strategy": "epoch",
            "evaluation_strategy": "epoch",
            "save_strategy": "epoch",
            "load_best_model_at_end": True,
            "metric_for_best_model": "accuracy",
            "report_to": [],
            "fp16": torch.cuda.is_available(),
        }
        supported_args = set(inspect.signature(TrainingArguments.__init__).parameters.keys())
        filtered_args = {k: v for k, v in arg_candidates.items() if k in supported_args}
        args = TrainingArguments(**filtered_args)

        trainer_kwargs: dict[str, Any] = {
            "model": model,
            "args": args,
            "train_dataset": train_dataset,
            "eval_dataset": test_dataset,
            "tokenizer": tokenizer,
            "compute_metrics": compute_metrics,
        }
        trainer_supported = set(inspect.signature(Trainer.__init__).parameters.keys())
        if "tokenizer" not in trainer_supported:
            trainer_kwargs.pop("tokenizer", None)
            if "processing_class" in trainer_supported:
                trainer_kwargs["processing_class"] = tokenizer

        trainer = Trainer(**trainer_kwargs)

        trainer.train()
        metrics = trainer.evaluate()
        accuracy = float(metrics.get("eval_accuracy", 0.0))
        print(f"Validation accuracy: {accuracy:.4f}")

        trainer.save_model(str(config.output_dir))
        tokenizer.save_pretrained(str(config.output_dir))
    else:
        if not config.output_dir.exists():
            raise FileNotFoundError(
                f"Checkpoint directory does not exist for --export-only: {config.output_dir}"
            )
        print(f"Using existing checkpoint for export: {config.output_dir}")

    export_to_onnx(config.output_dir, config.onnx_output_path)


if __name__ == "__main__":
    main()
