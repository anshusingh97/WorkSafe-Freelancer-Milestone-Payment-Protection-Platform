import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Scale } from "lucide-react";
import { api, apiErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Dispute, Milestone, Project, User } from "../types";

export function Disputes() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const { data } = await api.get("/disputes");
      setDisputes(data.disputes);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not load disputes"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(disputeId: string, resolution: "release_to_freelancer" | "refund_client") {
    try {
      const simulatedTxHash = `${Date.now().toString(16)}resolve`;
      await api.patch(`/disputes/${disputeId}/resolve`, { resolution, releaseTxHash: simulatedTxHash });
      toast.success("Dispute resolved");
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not resolve dispute"));
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center gap-2 mb-2">
        <Scale size={22} className="text-rust" />
        <h1 className="font-display text-3xl font-semibold">Disputes</h1>
      </div>
      <p className="text-parchment/60 mb-8">
        {user?.role === "admin"
          ? "Review evidence and resolve disputed milestones."
          : "Disputes raised on your projects."}
      </p>

      {loading ? (
        <p className="text-parchment/50">Loading…</p>
      ) : disputes.length === 0 ? (
        <div className="glass-card p-10 text-center text-parchment/50">No disputes to show.</div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => {
            const raisedBy = d.raisedBy as User;
            const project = d.projectId as Project;
            const milestone = d.milestoneId as Milestone;
            return (
              <div key={d._id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold">{project?.title || "Project"}</p>
                    <p className="text-sm text-parchment/50">
                      Milestone: {milestone?.title} · {milestone?.amount} XLM
                    </p>
                  </div>
                  <span
                    className={`status-badge ${
                      d.status === "open" ? "bg-rust/20 text-rust" : "bg-verdigris-500/15 text-verdigris-400"
                    }`}
                  >
                    {d.status === "open" ? "Open" : "Resolved"}
                  </span>
                </div>
                <p className="text-sm text-parchment/70 mb-1">
                  Raised by <span className="text-parchment">{raisedBy?.name}</span>
                </p>
                <p className="text-sm text-parchment/60 mb-4">{d.reason}</p>
                {d.proofUrl && (
                  <a href={d.proofUrl} target="_blank" rel="noreferrer" className="tx-hash">
                    View proof
                  </a>
                )}

                {user?.role === "admin" && d.status === "open" && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-ink-700">
                    <button onClick={() => resolve(d._id, "release_to_freelancer")} className="btn-primary text-sm !py-1.5">
                      Release to freelancer
                    </button>
                    <button onClick={() => resolve(d._id, "refund_client")} className="btn-secondary text-sm !py-1.5">
                      Refund client
                    </button>
                  </div>
                )}
                {d.resolution && (
                  <p className="text-xs text-parchment/40 mt-3">
                    Resolved:{" "}
                    {d.resolution === "release_to_freelancer" ? "Released to freelancer" : "Refunded to client"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
