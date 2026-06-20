"""
WALL.E Waste Classification API — Faster RCNN Edition
=======================================================
Uses Faster RCNN with ResNet50-FPN backbone for real object detection.

The pipeline:
  1. Receive image (file upload / file path / base64)
  2. Run Faster RCNN → detect objects with bounding boxes + confidence scores
  3. Map each detected COCO/custom label → waste category (Wet/Dry/E-Waste/Mixed)
  4. Aggregate detections by category (sum of confidence scores)
  5. Return dominant waste category + full detection details

Model priority:
  ① If checkpoints/best_model.pth EXISTS  → use the custom-trained WALL.E model
  ② Otherwise                            → use COCO-pretrained Faster RCNN
     (works immediately, no training needed, 80-class COCO → 4 waste categories)

Run:
    python waste_classifier_api.py
    → Starts on http://localhost:5001

Endpoints:
    GET  /health              - Health check + model info
    GET  /categories          - Category metadata
    POST /classify            - Classify image (file, base64, or path)
    POST /classify/path       - Classify by absolute file path (backend use)
"""

import os
import sys
import json
import io
import base64
import traceback
from pathlib import Path

import torch
import torchvision.transforms as T
import torchvision
from PIL import Image, ImageDraw, ImageFont
import numpy as np

from flask import Flask, request, jsonify
from flask_cors import CORS

# Add Model directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from waste_category_mapper import (
    map_coco_label_to_waste_category,
    map_custom_label_to_waste_category,
    CATEGORY_INFO,
    COCO_CATEGORY_MAP,
)

# ─── APP SETUP ──────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app)

print("=" * 65)
print("  WALL.E — Faster RCNN Waste Classification Service  ")
print("=" * 65)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"  Device : {device}")
if torch.cuda.is_available():
    print(f"  GPU    : {torch.cuda.get_device_name(0)}")

# ─── COCO LABELS ────────────────────────────────────────────────────────────────
# torchvision Faster RCNN uses 91-slot COCO label list (some are N/A)
COCO_LABELS = [
    '__background__', 'person', 'bicycle', 'car', 'motorcycle', 'airplane',
    'bus', 'train', 'truck', 'boat', 'traffic light', 'fire hydrant', 'N/A',
    'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse',
    'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'N/A', 'backpack',
    'umbrella', 'N/A', 'N/A', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis',
    'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
    'skateboard', 'surfboard', 'tennis racket', 'bottle', 'N/A', 'wine glass',
    'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich',
    'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
    'chair', 'couch', 'potted plant', 'bed', 'N/A', 'dining table', 'N/A',
    'N/A', 'toilet', 'N/A', 'tv', 'laptop', 'mouse', 'remote', 'keyboard',
    'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator',
    'N/A', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
    'toothbrush',
]

# ─── MODEL LOADING ──────────────────────────────────────────────────────────────

CUSTOM_CHECKPOINT = os.path.join(os.path.dirname(__file__), "checkpoints", "best_model.pth")
CUSTOM_CSV        = os.path.join(os.path.dirname(__file__), "Dataset", "waste", "meta_df.csv")

model        = None
label_mapper = None   # function: label_str → waste_category_str
class_labels = None   # list of label strings indexed by class id
model_source = None   # "custom" or "coco"


def load_coco_model():
    """Load COCO-pretrained Faster RCNN ResNet50-FPN."""
    global model, label_mapper, class_labels, model_source

    print("\n  Loading COCO-pretrained Faster RCNN (ResNet50-FPN)...")
    weights = torchvision.models.detection.FasterRCNN_ResNet50_FPN_Weights.DEFAULT
    model = torchvision.models.detection.fasterrcnn_resnet50_fpn(weights=weights)
    model.to(device)
    model.eval()

    class_labels = COCO_LABELS          # 91 slots
    label_mapper = map_coco_label_to_waste_category
    model_source = "coco"

    print("  ✓ COCO model loaded  (80 object classes → 4 waste categories)")
    print("  ℹ To use your custom trained model, place best_model.pth in Model/checkpoints/")


def load_custom_model():
    """
    Load the custom-trained WALL.E Faster RCNN checkpoint.
    Requires:  Model/checkpoints/best_model.pth
               Model/Dataset/waste/meta_df.csv  (for label mapping)
    """
    global model, label_mapper, class_labels, model_source

    print(f"\n  Found custom checkpoint: {CUSTOM_CHECKPOINT}")
    print("  Loading custom Faster RCNN model...")

    # Build category mapping from CSV
    import pandas as pd
    df = pd.read_csv(CUSTOM_CSV)
    categories = sorted(df['cat_name'].unique().tolist())
    cat_to_idx = {cat: idx + 1 for idx, cat in enumerate(categories)}
    idx_to_cat = {v: k for k, v in cat_to_idx.items()}
    num_classes = len(categories) + 1   # +1 for background

    # Load model architecture from model.py
    from model import get_model, load_model as _load_model
    m = get_model(num_classes=num_classes, pretrained=False)
    m, _, _ = _load_model(m, None, CUSTOM_CHECKPOINT, device)
    m.eval()

    model        = m
    class_labels = [idx_to_cat.get(i, "__background__") for i in range(num_classes)]
    label_mapper = map_custom_label_to_waste_category
    model_source = "custom"

    print(f"  ✓ Custom model loaded  ({num_classes - 1} waste classes → 4 categories)")
    return True


