import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  listDependencies,
  getDependency,
  createDependencyHandler,
  updateDependencyHandler,
  decideDependencyResolution,
} from "../controllers/dependencies.controller.js";

const router = Router();

// 🔐 THIS IS THE FIX — DO NOT SKIP
router.use(authMiddleware);

router.get("/", listDependencies);
router.get("/:id", getDependency);
router.post("/", createDependencyHandler);
router.put("/:id", updateDependencyHandler);
router.post("/decisions/:notificationId", decideDependencyResolution);

export default router;
