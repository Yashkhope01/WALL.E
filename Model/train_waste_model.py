#!/usr/bin/env python
"""
Quick start script for training the waste classification model
This script provides a simple interface to start training with GPU support
"""

import os
import sys
import subprocess

def main():
    """Main training function"""
    print("=" * 70)
    print("WASTE CLASSIFICATION MODEL TRAINING")
    print("=" * 70)
    print("\nStarting training with GPU support...")
    print("Dataset: Dataset/waste/data")
    print("Output: checkpoints/")
    print("\n" + "=" * 70 + "\n")
    
    # Default training parameters
    csv_file = "Dataset/waste/meta_df.csv"
    data_dir = "Dataset/waste/data"
    output_dir = "checkpoints"
    batch_size = 4  # Adjust based on GPU memory
    epochs = 20
    learning_rate = 0.005
    use_amp = True  # Enable mixed precision for faster training
    
    # Check if files exist
    if not os.path.exists(csv_file):
        print(f"ERROR: CSV file not found: {csv_file}")
        print("Please ensure the dataset is in the correct location.")
        sys.exit(1)
    
    if not os.path.exists(data_dir):
        print(f"ERROR: Data directory not found: {data_dir}")
        print("Please ensure the dataset is in the correct location.")
        sys.exit(1)
    
    # Build training command
    cmd = [
        sys.executable, "train.py",
        "--csv_file", csv_file,
        "--data_dir", data_dir,
        "--output_dir", output_dir,
        "--batch_size", str(batch_size),
        "--epochs", str(epochs),
        "--lr", str(learning_rate),
        "--use_amp"  # Enable mixed precision training
    ]
    
    print("Training command:")
    print(" ".join(cmd))
    print("\n" + "=" * 70 + "\n")
    
    # Run training
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"\nERROR: Training failed with error code {e.returncode}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\nTraining interrupted by user.")
        sys.exit(0)

if __name__ == "__main__":
    main()

