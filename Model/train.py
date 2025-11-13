"""
Training script for Faster RCNN Waste Detection Model
Enhanced with GPU support, mixed precision training, and better monitoring
"""

import torch
import torch.optim as optim
from torch.utils.data import DataLoader, Subset
import numpy as np
from tqdm import tqdm
import os
import argparse
import sys
from dataset import WasteDataset, get_train_transforms, get_valid_transforms, collate_fn
from model import get_model, save_model, load_model
from utils import MetricLogger, plot_losses
from torch.cuda.amp import autocast, GradScaler


def train_one_epoch(model, optimizer, data_loader, device, epoch, use_amp=False, scaler=None):
    """Train for one epoch with optional mixed precision training"""
    model.train()
    metric_logger = MetricLogger()
    
    progress_bar = tqdm(data_loader, desc=f"Epoch {epoch}")
    
    for batch_idx, (images, targets) in enumerate(progress_bar):
        images = list(image.to(device) for image in images)
        targets = [{k: v.to(device) for k, v in t.items()} for t in targets]
        
        # Forward pass with mixed precision if enabled
        if use_amp and scaler:
            with autocast():
                loss_dict = model(images, targets)
                losses = sum(loss for loss in loss_dict.values())
            
            # Backward pass with gradient scaling
            optimizer.zero_grad()
            scaler.scale(losses).backward()
            scaler.step(optimizer)
            scaler.update()
        else:
            # Standard training without mixed precision
            loss_dict = model(images, targets)
            losses = sum(loss for loss in loss_dict.values())
            
            # Backward pass
            optimizer.zero_grad()
            losses.backward()
            optimizer.step()
        
        # Update metrics
        metric_logger.update(loss=losses.item(), **{k: v.item() for k, v in loss_dict.items()})
        
        # Update progress bar with more info
        loss_info = {k: f"{v.item():.4f}" for k, v in loss_dict.items()}
        progress_bar.set_postfix(loss=f"{losses.item():.4f}", **loss_info)
        
        # Print GPU memory usage periodically (every 50 batches)
        if device.type == 'cuda' and batch_idx % 50 == 0:
            memory_allocated = torch.cuda.memory_allocated(device) / 1024**3  # GB
            memory_reserved = torch.cuda.memory_reserved(device) / 1024**3  # GB
            progress_bar.set_postfix(
                loss=f"{losses.item():.4f}",
                GPU_mem=f"{memory_allocated:.2f}GB/{memory_reserved:.2f}GB"
            )
    
    return metric_logger.get_avg()


@torch.no_grad()
def evaluate(model, data_loader, device):
    """Evaluate model by computing loss without gradients.
    Torchvision detection models return predictions in eval mode; to obtain
    a loss dict we temporarily switch the model to training mode while
    keeping no_grad active to avoid gradient computation.
    """
    metric_logger = MetricLogger()
    
    # Remember current training state and switch to train mode to get losses
    previous_training_state = model.training
    model.train(True)
    
    for images, targets in tqdm(data_loader, desc="Evaluating"):
        images = list(image.to(device) for image in images)
        targets = [{k: v.to(device) for k, v in t.items()} for t in targets]
        
        # Forward pass (returns loss dict in train mode)
        loss_dict = model(images, targets)
        losses = sum(loss for loss in loss_dict.values())
        
        metric_logger.update(loss=losses.item(), **{k: v.item() for k, v in loss_dict.items()})
    
    # Restore previous training/eval state
    model.train(previous_training_state)
    
    return metric_logger.get_avg()


