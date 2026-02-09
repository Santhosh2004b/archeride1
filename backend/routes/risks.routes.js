import { Router } from "express";
import {
  listRisks,
  getRisk,
  createRiskHandler,
  updateRiskHandler,
  decideRiskResolution,
} from "../controllers/risks.controller.js";

const router = Router();

router.get("/", listRisks);
router.get("/:id", getRisk);
router.post("/", createRiskHandler);
router.put("/:id", updateRiskHandler);


router.post("/decisions/:notificationId", decideRiskResolution);

export default router;
