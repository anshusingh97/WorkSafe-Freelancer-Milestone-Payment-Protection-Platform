import { Router } from "express";
import { createDispute, listDisputes, resolveDispute } from "../controllers/disputeController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, createDispute);
router.get("/", requireAuth, listDisputes);
router.patch("/:id/resolve", requireAuth, resolveDispute);

export default router;
