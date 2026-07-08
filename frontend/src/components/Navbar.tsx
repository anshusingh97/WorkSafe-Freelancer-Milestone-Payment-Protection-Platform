import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ShieldCheck, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { shortenAddress } from "../services/freighter";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = user
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/projects", label: "Projects" },
        ...(user.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
        { to: "/feedback", label: "Feedback" },
      ]
    : [];

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
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {user.walletAddress && (
                <span className="flex items-center gap-1.5 rounded-full border border-ink-600 px-3 py-1.5 text-xs font-mono text-verdigris-400">
                  <Wallet size={12} />
                  {shortenAddress(user.walletAddress)}
                </span>
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
