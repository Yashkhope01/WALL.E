"""
Utility functions for training and evaluation
"""

import matplotlib.pyplot as plt
import numpy as np
from collections import defaultdict


class MetricLogger:
    """
    Logger for training/validation metrics
    """
    def __init__(self):
        self.metrics = defaultdict(list)
    
    def update(self, **kwargs):
        for k, v in kwargs.items():
            self.metrics[k].append(v)
    
    def get_avg(self):
        return {k: np.mean(v) for k, v in self.metrics.items()}
    
    def __str__(self):
        return " | ".join([f"{k}: {np.mean(v):.4f}" for k, v in self.metrics.items()])


def plot_losses(train_losses, val_losses, save_path):
    """
    Plot training and validation losses
    """
    plt.figure(figsize=(10, 6))
    epochs = range(1, len(train_losses) + 1)
    
    plt.plot(epochs, train_losses, 'b-', label='Train Loss', linewidth=2)
    plt.plot(epochs, val_losses, 'r-', label='Val Loss', linewidth=2)
    
    plt.xlabel('Epoch', fontsize=12)
    plt.ylabel('Loss', fontsize=12)
    plt.title('Training and Validation Loss', fontsize=14, fontweight='bold')
    plt.legend(fontsize=12)
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"Training curves saved to {save_path}")


def calculate_iou(box1, box2):
    """
    Calculate Intersection over Union (IoU) between two boxes
    
    Args:
        box1: [x1, y1, x2, y2]
        box2: [x1, y1, x2, y2]
    
    Returns:
        iou: float
    """
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    
    intersection = max(0, x2 - x1) * max(0, y2 - y1)
    
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    
    union = area1 + area2 - intersection
    
    if union == 0:
        return 0
    
    return intersection / union

