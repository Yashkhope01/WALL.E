"""
Faster RCNN Model for Waste Detection
Uses ResNet50 backbone with Feature Pyramid Network (FPN)
"""

import torch
import torchvision
from torchvision.models.detection import FasterRCNN
from torchvision.models.detection.rpn import AnchorGenerator
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
from torchvision.models import resnet50, ResNet50_Weights


def get_model(num_classes, pretrained=True):
    """
    Create Faster RCNN model with custom number of classes
    
    Args:
        num_classes (int): Number of classes (including background)
        pretrained (bool): Use pretrained backbone
    
    Returns:
        model: Faster RCNN model
    """
    
    # Load pretrained Faster RCNN with ResNet50-FPN backbone
    weights = torchvision.models.detection.FasterRCNN_ResNet50_FPN_Weights.DEFAULT if pretrained else None
    model = torchvision.models.detection.fasterrcnn_resnet50_fpn(weights=weights)
    
    # Replace the classifier with a new one for our number of classes
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = FastRCNNPredictor(in_features, num_classes)
    
    return model


def get_model_custom_backbone(num_classes):
    """
    Alternative: Create Faster RCNN with custom backbone
    More flexible for experimentation
    """
    
    # Load ResNet50 backbone
    backbone = resnet50(weights=ResNet50_Weights.DEFAULT)
    
    # Remove the classification head
    backbone = torch.nn.Sequential(*list(backbone.children())[:-2])
    backbone.out_channels = 2048
    
    # Define anchor generator
    anchor_generator = AnchorGenerator(
        sizes=((32, 64, 128, 256, 512),),
        aspect_ratios=((0.5, 1.0, 2.0),)
    )
    
    # Define ROI pooler
    roi_pooler = torchvision.ops.MultiScaleRoIAlign(
        featmap_names=['0'],
        output_size=7,
        sampling_ratio=2
    )
    
    # Create Faster RCNN model
    model = FasterRCNN(
        backbone,
        num_classes=num_classes,
        rpn_anchor_generator=anchor_generator,
        box_roi_pool=roi_pooler
    )
    
    return model


def save_model(model, optimizer, epoch, loss, path):
    """Save model checkpoint"""
    torch.save({
        'epoch': epoch,
        'model_state_dict': model.state_dict(),
        'optimizer_state_dict': optimizer.state_dict(),
        'loss': loss,
    }, path)
    print(f"Model saved to {path}")


def load_model(model, optimizer, path, device):
    """Load model checkpoint and handle device transfer"""
    # Load checkpoint to the specified device
    # This handles CPU->GPU or GPU->CPU transfers automatically
    checkpoint = torch.load(path, map_location=device)
    
    # Load model state
    model.load_state_dict(checkpoint['model_state_dict'])
    
    # Ensure model is on the correct device
    model.to(device)
    
    # Load optimizer state (PyTorch handles device transfer automatically)
    if optimizer and 'optimizer_state_dict' in checkpoint:
        optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        # Move optimizer states to correct device if needed
        if device.type == 'cuda':
            for state in optimizer.state.values():
                for k, v in state.items():
                    if isinstance(v, torch.Tensor):
                        state[k] = v.to(device)
    
    epoch = checkpoint.get('epoch', 0)
    loss = checkpoint.get('loss', 0)
    
    print(f"Model loaded from {path} (Epoch: {epoch}, Loss: {loss:.4f})")
    print(f"Model moved to device: {device}")
    return model, optimizer, epoch

