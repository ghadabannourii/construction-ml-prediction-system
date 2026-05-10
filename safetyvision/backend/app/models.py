"""
Modèles Pydantic pour SafetyVision API
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class BoundingBox(BaseModel):
    """Coordonnées d'une bounding box"""
    x1: float
    y1: float
    x2: float
    y2: float


class Detection(BaseModel):
    """Une détection YOLOv8"""
    class_name: str
    confidence: float
    bbox: BoundingBox


class Violation(BaseModel):
    """Une violation de sécurité détectée"""
    type: str = Field(..., description="Type de violation (NO_HARDHAT, NO_VEST, NEAR_DANGER)")
    severity: int = Field(..., ge=0, le=3, description="Sévérité (0-3)")
    message: str = Field(..., description="Message descriptif")
    bbox: Optional[BoundingBox] = Field(None, description="Position de la violation")


class SafetyStats(BaseModel):
    """Statistiques de sécurité"""
    total_persons: int = Field(..., description="Nombre total de personnes")
    workers_with_hardhat: int = Field(..., description="Travailleurs avec casque")
    workers_with_vest: int = Field(..., description="Travailleurs avec gilet")
    workers_without_hardhat: int = Field(..., description="Travailleurs sans casque")
    workers_without_vest: int = Field(..., description="Travailleurs sans gilet")
    dangerous_objects: int = Field(..., description="Objets dangereux (machinery, vehicle)")
    safety_cones: int = Field(..., description="Cônes de sécurité")
    compliance_rate: float = Field(..., ge=0, le=100, description="Taux de conformité (%)")


class RiskConfig(BaseModel):
    """Configuration du niveau de risque"""
    level: str = Field(..., description="Niveau: SAFE, WARNING, HIGH_RISK, CRITICAL")
    label: str = Field(..., description="Label français")
    emoji: str = Field(..., description="Emoji représentatif")
    color: str = Field(..., description="Couleur hexadécimale")
    min_score: float = Field(..., description="Score minimum pour ce niveau")


class AnalysisResponse(BaseModel):
    """Réponse complète de l'analyse"""
    risk_level: str = Field(..., description="Niveau de risque")
    risk_score: float = Field(..., ge=0, description="Score de risque (0-10+)")
    risk_config: RiskConfig = Field(..., description="Configuration du niveau de risque")
    violations: List[Violation] = Field(..., description="Liste des violations")
    stats: SafetyStats = Field(..., description="Statistiques de sécurité")
    detections: List[Detection] = Field(..., description="Toutes les détections YOLOv8")
    report: str = Field(..., description="Rapport markdown")
    annotated_image: str = Field(..., description="Image annotée en base64")


class HealthResponse(BaseModel):
    """Réponse du endpoint /health"""
    status: str
    model_loaded: bool
    model_path: str
    classes: List[str]
    version: str