def check_gpu(force_cpu=False):
    """Check GPU availability and print detailed information"""
    if force_cpu:
        print("=" * 60)
        print("FORCE CPU MODE: GPU disabled by user")
        print("=" * 60)
        return False
    
    if torch.cuda.is_available():
        print("=" * 60)
        print("GPU DETECTION SUCCESSFUL")
        print("=" * 60)
        print(f"CUDA Available: {torch.cuda.is_available()}")
        print(f"CUDA Version: {torch.version.cuda}")
        print(f"PyTorch Version: {torch.__version__}")
        print(f"Number of GPUs: {torch.cuda.device_count()}")
        print(f"Current GPU: {torch.cuda.current_device()}")
        print(f"GPU Name: {torch.cuda.get_device_name(0)}")
        gpu_props = torch.cuda.get_device_properties(0)
        print(f"GPU Memory: {gpu_props.total_memory / 1024**3:.2f} GB")
        print(f"GPU Compute Capability: {gpu_props.major}.{gpu_props.minor}")
        print("=" * 60)
        return True
    else:
        print("=" * 60)
        print("WARNING: GPU NOT AVAILABLE")
        print("=" * 60)
        print("Training will use CPU (this will be much slower)")
        print("To use GPU, ensure:")
        print("  1. NVIDIA GPU is installed")
        print("  2. CUDA drivers are installed")
        print("  3. PyTorch with CUDA support is installed")
        print("     Install with: pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118")
        print("=" * 60)
        return False


