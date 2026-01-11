// backend/controllers/notifications.controller.js
import {
  listPendingRiskNotifications,
  listPendingIssueNotifications,
  listPendingDependencyNotifications,
  listPendingEscalationNotifications,
  listPendingActionNotifications,
  listBmRiskNotifications,
  listBmIssueNotifications,
  listBmEscalationNotifications,
  listBmDependencyNotifications,
  listBmActionNotifications,
  countAdminPendingRiskNotifications,
  countBmNotifications,
} from "../models/notifications.model.js";



import { sendSuccess, sendError } from "../utils/response.utils.js";

// ADMIN – Risk approvals (with joins for richer data)
export async function listRiskNotifications(req, res) {
  try {
    const items = await listPendingRiskNotifications();
    return sendSuccess(res, items);
  } catch (err) {
    console.error("Error listing risk notifications", err);
    return sendError(res, 500, "Failed to list notifications");
  }
}

// ADMIN – generic lists for other modules
export async function listIssueNotifications(req, res) {
  try {
    const items = await listPendingIssueNotifications();
    return sendSuccess(res, items);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Failed to list notifications");
  }
}

export async function listDependencyNotifications(req, res) {
  try {
    const items = await listPendingDependencyNotifications();
    return sendSuccess(res, items);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Failed to list notifications");
  }
}

export async function listEscalationNotifications(req, res) {
  try {
    const items = await listPendingEscalationNotifications();
    return sendSuccess(res, items);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Failed to list notifications");
  }
}

export async function listActionNotifications(req, res) {
  try {
    const items = await listPendingActionNotifications();
    return sendSuccess(res, items);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Failed to list notifications");
  }
}



// BM – notifications by module (?module=risk|issue|dependency|escalation)
export async function listBmNotificationsByModule(req, res) {
  try {
    const email = req.user?.email;
    if (!email) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    const module = req.query.module || "risk";
    let items = [];

    switch (module) {
      case "risk":
        items = await listBmRiskNotifications(email);
        break;
      case "issue":
        items = await listBmIssueNotifications(email);
        break;
      case "dependency":
        items = await listBmDependencyNotifications(email);
        break;
      case "escalation":
        items = await listBmEscalationNotifications(email);
        break;
      case "action":
        items = await listBmActionNotifications(email);
        break;
      default:
        items = [];
    }

    return res.json({ success: true, data: items });
  } catch (err) {
    console.error("Error listing BM notifications", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to list notifications" });
  }
}

// ADMIN bell count (RISK only)
export async function getAdminNotificationCount(req, res) {
  try {
    const c = await countAdminPendingRiskNotifications();
    return sendSuccess(res, { count: c });
  } catch (err) {
    console.error("Error counting admin notifications", err);
    return sendError(res, 500, "Failed to get count");
  }
}

// BM bell count (RISK only for now)
export async function getBmNotificationCount(req, res) {
  try {
    const email = req.user?.email;
    if (!email) return sendError(res, 401, "Unauthorized");
    const c = await countBmNotifications(email);
    return sendSuccess(res, { count: c });
  } catch (err) {
    console.error("Error counting BM notifications", err);
    return sendError(res, 500, "Failed to get count");
  }
}


