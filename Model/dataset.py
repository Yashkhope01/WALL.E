"""
Waste Detection Dataset Loader for Faster RCNN
Loads images and bounding box annotations from CSV format
"""

import os
import torch
import pandas as pd
import numpy as np
from PIL import Image
from torch.utils.data import Dataset
import torchvision.transforms as T
import albumentations as A
from albumentations.pytorch import ToTensorV2


class WasteDataset(Dataset):
    """
    Custom Dataset for Waste Detection
    Supports both training and validation with augmentations
    """
    
    def __init__(self, csv_file, root_dir, transforms=None, train=True):
        """
        Args:
            csv_file (str): Path to the meta_df.csv file
            root_dir (str): Directory with all the images
            transforms: Optional transform to be applied
            train (bool): Whether this is training set (applies augmentations)
        """
        self.annotations = pd.read_csv(csv_file)
        self.root_dir = root_dir
        self.transforms = transforms
        self.train = train
        
        # Group annotations by image
        self.grouped = self.annotations.groupby('img_id')
        # Sort img_ids to ensure consistent ordering across dataset instances
        self.img_ids = sorted(list(self.grouped.groups.keys()))
        
        # Create category mapping
        self.categories = self.annotations['cat_name'].unique()
        self.cat_to_idx = {cat: idx + 1 for idx, cat in enumerate(self.categories)}
        self.idx_to_cat = {v: k for k, v in self.cat_to_idx.items()}
        self.num_classes = len(self.categories) + 1  # +1 for background
        
        print(f"Loaded {len(self.img_ids)} images with {self.num_classes - 1} classes")
        print(f"Categories: {list(self.categories)}")
    
    def __len__(self):
        return len(self.img_ids)
    
    def __getitem__(self, idx):
        # Get image ID
        img_id = self.img_ids[idx]
        
        # Get all annotations for this image
        img_data = self.grouped.get_group(img_id)
        
        # Load image
        img_path = os.path.join(self.root_dir, img_data.iloc[0]['img_file'])
        image = Image.open(img_path).convert("RGB")
        image = np.array(image)
        
        # Get image dimensions
        img_width = img_data.iloc[0]['img_width']
        img_height = img_data.iloc[0]['img_height']
        
        # Get bounding boxes and labels
        boxes = []
        labels = []
        areas = []
        
        for _, row in img_data.iterrows():
            x, y, w, h = row['x'], row['y'], row['width'], row['height']
            
            # Convert to [x1, y1, x2, y2] format
            x1, y1, x2, y2 = x, y, x + w, y + h
            
            # Clip coordinates to image boundaries (prevent negative or out-of-bounds values)
            x1 = max(0, min(x1, img_width))
            y1 = max(0, min(y1, img_height))
            x2 = max(0, min(x2, img_width))
            y2 = max(0, min(y2, img_height))
            
            # Skip invalid boxes (where x2 <= x1 or y2 <= y1)
            if x2 <= x1 or y2 <= y1:
                continue
            
            boxes.append([x1, y1, x2, y2])
            labels.append(self.cat_to_idx[row['cat_name']])
            areas.append((x2 - x1) * (y2 - y1))  # Recalculate area
        
        boxes = torch.as_tensor(boxes, dtype=torch.float32)
        labels = torch.as_tensor(labels, dtype=torch.int64)
        areas = torch.as_tensor(areas, dtype=torch.float32)
        
        # Create target dictionary
        target = {
            'boxes': boxes,
            'labels': labels,
            'image_id': torch.tensor([img_id]),
            'area': areas,
            'iscrowd': torch.zeros((len(boxes),), dtype=torch.int64)
        }
        
        # Skip if no valid boxes
        if len(boxes) == 0:
            # Return a dummy sample (will be handled by collate_fn)
            if self.transforms:
                # Use transforms even for empty boxes
                try:
                    transformed = self.transforms(image=image, bboxes=[], labels=[])
                    image = transformed['image']
                    if image.dtype == torch.uint8:
                        image = image.float() / 255.0
                except:
                    image = T.ToTensor()(image)
            else:
                image = T.ToTensor()(image)
            target['boxes'] = torch.zeros((0, 4), dtype=torch.float32)
            target['labels'] = torch.zeros((0,), dtype=torch.int64)
            return image, target
        
        # Apply transforms if provided (for both training and validation)
        if self.transforms:
            try:
                transformed = self.transforms(image=image, bboxes=boxes.numpy(), labels=labels.numpy())
                image = transformed['image']
                # Convert to float and normalize to [0, 1]
                if image.dtype == torch.uint8:
                    image = image.float() / 255.0
                
                # Update boxes and labels after transformation
                if len(transformed['bboxes']) > 0:
                    target['boxes'] = torch.as_tensor(transformed['bboxes'], dtype=torch.float32)
                    target['labels'] = torch.as_tensor(transformed['labels'], dtype=torch.int64)
                    target['area'] = torch.as_tensor([
                        (box[2] - box[0]) * (box[3] - box[1]) for box in transformed['bboxes']
                    ], dtype=torch.float32)
                else:
                    # If all boxes were removed by transformation
                    target['boxes'] = torch.zeros((0, 4), dtype=torch.float32)
                    target['labels'] = torch.zeros((0,), dtype=torch.int64)
                    target['area'] = torch.zeros((0,), dtype=torch.float32)
            except Exception as e:
                # If transformation fails, use original image without transformation
                print(f"Warning: Transformation failed for image {img_id}: {e}")
                image = T.ToTensor()(image)
        else:
            # Convert to tensor and normalize to [0, 1] if no transforms provided
            image = T.ToTensor()(image)
        
        return image, target


def get_train_transforms():
    """Augmentations for training"""
    return A.Compose([
        A.HorizontalFlip(p=0.5),
        A.RandomBrightnessContrast(p=0.2),
        A.ColorJitter(p=0.2),
        A.GaussNoise(p=0.1),
        A.Blur(blur_limit=3, p=0.1),
        ToTensorV2()  # This converts to tensor but keeps uint8
    ], bbox_params=A.BboxParams(
        format='pascal_voc', 
        label_fields=['labels'],
        min_area=1.0,  # Minimum area of bbox to keep
        min_visibility=0.1,  # Minimum visibility of bbox to keep
        clip=True  # Clip bboxes to image boundaries
    ))


def get_valid_transforms():
    """Transforms for validation (no augmentation, just tensor conversion)"""
    return A.Compose([
        ToTensorV2()  # Just convert to tensor, no augmentation
    ], bbox_params=A.BboxParams(
        format='pascal_voc', 
        label_fields=['labels'],
        min_area=1.0,
        min_visibility=0.1,
        clip=True
    ))


def collate_fn(batch):
    """
    Custom collate function for dataloader
    Handles variable number of objects per image
    """
    return tuple(zip(*batch))

