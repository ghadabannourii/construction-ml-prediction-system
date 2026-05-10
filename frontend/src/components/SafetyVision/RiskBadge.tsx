import { RiskConfig } from '../../api/safetyVisionApi';

type RiskBadgeProps = {
  riskConfig: RiskConfig;
  riskScore: number;
  size?: 'sm' | 'md' | 'lg';
};

export default function RiskBadge({ riskConfig, riskScore, size = 'md' }: RiskBadgeProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const emojiSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full font-semibold
        ${sizeClasses[size]}
        shadow-lg
      `}
      style={{
        backgroundColor: `${riskConfig.color}20`,
        border: `2px solid ${riskConfig.color}`,
        color: riskConfig.color,
      }}
    >
      <span className={emojiSizes[size]}>{riskConfig.emoji}</span>
      <span>{riskConfig.label}</span>
      <span className="opacity-75">·</span>
      <span className="font-mono">{riskScore.toFixed(1)}/10</span>
    </div>
  );
}
