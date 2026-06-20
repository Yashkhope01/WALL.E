# WALL.E - AI Waste Classification Service

This directory contains the Artificial Intelligence microservice that powers the WALL.E platform. It is a standalone Python Flask API responsible for analyzing images and identifying waste categories.

## Model Architecture

The core of our AI is a **Faster R-CNN** (Region-based Convolutional Neural Network) model equipped with a **ResNet50-FPN** (Feature Pyramid Network) backbone.

1. **ResNet50**: A highly efficient 50-layer deep convolutional neural network that acts as the "eyes" of the model. It extracts rich visual features (like textures, shapes, and edges) from the input image.
2. **FPN (Feature Pyramid Network)**: This enhances the ResNet backbone by allowing the model to detect objects at multiple scales. This is crucial for waste detection, as a tiny plastic bottle and a massive cardboard box need to be detected simultaneously.
3. **Faster R-CNN Head**: This part of the network generates "Region Proposals" (bounding boxes where it thinks an object might be) and then classifies the specific object inside that box (e.g., "bottle", "laptop", "banana").

### Classification Pipeline

When the Node.js backend sends an image to this service, the following happens:
1. **Inference**: The Faster R-CNN model scans the image and detects all recognizable objects, drawing bounding boxes and assigning confidence scores.
2. **Category Mapping**: The detected objects are then processed by our `waste_category_mapper.py`. This script translates specific objects into our 4 core municipal waste categories:
   - **Wet Waste**: Organic matter, food scraps (e.g., apple, banana, sandwich).
   - **Dry Waste**: Recyclables (e.g., bottle, cup, paper).
   - **E-Waste**: Electronics (e.g., cell phone, laptop, tv).
   - **Mixed Waste**: For undetermined items or a combination of multiple types.
3. **Aggregation**: If multiple items are found (e.g., 3 bottles and 1 apple), the AI calculates a weighted score to determine the *dominant* waste category of the pile and returns this verdict to the backend.

## Setup & Running Locally

1. **Requirements**:
   You need Python 3.8+ installed.

2. **Install Dependencies**:
   Open a terminal in the `Model` directory and run:
   ```bash
   pip install -r requirements_api.txt
   ```
   *(Note: This installs PyTorch, Torchvision, Flask, and Pillow).*

3. **Start the Service**:
   You can easily start the service using the provided batch script (Windows) or manually via Python:
   ```bash
   start_ai_service.bat
   # OR
   python waste_classifier_api.py
   ```
   The AI service will start listening on `http://localhost:5001`.

## Endpoints

- `GET /health`: Returns the health status and loaded model details.
- `GET /categories`: Returns metadata about the 4 waste categories.
- `POST /classify/path`: The primary endpoint used by the Node.js backend. It accepts an absolute file path to an image on the server, runs inference, and returns a JSON payload with the dominant `wasteType` and confidence scores.
