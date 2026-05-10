# 🏗️ SafetyVision - Détection de Risques sur Chantier

## 📋 Description

SafetyVision est un système de détection de risques sur chantier utilisant YOLOv8 pour identifier les violations de sécurité en temps réel.

### Fonctionnalités

- ✅ Détection de 10 classes d'objets (casques, gilets, personnes, engins, etc.)
- ✅ Analyse de risques avec score de 0 à 10+
- ✅ Identification des violations (NO-Hardhat, NO-Vest, proximité danger)
- ✅ Calcul du taux de conformité
- ✅ Image annotée avec bounding boxes
- ✅ Rapport détaillé en markdown

## 🎯 Classes Détectées

1. **Hardhat** - Casque de sécurité
2. **Mask** - Masque
3. **NO-Hardhat** - Personne sans casque ⚠️
4. **NO-Mask** - Personne sans masque
5. **NO-Safety Vest** - Personne sans gilet ⚠️
6. **Person** - Personne
7. **Safety Cone** - Cône de sécurité
8. **Safety Vest** - Gilet de sécurité
9. **machinery** - Engin de chantier 🚧
10. **vehicle** - Véhicule 🚧

## 🏗️ Architecture

```
safetyvision/
├── backend/                    # API FastAPI (Port 8001)
│   ├── app/
│   │   ├── main.py            # API principale
│   │   ├── detector.py        # SafetyDetector (YOLOv8)
│   │   ├── risk_analyzer.py   # SafetyRiskAnalyzer
│   │   ├── models.py          # Modèles Pydantic
│   │   └── config.py          # Configuration
│   ├── model/
│   │   └── best.pt            # ⚠️ MODÈLE YOLOV8 À PLACER ICI
│   └── requirements.txt
│
└── frontend/                   # Intégré dans frontend/src/
    ├── pages/SafetyVisionPage.tsx
    ├── components/SafetyVision/
    │   ├── ImageUploader.tsx
    │   ├── RiskBadge.tsx
    │   ├── StatsCard.tsx
    │   └── ViolationsList.tsx
    └── api/safetyVisionApi.ts
```

## 🚀 Installation

### 1. Backend SafetyVision

```bash
# Aller dans le dossier backend
cd safetyvision/backend

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement (Windows)
venv\Scripts\activate

# Activer l'environnement (Linux/Mac)
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

### 2. ⚠️ IMPORTANT : Placer le modèle YOLOv8

**Vous devez placer votre fichier `best.pt` (modèle YOLOv8 entraîné) dans :**

```
safetyvision/backend/model/best.pt
```

Si vous n'avez pas encore entraîné le modèle, utilisez le notebook Google Colab :
- `SafetyVision_YOLOv8_v5_FINAL.ipynb`
- Entraînez le modèle sur le dataset Construction Site Safety (Kaggle)
- Téléchargez le fichier `best.pt` généré
- Placez-le dans `safetyvision/backend/model/`

### 3. Lancer le Backend

```bash
# Depuis safetyvision/backend/
python -m uvicorn app.main:app --reload --port 8001
```

Le backend sera accessible sur : **http://localhost:8001**

Documentation API : **http://localhost:8001/docs**

### 4. Frontend (déjà intégré)

Le frontend est déjà intégré dans le projet de groupe. Aucune installation supplémentaire nécessaire.

```bash
# Depuis la racine du projet
cd frontend
npm install  # Si pas déjà fait
npm run dev
```

Le frontend sera accessible sur : **http://localhost:5173**

Page SafetyVision : **http://localhost:5173/safetyvision**

## 📡 API Endpoints

### `GET /health`
Vérification de l'état de l'API et du modèle

**Réponse :**
```json
{
  "status": "ok",
  "model_loaded": true,
  "model_path": "model/best.pt",
  "classes": ["Hardhat", "Mask", ...],
  "version": "1.0.0"
}
```

### `POST /predict`
Analyse une image de chantier

**Requête :**
- `multipart/form-data`
- Champ `file` : image (JPEG, PNG)

**Réponse :**
```json
{
  "risk_level": "WARNING",
  "risk_score": 3.5,
  "risk_config": {
    "level": "WARNING",
    "label": "Attention",
    "emoji": "⚠️",
    "color": "#FFD600",
    "min_score": 2
  },
  "violations": [
    {
      "type": "NO_HARDHAT",
      "severity": 2,
      "message": "🔴 Travailleur sans casque détecté",
      "bbox": {"x1": 100, "y1": 150, "x2": 200, "y2": 300}
    }
  ],
  "stats": {
    "total_persons": 5,
    "workers_with_hardhat": 3,
    "workers_with_vest": 4,
    "workers_without_hardhat": 2,
    "workers_without_vest": 1,
    "dangerous_objects": 1,
    "safety_cones": 3,
    "compliance_rate": 70.0
  },
  "detections": [...],
  "report": "# Rapport d'Analyse...",
  "annotated_image": "base64_encoded_image..."
}
```

### `GET /classes`
Liste des classes détectables

## 🎨 Interface Frontend

### Page SafetyVision

L'interface est intégrée dans le frontend du groupe avec le même style :

1. **Header** : Titre, statut API, lien vers docs
2. **Upload** : Drag & drop ou clic pour sélectionner une image
3. **Analyse** : Bouton pour lancer l'analyse
4. **Résultats** :
   - Badge de risque (SAFE / WARNING / HIGH_RISK / CRITICAL)
   - Image annotée avec bounding boxes
   - Statistiques de sécurité
   - Liste des violations
   - Rapport détaillé

### Navigation

La page SafetyVision est accessible via :
- Menu de navigation : **SafetyVision**
- URL directe : **http://localhost:5173/safetyvision**

## 🔧 Configuration

### Variables d'environnement Backend

Créez un fichier `.env` dans `safetyvision/backend/` :

```env
API_HOST=0.0.0.0
API_PORT=8001
DEBUG=True
MODEL_PATH=model/best.pt
CONF_THRESHOLD=0.35
IOU_THRESHOLD=0.45
```

### Variables d'environnement Frontend

Dans `frontend/.env` (ou `.env.local`) :

```env
VITE_SAFETYVISION_API_URL=http://localhost:8001
```

## 📊 Niveaux de Risque

| Niveau | Score | Emoji | Couleur | Description |
|--------|-------|-------|---------|-------------|
| **SAFE** | 0-1 | ✅ | Vert | Aucun risque détecté |
| **WARNING** | 2-4 | ⚠️ | Jaune | Attention requise |
| **HIGH_RISK** | 5-7 | 🔴 | Orange | Risque élevé |
| **CRITICAL** | 8+ | 💀 | Rouge | Danger critique |

## 🧪 Test de l'API

### Avec curl

```bash
curl -X POST "http://localhost:8001/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/image.jpg"
```

### Avec Python

```python
import requests

