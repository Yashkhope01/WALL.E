#!/usr/bin/env python
"""
Verify that the training environment is set up correctly
"""

import sys

def check_pytorch():
    """Check PyTorch installation and GPU availability"""
    try:
        import torch
        print("✅ PyTorch installed successfully")
        print(f"   Version: {torch.__version__}")
        
        if torch.cuda.is_available():
            print("✅ CUDA available")
            print(f"   CUDA Version: {torch.version.cuda}")
            print(f"   GPU Count: {torch.cuda.device_count()}")
            print(f"   GPU Name: {torch.cuda.get_device_name(0)}")
            gpu_props = torch.cuda.get_device_properties(0)
            print(f"   GPU Memory: {gpu_props.total_memory / 1024**3:.2f} GB")
            print(f"   Compute Capability: {gpu_props.major}.{gpu_props.minor}")
            return True
        else:
            print("⚠️  CUDA not available - training will use CPU (much slower)")
            return False
    except ImportError:
        print("❌ PyTorch not installed")
        print("   Install with: pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118")
        return False

def check_dependencies():
    """Check if all required dependencies are installed"""
    dependencies = [
        'torch',
        'torchvision',
        'numpy',
        'pandas',
        'PIL',
        'cv2',
        'matplotlib',
        'sklearn',
        'tqdm',
        'albumentations',
        'pycocotools'
    ]
    
    missing = []
    for dep in dependencies:
        try:
            if dep == 'PIL':
                import PIL
            elif dep == 'cv2':
                import cv2
            elif dep == 'sklearn':
                import sklearn
            else:
                __import__(dep)
            print(f"✅ {dep}")
        except ImportError:
            print(f"❌ {dep} - not installed")
            missing.append(dep)
    
    return len(missing) == 0

def check_dataset():
    """Check if dataset files exist"""
    import os
    
    csv_file = "Dataset/waste/meta_df.csv"
    data_dir = "Dataset/waste/data"
    
    checks = []
    
    if os.path.exists(csv_file):
        print(f"✅ Dataset CSV found: {csv_file}")
        checks.append(True)
    else:
        print(f"❌ Dataset CSV not found: {csv_file}")
        checks.append(False)
    
    if os.path.exists(data_dir):
        print(f"✅ Data directory found: {data_dir}")
        checks.append(True)
    else:
        print(f"❌ Data directory not found: {data_dir}")
        checks.append(False)
    
    return all(checks)

def main():
    print("=" * 70)
    print("Waste Classification Model - Setup Verification")
    print("=" * 70)
    print()
    
    print("1. Checking PyTorch and GPU...")
    print("-" * 70)
    gpu_available = check_pytorch()
    print()
    
    print("2. Checking dependencies...")
    print("-" * 70)
    deps_ok = check_dependencies()
    print()
    
    print("3. Checking dataset...")
    print("-" * 70)
    dataset_ok = check_dataset()
    print()
    
    print("=" * 70)
    print("Summary")
    print("=" * 70)
    
    if gpu_available and deps_ok and dataset_ok:
        print("✅ All checks passed! Ready to train.")
        print()
        print("Start training with:")
        print("  python train.py --use_amp")
        return 0
    else:
        print("⚠️  Some checks failed. Please fix the issues above.")
        if not gpu_available:
            print("   - GPU not available (training will be slower on CPU)")
        if not deps_ok:
            print("   - Install missing dependencies: pip install -r requirements.txt")
        if not dataset_ok:
            print("   - Ensure dataset files are in the correct location")
        return 1

if __name__ == "__main__":
    sys.exit(main())

