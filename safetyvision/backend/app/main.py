"""
SafetyVision API - FastAPI Backend
Détection de risques sur chantier avec YOLOv8
"""
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from pathlib import Path

from .config import ALLOWED_ORIGINS, CLASS_NAMES, MODEL_PATH
from .detector import SafetyDetector
from .models import AnalysisResponse, HealthResponse, RiskConfig, SafetyStats, Violation, Detection, BoundingBox

# Configuration logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialisation FastAPI
app = FastAPI(
    title="SafetyVision API",
    description="API de détection de risques sur chantier avec YOLOv8",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS + ["*"],  # En production, restreindre
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialisation du détecteur (global)
detector = None

@app.on_event("startup")
async def startup_event():
    """Charge le modèle au démarrage"""
    global detector
    try:
        logger.info("🚀 Démarrage de SafetyVision API...")
        detector = SafetyDetector()
        logger.info("✅ Modèle YOLOv8 chargé avec succès")
    except Exception as e:
        logger.error(f"❌ Erreur lors du chargement du modèle: {e}")
        logger.warning("⚠️ L'API démarre sans modèle. Les prédictions échoueront.")


@app.get("/", tags=["Root"])
async def root():
    """Page d'accueil de l'API"""
    return {
        "message": "🏗️ SafetyVision API - Détection de risques sur chantier",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "predict": "/predict (POST)",
            "classes": "/classes"
        }
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health():
    """Vérification de l'état de l'API et du modèle"""
    model_loaded = detector is not None
    
    return HealthResponse(
        status="ok" if model_loaded else "model_not_loaded",
        model_loaded=model_loaded,
        model_path=str(MODEL_PATH),
        classes=CLASS_NAMES,
        version="1.0.0"
    )


@app.get("/classes", tags=["Info"])
async def get_classes():
    """Retourne la liste des classes détectables"""
    return {
        "classes": CLASS_NAMES,
        "count": len(CLASS_NAMES),
        "categories": {
            "safety_equipment": ["Hardhat", "Mask", "Safety Vest", "Safety Cone"],
            "violations": ["NO-Hardhat", "NO-Mask", "NO-Safety Vest"],
            "persons": ["Person"],
            "dangers": ["machinery", "vehicle"]
        }
    }


@app.post("/predict", response_model=AnalysisResponse, tags=["Prediction"])
async def predict(file: UploadFile = File(...)):
    """
    Analyse une image de chantier et retourne les risques détectés
    
    Args:
        file: Image (JPEG, PNG, etc.)
    
    Returns:
        AnalysisResponse avec détections, risques, violations, stats et image annotée
    """
    # Vérifier que le modèle est chargé
    if detector is None:
        raise HTTPException(
            status_code=503,
            detail="Modèle non chargé. Vérifiez que best.pt existe dans safetyvision/backend/model/"
        )
    
    # Vérifier le type de fichier
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Type de fichier invalide: {file.content_type}. Utilisez une image (JPEG, PNG, etc.)"
        )
    
    try:
        # Lire l'image
        logger.info(f"📸 Analyse de l'image: {file.filename}")
        image_bytes = await file.read()
        
        # Analyser l'image
        result = detector.analyze_image(image_bytes)
        
        # Construire la réponse
        detections_list = [
            Detection(
                class_name=d['class_name'],
                confidence=d['confidence'],
                bbox=BoundingBox(**d['bbox'])
            )
            for d in result['detections']
        ]
        
        analysis = result['analysis']
        
        violations_list = [
            Violation(
                type=v['type'],
                severity=v['severity'],
                message=v['message'],
                bbox=BoundingBox(**v['bbox']) if v.get('bbox') else None
            )
            for v in analysis['violations']
        ]
        
        risk_config_obj = RiskConfig(
            level=analysis['risk_level'],
            label=analysis['risk_config']['label'],
            emoji=analysis['risk_config']['emoji'],
            color=analysis['risk_config']['color'],
            min_score=analysis['risk_config']['min_score']
        )
        
        stats_obj = SafetyStats(**analysis['stats'])
        
        response = AnalysisResponse(
            risk_level=analysis['risk_level'],
            risk_score=analysis['risk_score'],
            risk_config=risk_config_obj,
            violations=violations_list,
            stats=stats_obj,
            detections=detections_list,
            report=result['report'],
            annotated_image=result['annotated_image']
        )
        
        logger.info(f"✅ Analyse terminée: {analysis['risk_level']} (score: {analysis['risk_score']})")
        
        return response
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'analyse: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'analyse de l'image: {str(e)}"
        )


@app.get("/stats", tags=["Info"])
async def get_stats():
    """Statistiques de l'API (pour monitoring)"""
    return {
        "model_loaded": detector is not None,
        "model_path": str(MODEL_PATH),
        "classes_count": len(CLASS_NAMES),
        "api_version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    from .config import API_HOST, API_PORT, DEBUG
    
    uvicorn.run(
        "app.main:app",
        host=API_HOST,
        port=API_PORT,
        reload=DEBUG
    )
