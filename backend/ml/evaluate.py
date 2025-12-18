"""
Model evaluation utilities
"""
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)
import numpy as np


def evaluate_model(y_true: np.ndarray, y_pred: np.ndarray, y_pred_proba: np.ndarray = None) -> dict:
    """
    Evaluate model performance with multiple metrics
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        y_pred_proba: Prediction probabilities (optional)
        
    Returns:
        Dictionary containing evaluation metrics
    """
    metrics = {
        'accuracy': accuracy_score(y_true, y_pred),
        'precision': precision_score(y_true, y_pred, average='weighted', zero_division=0),
        'recall': recall_score(y_true, y_pred, average='weighted', zero_division=0),
        'f1_score': f1_score(y_true, y_pred, average='weighted', zero_division=0),
    }
    
    return metrics


def print_evaluation_report(y_true: np.ndarray, y_pred: np.ndarray, label_names: list = None):
    """
    Print detailed evaluation report
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        label_names: Names of labels for display
    """
    print("\n" + "="*50)
    print("MODEL EVALUATION REPORT")
    print("="*50)
    
    metrics = evaluate_model(y_true, y_pred)
    
    print(f"\nOverall Metrics:")
    print(f"  Accuracy:  {metrics['accuracy']:.4f}")
    print(f"  Precision: {metrics['precision']:.4f}")
    print(f"  Recall:    {metrics['recall']:.4f}")
    print(f"  F1-Score:  {metrics['f1_score']:.4f}")
    
    print(f"\nConfusion Matrix:")
    cm = confusion_matrix(y_true, y_pred)
    print(cm)
    
    print(f"\nDetailed Classification Report:")
    print(classification_report(y_true, y_pred, target_names=label_names, zero_division=0))
    
    print("="*50 + "\n")
    
    return metrics
