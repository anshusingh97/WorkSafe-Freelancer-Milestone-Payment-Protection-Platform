import { Router } from "express";
import {
  acceptProject,
  createProject,
  getProject,
  listProjects,
} from "../controllers/projectController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, createProject);
router.get("/", requireAuth, listProjects);
router.get("/:id", requireAuth, getProject);
router.patch("/:id/accept", requireAuth, acceptProject);

export default router;
