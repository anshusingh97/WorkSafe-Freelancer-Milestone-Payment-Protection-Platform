import { Router } from "express";
import { submitFeedback } from "../controllers/feedbackController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, submitFeedback);

export default router;