# Try custom first, fall back to COCO
try:
    if os.path.exists(CUSTOM_CHECKPOINT) and os.path.exists(CUSTOM_CSV):
        load_custom_model()
    else:
        load_coco_model()
except Exception as e:
    print(f"\n  ⚠  Could not load custom model ({e}). Falling back to COCO model.")
    load_coco_model()

print("=" * 65)

# ─── IMAGE TRANSFORM ────────────────────────────────────────────────────────────

_transform = T.Compose([T.ToTensor()])


def preprocess_image(img: Image.Image):
    """Convert PIL Image → normalised tensor for Faster RCNN."""
    img_rgb = img.convert("RGB")
    tensor = _transform(img_rgb).to(device)   # shape [3, H, W], float32 in [0,1]
    return tensor


# ─── DETECTION + MAPPING ────────────────────────────────────────────────────────

def run_faster_rcnn(img: Image.Image, conf_threshold: float = 0.4):
    """
    Run Faster RCNN on a PIL image.

    Returns:
        detections: list of dicts containing
            { label, label_idx, score, box, waste_category }
    """
    tensor = preprocess_image(img)

    with torch.no_grad():
        outputs = model([tensor])[0]   # single image → single output dict

    boxes  = outputs["boxes"].cpu().numpy()     # [N, 4]  xyxy
    labels = outputs["labels"].cpu().numpy()    # [N]
    scores = outputs["scores"].cpu().numpy()    # [N]

    detections = []
    for box, label_idx, score in zip(boxes, labels, scores):
        if score < conf_threshold:
            continue

        # Resolve label string
        if label_idx < len(class_labels):
            label_str = class_labels[label_idx]
        else:
            label_str = f"class_{label_idx}"

        if label_str in ("N/A", "__background__"):
            continue

        waste_category = label_mapper(label_str)

        detections.append({
            "label":         label_str,
            "label_idx":     int(label_idx),
            "score":         float(score),
            "box":           [float(v) for v in box],   # [x1, y1, x2, y2]
            "wasteCategory": waste_category,
        })

    return detections


def aggregate_waste_category(detections: list) -> dict:
    """
    Aggregate per-detection waste categories into a single verdict.

    Strategy:
      - Sum confidence scores per waste category (weighted vote)
      - The category with highest total score wins
      - If no detections → "Mixed" with low confidence

    Returns:
        { wasteType, confidence, confidencePercent, categoryVotes }
    """
    if not detections:
        return {
            "wasteType":        "Mixed",
            "confidence":       0.25,
            "confidencePercent": 25.0,
            "categoryVotes":    {"Mixed": 0.25},
        }

    votes = {}
    for det in detections:
        cat   = det["wasteCategory"]
        score = det["score"]
        votes[cat] = votes.get(cat, 0.0) + score

    best_cat   = max(votes, key=votes.get)
    total      = sum(votes.values())
    confidence = votes[best_cat] / total if total > 0 else 0.0

    # Hard cap confidence at 0.99
    confidence = min(confidence, 0.99)

    return {
        "wasteType":         best_cat,
        "confidence":        round(confidence, 4),
        "confidencePercent": round(confidence * 100, 1),
        "categoryVotes":     {k: round(v / total, 4) for k, v in votes.items()},
    }


def classify_image(img: Image.Image, conf_threshold: float = 0.4) -> dict:
    """
    Full pipeline: PIL Image → waste classification result.

    Returns a dict ready to be JSON-serialised.
    """
    detections = run_faster_rcnn(img, conf_threshold=conf_threshold)
    agg        = aggregate_waste_category(detections)

    # Best individual detection (highest score)
    best_det = max(detections, key=lambda d: d["score"]) if detections else None

    category_detail = (
        f"{best_det['label']} → {agg['wasteType']} Waste"
        if best_det
        else f"No objects detected above threshold (conf > {conf_threshold})"
    )

    return {
        "wasteType":         agg["wasteType"],
        "confidence":        agg["confidence"],
        "confidencePercent": agg["confidencePercent"],
        "categoryVotes":     agg["categoryVotes"],
        "categoryDetail":    category_detail,
        "categoryInfo":      CATEGORY_INFO.get(agg["wasteType"], {}),
        "detections":        detections,     # full bounding box list
        "totalDetections":   len(detections),
        "modelSource":       model_source,   # "coco" or "custom"
    }


# ─── HELPERS ────────────────────────────────────────────────────────────────────

