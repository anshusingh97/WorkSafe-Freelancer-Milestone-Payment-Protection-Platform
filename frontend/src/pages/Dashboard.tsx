import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Wallet, ArrowUpRight, Briefcase, Coins } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api, apiErrorMessage } from "../services/api";
import { ProjectStatusBadge } from "../components/StatusBadge";
import { ProjectListSkeleton } from "../components/Skeleton";
import type { Project } from "../types";
import toast from "react-hot-toast";

export function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/projects", { params: { mine: "true" } });
        setProjects(data.projects);
      } catch (err) {
        toast.error(apiErrorMessage(err, "Could not load your projects"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = {
    active: projects.filter((p) => p.status === "in_progress" || p.status === "accepted").length,
    completed: projects.filter((p) => p.status === "completed").length,
    open: projects.filter((p) => p.status === "open").length,
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            Welcome, {user?.name.split(" ")[0]}
          </h1>
          <p className="text-parchment/60 mt-1">
            {user?.role === "client" ? "Your projects and their escrow status." : "Work you've accepted and its payout status."}
          </p>
        </div>
        <div className="flex gap-3">
          {!user?.walletAddress && (
            <Link to="/profile" className="btn-secondary">
              <Wallet size={16} /> Connect wallet
            </Link>
          )}
          {user?.role === "client" && (
            <Link to="/create-project" className="btn-primary">
              <Plus size={16} /> New project
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="glass-card p-5">
          <Briefcase size={18} className="text-brass-400 mb-2" />
          <p className="text-2xl font-display font-semibold">{stats.active}</p>
          <p className="text-xs text-parchment/50 mt-0.5">Active</p>
        </div>
        <div className="glass-card p-5">
          <Coins size={18} className="text-verdigris-400 mb-2" />
          <p className="text-2xl font-display font-semibold">{stats.completed}</p>
          <p className="text-xs text-parchment/50 mt-0.5">Completed</p>
        </div>
        <div className="glass-card p-5">
          <ArrowUpRight size={18} className="text-parchment/50 mb-2" />
          <p className="text-2xl font-display font-semibold">{stats.open}</p>
          <p className="text-xs text-parchment/50 mt-0.5">Open</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-sans font-semibold text-lg">Your projects</h2>
        <Link to="/projects" className="text-sm text-brass-400 hover:text-brass-300">
          Browse all projects →
        </Link>
      </div>

      {loading ? (
        <ProjectListSkeleton />
      ) : projects.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-parchment/60 mb-4">
            {user?.role === "client"
              ? "You haven't created a project yet."
              : "You haven't accepted a project yet."}
          </p>
          <Link
            to={user?.role === "client" ? "/create-project" : "/projects"}
            className="btn-primary inline-flex"
          >
            {user?.role === "client" ? "Create your first project" : "Browse open projects"}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p._id} to={`/project/${p._id}`} className="glass-card p-5 hover:border-brass-500/40 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-sans font-semibold line-clamp-1">{p.title}</h3>
                <ProjectStatusBadge status={p.status} />
              </div>
              <p className="text-sm text-parchment/60 line-clamp-2 mb-4">{p.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-brass-400">{p.budget} XLM</span>
                <span className="text-parchment/40">{p.category}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
