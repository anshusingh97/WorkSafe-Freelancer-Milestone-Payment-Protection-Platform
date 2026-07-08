import { Router } from "express";
import { updateWallet } from "../controllers/userController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.patch("/wallet", requireAuth, updateWallet);

export default router;
