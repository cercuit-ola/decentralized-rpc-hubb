import { useQuery } from "@tanstack/react-query";

export interface LiveRpcProvider {
  id: string;
  name: string;
  type: 'light-client' | 'p2p' | 'decentralized' | 'centralized';
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  blockHeight: number;
  region: string;
}

export interface RpcHealthResponse {
  providers: LiveRpcProvider[];
  stats: {
    totalProviders: number;
    healthyProviders: number;
    avgLatency: number;
    currentBlock: number;
  };
  timestamp: string;
}

interface RpcEndpoint {
  id: string;
  name: string;
  type: LiveRpcProvider['type'];
  url: string;
  region: string;
}

const RPC_ENDPOINTS: RpcEndpoint[] = [
  // Tier 1 — Major providers (public endpoints)
  { id: 'ankr', name: 'Ankr Protocol', type: 'decentralized', url: 'https://rpc.ankr.com/eth', region: 'Global' },
  { id: 'pokt', name: 'Pocket Network', type: 'decentralized', url: 'https://eth-mainnet.gateway.pokt.network/v1/lb/62e208b7a3457c003985a6c6', region: 'Global' },
  { id: 'blastapi', name: 'Blast API', type: 'decentralized', url: 'https://eth-mainnet.public.blastapi.io', region: 'EU / US' },
  { id: 'blockpi', name: 'BlockPI', type: 'decentralized', url: 'https://ethereum.blockpi.network/v1/rpc/public', region: 'Global' },
  { id: 'publicnode', name: 'PublicNode', type: 'decentralized', url: 'https://ethereum-rpc.publicnode.com', region: 'Global' },
  { id: 'chainstack', name: 'Chainstack', type: 'centralized', url: 'https://ethereum-mainnet.core.chainstack.com', region: 'Multi-Region' },

  // Tier 2 — Notable providers
  { id: 'llamarpc', name: 'LlamaRPC', type: 'decentralized', url: 'https://eth.llamarpc.com', region: 'Multi-Region' },
  { id: 'drpc', name: 'dRPC', type: 'decentralized', url: 'https://eth.drpc.org', region: 'EU / US' },
  { id: 'onerpc', name: '1RPC (Automata)', type: 'decentralized', url: 'https://1rpc.io/eth', region: 'Global' },
  { id: 'lava', name: 'Lava Network', type: 'decentralized', url: 'https://eth1.lava.build/lava-referer-2e3e1e22-fca0-4a8d-8a28-4485ec535bf3/', region: 'Global' },
  { id: 'tenderly', name: 'Tenderly', type: 'centralized', url: 'https://gateway.tenderly.co/public/mainnet', region: 'EU' },
  { id: 'onfinality', name: 'OnFinality', type: 'decentralized', url: 'https://eth.api.onfinality.io/public', region: 'Asia Pacific' },

  // Public / Free endpoints
  { id: 'cloudflare', name: 'Cloudflare ETH', type: 'decentralized', url: 'https://cloudflare-eth.com', region: 'Global CDN' },
  { id: 'mew', name: 'MEW (MyEtherWallet)', type: 'centralized', url: 'https://nodes.mewapi.io/rpc/eth', region: 'Global' },
  { id: 'runonflux', name: 'RunOnFlux', type: 'decentralized', url: 'https://eth.runonflux.io', region: 'Global' },
  { id: 'ethcall', name: 'eth.merkle.io', type: 'decentralized', url: 'https://eth.merkle.io', region: 'Global' },
  { id: 'payload', name: 'Payload', type: 'centralized', url: 'https://rpc.payload.de', region: 'EU' },
  { id: 'notadegen', name: 'notadegen', type: 'decentralized', url: 'https://rpc.notadegen.com/eth', region: 'Global' },

  // Specialty — MEV protection & privacy
  { id: 'mevblocker', name: 'MEV Blocker', type: 'decentralized', url: 'https://rpc.mevblocker.io', region: 'Global' },
  { id: 'flashbots', name: 'Flashbots Protect', type: 'decentralized', url: 'https://rpc.flashbots.net', region: 'Global' },
  { id: 'securerpc', name: 'SecureRPC', type: 'decentralized', url: 'https://api.securerpc.com/v1', region: 'Global' },
  { id: 'builder0x69', name: 'Builder0x69', type: 'decentralized', url: 'https://rpc.builder0x69.io', region: 'Global' },

  // Additional public endpoints
  { id: 'omniatech', name: 'OMNIA Protocol', type: 'decentralized', url: 'https://endpoints.omniatech.io/v1/eth/mainnet/public', region: 'Global' },
  { id: 'rpcfast', name: 'RPCFast', type: 'decentralized', url: 'https://eth-mainnet.rpcfast.com?api_key=xbhWBI1Wkguk8SNMu1bHvvLc_AeYVraz7O', region: 'Global' },
  { id: 'etherspot', name: 'Etherspot', type: 'decentralized', url: 'https://ethereum-rpc.etherspot.io/v2', region: 'Global' },
  { id: 'oasis', name: 'Oasis', type: 'decentralized', url: 'https://1rpc.io/eth', region: 'Global' },
];

async function checkEndpoint(endpoint: RpcEndpoint): Promise<LiveRpcProvider> {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const latencyMs = Math.round(performance.now() - start);
    const data = await response.json();
    const blockHeight = parseInt(data.result, 16) || 0;

    return {
      id: endpoint.id,
      name: endpoint.name,
      type: endpoint.type,
      status: latencyMs < 1000 ? 'healthy' : 'degraded',
      latencyMs,
      blockHeight,
      region: endpoint.region,
    };
  } catch {
    const latencyMs = Math.round(performance.now() - start);
    return {
      id: endpoint.id,
      name: endpoint.name,
      type: endpoint.type,
      status: 'down',
      latencyMs,
      blockHeight: 0,
      region: endpoint.region,
    };
  }
}

async function fetchRpcHealth(): Promise<RpcHealthResponse> {
  const results = await Promise.allSettled(RPC_ENDPOINTS.map(checkEndpoint));
  const providers = results
    .filter((r): r is PromiseFulfilledResult<LiveRpcProvider> => r.status === 'fulfilled')
    .map(r => r.value);

  const healthy = providers.filter(r => r.status === 'healthy').length;
  const responding = providers.filter(r => r.latencyMs > 0);
  const avgLatency = responding.length > 0
    ? Math.round(responding.reduce((s, r) => s + r.latencyMs, 0) / responding.length)
    : 0;
  const maxBlock = Math.max(...providers.map(r => r.blockHeight), 0);

  return {
    providers,
    stats: {
      totalProviders: providers.length,
      healthyProviders: healthy,
      avgLatency,
      currentBlock: maxBlock,
    },
    timestamp: new Date().toISOString(),
  };
}

export function useRpcHealth() {
  return useQuery({
    queryKey: ['rpc-health'],
    queryFn: fetchRpcHealth,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}
