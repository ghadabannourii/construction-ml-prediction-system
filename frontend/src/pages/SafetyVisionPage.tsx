import { useState, useEffect } from 'react';
import { 
  HardHat, Upload, Zap, Shield, Users, AlertTriangle, 
  CheckCircle2, XCircle, TrendingUp, Eye, FileText, RefreshCw,
  Activity, ChevronRight, Loader2, Sparkles
} from 'lucide-react';
import { 
  checkHealth, 
  analyzeImage, 
  AnalysisResponse 
} from '../api/safetyVisionApi';

type ApiStatus = 'loading' | 'ready' | 'error';

export default function SafetyVisionPage() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('loading');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        await checkHealth();
        setApiStatus('ready');
      } catch (err) {
        setApiStatus('error');
      }
    };
    checkApiHealth();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setError('');

    try {
      const response = await analyzeImage(selectedFile);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setResult(null);
    setError('');
  };

  const getRiskColor = (level: string) => {
    const colors = {
      SAFE: '#10b981',
      WARNING: '#eab308',
      HIGH_RISK: '#f97316',
      CRITICAL: '#ef4444'
    };
    return colors[level as keyof typeof colors] || '#10b981';
  };

  return (
    <div className="safetyvision-app">
      {/* Hero Title */}
      <div className="hero-title">
        <div className="title-icon">
          <HardHat size={48} />
          <Sparkles size={24} className="sparkle" />
        </div>
        <h1>RISK SAFETY DETECTION</h1>
        <p>Détection intelligente de risques sur chantier avec YOLOv8</p>
        <div className={`api-badge ${apiStatus}`}>
          <span className="dot"></span>
          {apiStatus === 'ready' ? 'API Connectée' : apiStatus === 'error' ? 'API Hors ligne' : 'Connexion...'}
        </div>
      </div>

      <div className="container">
        {/* Upload Area */}
        {!result && !analyzing && (
          <div 
            className={`upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <label className="upload-label">
              <input type="file" accept="image/*" onChange={handleFileSelect} hidden />
              <div className="upload-content">
                <Upload size={56} strokeWidth={1.5} />
                <h3>Glissez-déposez votre image</h3>
                <p>ou cliquez pour parcourir</p>
                <span className="hint">JPG, PNG, JPEG · Max 10MB</span>
              </div>
            </label>
          </div>
        )}

        {/* Preview & Analyze */}
        {selectedFile && !result && !analyzing && (
          <div className="preview-area">
            <img src={previewUrl} alt="Preview" className="preview-img" />
            <div className="preview-actions">
              <button onClick={handleAnalyze} className="btn-analyze">
                <Zap size={20} />
                Analyser l'image
              </button>
              <button onClick={handleReset} className="btn-cancel">Changer d'image</button>
            </div>
          </div>
        )}

        {/* Loading */}
        {analyzing && (
          <div className="loading-area">
            <Loader2 size={48} className="spinner" />
            <h3>Analyse en cours...</h3>
            <p>Détection YOLOv8 · Calcul des risques · Génération du rapport</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-area">
            <AlertTriangle size={24} />
            <div>
              <strong>Erreur</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Risk Score Card */}
            <div className="risk-card" style={{ borderColor: getRiskColor(result.risk_level) }}>
              <div className="risk-header">
                <div className="risk-left">
                  <span className="risk-emoji">{result.risk_config.emoji}</span>
                  <div>
                    <div className="risk-label">NIVEAU DE RISQUE</div>
                    <div className="risk-value" style={{ color: getRiskColor(result.risk_level) }}>
                      {result.risk_config.label}
                    </div>
                  </div>
                </div>
                <div className="risk-score">
                  <span className="score-number">{result.risk_score}</span>
                  <span className="score-max">/10</span>
                </div>
              </div>
              <div className="risk-bar">
                <div className="risk-fill" style={{ width: `${Math.min(result.risk_score * 10, 100)}%`, background: getRiskColor(result.risk_level) }} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <Users size={24} color="#3b82f6" />
                <div className="stat-value">{result.stats.total_persons}</div>
                <div className="stat-label">Personnes</div>
              </div>
              <div className="stat-card">
                <CheckCircle2 size={24} color="#10b981" />
                <div className="stat-value">{result.stats.workers_with_hardhat}</div>
                <div className="stat-label">Avec casque</div>
              </div>
              <div className="stat-card">
                <XCircle size={24} color="#ef4444" />
                <div className="stat-value">{result.stats.workers_without_hardhat}</div>
                <div className="stat-label">Sans casque</div>
              </div>
              <div className="stat-card">
                <Shield size={24} color="#10b981" />
                <div className="stat-value">{result.stats.workers_with_vest}</div>
                <div className="stat-label">Avec gilet</div>
              </div>
              <div className="stat-card">
                <TrendingUp size={24} color="#a855f7" />
                <div className="stat-value">{result.stats.compliance_rate.toFixed(0)}%</div>
                <div className="stat-label">Conformité</div>
              </div>
              <div className="stat-card">
                <AlertTriangle size={24} color="#f97316" />
                <div className="stat-value">{result.stats.dangerous_objects}</div>
                <div className="stat-label">Engins dangereux</div>
              </div>
            </div>

            {/* Violations */}
            {result.violations.length > 0 && (
              <div className="violations-card">
                <div className="card-header">
                  <AlertTriangle size={20} color="#ef4444" />
                  <h3>Violations détectées</h3>
                  <span className="badge">{result.violations.length}</span>
                </div>
                {result.violations.map((v, i) => (
                  <div key={i} className={`violation-item severity-${v.severity}`}>
                    <span className="violation-icon">
                      {v.severity >= 3 ? '🔴' : v.severity >= 2 ? '⚠️' : '⚡'}
                    </span>
                    <span className="violation-text">{v.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Annotated Image */}
            <div className="image-card">
              <div className="card-header">
                <Eye size={20} color="#f97316" />
                <h3>Résultat de détection</h3>
                <span className="badge">{result.detections.length} objets</span>
              </div>
              <img 
                src={`data:image/jpeg;base64,${result.annotated_image}`}
                alt="Annotated"
                className="annotated-img"
              />
            </div>

            {/* Report */}
            <div className="report-card">
              <div className="card-header">
                <FileText size={20} color="#10b981" />
                <h3>Rapport complet</h3>
              </div>
              <pre className="report-text">{result.report}</pre>
            </div>

            {/* Reset Button */}
            <button onClick={handleReset} className="btn-new">
              <RefreshCw size={18} />
              Nouvelle analyse
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .safetyvision-app {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0f1a 0%, #0f172a 50%, #1e1b4b 100%);
          font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
        }

        /* Hero Title */
        .hero-title {
          text-align: center;
          padding: 60px 24px 40px;
          position: relative;
          overflow: hidden;
        }

        .hero-title::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .title-icon {
          position: relative;
          display: inline-block;
          margin-bottom: 24px;
        }

        .title-icon svg:first-child {
          background: linear-gradient(135deg, #f97316, #dc2626);
          padding: 16px;
          border-radius: 28px;
          color: white;
        }

        .sparkle {
          position: absolute;
          top: -8px;
          right: -12px;
          color: #fbbf24;
          animation: sparkle 2s ease-in-out infinite;
        }

        .hero-title h1 {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, #f97316 50%, #dc2626 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }

        @media (min-width: 768px) {
          .hero-title h1 {
            font-size: 3.5rem;
          }
        }

        .hero-title p {
          color: #94a3b8;
          font-size: 1rem;
          margin-bottom: 20px;
        }

        .api-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .api-badge .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .api-badge.ready .dot { background: #10b981; box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite; }
        .api-badge.error .dot { background: #ef4444; }
        .api-badge.loading .dot { background: #eab308; animation: pulse 1s infinite; }

        /* Container */
        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 24px 60px;
        }

        /* Upload Area */
        .upload-area {
          background: rgba(255, 255, 255, 0.02);
          border: 2px dashed rgba(255, 255, 255, 0.15);
          border-radius: 32px;
          transition: all 0.3s ease;
        }

        .upload-area.drag-active {
          border-color: #f97316;
          background: rgba(249, 115, 22, 0.05);
        }

        .upload-area:hover {
          border-color: #f97316;
          background: rgba(249, 115, 22, 0.03);
        }

        .upload-label {
          display: block;
          cursor: pointer;
        }

        .upload-content {
          padding: 60px 40px;
          text-align: center;
        }

        .upload-content svg {
          color: #f97316;
          margin-bottom: 20px;
        }

        .upload-content h3 {
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .upload-content p {
          color: #94a3b8;
          margin-bottom: 12px;
        }

        .hint {
          display: inline-block;
          font-size: 0.75rem;
          color: #64748b;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 12px;
          border-radius: 100px;
        }

        /* Preview */
        .preview-area {
          text-align: center;
        }

        .preview-img {
          max-width: 100%;
          max-height: 400px;
          border-radius: 24px;
          margin-bottom: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .preview-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-analyze {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          background: linear-gradient(135deg, #f97316, #dc2626);
          border: none;
          border-radius: 100px;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-analyze:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(249, 115, 22, 0.4);
        }

        .btn-cancel {
          padding: 14px 28px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 100px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-cancel:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Loading */
        .loading-area {
          text-align: center;
          padding: 60px 20px;
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: #f97316;
          margin-bottom: 20px;
        }

        .loading-area h3 {
          color: white;
          font-size: 1.5rem;
          margin-bottom: 8px;
        }

        .loading-area p {
          color: #94a3b8;
        }

        /* Error */
        .error-area {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 16px;
          color: #fca5a5;
        }

        /* Risk Card */
        .risk-card {
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid;
          border-radius: 28px;
          padding: 28px;
          margin-bottom: 32px;
        }

        .risk-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 20px;
        }

        .risk-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .risk-emoji {
          font-size: 3.5rem;
        }

        .risk-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #94a3b8;
        }

        .risk-value {
          font-size: 1.75rem;
          font-weight: 800;
        }

        .risk-score {
          text-align: right;
        }

        .score-number {
          font-size: 2.5rem;
          font-weight: 800;
        }

        .score-max {
          font-size: 1rem;
          color: #94a3b8;
        }

        .risk-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .risk-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s ease;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.05);
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: white;
          margin: 12px 0 4px;
        }

        .stat-label {
          font-size: 0.7rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Violations */
        .violations-card {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 20px;
          margin-bottom: 32px;
          overflow: hidden;
        }

        .violation-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .violation-item:last-child {
          border-bottom: none;
        }

        .violation-item.severity-3 { border-left: 3px solid #ef4444; }
        .violation-item.severity-2 { border-left: 3px solid #f97316; }
        .violation-item.severity-1 { border-left: 3px solid #eab308; }

        .violation-icon {
          font-size: 1.25rem;
        }

        .violation-text {
          color: #e2e8f0;
          font-size: 0.9rem;
        }

        /* Image Card */
        .image-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 32px;
        }

        .annotated-img {
          width: 100%;
          height: auto;
          display: block;
        }

        /* Report Card */
        .report-card {
          background: rgba(10, 14, 39, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 32px;
        }

        .report-text {
          padding: 24px;
          margin: 0;
          font-family: 'SF Mono', 'Monaco', monospace;
          font-size: 0.8rem;
          line-height: 1.6;
          color: #cbd5e1;
          white-space: pre-wrap;
          background: transparent;
        }

        /* Card Header */
        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .card-header h3 {
          color: white;
          font-size: 1rem;
          font-weight: 600;
        }

        .badge {
          margin-left: auto;
          padding: 2px 10px;
          background: rgba(249, 115, 22, 0.2);
          border-radius: 100px;
          font-size: 0.7rem;
          color: #f97316;
          font-weight: 600;
        }

        /* New Analysis Button */
        .btn-new {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 16px;
          background: transparent;
          border: 2px solid rgba(249, 115, 22, 0.4);
          border-radius: 100px;
          color: #f97316;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-new:hover {
          background: rgba(249, 115, 22, 0.1);
          border-color: #f97316;
          transform: translateY(-2px);
        }

        /* Animations */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            padding: 40px 20px 30px;
          }
          
          .hero-title h1 {
            font-size: 1.75rem;
          }
          
          .container {
            padding: 0 16px 40px;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          
          .risk-header {
            flex-direction: column;
            text-align: center;
          }
          
          .risk-left {
            flex-direction: column;
          }
          
          .risk-score {
            text-align: center;
          }
          
          .upload-content {
            padding: 40px 20px;
          }
          
          .upload-content h3 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}