import { SafetyStats } from '../../api/safetyVisionApi';
import { Users, HardHat, ShieldCheck, AlertTriangle, TrendingUp, Cone } from 'lucide-react';

type StatsCardProps = {
  stats: SafetyStats;
};

export default function StatsCard({ stats }: StatsCardProps) {
  const statItems = [
    {
      icon: Users,
      label: 'Personnes détectées',
      value: stats.total_persons,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      icon: HardHat,
      label: 'Avec casque',
      value: stats.workers_with_hardhat,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      icon: ShieldCheck,
      label: 'Avec gilet',
      value: stats.workers_with_vest,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
    },
    {
      icon: AlertTriangle,
      label: 'Sans casque',
      value: stats.workers_without_hardhat,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
    },
    {
      icon: AlertTriangle,
      label: 'Sans gilet',
      value: stats.workers_without_vest,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
    },
    {
      icon: Cone,
      label: 'Cônes de sécurité',
      value: stats.safety_cones,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
  ];

  return (
    <div className="glass rounded-2xl p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Statistiques de Sécurité</h3>
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-slate-400" />
          <span className="text-xs text-slate-400">Analyse en temps réel</span>
        </div>
      </div>

      {/* Taux de conformité */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">Taux de conformité</span>
          <span className="text-2xl font-bold text-purple-400">
            {stats.compliance_rate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-700"
            style={{ width: `${stats.compliance_rate}%` }}
          />
        </div>
      </div>

      {/* Grille de stats */}
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                <item.icon size={20} className={item.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 truncate">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Engins dangereux */}
      {stats.dangerous_objects > 0 && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">
              {stats.dangerous_objects} engin{stats.dangerous_objects > 1 ? 's' : ''} dangereux détecté{stats.dangerous_objects > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-red-400/80">Vigilance accrue requise</p>
          </div>
        </div>
      )}
    </div>
  );
}
