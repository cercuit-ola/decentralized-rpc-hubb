import { geoDistribution } from "@/data/mockRpcData";
import { MapPin } from "lucide-react";

const GeoDistribution = () => {
  const maxNodes = Math.max(...geoDistribution.map(g => g.nodes));

  return (
    <div className="bg-card border border-border rounded-lg p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-foreground">Geographic Distribution</h3>
      </div>
      <div className="space-y-3">
        {geoDistribution.map((geo) => (
          <div key={geo.region}>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-mono text-foreground">{geo.region}</span>
              <span className="text-xs font-mono text-muted-foreground">
                {geo.nodes.toLocaleString()} nodes ({geo.percentage}%)
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(geo.nodes / maxNodes) * 100}%`,
                  background: `linear-gradient(90deg, hsl(152 100% 50%), hsl(185 100% 50%))`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeoDistribution;
