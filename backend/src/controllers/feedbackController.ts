import { Request, Response } from "express";
import { z } from "zod";
import { Feedback } from "../models/Feedback";

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  liked: z.string().max(1000).optional(),
  problemFaced: z.string().max(1000).optional(),
  wouldUse: z.boolean().optional(),
  message: z.string().max(2000).optional(),
});

export async function submitFeedback(req: Request, res: Response) {
  const data = feedbackSchema.parse(req.body);
  const feedback = await Feedback.create({ ...data, userId: req.auth!.userId });
  res.status(201).json({ feedback });
}
