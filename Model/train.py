import os
import sys
import glob
import torch
import torchvision
from PIL import Image
import torchvision.transforms as T
from torch.utils.data import Dataset, DataLoader

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from model import get_model, save_model, load_model

class CustomWetWasteDataset(Dataset):
    def __init__(self, folder_path):
        self.folder_path = folder_path
        # Support common image extensions
        self.image_paths = []
        for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
            self.image_paths.extend(glob.glob(os.path.join(folder_path, ext)))
        
        self.image_paths = sorted(list(set(self.image_paths)))
        print(f"Found {len(self.image_paths)} images in {folder_path}")
        self.transform = T.Compose([T.ToTensor()])

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        img = Image.open(img_path).convert("RGB")
        width, height = img.size
        
        # Convert image to tensor
        img_tensor = self.transform(img)
        
        # Bounding box for the entire image: [x_min, y_min, x_max, y_max]
        # In PyTorch Faster R-CNN, boxes must satisfy x_min < x_max and y_min < y_max
        boxes = torch.as_tensor([[2.0, 2.0, float(width - 2), float(height - 2)]], dtype=torch.float32)
        
        # Label 4 corresponds to 'Wet' waste in categories: ['Dry', 'E-Waste', 'Mixed', 'Wet']
        labels = torch.as_tensor([4], dtype=torch.int64)
        
        target = {
            "boxes": boxes,
            "labels": labels,
            "image_id": torch.tensor([idx])
        }
        
        return img_tensor, target

def collate_fn(batch):
    return tuple(zip(*batch))

def train_model(data_folder, epochs=15, lr=0.005):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")
    
    # 1. Initialize dataset and dataloader
    dataset = CustomWetWasteDataset(data_folder)
    if len(dataset) == 0:
        print("ERROR: No images found to train on.")
        return False
        
    data_loader = DataLoader(
        dataset, 
        batch_size=2, 
        shuffle=True, 
        num_workers=0, 
        collate_fn=collate_fn
    )
    
    # 2. Load or initialize Faster R-CNN model
    checkpoint_path = os.path.join(os.path.dirname(__file__), "checkpoints", "best_model.pth")
    num_classes = 5  # Background + 4 classes
    model = get_model(num_classes=num_classes, pretrained=False)
    
    if os.path.exists(checkpoint_path):
        print(f"Loading existing checkpoint to fine-tune: {checkpoint_path}")
        try:
            model, _, start_epoch = load_model(model, None, checkpoint_path, device)
            print(f"Successfully loaded checkpoint from epoch {start_epoch}")
        except Exception as e:
            print(f"Warning: Could not load checkpoint ({e}). Training from pre-trained backbone.")
            model = get_model(num_classes=num_classes, pretrained=True)
    else:
        print("No existing checkpoint found. Initializing model with pre-trained MobileNetV3-FPN backbone.")
        model = get_model(num_classes=num_classes, pretrained=True)
        
    model.to(device)
    
    # 3. Setup optimizer
    params = [p for p in model.parameters() if p.requires_grad]
    optimizer = torch.optim.SGD(params, lr=lr, momentum=0.9, weight_decay=0.0005)
    
    # 4. Training Loop
    model.train()
    print("\nStarting training loop...")
    for epoch in range(1, epochs + 1):
        epoch_loss = 0.0
        for images, targets in data_loader:
            # Move data to device
            images = list(image.to(device) for image in images)
            targets = [{k: v.to(device) for k, v in t.items()} for t in targets]
            
            # Forward pass: Faster R-CNN returns dictionary of losses in training mode
            loss_dict = model(images, targets)
            losses = sum(loss for loss in loss_dict.values())
            
            # Backward pass & optimization
            optimizer.zero_grad()
            losses.backward()
            optimizer.step()
            
            epoch_loss += losses.item()
            
        print(f"Epoch {epoch}/{epochs} - Loss: {epoch_loss/len(data_loader):.4f}")
        
    # 5. Save updated model
    os.makedirs(os.path.dirname(checkpoint_path), exist_ok=True)
    save_model(model, optimizer, epoch, epoch_loss/len(data_loader), checkpoint_path)
    print("Fine-tuning completed successfully!")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        data_folder = sys.argv[1]
    else:
        data_folder = r"D:\New folder\Wet waste"
        
    train_model(data_folder)
