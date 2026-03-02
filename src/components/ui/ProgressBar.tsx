interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, max = 100, color = 'bg-primary-600', label, className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={className}>
      {label && <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{label}</span><span>{Math.round(pct)}%</span></div>}
      <div className="h-2 rounded-full bg-gray-200">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
