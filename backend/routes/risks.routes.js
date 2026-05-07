import { Router } from "express";
import {
  listRisks,
  getRisk,
  createRiskHandler,
  updateRiskHandler,
  deleteRisksHandler,
  decideRiskResolution,
} from "../controllers/risks.controller.js";

const router = Router();

router.get("/", listRisks);
router.get("/:id", getRisk);
router.post("/", createRiskHandler);
router.put("/:id", updateRiskHandler);
router.post("/delete-multiple", deleteRisksHandler);


router.post("/decisions/:notificationId", decideRiskResolution);

export default router;
