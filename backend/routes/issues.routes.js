// backend/routes/issues.routes.js
import { Router } from "express";
import {
  listIssues,
  getIssue,
  createIssue,
  createIssueHandler,
  updateIssueHandler,
  decideIssueResolution,
} from "../controllers/issues.controller.js";

const router = Router();
router.get("/", listIssues);
router.get("/:id", getIssue);
router.post("/", createIssueHandler);
router.put("/:id", updateIssueHandler);
router.post("/decisions/:notificationId", decideIssueResolution);

export default router;
