import { type RpcProvider } from "@/data/mockRpcData";
import { ShieldCheck } from "lucide-react";

interface CensorshipScoreCardProps {
  providers: RpcProvider[];
}

const CensorshipScoreCard = ({ providers }: CensorshipScoreCardProps) => {
  const sorted = [...providers].sort((a, b) => b.censorshipScore - a.censorshipScore);

  return (
    <div className="bg-card border border-border rounded-lg p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-foreground">Censorship Resistance Ranking</h3>
      </div>
      <div className="space-y-2">
        {sorted.map((p, i) => {
          const color = p.censorshipScore >= 85 ? 'bg-success' : p.censorshipScore >= 60 ? 'bg-warning' : 'bg-destructive';
          return (
            <div key={p.id} className="flex items-center gap-3 py-1.5">
              <span className="text-xs font-mono text-muted-foreground w-4">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-foreground truncate">{p.name}</span>
                  <span className="text-xs font-mono font-bold text-foreground">{p.censorshipScore}</span>
                </div>
                <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${p.censorshipScore}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CensorshipScoreCard;
