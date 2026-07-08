export type UserRole = "client" | "freelancer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress: string | null;
  createdAt: string;
}

export type ProjectStatus = "open" | "accepted" | "in_progress" | "completed" | "disputed";

export interface Project {
  _id: string;
  title: string;
  description: string;
  clientId: User | string;
  freelancerId?: User | string;
  category: string;
  budget: number;
  requiredSkills: string[];
  deadline?: string;
  status: ProjectStatus;
  createdAt: string;
}

export type MilestoneStatus =
  | "created"
  | "funded"
  | "submitted"
  | "approved"
  | "released"
  | "disputed"
  | "refunded";

export interface Milestone {
  _id: string;
  projectId: string;
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
  status: MilestoneStatus;
  contractMilestoneId: number;
  escrowTxHash?: string;
  releaseTxHash?: string;
  submissionUrl?: string;
  submissionNote?: string;
  createdAt: string;
}

export type DisputeStatus = "open" | "resolved";
export type DisputeResolution = "release_to_freelancer" | "refund_client";

export interface Dispute {
  _id: string;
  projectId: Project | string;
  milestoneId: Milestone | string;
  raisedBy: User | string;
  reason: string;
  proofUrl?: string;
  status: DisputeStatus;
  resolution?: DisputeResolution;
  createdAt: string;
}

export interface PlatformStats {
  users: { total: number; clients: number; freelancers: number };
  wallets: { connected: number };
  projects: { total: number; open: number; completed: number };
  milestones: { total: number; released: number; totalVolumeReleased: number };
  disputes: { open: number; resolved: number };
  feedback: { averageRating: number | null; responses: number };
}
