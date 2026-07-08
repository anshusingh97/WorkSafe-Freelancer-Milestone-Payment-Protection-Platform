import { Request, Response } from "express";
import { z } from "zod";
import { Dispute } from "../models/Dispute";
import { Milestone } from "../models/Milestone";
import { Project } from "../models/Project";
import { ApiError } from "../middleware/errorHandler";

const createDisputeSchema = z.object({
  projectId: z.string(),
  milestoneId: z.string(),
  reason: z.string().min(5).max(2000),
  proofUrl: z.string().url().optional(),
});

export async function createDispute(req: Request, res: Response) {
  const data = createDisputeSchema.parse(req.body);

  const milestone = await Milestone.findById(data.milestoneId);
  if (!milestone) throw new ApiError(404, "Milestone not found");
  if (!["funded", "submitted"].includes(milestone.status)) {
    throw new ApiError(409, `Cannot dispute a milestone in status "${milestone.status}"`);
  }

  const project = await Project.findById(data.projectId);
  if (!project) throw new ApiError(404, "Project not found");

  const userId = req.auth!.userId;
  const isParty =
    project.clientId.toString() === userId || project.freelancerId?.toString() === userId;
  if (!isParty) {
    throw new ApiError(403, "Only the client or freelancer on this project can raise a dispute");
  }

  const dispute = await Dispute.create({ ...data, raisedBy: userId, status: "open" });

  milestone.status = "disputed";
  await milestone.save();
  project.status = "disputed";
  await project.save();

  res.status(201).json({ dispute });
}

export async function listDisputes(req: Request, res: Response) {
  const filter: Record<string, unknown> = {};
  if (req.auth!.role !== "admin") {
    // Non-admins only see disputes tied to their own projects; a lightweight
    // join since Mongo doesn't do this natively.
    const myProjects = await Project.find({
      $or: [{ clientId: req.auth!.userId }, { freelancerId: req.auth!.userId }],
    }).select("_id");
    filter.projectId = { $in: myProjects.map((p) => p._id) };
  }

  const disputes = await Dispute.find(filter)
    .sort({ createdAt: -1 })
    .populate("raisedBy", "name email role")
    .populate("projectId", "title")
    .populate("milestoneId", "title amount");

  res.json({ disputes });
}

const resolveSchema = z.object({
  resolution: z.enum(["release_to_freelancer", "refund_client"]),
  releaseTxHash: z.string().min(4).optional(),
});

export async function resolveDispute(req: Request, res: Response) {
  if (req.auth!.role !== "admin") {
    throw new ApiError(403, "Only an admin can resolve disputes");
  }

  const { resolution, releaseTxHash } = resolveSchema.parse(req.body);

  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) throw new ApiError(404, "Dispute not found");
  if (dispute.status === "resolved") {
    throw new ApiError(409, "Dispute already resolved");
  }

  dispute.status = "resolved";
  dispute.resolution = resolution;
  dispute.resolvedBy = req.auth!.userId as unknown as typeof dispute.resolvedBy;
  await dispute.save();

  const milestone = await Milestone.findById(dispute.milestoneId);
  if (milestone) {
    milestone.status = resolution === "release_to_freelancer" ? "released" : "refunded";
    if (releaseTxHash) milestone.releaseTxHash = releaseTxHash;
    await milestone.save();
  }

  res.json({ dispute });
}
