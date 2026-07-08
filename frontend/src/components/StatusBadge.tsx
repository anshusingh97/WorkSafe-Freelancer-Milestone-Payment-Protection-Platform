import { Lock, Coins, FileCheck2, CheckCircle2, Send, Scale, Undo2 } from "lucide-react";
import type { MilestoneStatus, ProjectStatus } from "../types";

const MILESTONE_CONFIG: Record<
  MilestoneStatus,
  { label: string; className: string; icon: typeof Lock }
> = {
  created: { label: "Created", className: "bg-ink-700 text-parchment/70", icon: FileCheck2 },
  funded: { label: "Escrowed", className: "bg-brass-500/15 text-brass-400", icon: Lock },
  submitted: { label: "Submitted", className: "bg-verdigris-500/15 text-verdigris-400", icon: Send },
  approved: { label: "Approved", className: "bg-verdigris-500/20 text-verdigris-400", icon: CheckCircle2 },
  released: { label: "Released", className: "bg-verdigris-500/25 text-verdigris-300", icon: Coins },
  disputed: { label: "Disputed", className: "bg-rust/20 text-rust", icon: Scale },
  refunded: { label: "Refunded", className: "bg-ink-700 text-parchment/60", icon: Undo2 },
};

const PROJECT_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-brass-500/15 text-brass-400" },
  accepted: { label: "Accepted", className: "bg-verdigris-500/15 text-verdigris-400" },
  in_progress: { label: "In Progress", className: "bg-verdigris-500/20 text-verdigris-400" },
  completed: { label: "Completed", className: "bg-verdigris-500/25 text-verdigris-300" },
  disputed: { label: "Disputed", className: "bg-rust/20 text-rust" },
};

export function MilestoneStatusBadge({ status }: { status: MilestoneStatus }) {
  const config = MILESTONE_CONFIG[status];
  const Icon = config.icon;
  return (
    <span className={`status-badge ${config.className}`}>
      <Icon size={12} strokeWidth={2.5} />
      {config.label}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = PROJECT_CONFIG[status];
  return <span className={`status-badge ${config.className}`}>{config.label}</span>;
}
