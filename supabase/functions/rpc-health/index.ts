import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface RpcEndpoint {
  id: string;
  name: string;
  type: 'light-client' | 'p2p' | 'decentralized' | 'centralized';
  url: string;
  region: string;
}

const RPC_ENDPOINTS: RpcEndpoint[] = [
  { id: 'ankr', name: 'Ankr Protocol', type: 'decentralized', url: 'https://rpc.ankr.com/eth', region: 'Global' },
  { id: 'pokt', name: 'Pocket Network', type: 'decentralized', url: 'https://eth-mainnet.gateway.pokt.network/v1/lb/62e208b7a3457c003985a6c6', region: 'Global' },
  { id: 'blastapi', name: 'Blast API', type: 'decentralized', url: 'https://eth-mainnet.public.blastapi.io', region: 'EU / US' },
  { id: 'blockpi', name: 'BlockPI', type: 'decentralized', url: 'https://ethereum.blockpi.network/v1/rpc/public', region: 'Global' },
  { id: 'publicnode', name: 'PublicNode', type: 'decentralized', url: 'https://ethereum-rpc.publicnode.com', region: 'Global' },
  { id: 'chainstack', name: 'Chainstack', type: 'centralized', url: 'https://ethereum-mainnet.core.chainstack.com', region: 'Multi-Region' },
  { id: 'llamarpc', name: 'LlamaRPC', type: 'decentralized', url: 'https://eth.llamarpc.com', region: 'Multi-Region' },
  { id: 'drpc', name: 'dRPC', type: 'decentralized', url: 'https://eth.drpc.org', region: 'EU / US' },
  { id: 'onerpc', name: '1RPC (Automata)', type: 'decentralized', url: 'https://1rpc.io/eth', region: 'Global' },
  { id: 'lava', name: 'Lava Network', type: 'decentralized', url: 'https://eth1.lava.build/lava-referer-2e3e1e22-fca0-4a8d-8a28-4485ec535bf3/', region: 'Global' },
  { id: 'tenderly', name: 'Tenderly', type: 'centralized', url: 'https://gateway.tenderly.co/public/mainnet', region: 'EU' },
  { id: 'onfinality', name: 'OnFinality', type: 'decentralized', url: 'https://eth.api.onfinality.io/public', region: 'Asia Pacific' },
  { id: 'cloudflare', name: 'Cloudflare ETH', type: 'decentralized', url: 'https://cloudflare-eth.com', region: 'Global CDN' },
  { id: 'mew', name: 'MEW (MyEtherWallet)', type: 'centralized', url: 'https://nodes.mewapi.io/rpc/eth', region: 'Global' },
  { id: 'runonflux', name: 'RunOnFlux', type: 'decentralized', url: 'https://eth.runonflux.io', region: 'Global' },
  { id: 'ethcall', name: 'eth.merkle.io', type: 'decentralized', url: 'https://eth.merkle.io', region: 'Global' },
  { id: 'payload', name: 'Payload', type: 'centralized', url: 'https://rpc.payload.de', region: 'EU' },
  { id: 'notadegen', name: 'notadegen', type: 'decentralized', url: 'https://rpc.notadegen.com/eth', region: 'Global' },
  { id: 'mevblocker', name: 'MEV Blocker', type: 'decentralized', url: 'https://rpc.mevblocker.io', region: 'Global' },
  { id: 'flashbots', name: 'Flashbots Protect', type: 'decentralized', url: 'https://rpc.flashbots.net', region: 'Global' },
  { id: 'securerpc', name: 'SecureRPC', type: 'decentralized', url: 'https://api.securerpc.com/v1', region: 'Global' },
  { id: 'builder0x69', name: 'Builder0x69', type: 'decentralized', url: 'https://rpc.builder0x69.io', region: 'Global' },
  { id: 'omniatech', name: 'OMNIA Protocol', type: 'decentralized', url: 'https://endpoints.omniatech.io/v1/eth/mainnet/public', region: 'Global' },
  { id: 'rpcfast', name: 'RPCFast', type: 'decentralized', url: 'https://eth-mainnet.rpcfast.com?api_key=xbhWBI1Wkguk8SNMu1bHvvLc_AeYVraz7O', region: 'Global' },
  { id: 'etherspot', name: 'Etherspot', type: 'decentralized', url: 'https://ethereum-rpc.etherspot.io/v2', region: 'Global' },
];

async function checkEndpoint(endpoint: RpcEndpoint): Promise<{
  id: string;
  name: string;
  type: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  blockHeight: number;
  region: string;
}> {
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
      status: latencyMs < 500 ? 'healthy' : 'degraded',
      latencyMs,
      blockHeight,
      region: endpoint.region,
    };
  } catch (error) {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const results = await Promise.all(RPC_ENDPOINTS.map(checkEndpoint));

    const healthy = results.filter(r => r.status === 'healthy').length;
    const avgLatency = Math.round(results.reduce((s, r) => s + r.latencyMs, 0) / results.length);
    const maxBlock = Math.max(...results.map(r => r.blockHeight));

    const response = {
      providers: results,
      stats: {
        totalProviders: results.length,
        healthyProviders: healthy,
        avgLatency,
        currentBlock: maxBlock,
      },
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
