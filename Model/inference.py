"""
Inference script for Faster RCNN Waste Detection
"""

import torch
import torchvision.transforms as T
from PIL import Image
import numpy as np
import cv2
import os
import argparse
from model import get_model, load_model
from dataset import WasteDataset


class WasteDetector:
    """
    Waste Detection Inference Class
    """
    def __init__(self, model_path, csv_file, device='cuda'):
        """
        Initialize detector with trained model
        
        Args:
            model_path: Path to saved model checkpoint
            csv_file: Path to CSV to get category mappings
            device: 'cuda' or 'cpu'
        """
        self.device = torch.device(device if torch.cuda.is_available() else 'cpu')
        
        # Load category mappings from dataset
        dataset = WasteDataset(csv_file, root_dir="", train=False)
        self.idx_to_cat = dataset.idx_to_cat
        self.num_classes = dataset.num_classes
        
        # Load model
        self.model = get_model(num_classes=self.num_classes, pretrained=False)
        self.model, _, _ = load_model(self.model, None, model_path, self.device)
        self.model.eval()
        self.model.to(self.device)
        
        self.transform = T.Compose([T.ToTensor()])
        
        print(f"Detector initialized with {self.num_classes - 1} classes")
        print(f"Device: {self.device}")
    
    @torch.no_grad()
    def predict(self, image_path, conf_threshold=0.5):
        """
        Predict waste objects in image
        
        Args:
            image_path: Path to image file
            conf_threshold: Confidence threshold for detections
        
        Returns:
            predictions: List of dicts with boxes, labels, scores
        """
        # Load and transform image
        image = Image.open(image_path).convert('RGB')
        image_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        # Predict
        predictions = self.model(image_tensor)[0]
        
        # Filter by confidence
        keep = predictions['scores'] > conf_threshold
        boxes = predictions['boxes'][keep].cpu().numpy()
        labels = predictions['labels'][keep].cpu().numpy()
        scores = predictions['scores'][keep].cpu().numpy()
        
        # Convert to readable format
        results = []
        for box, label, score in zip(boxes, labels, scores):
            results.append({
                'box': box.tolist(),
                'label': self.idx_to_cat.get(int(label), 'Unknown'),
                'score': float(score)
            })
        
        return results
    
    def visualize(self, image_path, predictions, output_path=None):
        """
        Visualize predictions on image
        
        Args:
            image_path: Path to input image
            predictions: Predictions from predict()
            output_path: Path to save output image
        """
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Draw predictions
        for pred in predictions:
            box = pred['box']
            label = pred['label']
            score = pred['score']
            
            x1, y1, x2, y2 = map(int, box)
            
            # Draw box
            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Draw label
            text = f"{label}: {score:.2f}"
            cv2.putText(image, text, (x1, y1 - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        if output_path:
            cv2.imwrite(output_path, cv2.cvtColor(image, cv2.COLOR_RGB2BGR))
            print(f"Visualization saved to {output_path}")
        
        return image


def main(args):
    # Initialize detector
    detector = WasteDetector(
        model_path=args.model_path,
        csv_file=args.csv_file,
        device='cuda' if torch.cuda.is_available() else 'cpu'
    )
    
    # Predict
    predictions = detector.predict(args.image_path, conf_threshold=args.threshold)
    
    print(f"\nDetected {len(predictions)} objects:")
    for i, pred in enumerate(predictions, 1):
        print(f"  {i}. {pred['label']} (confidence: {pred['score']:.3f})")
    
    # Visualize
    if args.output_path:
        detector.visualize(args.image_path, predictions, args.output_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Inference for Waste Detection")
    
    parser.add_argument("--model_path", type=str, required=True,
                        help="Path to trained model checkpoint")
    parser.add_argument("--csv_file", type=str, default="Dataset/waste/meta_df.csv",
                        help="Path to CSV file for category mappings")
    parser.add_argument("--image_path", type=str, required=True,
                        help="Path to input image")
    parser.add_argument("--output_path", type=str, default=None,
                        help="Path to save output visualization")
    parser.add_argument("--threshold", type=float, default=0.5,
                        help="Confidence threshold")
    
    args = parser.parse_args()
    main(args)

