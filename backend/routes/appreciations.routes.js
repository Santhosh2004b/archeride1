import { Router } from "express";
import {
  listAppreciations,
  getAppreciation,
  createAppreciationHandler,
  updateAppreciationHandler,
  deleteAppreciationsHandler,
} from "../controllers/appreciations.controller.js";
const router = Router();
router.get("/", listAppreciations);
router.get("/:id", getAppreciation);
router.post("/", createAppreciationHandler);
router.put("/:id", updateAppreciationHandler);
router.post("/delete-multiple", deleteAppreciationsHandler);

export default router;