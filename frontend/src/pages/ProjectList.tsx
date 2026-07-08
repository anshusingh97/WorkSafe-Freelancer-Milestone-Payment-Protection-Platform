import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { api, apiErrorMessage } from "../services/api";
import { ProjectStatusBadge } from "../components/StatusBadge";
import { ProjectListSkeleton } from "../components/Skeleton";
import type { Project } from "../types";

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/projects", { params: { status: "open" } });
        setProjects(data.projects);
      } catch (err) {
        toast.error(apiErrorMessage(err, "Could not load projects"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold mb-2">Open projects</h1>
        <p className="text-parchment/60">Escrow-backed work waiting for a freelancer.</p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-parchment/40" />
        <input
          className="input-field pl-10"
          placeholder="Search by title or category…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <ProjectListSkeleton />
      ) : filtered.length === 0 ? (
        <div className="glass-card p-10 text-center text-parchment/60">
          No open projects match your search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p._id}
              to={`/project/${p._id}`}
              className="glass-card p-5 hover:border-brass-500/40 transition-colors flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-sans font-semibold line-clamp-1">{p.title}</h3>
                <ProjectStatusBadge status={p.status} />
              </div>
              <p className="text-sm text-parchment/60 line-clamp-3 mb-4 flex-1">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.requiredSkills.slice(0, 3).map((s) => (
                  <span key={s} className="text-[11px] rounded-full bg-ink-700 px-2.5 py-0.5 text-parchment/60">
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm pt-3 border-t border-ink-700">
                <span className="font-mono text-brass-400 font-medium">{p.budget} XLM</span>
                <span className="text-parchment/40">{p.category}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
