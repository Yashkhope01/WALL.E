# ─── WALL.E AI Microservice — Dockerfile ─────────────────────────────────────
# Builds the Flask + PyTorch Faster R-CNN classifier for Hugging Face Spaces.
# HF Spaces Docker containers MUST expose port 7860.
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim

WORKDIR /app

# System dependencies required for PyTorch CPU inference and Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (cached layer — only re-runs if file changes)
COPY requirements_api.txt .
RUN pip install --no-cache-dir -r requirements_api.txt

# Copy application source files
COPY waste_classifier_api.py .
COPY waste_category_mapper.py .
COPY model.py .

# Copy model checkpoint if it exists (optional — falls back to COCO pretrained)
# If best_model.pth is in checkpoints/, copy the whole directory
COPY checkpoints/ ./checkpoints/

# Expose the port Hugging Face Spaces expects
EXPOSE 7860

# Use the PORT env var injected by HF Spaces (defaults to 7860)
CMD ["python", "waste_classifier_api.py"]
