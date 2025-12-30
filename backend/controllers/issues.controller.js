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
    const { whereSql, params } = buildIssueFilters(req.query);
    
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
    const created = await createIssueModel(req.body);
    return sendSuccess(res, created, 201);
  } catch (err) {
    console.error("Error creating issue", err);
    return sendError(res, 500, "Failed to create issue");
  }
}

export async function updateIssueHandler(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;

    const existing = await findIssueById(id);
    if (!existing) return sendError(res, 404, "Issue not found");

    // 🔐 OWNERSHIP CHECK
    if (
      req.user.role !== "ADMIN" &&
      existing.reported_by !== req.user.email
    ) {
      return sendError(res, 403, "Forbidden");
    }

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

