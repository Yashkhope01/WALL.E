#!/usr/bin/env python
"""
Resume training on GPU from the latest checkpoint
This script finds the latest checkpoint and resumes training on GPU
"""

import os
import torch
import glob

def find_latest_checkpoint(checkpoint_dir="checkpoints"):
    """Find the latest checkpoint file"""
    if not os.path.exists(checkpoint_dir):
        print(f"Error: Checkpoint directory '{checkpoint_dir}' not found")
        return None
    
    # Find all checkpoint files
    checkpoint_files = glob.glob(os.path.join(checkpoint_dir, "checkpoint_epoch_*.pth"))
    
    if not checkpoint_files:
        print(f"No checkpoint files found in '{checkpoint_dir}'")
        return None
    
    # Sort by epoch number
    def get_epoch_number(filename):
        try:
            # Extract epoch number from filename like "checkpoint_epoch_3.pth"
            basename = os.path.basename(filename)
            epoch_str = basename.replace("checkpoint_epoch_", "").replace(".pth", "")
            return int(epoch_str)
        except:
            return 0
    
    checkpoint_files.sort(key=get_epoch_number, reverse=True)
    latest_checkpoint = checkpoint_files[0]
    epoch_num = get_epoch_number(latest_checkpoint)
    
    print(f"Found latest checkpoint: {latest_checkpoint}")
    print(f"Epoch: {epoch_num}")
    return latest_checkpoint, epoch_num

def verify_gpu():
    """Verify GPU is available"""
    if not torch.cuda.is_available():
        print("=" * 70)
        print("ERROR: GPU NOT AVAILABLE")
        print("=" * 70)
        print("Cannot resume on GPU. Please check:")
        print("1. Are you using the virtual environment with GPU support?")
        print("2. Is CUDA properly installed?")
        print("3. Run: python verify_setup.py")
        print("=" * 70)
        return False
    
    print("=" * 70)
    print("GPU VERIFIED")
    print("=" * 70)
    print(f"GPU Name: {torch.cuda.get_device_name(0)}")
    print(f"CUDA Version: {torch.version.cuda}")
    gpu_props = torch.cuda.get_device_properties(0)
    print(f"GPU Memory: {gpu_props.total_memory / 1024**3:.2f} GB")
    print("=" * 70)
    return True

def main():
    print("=" * 70)
    print("RESUME TRAINING ON GPU")
    print("=" * 70)
    print()
    
    # Verify GPU
    if not verify_gpu():
        return
    
    # Find latest checkpoint
    result = find_latest_checkpoint()
    if not result:
        return
    
    latest_checkpoint, epoch_num = result
    print()
    
    # Build resume command
    print("=" * 70)
    print("RESUME COMMAND")
    print("=" * 70)
    print()
    print("To resume training on GPU from the latest checkpoint, run:")
    print()
    print(f"python train.py --resume {latest_checkpoint} --use_amp --batch_size 2")
    print()
    print("Or if you want to continue with your previous settings:")
    print(f"python train.py --resume {latest_checkpoint} --use_amp")
    print()
    print("=" * 70)
    print("NOTE: Make sure you're using the virtual environment!")
    print("Activate with: venv\\Scripts\\activate")
    print("=" * 70)

if __name__ == "__main__":
    main()

