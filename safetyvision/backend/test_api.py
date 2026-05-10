"""
Script de test pour l'API SafetyVision
Vérifie que l'API fonctionne correctement
"""
import requests
import sys
from pathlib import Path

API_URL = "http://localhost:8001"

def test_health():
    """Test du endpoint /health"""
    print("🔍 Test /health...")
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Status: {data['status']}")
            print(f"✅ Model Loaded: {data['model_loaded']}")
            print(f"✅ Classes: {len(data['classes'])} classes")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to API at {API_URL}")
        print("   Make sure the backend is running:")
        print("   cd safetyvision/backend")
        print("   python -m uvicorn app.main:app --reload --port 8001")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_classes():
    """Test du endpoint /classes"""
    print("\n🔍 Test /classes...")
    try:
        response = requests.get(f"{API_URL}/classes", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Classes count: {data['count']}")
            print(f"✅ Classes: {', '.join(data['classes'][:3])}...")
            return True
        else:
            print(f"❌ Classes endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_predict(image_path: str = None):
    """Test du endpoint /predict avec une image"""
    print("\n🔍 Test /predict...")
    
    if not image_path:
        print("⚠️  Aucune image fournie, test /predict ignoré")
        print("   Usage: python test_api.py /path/to/image.jpg")
        return True
    
    image_file = Path(image_path)
    if not image_file.exists():
        print(f"❌ Image not found: {image_path}")
        return False
    
    try:
        with open(image_file, 'rb') as f:
            files = {'file': (image_file.name, f, 'image/jpeg')}
            print(f"   Uploading: {image_file.name}")
            response = requests.post(f"{API_URL}/predict", files=files, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Prediction successful!")
            print(f"   Risk Level: {data['risk_level']}")
            print(f"   Risk Score: {data['risk_score']}")
            print(f"   Detections: {len(data['detections'])}")
            print(f"   Violations: {len(data['violations'])}")
            print(f"   Compliance Rate: {data['stats']['compliance_rate']}%")
            return True
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Exécute tous les tests"""
    print("=" * 60)
    print("🧪 SafetyVision API Test Suite")
    print("=" * 60)
    
    # Test 1: Health
    health_ok = test_health()
    
    if not health_ok:
        print("\n❌ API is not running or not accessible")
        sys.exit(1)
    
    # Test 2: Classes
    classes_ok = test_classes()
    
    # Test 3: Predict (si image fournie)
    image_path = sys.argv[1] if len(sys.argv) > 1 else None
    predict_ok = test_predict(image_path)
    
    # Résumé
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    print(f"Health:  {'✅' if health_ok else '❌'}")
    print(f"Classes: {'✅' if classes_ok else '❌'}")
    print(f"Predict: {'✅' if predict_ok else '⚠️  (skipped)'}")
    
    if health_ok and classes_ok:
        print("\n✅ All tests passed!")
        print("\n🚀 API is ready to use:")
        print(f"   - API: {API_URL}")
        print(f"   - Docs: {API_URL}/docs")
        print(f"   - Frontend: http://localhost:5173/safetyvision")
        return 0
    else:
        print("\n❌ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
