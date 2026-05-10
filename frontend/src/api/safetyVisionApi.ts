/**
 * API Client pour SafetyVision Backend
 * Communique avec le backend FastAPI sur port 8001
 */

const SAFETYVISION_API_URL = 
  (import.meta.env.VITE_SAFETYVISION_API_URL as string | undefined) || 
  'http://localhost:8001';

export type BoundingBox = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type Detection = {
  class_name: string;
  confidence: number;
  bbox: BoundingBox;
};

export type Violation = {
  type: string;
  severity: number;
  message: string;
  bbox?: BoundingBox;
};

export type SafetyStats = {
  total_persons: number;
  workers_with_hardhat: number;
  workers_with_vest: number;
  workers_without_hardhat: number;
  workers_without_vest: number;
  dangerous_objects: number;
  safety_cones: number;
  compliance_rate: number;
};

export type RiskConfig = {
  level: string;
  label: string;
  emoji: string;
  color: string;
  min_score: number;
};

export type AnalysisResponse = {
  risk_level: string;
  risk_score: number;
  risk_config: RiskConfig;
  violations: Violation[];
  stats: SafetyStats;
  detections: Detection[];
  report: string;
  annotated_image: string; // base64
};

export type HealthResponse = {
  status: string;
  model_loaded: boolean;
  model_path: string;
  classes: string[];
  version: string;
};

/**
 * Vérifie l'état de l'API SafetyVision
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${SAFETYVISION_API_URL}/health`);
  if (!response.ok) {
    throw new Error(`API Health check failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Analyse une image de chantier
 */
export async function analyzeImage(file: File): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${SAFETYVISION_API_URL}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || 'Erreur lors de l\'analyse de l\'image');
  }

  return response.json();
}

/**
 * Récupère la liste des classes détectables
 */
export async function getClasses(): Promise<{ classes: string[]; count: number }> {
  const response = await fetch(`${SAFETYVISION_API_URL}/classes`);
  if (!response.ok) {
    throw new Error('Impossible de récupérer les classes');
  }
  return response.json();
}

export { SAFETYVISION_API_URL };
