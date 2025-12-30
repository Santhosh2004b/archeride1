import { Router } from "express";
import {
  listEscalations,
  getEscalation,
  createEscalationHandler,
  updateEscalationHandler,
  decideEscalationResolution,  // ✅ ADD THIS
} from "../controllers/escalations.controller.js";

const router = Router();
router.get("/", listEscalations);
router.get("/:id", getEscalation);
router.post("/", createEscalationHandler);
router.put("/:id", updateEscalationHandler);
router.post("/decisions/:notificationId", decideEscalationResolution);

export default router;
