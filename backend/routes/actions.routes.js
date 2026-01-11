// backend/routes/actions.routes.js
import { Router } from "express";
import {
  listActions,
  getAction,
  createActionHandler,
  updateActionHandler,
  decideActionResolution,
} from "../controllers/actions.controller.js";

const router = Router();

router.get("/", listActions);
router.get("/:id", getAction);
router.post("/", createActionHandler);
router.put("/:id", updateActionHandler);
router.post("/decisions/:notificationId", decideActionResolution);

export default router;
