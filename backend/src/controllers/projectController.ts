import { Request, Response } from "express";
import { z } from "zod";
import { Project } from "../models/Project";
import { ApiError } from "../middleware/errorHandler";

const createProjectSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().min(10).max(5000),
  category: z.string().min(2),
  budget: z.number().positive(),
  requiredSkills: z.array(z.string()).default([]),
  deadline: z.string().datetime().optional(),
});

export async function createProject(req: Request, res: Response) {
  if (req.auth!.role !== "client") {
    throw new ApiError(403, "Only clients can create projects");
  }

  const data = createProjectSchema.parse(req.body);

  const project = await Project.create({
    ...data,
    deadline: data.deadline ? new Date(data.deadline) : undefined,
    clientId: req.auth!.userId,
    status: "open",
  });

  res.status(201).json({ project });
}

export async function listProjects(req: Request, res: Response) {
  const { status, category, mine } = req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (mine === "true") {
    filter.$or = [{ clientId: req.auth!.userId }, { freelancerId: req.auth!.userId }];
  }

  const projects = await Project.find(filter)
    .sort({ createdAt: -1 })
    .populate("clientId", "name email walletAddress")
    .populate("freelancerId", "name email walletAddress")
    .limit(200);

  res.json({ projects });
}

export async function getProject(req: Request, res: Response) {
  const project = await Project.findById(req.params.id)
    .populate("clientId", "name email walletAddress")
    .populate("freelancerId", "name email walletAddress");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  res.json({ project });
}

export async function acceptProject(req: Request, res: Response) {
  if (req.auth!.role !== "freelancer") {
    throw new ApiError(403, "Only freelancers can accept projects");
  }

  const project = await Project.findById(req.params.id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  if (project.status !== "open") {
    throw new ApiError(409, "This project is no longer open");
  }

  project.freelancerId = req.auth!.userId as unknown as typeof project.freelancerId;
  project.status = "accepted";
  await project.save();

  res.json({ project });
}
