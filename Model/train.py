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
        self.image_data = [] # List of tuples: (image_path, label_id)
        self.transform = T.Compose([T.ToTensor()])
        
        # Check for subdirectories first
        subfolders = []
        if os.path.exists(folder_path) and os.path.isdir(folder_path):
            subfolders = [d for d in os.listdir(folder_path) if os.path.isdir(os.path.join(folder_path, d))]
        
        # Mapping definition based on sorted: ['Dry', 'E-Waste', 'Mixed', 'Wet']
        # 1-indexed: Dry=1, E-Waste=2, Mixed=3, Wet=4
        label_mapping = {
            'dry': 1,
            'e-waste': 2,
            'mixed': 3,
            'wet': 4
        }
        
        has_subdirs = False
        for sub in subfolders:
            sub_lower = sub.lower()
            target_label = None
            for key, val in label_mapping.items():
                if key in sub_lower:
                    target_label = val
                    break
            
            if target_label is not None:
                has_subdirs = True
                sub_path = os.path.join(folder_path, sub)
                # Find all images in this subfolder
                sub_images = []
                for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
                    sub_images.extend(glob.glob(os.path.join(sub_path, ext)))
                
                sub_images = sorted(list(set(sub_images)))
                for img_path in sub_images:
                    self.image_data.append((img_path, target_label))
                print(f"Subfolder '{sub}' -> Mapped to class ID {target_label}. Found {len(sub_images)} images.")

        if not has_subdirs:
            # Fallback to single folder mode: all images treated as Wet waste (4)
            image_paths = []
            for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
                image_paths.extend(glob.glob(os.path.join(folder_path, ext)))
            image_paths = sorted(list(set(image_paths)))
            for img_path in image_paths:
                self.image_data.append((img_path, 4))
            print(f"No valid class subfolders found. Treating all {len(image_paths)} images as Wet waste (Class ID 4).")

    def __len__(self):
        return len(self.image_data)

    def __getitem__(self, idx):
        img_path, label_id = self.image_data[idx]
        img = Image.open(img_path).convert("RGB")
        width, height = img.size
        
        # Convert image to tensor
        img_tensor = self.transform(img)
        
        # Bounding box for the entire image: [x_min, y_min, x_max, y_max]
        # In PyTorch Faster R-CNN, boxes must satisfy x_min < x_max and y_min < y_max
        boxes = torch.as_tensor([[2.0, 2.0, float(width - 2), float(height - 2)]], dtype=torch.float32)
        labels = torch.as_tensor([label_id], dtype=torch.int64)
        
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
        data_folder = r"D:\New folder"
        
    train_model(data_folder)
