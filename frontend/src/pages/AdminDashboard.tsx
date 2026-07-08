import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Users, Briefcase, Coins, Scale, Star, Wallet } from "lucide-react";
import { api, apiErrorMessage } from "../services/api";
import type { PlatformStats } from "../types";

export function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/admin/stats");
        setStats(data);
      } catch (err) {
        toast.error(apiErrorMessage(err, "Could not load platform stats"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="mx-auto max-w-6xl px-6 py-12 text-parchment/50">Loading…</div>;
  if (!stats) return null;

  const cards = [
    { icon: Users, label: "Total users", value: stats.users.total, sub: `${stats.users.clients} clients · ${stats.users.freelancers} freelancers` },
    { icon: Wallet, label: "Wallets connected", value: stats.wallets.connected, sub: "Proof of real user onboarding" },
    { icon: Briefcase, label: "Projects", value: stats.projects.total, sub: `${stats.projects.open} open · ${stats.projects.completed} completed` },
    { icon: Coins, label: "XLM released", value: stats.milestones.totalVolumeReleased.toFixed(2), sub: `${stats.milestones.released}/${stats.milestones.total} milestones released` },
    { icon: Scale, label: "Disputes", value: stats.disputes.open, sub: `${stats.disputes.resolved} resolved`, alert: stats.disputes.open > 0 },
    { icon: Star, label: "Avg. feedback rating", value: stats.feedback.averageRating ? stats.feedback.averageRating.toFixed(1) : "—", sub: `${stats.feedback.responses} responses` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold">Admin dashboard</h1>
        <Link to="/disputes" className="btn-secondary text-sm">
          <Scale size={14} /> Review disputes
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className={`glass-card p-5 ${c.alert ? "border-rust/40" : ""}`}>
            <c.icon size={18} className={c.alert ? "text-rust mb-2" : "text-brass-400 mb-2"} />
            <p className="text-2xl font-display font-semibold">{c.value}</p>
            <p className="text-xs text-parchment/50 mt-1">{c.label}</p>
            <p className="text-[11px] text-parchment/35 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
