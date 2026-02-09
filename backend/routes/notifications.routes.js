
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


router.get("/risks", listRiskNotifications);
router.get("/issues", listIssueNotifications);
router.get("/dependencies", listDependencyNotifications);
router.get("/escalations", listEscalationNotifications);
router.get("/actions", listActionNotifications);


router.get("/bm", listBmNotificationsByModule);


router.get("/counts/admin", getAdminNotificationCount);
router.get("/counts/bm", getBmNotificationCount);

export default router;
