"""
SafetyRiskAnalyzer - Analyse des risques sur chantier
Copié du notebook SafetyVision_YOLOv8_v5_FINAL.ipynb (cellule 6)
"""
from typing import List, Dict, Any, Tuple
import numpy as np


class SafetyRiskAnalyzer:
    """
    Analyse les détections YOLOv8 et calcule un score de risque
    """
    
    # Niveaux de risque
    RISK_LEVELS = {
        'SAFE': {
            'label': 'Sécurisé',
            'emoji': '✅',
            'color': '#00C853',
            'min_score': 0
        },
        'WARNING': {
            'label': 'Attention',
            'emoji': '⚠️',
            'color': '#FFD600',
            'min_score': 2
        },
        'HIGH_RISK': {
            'label': 'Risque Élevé',
            'emoji': '🔴',
            'color': '#FF6D00',
            'min_score': 5
        },
        'CRITICAL': {
            'label': 'Critique',
            'emoji': '💀',
            'color': '#D50000',
            'min_score': 8
        }
    }
    
    # Scores de violation
    VIOLATION_SCORES = {
        'NO_HARDHAT': 2,
        'NO_VEST': 1,
        'NO_MASK': 0.5,
        'NEAR_DANGER': 3
    }
    
    # Distance de danger (en pixels normalisés)
    DANGER_DISTANCE_THRESHOLD = 0.15
    
    @staticmethod
    def iou(box1: Tuple[float, float, float, float], 
            box2: Tuple[float, float, float, float]) -> float:
        """
        Calcule l'Intersection over Union entre deux bounding boxes
        box format: (x1, y1, x2, y2)
        """
        x1_inter = max(box1[0], box2[0])
        y1_inter = max(box1[1], box2[1])
        x2_inter = min(box1[2], box2[2])
        y2_inter = min(box1[3], box2[3])
        
        if x2_inter < x1_inter or y2_inter < y1_inter:
            return 0.0
        
        inter_area = (x2_inter - x1_inter) * (y2_inter - y1_inter)
        box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
        box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])
        union_area = box1_area + box2_area - inter_area
        
        return inter_area / union_area if union_area > 0 else 0.0
    
    @staticmethod
    def distance_between_boxes(box1: Tuple[float, float, float, float],
                               box2: Tuple[float, float, float, float]) -> float:
        """
        Calcule la distance entre les centres de deux bounding boxes (normalisée)
        """
        center1_x = (box1[0] + box1[2]) / 2
        center1_y = (box1[1] + box1[3]) / 2
        center2_x = (box2[0] + box2[2]) / 2
        center2_y = (box2[1] + box2[3]) / 2
        
        return np.sqrt((center1_x - center2_x)**2 + (center1_y - center2_y)**2)
    
    def analyze(self, detections: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyse les détections et retourne un rapport de risque
        
        Args:
            detections: Liste de détections avec format:
                {
                    'class_name': str,
                    'confidence': float,
                    'bbox': {'x1': float, 'y1': float, 'x2': float, 'y2': float}
                }
        
        Returns:
            {
                'risk_level': str,
                'risk_score': float,
                'violations': List[Dict],
                'stats': Dict,
                'risk_config': Dict
            }
        """
        risk_score = 0
        violations = []
        
        # Compteurs
        persons = [d for d in detections if d['class_name'] == 'Person']
        hardhats = [d for d in detections if d['class_name'] == 'Hardhat']
        vests = [d for d in detections if d['class_name'] == 'Safety Vest']
        no_hardhats = [d for d in detections if d['class_name'] == 'NO-Hardhat']
        no_vests = [d for d in detections if d['class_name'] == 'NO-Safety Vest']
        machinery = [d for d in detections if d['class_name'] in ['machinery', 'vehicle']]
        cones = [d for d in detections if d['class_name'] == 'Safety Cone']
        
        # 1. Violations directes (NO-Hardhat, NO-Vest)
        for no_hardhat in no_hardhats:
            risk_score += self.VIOLATION_SCORES['NO_HARDHAT']
            violations.append({
                'type': 'NO_HARDHAT',
                'severity': 2,
                'message': '🔴 Travailleur sans casque détecté',
                'bbox': no_hardhat['bbox']
            })
        
        for no_vest in no_vests:
            risk_score += self.VIOLATION_SCORES['NO_VEST']
            violations.append({
                'type': 'NO_VEST',
                'severity': 1,
                'message': '⚠️ Travailleur sans gilet de sécurité',
                'bbox': no_vest['bbox']
            })
        
        # 2. Proximité avec machines dangereuses
        for person in persons:
            person_box = (
                person['bbox']['x1'],
                person['bbox']['y1'],
                person['bbox']['x2'],
                person['bbox']['y2']
            )
            
            for machine in machinery:
                machine_box = (
                    machine['bbox']['x1'],
                    machine['bbox']['y1'],
                    machine['bbox']['x2'],
                    machine['bbox']['y2']
                )
                
                distance = self.distance_between_boxes(person_box, machine_box)
                
                if distance < self.DANGER_DISTANCE_THRESHOLD:
                    risk_score += self.VIOLATION_SCORES['NEAR_DANGER']
                    violations.append({
                        'type': 'NEAR_DANGER',
                        'severity': 3,
                        'message': f'💀 Personne trop proche d\'un engin dangereux ({machine["class_name"]})',
                        'bbox': person['bbox']
                    })
        
        # 3. Calcul du taux de conformité
        total_workers = len(persons) + len(no_hardhats) + len(no_vests)
        workers_with_hardhat = len(hardhats)
        workers_with_vest = len(vests)
        
        compliance_rate = 0.0
        if total_workers > 0:
            # Conformité = (casques + gilets) / (2 * travailleurs)
            compliance_rate = ((workers_with_hardhat + workers_with_vest) / (2 * total_workers)) * 100
        
        # 4. Déterminer le niveau de risque
        risk_level = 'SAFE'
        for level, config in sorted(
            self.RISK_LEVELS.items(),
            key=lambda x: x[1]['min_score'],
            reverse=True
        ):
            if risk_score >= config['min_score']:
                risk_level = level
                break
        
        # 5. Statistiques
        stats = {
            'total_persons': len(persons),
            'workers_with_hardhat': workers_with_hardhat,
            'workers_with_vest': workers_with_vest,
            'workers_without_hardhat': len(no_hardhats),
            'workers_without_vest': len(no_vests),
            'dangerous_objects': len(machinery),
            'safety_cones': len(cones),
            'compliance_rate': round(compliance_rate, 2)
        }
        
        return {
            'risk_level': risk_level,
            'risk_score': round(risk_score, 2),
            'violations': violations,
            'stats': stats,
            'risk_config': self.RISK_LEVELS[risk_level]
        }
