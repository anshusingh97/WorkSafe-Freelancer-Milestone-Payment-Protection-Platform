import { Request, Response } from "express";
import { User } from "../models/User";
import { Project } from "../models/Project";
import { Milestone } from "../models/Milestone";
import { Dispute } from "../models/Dispute";
import { Feedback } from "../models/Feedback";

export async function getStats(_req: Request, res: Response) {
  const [
    totalUsers,
    totalClients,
    totalFreelancers,
    totalProjects,
    openProjects,
    completedProjects,
    totalMilestones,
    releasedMilestones,
    totalVolumeAgg,
    openDisputes,
    resolvedDisputes,
    feedbackAgg,
    connectedWallets,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "client" }),
    User.countDocuments({ role: "freelancer" }),
    Project.countDocuments(),
    Project.countDocuments({ status: "open" }),
    Project.countDocuments({ status: "completed" }),
    Milestone.countDocuments(),
    Milestone.countDocuments({ status: "released" }),
    Milestone.aggregate([
      { $match: { status: "released" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Dispute.countDocuments({ status: "open" }),
    Dispute.countDocuments({ status: "resolved" }),
    Feedback.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }]),
    User.countDocuments({ walletAddress: { $exists: true, $ne: null } }),
  ]);

  res.json({
    users: { total: totalUsers, clients: totalClients, freelancers: totalFreelancers },
    wallets: { connected: connectedWallets },
    projects: { total: totalProjects, open: openProjects, completed: completedProjects },
    milestones: {
      total: totalMilestones,
      released: releasedMilestones,
      totalVolumeReleased: totalVolumeAgg[0]?.total ?? 0,
    },
    disputes: { open: openDisputes, resolved: resolvedDisputes },
    feedback: {
      averageRating: feedbackAgg[0]?.avg ?? null,
      responses: feedbackAgg[0]?.count ?? 0,
    },
  });
}
