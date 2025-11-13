"""
Quick test script to verify model training setup
"""

import torch
import os
from dataset import WasteDataset, get_train_transforms
from model import get_model


def test_dataset():
    """Test dataset loading"""
    print("Testing Dataset Loading...")
    try:
        dataset = WasteDataset(
            csv_file='Dataset/waste/meta_df.csv',
            root_dir='Dataset/waste/data',
            transforms=get_train_transforms(),
            train=True
        )
        
        print(f"✅ Dataset loaded successfully!")
        print(f"   Total images: {len(dataset)}")
        print(f"   Number of classes: {dataset.num_classes}")
        print(f"   Categories: {list(dataset.categories)[:5]}...")
        
        # Test loading one sample
        image, target = dataset[0]
        print(f"   Sample image shape: {image.shape}")
        print(f"   Sample boxes: {target['boxes'].shape[0]} objects")
        
        return True
    except Exception as e:
        print(f"❌ Dataset loading failed: {e}")
        return False


def test_model():
    """Test model creation"""
    print("\nTesting Model Creation...")
    try:
        model = get_model(num_classes=51, pretrained=True)
        print(f"✅ Model created successfully!")
        
        # Test forward pass
        dummy_input = torch.randn(1, 3, 224, 224)
        model.eval()
        with torch.no_grad():
            output = model(dummy_input)
        
        print(f"   Model output keys: {output[0].keys()}")
        print(f"   Model is ready for training!")
        
        return True
    except Exception as e:
        print(f"❌ Model creation failed: {e}")
        return False


def test_device():
    """Test CUDA availability"""
    print("\nTesting Device...")
    if torch.cuda.is_available():
        print(f"✅ CUDA available!")
        print(f"   Device: {torch.cuda.get_device_name(0)}")
        print(f"   CUDA Version: {torch.version.cuda}")
    else:
        print(f"⚠️  CUDA not available. Training will use CPU (slower)")
    
    return True


def main():
    print("=" * 60)
    print("🤖 WALL.E Waste Detection - Model Test")
    print("=" * 60)
    print()
    
    results = []
    
    # Test device
    results.append(test_device())
    
    # Test dataset
    results.append(test_dataset())
    
    # Test model
    results.append(test_model())
    
    print("\n" + "=" * 60)
    if all(results):
        print("✅ All tests passed! Ready to train.")
        print("\nTo start training:")
        print("  python train.py")
    else:
        print("❌ Some tests failed. Please check the errors above.")
    print("=" * 60)


if __name__ == "__main__":
    main()

