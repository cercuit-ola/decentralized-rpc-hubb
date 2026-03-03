import { LiveRpcProvider, type RpcHealthResponse } from "@/hooks/useRpcHealth";

// Fallback mock data used when live data is unavailable
export interface RpcProvider {
  id: string;
  name: string;
  type: 'light-client' | 'p2p' | 'decentralized' | 'centralized';
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  uptimePercent: number;
  censorshipScore: number;
  blockHeight: number;
  region: string;
  nodeCount: number;
  lastChecked: string;
  latencyHistory: number[];
}

// Censorship scores are static metadata (not measurable via RPC)
const censorshipScores: Record<string, number> = {
  ankr: 78, pokt: 92, blastapi: 75, blockpi: 77, publicnode: 85, chainstack: 55,
  llamarpc: 82, drpc: 80, onerpc: 88, lava: 86, tenderly: 50, onfinality: 74,
  cloudflare: 60, mew: 58, runonflux: 83, ethcall: 79, payload: 62, notadegen: 84,
  mevblocker: 92, flashbots: 90, securerpc: 88, builder0x69: 85,
  omniatech: 76, rpcfast: 72, etherspot: 78, oasis: 88,
};

const nodeEstimates: Record<string, number> = {
  ankr: 1500, pokt: 45000, blastapi: 800, blockpi: 500, publicnode: 200, chainstack: 350,
  llamarpc: 300, drpc: 620, onerpc: 400, lava: 1200, tenderly: 50, onfinality: 180,
  cloudflare: 1, mew: 50, runonflux: 12000, ethcall: 100, payload: 30, notadegen: 80,
  mevblocker: 150, flashbots: 100, securerpc: 120, builder0x69: 60,
  omniatech: 250, rpcfast: 90, etherspot: 70, oasis: 400,
};

// Keep a rolling history of latencies per provider
const latencyHistories: Record<string, number[]> = {};

export function enrichLiveProvider(p: LiveRpcProvider): RpcProvider {
  // Maintain rolling 15-point history
  if (!latencyHistories[p.id]) {
    latencyHistories[p.id] = Array(15).fill(p.latencyMs);
  }
  const hist = latencyHistories[p.id];
  hist.push(p.latencyMs);
  if (hist.length > 15) hist.shift();

  return {
    ...p,
    uptimePercent: p.status === 'healthy' ? 99.5 : p.status === 'degraded' ? 96.0 : 0,
    censorshipScore: censorshipScores[p.id] ?? 70,
    nodeCount: nodeEstimates[p.id] ?? 100,
    lastChecked: 'just now',
    latencyHistory: [...hist],
  };
}

export function enrichLiveData(data: RpcHealthResponse) {
  const providers = data.providers.map(enrichLiveProvider);
  const decentralized = providers.filter(p => p.type !== 'centralized');
  const decShare = providers.length > 0 ? Math.round((decentralized.length / providers.length) * 1000) / 10 : 0;

  return {
    providers,
    stats: {
      ...data.stats,
      avgUptime: Math.round(providers.reduce((s, p) => s + p.uptimePercent, 0) / providers.length * 10) / 10,
      decentralizedShare: decShare,
      totalNodes: providers.reduce((s, p) => s + p.nodeCount, 0),
    },
  };
}

// Fallback latency chart data (used until we have enough live history)
export const latencyOverTime = [
  { time: '00:00', helios: 52, portal: 130, lava: 72, centralized: 25 },
  { time: '02:00', helios: 48, portal: 125, lava: 65, centralized: 24 },
  { time: '04:00', helios: 45, portal: 118, lava: 70, centralized: 22 },
  { time: '06:00', helios: 50, portal: 122, lava: 68, centralized: 26 },
  { time: '08:00', helios: 42, portal: 115, lava: 75, centralized: 23 },
  { time: '10:00', helios: 47, portal: 128, lava: 63, centralized: 24 },
  { time: '12:00', helios: 44, portal: 120, lava: 68, centralized: 22 },
  { time: '14:00', helios: 46, portal: 119, lava: 71, centralized: 25 },
  { time: '16:00', helios: 43, portal: 125, lava: 66, centralized: 23 },
  { time: '18:00', helios: 45, portal: 121, lava: 69, centralized: 24 },
  { time: '20:00', helios: 48, portal: 118, lava: 67, centralized: 22 },
  { time: '22:00', helios: 41, portal: 116, lava: 70, centralized: 23 },
];

export const geoDistribution = [
  { region: 'North America', nodes: 8500, percentage: 25.3 },
  { region: 'Europe', nodes: 11200, percentage: 33.4 },
  { region: 'Asia Pacific', nodes: 7800, percentage: 23.2 },
  { region: 'South America', nodes: 2100, percentage: 6.3 },
  { region: 'Africa', nodes: 1200, percentage: 3.6 },
  { region: 'Middle East', nodes: 2771, percentage: 8.2 },
];