url = "http://localhost:8001/predict"
files = {"file": open("chantier.jpg", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

## 🐳 Docker (Optionnel)

```bash
# Build
cd safetyvision/backend
docker build -t safetyvision-backend .

# Run
docker run -p 8001:8001 -v $(pwd)/model:/app/model safetyvision-backend
```

## 🔍 Dépannage

### Erreur : "Modèle YOLOv8 introuvable"

**Solution :** Placez votre fichier `best.pt` dans `safetyvision/backend/model/`

### Erreur : "API SafetyVision hors ligne"

**Solution :** Vérifiez que le backend tourne sur le port 8001 :

```bash
cd safetyvision/backend
python -m uvicorn app.main:app --reload --port 8001
```

### Erreur : "ultralytics n'est pas installé"

**Solution :**

```bash
pip install ultralytics==8.3.0
```

### Port 8001 déjà utilisé

**Solution :** Changez le port dans `config.py` et `.env`

## 📦 Dépendances Backend

- **fastapi** : Framework API
- **uvicorn** : Serveur ASGI
- **ultralytics** : YOLOv8
- **opencv-python-headless** : Traitement d'images
- **pillow** : Manipulation d'images
- **numpy** : Calculs numériques
- **pydantic** : Validation de données

## 🎓 Dataset

Le modèle est entraîné sur le **Construction Site Safety Dataset** (Kaggle) :
- 10 classes d'objets
- Images de chantiers de construction
- Annotations au format YOLO

## 📝 Intégration avec le Projet de Groupe

SafetyVision est conçu pour s'intégrer parfaitement avec le projet existant :

1. **Backend séparé** : Port 8001 (pas de conflit avec Flask sur 5000 ou Safety sur 8000)
2. **Frontend intégré** : Même style, même navigation
3. **Indépendant** : Peut fonctionner seul ou avec les autres modules

### Structure du Projet de Groupe

```
projet-groupe/
├── backend/              # Flask API (Construction Performance) - Port 5000
├── safety/               # FastAPI (HAM10000 Skin Lesion) - Port 8000
├── safetyvision/         # FastAPI (Construction Safety) - Port 8001
│   └── backend/
└── frontend/             # React (Tous les modules intégrés) - Port 5173
    ├── src/
    │   ├── pages/
    │   │   ├── ContructionPerform.tsx    # Construction Performance
    │   │   ├── Ham10000LabPage.tsx       # HAM10000 Lab
    │   │   └── SafetyVisionPage.tsx      # SafetyVision (NOUVEAU)
    │   └── api/
    │       └── safetyVisionApi.ts        # API Client SafetyVision
```

## 🚀 Commandes Rapides

### Démarrer tout le projet

```bash
# Terminal 1 : Backend Construction Performance (Flask)
cd backend
python app.py

# Terminal 2 : Backend HAM10000 (FastAPI)
cd safety
python main.py

# Terminal 3 : Backend SafetyVision (FastAPI) - NOUVEAU
cd safetyvision/backend
python -m uvicorn app.main:app --reload --port 8001

# Terminal 4 : Frontend (React)
cd frontend
npm run dev
```

### URLs

- **Frontend** : http://localhost:5173
- **SafetyVision Page** : http://localhost:5173/safetyvision
- **SafetyVision API** : http://localhost:8001
- **SafetyVision Docs** : http://localhost:8001/docs

## 📄 Licence

Ce projet est développé dans le cadre d'un projet de groupe universitaire.

## 👥 Auteurs

- Votre équipe de projet

---

**Note importante** : N'oubliez pas de placer le modèle `best.pt` dans `safetyvision/backend/model/` avant de lancer le backend !
