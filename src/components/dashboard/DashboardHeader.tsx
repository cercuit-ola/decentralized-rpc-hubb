import { Radio, Wallet } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { getEthBalance } from "@/lib/ethereum";
import { checksumAddress } from "@/lib/ethereum";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

const DashboardHeader = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!account) { setBalance(null); return; }
    let cancelled = false;
    const validated = checksumAddress(account);
    if (!validated) return;
    getEthBalance(validated).then((bal) => {
      if (!cancelled) setBalance(parseFloat(bal).toFixed(4));
    }).catch(() => { if (!cancelled) setBalance(null); });
    return () => { cancelled = true; };
  }, [account]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum?.isMetaMask) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    setConnecting(true);
    try {
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      if (accounts.length > 0) setAccount(accounts[0]);
    } catch {
      // user rejected
    } finally {
      setConnecting(false);
    }
  }, []);

  const truncated = account ? `${account.slice(0, 6)}…${account.slice(-4)}` : null;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center glow-primary">
            <Radio className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-mono font-bold text-foreground tracking-tight">
              ETH<span className="text-primary">RPC</span>.monitor
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Decentralized RPC Health Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
            <span className="text-xs font-mono text-muted-foreground">Live</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground border border-border px-3 py-1 rounded">
            Ethereum Mainnet
          </span>
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-colors text-xs font-mono text-primary disabled:opacity-50"
          >
            <Wallet className="w-3.5 h-3.5" />
            {connecting ? "Connecting…" : truncated ? `${truncated}${balance ? ` · ${balance} ETH` : ""}` : "Connect Wallet"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
