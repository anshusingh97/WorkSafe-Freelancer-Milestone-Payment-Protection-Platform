import { Router } from "express";
import { getStats } from "../controllers/adminController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/stats", requireAuth, requireRole("admin"), getStats);

export default router;