def load_image_from_request(req):
    """Load PIL Image from Flask request (file / JSON path / base64)."""
    if "image" in req.files:
        f     = req.files["image"]
        img   = Image.open(io.BytesIO(f.read())).convert("RGB")
        return img, f.filename or "upload"

    if req.is_json:
        data = req.get_json()

        if "image_path" in data:
            path = data["image_path"]
            if not os.path.exists(path):
                raise FileNotFoundError(f"Image not found: {path}")
            return Image.open(path).convert("RGB"), path

        if "image_base64" in data:
            b64 = data["image_base64"]
            if "," in b64:
                b64 = b64.split(",", 1)[1]
            raw = base64.b64decode(b64)
            return Image.open(io.BytesIO(raw)).convert("RGB"), "base64_image"

    raise ValueError(
        "No image provided. Send 'image' as file, "
        "'image_path' as JSON, or 'image_base64' as JSON."
    )


# ─── ROUTES ─────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":     "ok",
        "service":    "WALL.E Waste Classifier (Faster RCNN)",
        "model":      "Faster RCNN ResNet50-FPN",
        "backbone":   "ResNet-50 + FPN",
        "modelSource": model_source,
        "device":     str(device),
        "categories": list(CATEGORY_INFO.keys()),
    })


@app.route("/categories", methods=["GET"])
def get_categories():
    return jsonify({"categories": CATEGORY_INFO})


@app.route("/classify", methods=["POST"])
def classify():
    """
    Classify waste image via Faster RCNN object detection.

    Accepts:
      • multipart/form-data  → 'image' file field
      • application/json     → 'image_path'   (absolute path)
      • application/json     → 'image_base64' (data URI or raw base64)

    Optional query param:
      • threshold=0.4  (default 0.4, detection confidence cutoff)

    Returns:
      {
        "success"         : true,
        "wasteType"       : "Dry",
        "confidence"      : 0.87,
        "confidencePercent": 87.0,
        "categoryDetail"  : "bottle → Dry Waste",
        "detections"      : [
            { "label": "bottle", "score": 0.94, "box": [...], "wasteCategory": "Dry" },
            ...
        ],
        "totalDetections" : 1,
        "modelSource"     : "coco",
        "categoryInfo"    : { ... }
      }
    """
    threshold = float(request.args.get("threshold", 0.4))
    try:
        img, source = load_image_from_request(request)
        result      = classify_image(img, conf_threshold=threshold)
        return jsonify({"success": True, "source": source, **result})

    except FileNotFoundError as e:
        return jsonify({"success": False, "error": "file_not_found",    "message": str(e)}), 404
    except ValueError as e:
        return jsonify({"success": False, "error": "invalid_request",   "message": str(e)}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": "detection_failed",  "message": str(e)}), 500


@app.route("/classify/path", methods=["POST"])
def classify_by_path():
    """
    Classify by absolute file path — used by the Node.js backend.
    Body: { "image_path": "C:/absolute/path/to/image.jpg" }
    """
    data = request.get_json()
    if not data or "image_path" not in data:
        return jsonify({
            "success": False,
            "error":   "invalid_request",
            "message": "Provide image_path in JSON body",
        }), 400

    threshold = float(data.get("threshold", 0.4))
    img_path  = data["image_path"]

    try:
        if not os.path.exists(img_path):
            return jsonify({
                "success": False,
                "error":   "file_not_found",
                "message": f"Image not found at: {img_path}",
            }), 404

        img    = Image.open(img_path).convert("RGB")
        result = classify_image(img, conf_threshold=threshold)
        return jsonify({"success": True, "source": img_path, **result})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": "detection_failed", "message": str(e)}), 500


@app.route("/model/info", methods=["GET"])
def model_info():
    """Return detailed model and class information."""
    coco_classes  = {k: v for k, v in COCO_CATEGORY_MAP.items()}
    num_params    = sum(p.numel() for p in model.parameters()) if model else 0
    return jsonify({
        "modelSource":    model_source,
        "backbone":       "ResNet-50 + FPN",
        "detector":       "Faster RCNN",
        "device":         str(device),
        "totalParams":    f"{num_params / 1e6:.1f}M",
        "numClasses":     len([l for l in class_labels if l not in ("N/A", "__background__")]),
        "wasteCategories": list(CATEGORY_INFO.keys()),
        "cocoClasses":    coco_classes if model_source == "coco" else {},
    })


# ─── MAIN ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("\n🚀 Starting WALL.E Faster RCNN Waste Classification API")
    print("📡 Listening on http://localhost:5001")
    print("")
    print("  Endpoints:")
    print("    GET  /health          → Health check + model info")
    print("    GET  /categories      → Waste category metadata")
    print("    GET  /model/info      → Detailed model info")
    print("    POST /classify        → Classify image (file/base64/path)")
    print("    POST /classify/path   → Classify by absolute file path")
    print("")
    print("  Quick test:")
    print("    curl http://localhost:5001/health")
    print("    curl -X POST http://localhost:5001/classify \\")
    print("         -F 'image=@/path/to/waste_image.jpg'")
    print("=" * 65)

    app.run(host="0.0.0.0", port=5001, debug=False, threaded=True)
