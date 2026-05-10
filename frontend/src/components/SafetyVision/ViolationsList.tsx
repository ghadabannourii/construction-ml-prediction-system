import { Violation } from '../../api/safetyVisionApi';
import { AlertCircle, AlertTriangle, Skull } from 'lucide-react';

type ViolationsListProps = {
  violations: Violation[];
};

export default function ViolationsList({ violations }: ViolationsListProps) {
  if (violations.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">✅</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Aucune violation détectée</h3>
        <p className="text-sm text-slate-400">
          Excellent travail ! Toutes les mesures de sécurité sont respectées.
        </p>
      </div>
    );
  }

  const getSeverityConfig = (severity: number) => {
    if (severity >= 3) {
      return {
        icon: Skull,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        label: 'CRITIQUE',
      };
    } else if (severity >= 2) {
      return {
        icon: AlertCircle,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        borderColor: 'border-orange-500/30',
        label: 'ÉLEVÉ',
      };
    } else {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/30',
        label: 'MODÉRÉ',
      };
    }
  };

  return (
    <div className="glass rounded-2xl p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Violations Détectées ({violations.length})
        </h3>
        <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
          <span className="text-xs font-semibold text-red-400">
            {violations.filter(v => v.severity >= 2).length} critique{violations.filter(v => v.severity >= 2).length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {violations.map((violation, index) => {
          const config = getSeverityConfig(violation.severity);
          const Icon = config.icon;

          return (
            <div
              key={index}
              className={`
                p-4 rounded-xl border ${config.borderColor} ${config.bgColor}
                hover:scale-[1.02] transition-transform
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center shrink-0`}>
                  <Icon size={20} className={config.color} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold ${config.color} uppercase tracking-wider`}>
                      {config.label}
                    </span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs font-mono text-slate-400">{violation.type}</span>
                  </div>
                  
                  <p className="text-sm text-white font-medium">
                    {violation.message}
                  </p>

                  {violation.bbox && (
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      Position: ({violation.bbox.x1.toFixed(0)}, {violation.bbox.y1.toFixed(0)})
                    </p>
                  )}
                </div>

                {/* Indicateur de sévérité */}
                <div className="flex flex-col gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < violation.severity ? config.color.replace('text-', 'bg-') : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
