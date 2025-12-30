// backend/routes/notifications.routes.js
import { Router } from "express";
import {
  listRiskNotifications,
  listIssueNotifications,
  listDependencyNotifications,
  listEscalationNotifications,
  listActionNotifications,
  listBmNotificationsByModule,
  getAdminNotificationCount,
  getBmNotificationCount,
} from "../controllers/notifications.controller.js";

const router = Router();

// ADMIN: approvals
router.get("/risks", listRiskNotifications);
router.get("/issues", listIssueNotifications);
router.get("/dependencies", listDependencyNotifications);
router.get("/escalations", listEscalationNotifications);
router.get("/actions", listActionNotifications);

// BM: own notifications (all modules via ?module=)
router.get("/bm", listBmNotificationsByModule);

// counts for bell
router.get("/counts/admin", getAdminNotificationCount);
router.get("/counts/bm", getBmNotificationCount);

export default router;
