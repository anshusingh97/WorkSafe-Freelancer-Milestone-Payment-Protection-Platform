import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ShieldCheck, Wallet, Unplug } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { shortenAddress } from "../services/freighter";
import { useWalletBalance } from "../hooks/useWalletBalance";
import { api, apiErrorMessage } from "../services/api";

export function Navbar() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const balance = useWalletBalance();

  const links = user
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/projects", label: "Projects" },
        ...(user.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
        { to: "/feedback", label: "Feedback" },
      ]
    : [];

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
    <header className="sticky top-0 z-40 border-b border-ink-700/60 bg-ink-950/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <ShieldCheck size={22} className="text-brass-400" strokeWidth={2} />
          <span className="font-display text-lg font-semibold tracking-tight">WorkSafe</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-parchment/70 hover:text-parchment transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="mailto:support@worksafe.app"
            className="text-sm text-parchment/70 hover:text-parchment transition-colors"
          >
            Support
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {user.walletAddress && (
                <div className="flex items-center gap-2 mr-2">
                  {balance !== null && (
                    <span className="text-xs font-semibold text-brass-300">
                      {parseFloat(balance).toFixed(2)} XLM
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 rounded-full border border-ink-600 pl-3 pr-1 py-1 text-xs font-mono text-verdigris-400">
                    <Wallet size={12} />
                    {shortenAddress(user.walletAddress)}
                    <button
                      onClick={handleDisconnect}
                      className="text-rose-400 hover:text-rose-300 ml-1 hover:bg-rose-900/30 p-1 rounded-full transition-colors"
                      title="Disconnect Wallet"
                    >
                      <Unplug size={12} />
                    </button>
                  </div>
                </div>
              )}
              <Link to="/profile" className="text-sm text-parchment/70 hover:text-parchment">
                {user.name}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="btn-secondary !px-4 !py-1.5 text-sm"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-parchment/70 hover:text-parchment">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-1.5 text-sm">
                Get started
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-parchment" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink-700/60 bg-ink-950 px-4 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-parchment/80">
              {l.label}
            </Link>
          ))}
          <a href="mailto:support@worksafe.app" onClick={() => setOpen(false)} className="text-parchment/80">
            Support
          </a>
          <div className="seal-divider" />
          {user ? (
            <>
              <Link to="/profile" onClick={() => setOpen(false)} className="text-parchment/80">
                {user.name} · {user.role}
              </Link>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate("/");
                }}
                className="btn-secondary w-full"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="text-parchment/80">
                Log in
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className="btn-primary w-full">
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
