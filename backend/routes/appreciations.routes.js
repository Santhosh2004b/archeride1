import { Router } from "express";
import {
  listAppreciations,
  getAppreciation,
  createAppreciationHandler,
  updateAppreciationHandler,
} from "../controllers/appreciations.controller.js";

const router = Router();

router.get("/", listAppreciations);
router.get("/:id", getAppreciation);
router.post("/", createAppreciationHandler);
router.put("/:id", updateAppreciationHandler);

export default router;
