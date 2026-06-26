"""
Waste Category Mapper for Faster RCNN
======================================
Maps COCO-pretrained Faster RCNN class labels (80 classes) to 4 waste categories:
  ♻️  Dry    - Recyclable: plastic, glass, paper, metal
  🌿  Wet    - Organic / biodegradable: food, plants
  ⚡  E-Waste - Electronics: devices, batteries, appliances
  🗑️  Mixed  - Unclassified / ambiguous

Also supports mapping from the custom waste dataset (50+ classes)
when a trained checkpoint is available.

COCO 80-class label → waste category lookup table
---------------------------------------------------
"""

# ─── COCO 80-CLASS → WASTE CATEGORY MAPPING ────────────────────────────────────
# Reference: https://cocodataset.org/#explore
# __background__ is index 0 (ignored)

COCO_CATEGORY_MAP = {
    # ── Dry Waste (Recyclable) ──────────────────────────────────────
    "bottle":       "Dry",   # plastic / glass bottles
    "wine glass":   "Dry",   # glass
    "cup":          "Dry",   # plastic/paper cups
    "fork":         "Dry",   # metal/plastic cutlery
    "knife":        "Dry",   # metal/plastic cutlery
    "spoon":        "Dry",   # metal/plastic cutlery
    "bowl":         "Dry",   # plastic/ceramic bowl
    "backpack":     "Dry",   # fabric item
    "umbrella":     "Dry",   # fabric/plastic item
    "handbag":      "Dry",   # fabric/leather item
    "tie":          "Dry",   # fabric item
    "suitcase":     "Dry",   # hard plastic / fabric
    "book":         "Dry",   # paper
    "vase":         "Dry",   # glass/ceramic
    "scissors":     "Dry",   # metal
    "clock":        "Dry",   # recyclable material
    "frisbee":      "Dry",   # plastic
    "skis":         "Dry",   # composite material
    "snowboard":    "Dry",   # composite material
    "skateboard":   "Dry",   # wood/plastic
    "surfboard":    "Dry",   # composite material
    "baseball bat": "Dry",   # wood/metal
    "baseball glove": "Dry", # leather
    "tennis racket": "Dry",  # composite
    "sports ball":  "Dry",   # rubber/leather
    "kite":         "Dry",   # plastic/fabric
    "chair":        "Dry",   # wood/plastic
    "couch":        "Dry",   # fabric/foam
    "bed":          "Dry",   # fabric/wood
    "dining table": "Dry",   # wood/plastic
    "teddy bear":   "Dry",   # fabric/stuffing

    # ── Wet Waste (Organic/Biodegradable) ───────────────────────────
    "banana":       "Wet",   # fruit
    "apple":        "Wet",   # fruit
    "sandwich":     "Wet",   # food
    "orange":       "Wet",   # fruit
    "broccoli":     "Wet",   # vegetable
    "carrot":       "Wet",   # vegetable
    "hot dog":      "Wet",   # food
    "pizza":        "Wet",   # food
    "donut":        "Wet",   # food
    "cake":         "Wet",   # food
    "potted plant": "Wet",   # organic / garden waste

    # ── E-Waste (Electronic Waste) ──────────────────────────────────
    "tv":           "E-Waste",       # television / monitor
    "laptop":       "E-Waste",       # laptop computer
    "mouse":        "E-Waste",       # computer mouse
    "remote":       "E-Waste",       # remote control
    "keyboard":     "E-Waste",       # computer keyboard
    "cell phone":   "E-Waste",       # smartphone / feature phone
    "microwave":    "E-Waste",       # microwave oven
    "oven":         "E-Waste",       # electric oven
    "toaster":      "E-Waste",       # toaster
    "hair drier":   "E-Waste",       # hair dryer
    "refrigerator": "E-Waste",       # fridge / freezer
    "sink":         "E-Waste",       # metal/plumbing fixture
    "toilet":       "E-Waste",       # ceramic fixture
    "toothbrush":   "E-Waste",       # plastic (personal hygiene)

    # ── Mixed Waste (Unclassified / General) ────────────────────────
    "person":       "Mixed",
    "bicycle":      "Mixed",
    "car":          "Mixed",
    "motorcycle":   "Mixed",
    "airplane":     "Mixed",
    "bus":          "Mixed",
    "train":        "Mixed",
    "truck":        "Mixed",
    "boat":         "Mixed",
    "traffic light":"Mixed",
    "fire hydrant": "Mixed",
    "stop sign":    "Mixed",
    "parking meter":"Mixed",
    "bench":        "Mixed",
    "bird":         "Mixed",
    "cat":          "Mixed",
    "dog":          "Mixed",
    "horse":        "Mixed",
    "sheep":        "Mixed",
    "cow":          "Mixed",
    "elephant":     "Mixed",
    "bear":         "Mixed",
    "zebra":        "Mixed",
    "giraffe":      "Mixed",
}

# ─── CUSTOM DATASET (50+ classes) → WASTE CATEGORY MAPPING ─────────────────────
# These are the fine-grained labels from the WALL.E dataset (meta_df.csv).
# When a trained custom model checkpoint is found, this mapping is used.