def main(args):
    # Check and display GPU information
    use_gpu = check_gpu(force_cpu=args.force_cpu)
    device = torch.device('cuda' if use_gpu else 'cpu')
    
    # Enable mixed precision training if GPU is available and enabled
    use_amp = use_gpu and args.use_amp
    scaler = GradScaler() if use_amp else None
    
    if use_amp:
        print("Mixed Precision Training: ENABLED (faster training on GPU)")
    elif use_gpu:
        print("Mixed Precision Training: DISABLED (use --use_amp to enable)")
    
    # Load dataset
    print("\nLoading dataset...")
    # Create base dataset to get metadata
    base_dataset = WasteDataset(
        csv_file=args.csv_file,
        root_dir=args.data_dir,
        transforms=get_train_transforms(),
        train=True
    )
    
    dataset_size = len(base_dataset)
    train_size = int(0.8 * dataset_size)
    val_size = dataset_size - train_size
    
    # Create indices for splitting (using fixed seed for reproducibility)
    torch.manual_seed(42)
    indices = torch.randperm(dataset_size).tolist()
    train_indices = indices[:train_size]
    val_indices = indices[train_size:]
    
    # Create datasets with appropriate transforms
    train_dataset = WasteDataset(
        csv_file=args.csv_file,
        root_dir=args.data_dir,
        transforms=get_train_transforms(),
        train=True
    )
    
    val_dataset = WasteDataset(
        csv_file=args.csv_file,
        root_dir=args.data_dir,
        transforms=get_valid_transforms(),
        train=False
    )
    
    # Create subsets with the same indices
    train_subset = Subset(train_dataset, train_indices)
    val_subset = Subset(val_dataset, val_indices)
    
    print(f"Dataset loaded: {dataset_size} images")
    print(f"Train size: {train_size}, Val size: {val_size}")
    print(f"Number of classes: {base_dataset.num_classes - 1}")
    print(f"Categories: {list(base_dataset.categories)}")
    
    # Create data loaders
    # Note: On Windows, num_workers > 0 can cause shared memory errors
    # Set to 0 to disable multiprocessing (uses main process instead)
    num_workers = 0 if os.name == 'nt' else args.num_workers  # nt = Windows
    
    train_loader = DataLoader(
        train_subset,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=num_workers,
        collate_fn=collate_fn,
        pin_memory=True if use_gpu else False
    )
    
    val_loader = DataLoader(
        val_subset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=num_workers,
        collate_fn=collate_fn,
        pin_memory=True if use_gpu else False
    )
    
    # Create model
    print(f"\nCreating model with {base_dataset.num_classes} classes...")
    model = get_model(num_classes=base_dataset.num_classes, pretrained=True)
    model.to(device)
    
    # Clear GPU cache if using GPU
    if use_gpu:
        torch.cuda.empty_cache()
        print(f"GPU memory after model loading: {torch.cuda.memory_allocated(device) / 1024**3:.2f} GB")
    
    # Optimizer and scheduler
    params = [p for p in model.parameters() if p.requires_grad]
    optimizer = optim.SGD(params, lr=args.lr, momentum=0.9, weight_decay=0.0005)
    lr_scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=3, gamma=0.1)
    
    # Load checkpoint if specified
    start_epoch = 0
    if args.resume:
        model, optimizer, start_epoch = load_model(model, optimizer, args.resume, device)
    
    # Training loop
    print("Starting training...")
    train_losses = []
    val_losses = []
    best_val_loss = float('inf')
    
    for epoch in range(start_epoch, args.epochs):
        print(f"\n{'='*60}")
        print(f"Epoch {epoch + 1}/{args.epochs}")
        print(f"{'='*60}")
        
        # Train
        train_metrics = train_one_epoch(model, optimizer, train_loader, device, epoch + 1, use_amp, scaler)
        train_loss = train_metrics['loss']
        train_losses.append(train_loss)
        
        # Validate
        val_metrics = evaluate(model, val_loader, device)
        val_loss = val_metrics['loss']
        val_losses.append(val_loss)
        
        # Update learning rate
        lr_scheduler.step()
        
        # Print epoch summary
        print(f"\nEpoch {epoch + 1} Summary:")
        print(f"  Train Loss: {train_loss:.4f}")
        for key, value in train_metrics.items():
            if key != 'loss':
                print(f"    {key}: {value:.4f}")
        print(f"  Val Loss: {val_loss:.4f}")
        for key, value in val_metrics.items():
            if key != 'loss':
                print(f"    {key}: {value:.4f}")
        print(f"  Learning Rate: {optimizer.param_groups[0]['lr']:.6f}")
        
        # GPU memory info
        if use_gpu:
            memory_allocated = torch.cuda.memory_allocated(device) / 1024**3
            memory_reserved = torch.cuda.memory_reserved(device) / 1024**3
            print(f"  GPU Memory: {memory_allocated:.2f}GB / {memory_reserved:.2f}GB")
        
        # Save checkpoint
        save_path = os.path.join(args.output_dir, f"checkpoint_epoch_{epoch + 1}.pth")
        save_model(model, optimizer, epoch + 1, val_loss, save_path)
        
        # Save best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_path = os.path.join(args.output_dir, "best_model.pth")
            save_model(model, optimizer, epoch + 1, val_loss, best_path)
            print(f"  ✓ New best model saved! Val Loss: {val_loss:.4f}")
        
        # Clear GPU cache periodically
        if use_gpu:
            torch.cuda.empty_cache()
    
    # Plot training curves
    plot_losses(train_losses, val_losses, os.path.join(args.output_dir, "training_curves.png"))
    
    print("\nTraining completed!")
    print(f"Best validation loss: {best_val_loss:.4f}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Faster RCNN for Waste Detection")
    
    parser.add_argument("--csv_file", type=str, default="Dataset/waste/meta_df.csv",
                        help="Path to CSV file with annotations")
    parser.add_argument("--data_dir", type=str, default="Dataset/waste/data",
                        help="Path to data directory")
    parser.add_argument("--output_dir", type=str, default="checkpoints",
                        help="Directory to save checkpoints")
    parser.add_argument("--batch_size", type=int, default=4,
                        help="Batch size for training")
    parser.add_argument("--epochs", type=int, default=20,
                        help="Number of epochs to train")
    parser.add_argument("--lr", type=float, default=0.005,
                        help="Learning rate")
    parser.add_argument("--num_workers", type=int, default=0,
                        help="Number of data loading workers (auto-set to 0 on Windows)")
    parser.add_argument("--resume", type=str, default=None,
                        help="Path to checkpoint to resume from")
    parser.add_argument("--use_amp", action="store_true",
                        help="Use mixed precision training (faster on GPU)")
    parser.add_argument("--force_cpu", action="store_true",
                        help="Force CPU training even if GPU is available")
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    main(args)

