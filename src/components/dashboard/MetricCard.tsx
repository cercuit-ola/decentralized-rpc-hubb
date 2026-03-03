import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  glowColor?: "primary" | "accent" | "warning";
}

const MetricCard = ({ label, value, suffix, icon, trend, trendValue, glowColor = "primary" }: MetricCardProps) => {
  const glowClass = {
    primary: "glow-primary",
    accent: "glow-accent",
    warning: "glow-warning",
  }[glowColor];

  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";

  return (
    <div className={`relative bg-card border border-border rounded-lg p-5 ${glowClass} animate-slide-up`}>
      <div className="absolute inset-0 scanline rounded-lg" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
          <span className="text-primary opacity-70">{icon}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-mono font-bold text-foreground text-glow-primary">{value}</span>
          {suffix && <span className="text-sm font-mono text-muted-foreground">{suffix}</span>}
        </div>
        {trend && trendValue && (
          <div className={`mt-2 text-xs font-mono ${trendColor}`}>
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "●"} {trendValue}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
