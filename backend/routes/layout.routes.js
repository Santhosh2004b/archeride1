
import { Router } from "express";
import { getLayout, saveLayout } from "../controllers/layout.controller.js";
import { authMiddleware, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:module", authMiddleware, getLayout);
router.post("/:module", authMiddleware, requireAdmin, saveLayout);

export default router;
