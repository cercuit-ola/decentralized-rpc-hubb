interface StatusBadgeProps {
  status: 'healthy' | 'degraded' | 'down';
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = {
    healthy: { label: 'Healthy', dotClass: 'bg-success animate-pulse-glow', textClass: 'text-success' },
    degraded: { label: 'Degraded', dotClass: 'bg-warning', textClass: 'text-warning' },
    down: { label: 'Down', dotClass: 'bg-destructive', textClass: 'text-destructive' },
  }[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.dotClass}`} />
      <span className={`text-xs font-mono uppercase tracking-wider ${config.textClass}`}>{config.label}</span>
    </div>
  );
};

export default StatusBadge;
