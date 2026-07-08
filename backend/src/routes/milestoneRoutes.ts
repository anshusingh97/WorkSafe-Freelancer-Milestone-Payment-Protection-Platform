import { Router } from "express";
import {
  approveMilestone,
  createMilestone,
  disputeMilestone,
  fundMilestone,
  listMilestonesForProject,
  submitMilestoneWork,
} from "../controllers/milestoneController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, createMilestone);
router.get("/project/:projectId", requireAuth, listMilestonesForProject);
router.patch("/:id/fund", requireAuth, fundMilestone);
router.patch("/:id/submit", requireAuth, submitMilestoneWork);
router.patch("/:id/approve", requireAuth, approveMilestone);
router.patch("/:id/dispute", requireAuth, disputeMilestone);

export default router;
