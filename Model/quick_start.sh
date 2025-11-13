#!/bin/bash

echo "========================================="
echo "🤖 WALL.E Waste Detection Training"
echo "========================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing dependencies..."
pip install -r requirements.txt

# Create checkpoints directory
mkdir -p checkpoints

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "To start training, run:"
echo "  python train.py"
echo ""
echo "For custom training:"
echo "  python train.py --batch_size 8 --epochs 30"
echo ""
echo "To run inference:"
echo "  python inference.py --model_path checkpoints/best_model.pth --image_path test.jpg --output_path result.jpg"
echo ""

