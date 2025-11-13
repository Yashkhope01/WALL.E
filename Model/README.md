# Faster RCNN Waste Detection Model 🤖♻️

A deep learning model for detecting and classifying waste objects in images using Faster RCNN with ResNet50-FPN backbone.

## 📁 Project Structure

```
Model/
├── Dataset/
│   └── waste/
│       ├── data/
│       │   ├── annotations.json
│       │   ├── batch_1/ to batch_15/  (images)
│       └── meta_df.csv
├── dataset.py          # Dataset loader
├── model.py            # Faster RCNN model
├── train.py            # Training script
├── inference.py        # Inference script
├── utils.py            # Utility functions
├── requirements.txt    # Dependencies
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd Model
pip install -r requirements.txt
```

### 2. Train the Model

**GPU Training (Recommended):**
```bash
python train.py --use_amp
```

This will automatically detect your GPU and use mixed precision training for faster training.

**Basic training:**
```bash
python train.py
```

**Custom parameters:**
```bash
python train.py --batch_size 8 --epochs 30 --lr 0.01 --use_amp
```

**Full options:**
```bash
python train.py \
  --csv_file Dataset/waste/meta_df.csv \
  --data_dir Dataset/waste/data \
  --output_dir checkpoints \
  --batch_size 4 \
  --epochs 20 \
  --lr 0.005 \
  --num_workers 4 \
  --use_amp
```

**Quick Start Script:**
```bash
python train_waste_model.py
```

**Key Options:**
- `--use_amp`: Enable mixed precision training (faster on GPU, ~2x speedup)
- `--force_cpu`: Force CPU training even if GPU is available
- `--batch_size`: Adjust based on GPU memory (default: 4)
- `--epochs`: Number of training epochs (default: 20)
- `--lr`: Learning rate (default: 0.005)

### 3. Resume Training

```bash
python train.py --resume checkpoints/checkpoint_epoch_10.pth
```

### 4. Run Inference

```bash
python inference.py \
  --model_path checkpoints/best_model.pth \
  --image_path test_image.jpg \
  --output_path result.jpg \
  --threshold 0.5
```

## 📊 Dataset Info

- **Total Images**: ~1,400+
- **Categories**: 50+ waste types including:
  - Bottles (Clear plastic, Glass, Other plastic)
  - Cans (Drink can, Food can, Aerosol)
  - Cartons (Meal carton, Other carton)
  - Bottle caps
  - Pop tabs
  - And more...

- **Format**: COCO-style annotations with bounding boxes
- **Splits**: 80% training, 20% validation (automatic)

## 🏗️ Model Architecture

- **Backbone**: ResNet50 with Feature Pyramid Network (FPN)
- **Detector**: Faster RCNN
- **Pretrained**: ImageNet pretrained weights
- **Input Size**: Variable (maintains aspect ratio)

## ⚙️ Training Configuration

- **Optimizer**: SGD with momentum (0.9)
- **Learning Rate**: 0.005 (default)
- **LR Scheduler**: StepLR (decay by 0.1 every 3 epochs)
- **Batch Size**: 4 (default, adjust based on GPU)
- **Epochs**: 20 (default)
- **Mixed Precision**: Optional (use `--use_amp` flag for ~2x speedup on GPU)
- **GPU Support**: Automatic detection, falls back to CPU if GPU not available

## 📈 Augmentations

Training augmentations:
- Horizontal Flip (p=0.5)
- Random Brightness/Contrast
- Color Jitter
- Gaussian Noise
- Blur

## 🎯 Usage in Backend

See `integrate_backend.py` for Flask/Express integration example.

## 📝 Training Tips

1. **GPU Recommended**: Training on CPU will be very slow (10-20x slower)
2. **Mixed Precision**: Use `--use_amp` for faster training on GPU (~2x speedup)
3. **Batch Size**: Reduce if you get OOM errors (try 2 or 1)
4. **Learning Rate**: Start with 0.005, reduce if loss doesn't decrease
5. **Epochs**: 20-30 epochs usually sufficient
6. **Checkpoints**: Best model is saved automatically
7. **GPU Memory**: Monitor GPU memory usage during training (displayed in progress bar)
8. **Windows Users**: num_workers is automatically set to 0 to avoid shared memory issues

## 🔍 Monitoring Training

Training progress is displayed with:
- Progress bars for each epoch
- Train and validation losses
- Learning rate updates
- Best model indicators

Saved artifacts:
- `checkpoints/checkpoint_epoch_X.pth` - Regular checkpoints
- `checkpoints/best_model.pth` - Best validation loss model
- `checkpoints/training_curves.png` - Loss curves

## 🎨 Inference Output

Predictions include:
- Bounding box coordinates `[x1, y1, x2, y2]`
- Class label (e.g., "Clear plastic bottle")
- Confidence score (0-1)

## 🔧 Troubleshooting

**Out of Memory:**
```bash
python train.py --batch_size 2
```

**Slow Training:**
```bash
python train.py --num_workers 0  # Disable multiprocessing
```

**CUDA Not Available:**
- Model will automatically use CPU
- Training will be significantly slower

## 📦 Requirements

- Python 3.8+
- PyTorch 2.0+
- torchvision 0.15+
- CUDA 11.x+ (for GPU training)

## 🎓 Citation

If you use this model, please cite:
```
Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks
Ren et al., NeurIPS 2015
```

## 📄 License

MIT License - Feel free to use for your waste management projects!

---

**Built with ❤️ for WALL.E Waste Management System**

