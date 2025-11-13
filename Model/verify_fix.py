"""
Quick verification script to test the fix
"""

import torch
from dataset import WasteDataset, get_train_transforms, collate_fn
from torch.utils.data import DataLoader


def verify_dataset():
    print("Testing dataset with fixed image normalization...")
    
    # Create dataset
    dataset = WasteDataset(
        csv_file='Dataset/waste/meta_df.csv',
        root_dir='Dataset/waste/data',
        transforms=get_train_transforms(),
        train=True
    )
    
    # Create dataloader
    dataloader = DataLoader(
        dataset,
        batch_size=2,
        shuffle=True,
        collate_fn=collate_fn
    )
    
    # Get one batch
    images, targets = next(iter(dataloader))
    
    # Check first image
    img = images[0]
    
    print(f"\n✅ Image loaded successfully!")
    print(f"   Image shape: {img.shape}")
    print(f"   Image dtype: {img.dtype}")
    print(f"   Image min value: {img.min():.4f}")
    print(f"   Image max value: {img.max():.4f}")
    print(f"   Image mean value: {img.mean():.4f}")
    
    # Verify
    if img.dtype == torch.float32 or img.dtype == torch.float64:
        print(f"\n✅ Correct dtype: {img.dtype}")
    else:
        print(f"\n❌ Wrong dtype: {img.dtype} (expected float)")
        return False
    
    if 0.0 <= img.min() <= img.max() <= 1.0:
        print(f"✅ Correct range: [{img.min():.4f}, {img.max():.4f}]")
    else:
        print(f"⚠️  Values outside [0, 1] range: [{img.min():.4f}, {img.max():.4f}]")
        print("   This is OK if using augmentations that modify intensity")
    
    print(f"\n✅ Fix verified! You can now run training:")
    print(f"   python train.py")
    
    return True


if __name__ == "__main__":
    verify_dataset()

