import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ExternalLink, Plus, Wallet } from "lucide-react";
import { api, apiErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { track } from "../services/analytics";
import { MilestoneTimeline } from "../components/MilestoneTimeline";
import { MilestoneStatusBadge, ProjectStatusBadge } from "../components/StatusBadge";
import type { Milestone, Project, User } from "../types";

const STELLAR_EXPERT_TX = "https://stellar.expert/explorer/testnet/tx/";

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [projectRes, milestonesRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/milestones/project/${id}`),
      ]);
      setProject(projectRes.data.project);
      setMilestones(milestonesRes.data.milestones);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not load project"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <div className="mx-auto max-w-5xl px-6 py-12 text-parchment/50">Loading project…</div>;
  }
  if (!project) {
    return <div className="mx-auto max-w-5xl px-6 py-12 text-parchment/50">Project not found.</div>;
  }

  const client = project.clientId as any;
  const freelancer = project.freelancerId as any;
  const isClient = user?.id === (typeof project.clientId === "string" ? project.clientId : (client?.id || client?._id));
  const isFreelancer =
    freelancer && user?.id === (typeof project.freelancerId === "string" ? project.freelancerId : (freelancer?.id || freelancer?._id));

  async function acceptProject() {
    try {
      await api.patch(`/projects/${id}/accept`);
      track("project_accepted", { projectId: id });
      toast.success("Project accepted — you can now wait for the client to fund a milestone");
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not accept project"));
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
        <h1 className="font-display text-3xl font-semibold">{project.title}</h1>
        <ProjectStatusBadge status={project.status} />
      </div>
      <p className="text-parchment/60 mb-6 max-w-2xl">{project.description}</p>

      <div className="flex flex-wrap gap-6 text-sm mb-8 pb-8 border-b border-ink-700">
        <div>
          <p className="text-parchment/40 text-xs mb-1">Budget</p>
          <p className="font-mono text-brass-400">{project.budget} XLM</p>
        </div>
        <div>
          <p className="text-parchment/40 text-xs mb-1">Category</p>
          <p>{project.category}</p>
        </div>
        <div>
          <p className="text-parchment/40 text-xs mb-1">Client</p>
          <p>{client?.name || "—"}</p>
        </div>
        <div>
          <p className="text-parchment/40 text-xs mb-1">Freelancer</p>
          <p>{freelancer?.name || "Not yet assigned"}</p>
        </div>
      </div>

      {project.status === "open" && user?.role === "freelancer" && (
        <div className="glass-card p-5 mb-8 flex items-center justify-between">
          <p className="text-sm text-parchment/70">Interested in this project?</p>
          <button onClick={acceptProject} className="btn-primary">
            Accept project
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-sans font-semibold text-lg">Milestones</h2>
        {isClient && (
          <button onClick={() => setShowMilestoneForm((s) => !s)} className="btn-secondary text-sm !py-1.5">
            <Plus size={14} /> Add milestone
          </button>
        )}
      </div>

      {showMilestoneForm && isClient && (
        <MilestoneForm
          projectId={project._id}
          existingCount={milestones.length}
          onCreated={() => {
            setShowMilestoneForm(false);
            load();
          }}
        />
      )}

      {milestones.length === 0 ? (
        <div className="glass-card p-8 text-center text-parchment/50">
          No milestones yet. {isClient && "Add one to start the escrow flow."}
        </div>
      ) : (
        <div className="space-y-4">
          {milestones.map((m) => (
            <MilestoneCard
              key={m._id}
              milestone={m}
              isClient={!!isClient}
              isFreelancer={!!isFreelancer}
              onUpdate={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MilestoneForm({
  projectId,
  existingCount,
  onCreated,
}: {
  projectId: string;
  existingCount: number;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/milestones", {
        projectId,
        title,
        description,
        amount: Number(amount),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        // In production this comes back from the Soroban `create_milestone`
        // call (see freighter.ts + contract service); a monotonically
        // increasing id keyed off existing milestone count is a reasonable
        // placeholder for a fresh project.
        contractMilestoneId: Date.now() + existingCount,
      });
      track("milestone_created", { projectId });
      toast.success("Milestone added");
      onCreated();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create milestone"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-card p-5 mb-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          className="input-field"
          placeholder="Milestone title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="number"
          min={0.01}
          step="0.01"
          className="input-field"
          placeholder="Amount (XLM)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <textarea
        className="input-field resize-y"
        placeholder="What does this milestone cover?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="date"
        className="input-field"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Adding…" : "Add milestone"}
      </button>
    </form>
  );
}

function MilestoneCard({
  milestone,
  isClient,
  isFreelancer,
  onUpdate,
}: {
  milestone: Milestone;
  isClient: boolean;
  isFreelancer: boolean;
  onUpdate: () => void;
}) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  async function fund() {
    if (!user?.walletAddress) {
      toast.error("Connect your Freighter wallet in Profile before funding escrow");
      return;
    }
    setBusy(true);
    try {
      // In production: build a Soroban `fund_milestone` invocation, sign it
      // with Freighter (services/freighter.ts:signTransaction), submit to
      // Horizon, then send the resulting tx hash here. Simulated below so
      // the milestone flow is fully testable without a live contract.
      const simulatedTxHash = `${Date.now().toString(16)}sim`;
      await api.patch(`/milestones/${milestone._id}/fund`, { escrowTxHash: simulatedTxHash });
      track("milestone_funded", { milestoneId: milestone._id });
      toast.success("Milestone funded — escrow is locked");
      onUpdate();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not fund milestone"));
    } finally {
      setBusy(false);
    }
  }

  async function submitWork() {
    if (!submissionUrl) {
      toast.error("Add a link to the work before submitting");
      return;
    }
    setBusy(true);
    try {
      await api.patch(`/milestones/${milestone._id}/submit`, { submissionUrl });
      track("work_submitted", { milestoneId: milestone._id });
      toast.success("Work submitted for review");
      setShowSubmitForm(false);
      onUpdate();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not submit work"));
    } finally {
      setBusy(false);
    }
  }

  async function approve() {
    setBusy(true);
    try {
      const simulatedTxHash = `${Date.now().toString(16)}release`;
      await api.patch(`/milestones/${milestone._id}/approve`, { releaseTxHash: simulatedTxHash });
      track("payment_released", { milestoneId: milestone._id });
      toast.success("Payment released to freelancer");
      onUpdate();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not approve milestone"));
    } finally {
      setBusy(false);
    }
  }

  async function dispute() {
    const reason = window.prompt("Briefly describe the issue with this milestone:");
    if (!reason) return;
    setBusy(true);
    try {
      await api.post("/disputes", { projectId: milestone.projectId, milestoneId: milestone._id, reason });
      track("dispute_raised", { milestoneId: milestone._id });
      toast.success("Dispute raised — an admin will review it");
      onUpdate();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not raise dispute"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-sans font-semibold">{milestone.title}</h3>
          {milestone.description && (
            <p className="text-sm text-parchment/60 mt-1">{milestone.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-brass-400 text-sm">{milestone.amount} XLM</span>
          <MilestoneStatusBadge status={milestone.status} />
        </div>
      </div>

      <MilestoneTimeline status={milestone.status} />

      <div className="flex flex-wrap items-center gap-4 mt-4 text-xs">
        {milestone.escrowTxHash && (
          <a
            href={`${STELLAR_EXPERT_TX}${milestone.escrowTxHash}`}
            target="_blank"
            rel="noreferrer"
            className="tx-hash flex items-center gap-1"
          >
            Escrow tx: {milestone.escrowTxHash.slice(0, 10)}… <ExternalLink size={10} />
          </a>
        )}
        {milestone.releaseTxHash && (
          <a
            href={`${STELLAR_EXPERT_TX}${milestone.releaseTxHash}`}
            target="_blank"
            rel="noreferrer"
            className="tx-hash flex items-center gap-1"
          >
            Release tx: {milestone.releaseTxHash.slice(0, 10)}… <ExternalLink size={10} />
          </a>
        )}
        {milestone.submissionUrl && (
          <a href={milestone.submissionUrl} target="_blank" rel="noreferrer" className="tx-hash flex items-center gap-1">
            View submission <ExternalLink size={10} />
          </a>
        )}
      </div>

      {showSubmitForm && (
        <div className="mt-4 flex gap-2">
          <input
            className="input-field"
            placeholder="https://link-to-your-work.com"
            value={submissionUrl}
            onChange={(e) => setSubmissionUrl(e.target.value)}
          />
          <button onClick={submitWork} disabled={busy} className="btn-primary shrink-0">
            Submit
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-ink-700">
        {isClient && milestone.status === "created" && (
          <button onClick={fund} disabled={busy} className="btn-primary text-sm !py-1.5">
            <Wallet size={14} /> Fund escrow
          </button>
        )}
        {isFreelancer && milestone.status === "funded" && !showSubmitForm && (
          <button onClick={() => setShowSubmitForm(true)} className="btn-secondary text-sm !py-1.5">
            Submit work
          </button>
        )}
        {isClient && milestone.status === "submitted" && (
          <button onClick={approve} disabled={busy} className="btn-primary text-sm !py-1.5">
            Approve & release payment
          </button>
        )}
        {(isClient || isFreelancer) && ["funded", "submitted"].includes(milestone.status) && (
          <button onClick={dispute} disabled={busy} className="text-sm text-rust hover:text-rust/80">
            Raise a dispute
          </button>
        )}
      </div>
    </div>
  );
}
