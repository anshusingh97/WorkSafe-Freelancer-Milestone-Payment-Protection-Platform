import { Request, Response } from "express";
import { z } from "zod";
import { Milestone } from "../models/Milestone";
import { Project } from "../models/Project";
import { ApiError } from "../middleware/errorHandler";

const createMilestoneSchema = z.object({
  projectId: z.string(),
  title: z.string().min(2).max(140),
  description: z.string().max(3000).optional(),
  amount: z.number().positive(),
  dueDate: z.string().datetime().optional(),
  contractMilestoneId: z.number().int().nonnegative(),
});

async function assertClientOwnsProject(projectId: string, userId: string) {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");
  if (project.clientId.toString() !== userId) {
    throw new ApiError(403, "Only the project's client can do this");
  }
  return project;
}

export async function createMilestone(req: Request, res: Response) {
  const data = createMilestoneSchema.parse(req.body);
  await assertClientOwnsProject(data.projectId, req.auth!.userId);

  const milestone = await Milestone.create({
    ...data,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    status: "created",
  });

  res.status(201).json({ milestone });
}

export async function listMilestonesForProject(req: Request, res: Response) {
  const milestones = await Milestone.find({ projectId: req.params.projectId }).sort({
    createdAt: 1,
  });
  res.json({ milestones });
}

const fundSchema = z.object({ escrowTxHash: z.string().min(4) });

export async function fundMilestone(req: Request, res: Response) {
  const { escrowTxHash } = fundSchema.parse(req.body);

  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) throw new ApiError(404, "Milestone not found");
  await assertClientOwnsProject(milestone.projectId.toString(), req.auth!.userId);

  if (milestone.status !== "created") {
    throw new ApiError(409, `Cannot fund a milestone in status "${milestone.status}"`);
  }

  milestone.status = "funded";
  milestone.escrowTxHash = escrowTxHash;
  await milestone.save();

  await Project.findByIdAndUpdate(milestone.projectId, { status: "in_progress" });

  res.json({ milestone });
}

const submitSchema = z.object({
  submissionUrl: z.string().url(),
  submissionNote: z.string().max(2000).optional(),
});

export async function submitMilestoneWork(req: Request, res: Response) {
  const { submissionUrl, submissionNote } = submitSchema.parse(req.body);

  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) throw new ApiError(404, "Milestone not found");

  const project = await Project.findById(milestone.projectId);
  if (!project) throw new ApiError(404, "Project not found");
  if (project.freelancerId?.toString() !== req.auth!.userId) {
    throw new ApiError(403, "Only the assigned freelancer can submit work");
  }

  if (milestone.status !== "funded") {
    throw new ApiError(409, `Cannot submit work for a milestone in status "${milestone.status}"`);
  }

  milestone.status = "submitted";
  milestone.submissionUrl = submissionUrl;
  milestone.submissionNote = submissionNote;
  await milestone.save();

  res.json({ milestone });
}

const approveSchema = z.object({ releaseTxHash: z.string().min(4) });

export async function approveMilestone(req: Request, res: Response) {
  const { releaseTxHash } = approveSchema.parse(req.body);

  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) throw new ApiError(404, "Milestone not found");
  const project = await assertClientOwnsProject(milestone.projectId.toString(), req.auth!.userId);

  if (milestone.status !== "submitted") {
    throw new ApiError(409, `Cannot approve a milestone in status "${milestone.status}"`);
  }

  milestone.status = "released";
  milestone.releaseTxHash = releaseTxHash;
  await milestone.save();

  const remaining = await Milestone.countDocuments({
    projectId: project._id,
    status: { $ne: "released" },
  });
  if (remaining === 0) {
    project.status = "completed";
    await project.save();
  }

  res.json({ milestone });
}

const disputeMilestoneSchema = z.object({
  reason: z.string().min(5).max(2000),
  proofUrl: z.string().url().optional(),
});

export async function disputeMilestone(req: Request, res: Response) {
  disputeMilestoneSchema.parse(req.body); // validated fully in disputeController; keep body shape consistent

  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) throw new ApiError(404, "Milestone not found");

  if (!["funded", "submitted"].includes(milestone.status)) {
    throw new ApiError(409, `Cannot dispute a milestone in status "${milestone.status}"`);
  }

  milestone.status = "disputed";
  await milestone.save();

  await Project.findByIdAndUpdate(milestone.projectId, { status: "disputed" });

  res.json({ milestone });
}
