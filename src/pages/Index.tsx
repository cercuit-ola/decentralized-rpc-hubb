import { Server, Clock, ArrowUpRight, Blocks, Shield, Activity, Loader2 } from "lucide-react";
import { enrichLiveData, geoDistribution, latencyOverTime } from "@/data/mockRpcData";
import { useRpcHealth } from "@/hooks/useRpcHealth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import ProviderTable from "@/components/dashboard/ProviderTable";
import LatencyChart from "@/components/dashboard/LatencyChart";
import GeoDistribution from "@/components/dashboard/GeoDistribution";
import CensorshipScoreCard from "@/components/dashboard/CensorshipScoreCard";

const Index = () => {
  const { data: liveData, isLoading, error } = useRpcHealth();

  const enriched = liveData ? enrichLiveData(liveData) : null;

  return (
    <div className="min-h-screen bg-background grid-bg">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-sm font-mono text-muted-foreground">Pinging RPC endpoints...</span>
          </div>
        )}

        {error && !enriched && (
          <div className="text-center py-10">
            <p className="text-sm font-mono text-destructive">Failed to fetch live data. Retrying...</p>
          </div>
        )}

        {enriched && (
          <>
            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard
                label="Total Nodes"
                value={enriched.stats.totalNodes.toLocaleString()}
                icon={<Server className="w-4 h-4" />}
                trend="up"
                trendValue="estimated"
                glowColor="primary"
              />
              <MetricCard
                label="Avg Latency"
                value={enriched.stats.avgLatency}
                suffix="ms"
                icon={<Clock className="w-4 h-4" />}
                trend={enriched.stats.avgLatency < 200 ? "down" : "up"}
                trendValue="live"
                glowColor="accent"
              />
              <MetricCard
                label="Avg Uptime"
                value={enriched.stats.avgUptime}
                suffix="%"
                icon={<ArrowUpRight className="w-4 h-4" />}
                trend="up"
                trendValue="estimated"
                glowColor="primary"
              />
              <MetricCard
                label="Block Height"
                value={enriched.stats.currentBlock.toLocaleString()}
                icon={<Blocks className="w-4 h-4" />}
                trend="neutral"
                trendValue="live"
              />
              <MetricCard
                label="Decentralized"
                value={enriched.stats.decentralizedShare}
                suffix="%"
                icon={<Shield className="w-4 h-4" />}
                trend="up"
                trendValue="of providers"
                glowColor="primary"
              />
              <MetricCard
                label="Providers"
                value={`${enriched.stats.healthyProviders}/${enriched.stats.totalProviders}`}
                icon={<Activity className="w-4 h-4" />}
                trend="neutral"
                trendValue={`${enriched.stats.healthyProviders} healthy`}
                glowColor="accent"
              />
            </div>

            {/* Provider Table */}
            <ProviderTable providers={enriched.providers} />

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LatencyChart />
              </div>
              <CensorshipScoreCard providers={enriched.providers} />
            </div>

            {/* Geo Distribution */}
            <GeoDistribution />
          </>
        )}

        {/* Footer */}
        <footer className="border-t border-border pt-6 pb-8 text-center">
          <p className="text-xs font-mono text-muted-foreground">
            ETHRPC.monitor — Open-source decentralized RPC health dashboard
          </p>
          <p className="text-[10px] font-mono text-muted-foreground mt-1">
            Data refreshes every 30s • Live from Ethereum Mainnet
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
