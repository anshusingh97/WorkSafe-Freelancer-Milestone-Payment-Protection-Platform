import { useState } from "react";
import toast from "react-hot-toast";
import { Wallet, ShieldCheck, CheckCircle2, Unplug } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api, apiErrorMessage } from "../services/api";
import { connectWallet, isFreighterInstalled, checkNetwork, shortenAddress } from "../services/freighter";
import { track } from "../services/analytics";
import { useWalletBalance } from "../hooks/useWalletBalance";

export function Profile() {
  const { user, refreshUser } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const balance = useWalletBalance();

  async function handleConnect() {
    if (!(await isFreighterInstalled())) {
      toast.error("Install the Freighter browser extension first, then reload this page.");
      return;
    }
    setConnecting(true);
    try {
      const address = await connectWallet();
      const { ok, network } = await checkNetwork();
      if (!ok) {
        toast.error(`Switch Freighter to Testnet (currently on ${network})`);
        return;
      }
      await api.patch("/users/wallet", { walletAddress: address });
      await refreshUser();
      track("wallet_connected", { address });
      toast.success("Wallet connected");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not connect wallet"));
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    try {
      await api.patch("/users/wallet", { walletAddress: "" });
      await refreshUser();
      toast.success("Wallet disconnected");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not disconnect wallet"));
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold mb-8">Your profile</h1>

      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brass-500/15 text-brass-400 font-display text-xl font-semibold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-parchment/50">{user?.email}</p>
          </div>
          <span className="ml-auto status-badge bg-ink-700 text-parchment/70 capitalize">
            {user?.role}
          </span>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-brass-400" />
            <h2 className="font-sans font-semibold">Stellar wallet</h2>
          </div>
          
          {user?.walletAddress && balance !== null && (
            <div className="text-sm font-semibold text-brass-300 bg-brass-900/30 px-3 py-1 rounded-full border border-brass-500/20">
              {parseFloat(balance).toFixed(2)} XLM
            </div>
          )}
        </div>

        {user?.walletAddress ? (
          <div className="flex items-center justify-between rounded-lg border border-verdigris-500/30 bg-verdigris-500/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-verdigris-400 shrink-0" />
              <div>
                <p className="text-sm text-parchment/80">Connected</p>
                <p className="font-mono text-xs text-verdigris-400">
                  {shortenAddress(user.walletAddress, 8)}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleDisconnect} 
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-rose-900/20"
            >
              <Unplug size={14} />
              Disconnect
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-parchment/60 mb-4">
              Connect Freighter to fund escrow, approve milestones, and receive payments.
              Escrow actions are disabled until a wallet is linked.
            </p>
            <button onClick={handleConnect} disabled={connecting} className="btn-primary">
              <ShieldCheck size={16} />
              {connecting ? "Connecting…" : "Connect Freighter wallet"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
