import { type RpcProvider } from "@/data/mockRpcData";
import StatusBadge from "./StatusBadge";
import SparklineChart from "./SparklineChart";
import { Shield, Zap, Globe, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { useState, useMemo } from "react";

const typeLabel = (type: RpcProvider['type']) => {
  const map = {
    'light-client': { label: 'Light Client', cls: 'text-primary border-primary/30 bg-primary/10' },
    'p2p': { label: 'P2P', cls: 'text-accent border-accent/30 bg-accent/10' },
    'decentralized': { label: 'Decentralized', cls: 'text-success border-success/30 bg-success/10' },
    'centralized': { label: 'Centralized', cls: 'text-destructive border-destructive/30 bg-destructive/10' },
  };
  const t = map[type];
  return <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded ${t.cls}`}>{t.label}</span>;
};

const censorshipColor = (score: number) => {
  if (score >= 85) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
};

type SortKey = 'name' | 'latencyMs' | 'uptimePercent' | 'censorshipScore' | 'nodeCount';
type SortDir = 'asc' | 'desc';

interface ProviderTableProps {
  providers: RpcProvider[];
}

const chipCls = (active: boolean) =>
  `px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider border cursor-pointer transition-colors ${
    active
      ? 'border-primary/60 bg-primary/20 text-primary'
      : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
  }`;

const ProviderTable = ({ providers }: ProviderTableProps) => {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('latencyMs');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const regions = useMemo(() => [...new Set(providers.map(p => p.region))].sort(), [providers]);
  const types = useMemo(() => [...new Set(providers.map(p => p.type))].sort(), [providers]);

  const filtered = useMemo(() => {
    let list = providers;
    if (statusFilter) list = list.filter(p => p.status === statusFilter);
    if (typeFilter) list = list.filter(p => p.type === typeFilter);
    if (regionFilter) list = list.filter(p => p.region === regionFilter);
    return [...list].sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      const cmp = typeof av === 'string' ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [providers, statusFilter, typeFilter, regionFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const hasFilters = statusFilter || typeFilter || regionFilter;

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={() => toggleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={`w-2.5 h-2.5 ${sortKey === field ? 'text-primary' : 'text-muted-foreground/40'}`} />
      </span>
    </th>
  );

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden animate-slide-up">
      {/* Header + Filters */}
      <div className="px-5 py-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-foreground">RPC Provider Benchmark</h3>
            <span className="text-[10px] font-mono text-muted-foreground ml-1">({filtered.length}/{providers.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            {hasFilters && (
              <button
                onClick={() => { setStatusFilter(null); setTypeFilter(null); setRegionFilter(null); }}
                className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-destructive border border-destructive/30 rounded hover:bg-destructive/10 transition-colors"
              >
                <X className="w-2.5 h-2.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-muted-foreground uppercase mr-1">Status</span>
            {['healthy', 'degraded', 'down'].map(s => (
              <button key={s} className={chipCls(statusFilter === s)} onClick={() => setStatusFilter(statusFilter === s ? null : s)}>
                {s}
              </button>
            ))}
          </div>
          {/* Type */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-muted-foreground uppercase mr-1">Type</span>
            {types.map(t => (
              <button key={t} className={chipCls(typeFilter === t)} onClick={() => setTypeFilter(typeFilter === t ? null : t)}>
                {t}
              </button>
            ))}
          </div>
          {/* Region */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-muted-foreground uppercase mr-1">Region</span>
            <select
              value={regionFilter ?? ''}
              onChange={e => setRegionFilter(e.target.value || null)}
              className="bg-secondary/50 border border-border text-[10px] font-mono text-foreground rounded px-2 py-1 focus:outline-none focus:border-primary/50"
            >
              <option value="">All</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <SortHeader label="Provider" field="name" />
              <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Status</th>
              <SortHeader label="Latency" field="latencyMs" />
              <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Trend</th>
              <SortHeader label="Uptime" field="uptimePercent" />
              <SortHeader label="Censorship Resistance" field="censorshipScore" />
              <SortHeader label="Nodes" field="nodeCount" />
              <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Region</th>
              <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Block</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm font-mono font-medium text-foreground">{p.name}</span>
                </td>
                <td className="px-4 py-3">{typeLabel(p.type)}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono text-foreground">{p.latencyMs}<span className="text-muted-foreground text-xs">ms</span></span>
                </td>
                <td className="px-4 py-3">
                  <SparklineChart data={p.latencyHistory} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono text-foreground">{p.uptimePercent}%</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-3 h-3 ${censorshipColor(p.censorshipScore)}`} />
                    <span className={`text-sm font-mono font-semibold ${censorshipColor(p.censorshipScore)}`}>{p.censorshipScore}</span>
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${p.censorshipScore}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono text-foreground">{p.nodeCount.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-mono text-muted-foreground">{p.region}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono text-muted-foreground">{p.blockHeight.toLocaleString()}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-sm font-mono text-muted-foreground">
                  No providers match the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProviderTable;
