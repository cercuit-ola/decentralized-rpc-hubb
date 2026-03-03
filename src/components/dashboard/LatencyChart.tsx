import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { latencyOverTime } from "@/data/mockRpcData";
import { Activity } from "lucide-react";

const LatencyChart = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-foreground">Latency Over Time (24h)</h3>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={latencyOverTime}>
          <defs>
            <linearGradient id="heliosGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(152 100% 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(152 100% 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="portalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(185 100% 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(185 100% 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lavaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="centralGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0 80% 55%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(0 80% 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 14%)" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: 'hsl(220 10% 50%)' }} />
          <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: 'hsl(220 10% 50%)' }} unit="ms" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(220 18% 7%)',
              border: '1px solid hsl(220 15% 14%)',
              borderRadius: '8px',
              fontFamily: 'JetBrains Mono',
              fontSize: '11px',
            }}
          />
          <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }} />
          <Area type="monotone" dataKey="helios" stroke="hsl(152 100% 50%)" fill="url(#heliosGrad)" strokeWidth={2} name="Helios" />
          <Area type="monotone" dataKey="portal" stroke="hsl(185 100% 50%)" fill="url(#portalGrad)" strokeWidth={2} name="Portal" />
          <Area type="monotone" dataKey="lava" stroke="hsl(38 92% 50%)" fill="url(#lavaGrad)" strokeWidth={2} name="Lava" />
          <Area type="monotone" dataKey="centralized" stroke="hsl(0 80% 55%)" fill="url(#centralGrad)" strokeWidth={1.5} strokeDasharray="5 5" name="Centralized Avg" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LatencyChart;
