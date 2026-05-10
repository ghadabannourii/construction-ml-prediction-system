"""
Configuration pour SafetyVision - Détection de risques sur chantier
"""
import os
from pathlib import Path

# Chemins
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "model"
MODEL_PATH = MODEL_DIR / "best.pt"

# Classes YOLOv8 (identique au notebook)
CLASS_NAMES = [
    'Hardhat',
    'Mask', 
    'NO-Hardhat',
    'NO-Mask',
    'NO-Safety Vest',
    'Person',
    'Safety Cone',
    'Safety Vest',
    'machinery',
    'vehicle'
]

# Seuils de détection
CONF_THRESHOLD = 0.35
IOU_THRESHOLD = 0.45

# Configuration serveur
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8001"))
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# CORS
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://construction-ml-prediction-system-l.vercel.app",
    "https://construction-ml-prediction-system-two.vercel.app",
    "https://construction-ml-prediction-system-git-522e13-ghadabannouriis-projects.vercel.app",
]
