"""
Backend Integration for Waste Detection Model
Use this to integrate the trained model with your Node.js/Express backend
"""

import torch
import sys
import json
from inference import WasteDetector


def classify_image(image_path, model_path='checkpoints/best_model.pth', csv_file='Dataset/waste/meta_df.csv'):
    """
    Classify waste in image
    Returns: JSON string with predictions
    """
    try:
        detector = WasteDetector(model_path, csv_file, device='cuda' if torch.cuda.is_available() else 'cpu')
        predictions = detector.predict(image_path, conf_threshold=0.5)
        
        # Format results
        result = {
            'success': True,
            'detections': len(predictions),
            'objects': predictions
        }
        
        return json.dumps(result)
    
    except Exception as e:
        return json.dumps({
            'success': False,
            'error': str(e)
        })


if __name__ == "__main__":
    # Example usage from command line
    # python integrate_backend.py <image_path>
    
    if len(sys.argv) < 2:
        print("Usage: python integrate_backend.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    result = classify_image(image_path)
    print(result)