CUSTOM_DATASET_CATEGORY_MAP = {
    # Dry waste — plastic
    "Clear plastic bottle":    "Dry",
    "Other plastic bottle":    "Dry",
    "Plastic bottle cap":      "Dry",
    "Plastic bag":             "Dry",
    "Plastic film":            "Dry",
    "Single-use carrier bag":  "Dry",
    "Crisp packet":            "Dry",
    "Other plastic wrapper":   "Dry",
    "Spread tub":              "Dry",
    "Tupperware":              "Dry",
    "Disposable food container": "Dry",
    "Foam food container":     "Dry",
    "Plastic straw":           "Dry",
    "Plastic cup":             "Dry",
    "Paper cup":               "Dry",
    "Polypropylene bag":       "Dry",

    # Dry waste — glass
    "Glass bottle":            "Dry",
    "Glass jar":               "Dry",
    "Broken glass":            "Dry",

    # Dry waste — metal
    "Drink can":               "Dry",
    "Food can":                "Dry",
    "Aerosol":                 "Dry",
    "Metal bottle cap":        "Dry",
    "Pop tab":                 "Dry",
    "Disposable aluminium":    "Dry",

    # Dry waste — paper/cardboard
    "Cardboard":               "Dry",
    "Meal carton":             "Dry",
    "Other carton":            "Dry",
    "Pizza box":               "Dry",
    "Egg carton":              "Dry",
    "Toilet tube":             "Dry",
    "Paper bag":               "Dry",
    "Wrapping paper":          "Dry",
    "Normal paper":            "Dry",
    "Tissues":                 "Dry",
    "Magazine paper":          "Dry",

    # Dry waste — textiles/other recyclable
    "Shoe":                    "Dry",
    "Single-use carrier bag":  "Dry",
    "Squeezable tube":         "Dry",
    "Rope & strings":          "Dry",

    # Wet waste — food/organic
    "Food":                    "Wet",
    "Food waste":              "Wet",
    "Fruit":                   "Wet",
    "Vegetable":               "Wet",
    "Organic waste":           "Wet",
    "Leaves":                  "Wet",
    "Garden waste":            "Wet",

    # E-Waste — electronics
    "Battery":                 "E-Waste",
    "Phone":                   "E-Waste",
    "Laptop":                  "E-Waste",
    "Cable":                   "E-Waste",
    "Electronic device":       "E-Waste",
    "Charger":                 "E-Waste",
    "Headphones":              "E-Waste",

    # Mixed
    "Unlabeled litter":        "Mixed",
    "Smoking-related":         "Mixed",
    "Cigarette":               "Mixed",
    "Others":                  "Mixed",
}


def map_coco_label_to_waste_category(label: str) -> str:
    """
    Maps a COCO class label to one of 4 waste categories.

    Args:
        label: COCO class name (e.g., 'bottle', 'laptop', 'banana')

    Returns:
        Waste category string: 'Wet' | 'Dry' | 'E-Waste' | 'Mixed'
    """
    return COCO_CATEGORY_MAP.get(label.lower(), "Mixed")


def map_custom_label_to_waste_category(label: str) -> str:
    """
    Maps a custom dataset label to one of 4 waste categories.
    Used when a trained Faster RCNN checkpoint is loaded.

    Args:
        label: Custom dataset class name (e.g., 'Clear plastic bottle')

    Returns:
        Waste category string: 'Wet' | 'Dry' | 'E-Waste' | 'Mixed'
    """
    # Exact match first
    if label in CUSTOM_DATASET_CATEGORY_MAP:
        return CUSTOM_DATASET_CATEGORY_MAP[label]

    # Substring match (case-insensitive)
    label_lower = label.lower()
    for key, cat in CUSTOM_DATASET_CATEGORY_MAP.items():
        if key.lower() in label_lower or label_lower in key.lower():
            return cat

    # Keyword-based fallback
    if any(kw in label_lower for kw in ["battery", "phone", "electronic", "cable", "laptop", "charger"]):
        return "E-Waste"
    if any(kw in label_lower for kw in ["food", "fruit", "vegetable", "organic", "leaf", "plant"]):
        return "Wet"
    if any(kw in label_lower for kw in ["plastic", "glass", "can", "paper", "carton", "bottle", "metal", "tin", "card"]):
        return "Dry"

    return "Mixed"


# ─── CATEGORY METADATA ──────────────────────────────────────────────────────────

CATEGORY_INFO = {
    "Wet": {
        "color":       "#4CAF50",
        "icon":        "🌿",
        "description": "Biodegradable organic waste (food, garden waste)",
        "disposal":    "Green compost bin",
        "examples":    ["Fruit peels", "Vegetable scraps", "Food leftovers", "Garden clippings"],
    },
    "Dry": {
        "color":       "#2196F3",
        "icon":        "♻️",
        "description": "Recyclable dry waste (plastic, paper, glass, metal)",
        "disposal":    "Blue recycling bin",
        "examples":    ["Plastic bottles", "Cardboard boxes", "Glass jars", "Metal cans"],
    },
    "E-Waste": {
        "color":       "#FF5722",
        "icon":        "⚡",
        "description": "Electronic waste (devices, batteries, cables, appliances)",
        "disposal":    "Special e-waste collection center",
        "examples":    ["Mobile phones", "Laptops", "Batteries", "Chargers", "TVs"],
    },
    "Mixed": {
        "color":       "#9C27B0",
        "icon":        "🗑️",
        "description": "Mixed or unclassified waste requiring manual sorting",
        "disposal":    "Grey general waste bin",
        "examples":    ["Mixed garbage", "Unidentified items", "Composite materials"],
    },
}
