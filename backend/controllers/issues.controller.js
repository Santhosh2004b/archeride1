// backend/controllers/issues.controller.js
import { buildIssueFilters } from "../utils/filters.utils.js";
import {
  findIssues,
  findIssueById,
  createIssue as createIssueModel,
  updateIssue as updateIssueModel,
} from "../models/issues.model.js";
import {
  createResolutionNotification,
  decideNotification,
  createBmNotificationForIssueDecision,
} from "../models/notifications.model.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";
import pool from "../db.js";

// backend/controllers/issues.controller.js

export async function listIssues(req, res) {
  try {
    // Use the filter builder to construct WHERE clause and params for raw SQL
    let { whereSql, params } = buildIssueFilters(req.query);

    // 🔒 ISOLATION: Non-admins only see their own items
    if (req.user.role !== "ADMIN") {
      const userEmail = req.user.email;
      if (whereSql) {
        whereSql += ` AND i.reported_by = $${params.length + 1}`;
      } else {
        whereSql = `WHERE i.reported_by = $${params.length + 1}`;
      }
      params.push(userEmail);
    }

    // Call the model function which uses raw SQL + pool
    const rows = await findIssues({ whereSql, params });

    return res.status(200).json(rows);
  } catch (err) {
    console.error("issues.listIssues error", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch issues", error: err.message || err });
  }
}

export async function createIssue(req, res) {
  try {
    const payload = {
      ...req.body,
      project_name: req.body.project_name,
      reported_by: req.user.email, // ✅ FORCE EMAIL
    };

    const issue = await createIssueModel(payload);
    return sendSuccess(res, issue, 201);
  } catch (err) {
    return sendError(res, 500, "Failed to create issue");
  }
}

export async function getIssue(req, res) {
  try {
    const { id } = req.params;
    const issue = await findIssueById(id);
    if (!issue) return sendError(res, 404, "Issue not found");
    return sendSuccess(res, issue);
  } catch (err) {
    console.error("Error getting issue", err);
    return sendError(res, 500, "Failed to get issue");
  }
}

export async function createIssueHandler(req, res) {
  try {
    // 🔐 Check if user is authenticated
    if (!req.user || !req.user.email) {
      console.error("createIssueHandler: req.user not set", req.user);
      return sendError(res, 401, "User not authenticated");
    }

    // 🆔 Auto-generate ID if not provided
    if (!req.body.issue_id || req.body.issue_id.trim() === "") {
      const { generateEntityId } = await import("../utils/idGenerator.js");
      req.body.issue_id = await generateEntityId(
        req.user.email,
        req.body.project_name || "Default",
        "issue"
      );
    }

    // 🗺️ Map frontend field names to backend database column names
    const payload = {
      ...req.body,
      reported_date: req.body.identified_date || req.body.reported_date,
      reported_by: req.body.identified_by || req.body.reported_by || req.user.email,
    };

    // Remove the old field names if they exist
    delete payload.identified_date;
    delete payload.identified_by;

    const created = await createIssueModel(payload);
    return sendSuccess(res, created, 201);
  } catch (err) {
    console.error("Error creating issue", err);
    console.error("Request body:", req.body);
    console.error("User:", req.user);
    return sendError(res, 500, `Failed to create issue: ${err.message}`);
  }
}

export async function updateIssueHandler(req, res) {
  try {
    const { id } = req.params;

    const existing = await findIssueById(id);
    if (!existing) return sendError(res, 404, "Issue not found");

    // 🔐 OWNERSHIP CHECK
    // Allow editing if: user is admin, OR user owns the issue, OR issue has no valid owner email
    const isEmail = (str) => str && str.includes('@');
    const hasValidOwner = existing.reported_by && isEmail(existing.reported_by);
    const isOwner = hasValidOwner && existing.reported_by === req.user.email;
    const canEdit = req.user.role === "ADMIN" || isOwner || !hasValidOwner;

    if (!canEdit) {
      console.log("Ownership check failed:", {
        userRole: req.user.role,
        userEmail: req.user.email,
        existingReportedBy: existing.reported_by,
        hasValidOwner,
        isOwner
      });
      return sendError(res, 403, "Forbidden - You can only edit your own issues");
    }

    // 🗺️ Map frontend field names to backend database column names
    const payload = {
      ...req.body,
      reported_date: req.body.identified_date || req.body.reported_date || existing.reported_date,
      reported_by: existing.reported_by, // Don't allow changing who reported it
    };

    // Remove the old field names
    delete payload.identified_date;
    delete payload.identified_by;

    const oldStatus = existing.status;
    const newStatus = payload.status;

    const normalize = (s) => s?.trim().toLowerCase();
    const becameResolved =
      normalize(oldStatus) !== "resolved" &&
      normalize(newStatus) === "resolved";



    const updated = await updateIssueModel(id, {
      ...payload,
      project_name: payload.project_name,
    })
    if (becameResolved && req.user?.email) {
      await createResolutionNotification({
        module: "issue",
        itemId: updated.id,
        itemCode: updated.issue_id,
        statusBefore: oldStatus,
        statusAfter: newStatus,
        payload: {
          project_name: existing.project_name,
          priority: updated.priority,
          category: updated.category,
          issue_title: updated.issue_title,
          reported_date: updated.reported_date,
        },
        bmUser: req.user.email,
      });
    }

    return sendSuccess(res, updated);
  } catch (err) {
    console.error("Error updating issue", err);
    return sendError(res, 500, "Failed to update issue");
  }
}

export async function decideIssueResolution(req, res) {
  try {
    const { notificationId } = req.params;
    const { decision, comment } = req.body;
    const adminUser = req.user?.email || null;

    if (!decision) {
      return sendError(res, 400, "Decision required");
    }

    const decided = await decideNotification({
      id: notificationId,
      adminUser,
      decision,
      comment,
    });

    await createBmNotificationForIssueDecision({
      issueId: decided.item_id,
      bmEmail: decided.bm_user,
      decision,
      comment,
    });

    return sendSuccess(res, decided);
  } catch (err) {
    console.error("Issue decision failed", err);
    return sendError(res, 500, "Failed to process decision");
  }
}

