import pool from "../db.js";
import {
  findActionById,
  createAction as createActionModel,
  updateAction as updateActionModel,
} from "../models/actions.model.js";

import { sendSuccess, sendError } from "../utils/response.utils.js";
import {
  createResolutionNotification,
  decideNotification,
} from "../models/notifications.model.js";

/* ============================
   GET /api/actions
   ============================ */
export async function listActions(req, res) {
  try {
    const user = req.user;

    let sql = `
      SELECT a.*
      FROM actions a
    `;

    const params = [];

    // ADMIN sees all — BM sees own
    if (user.role !== "ADMIN") {
      sql += ` WHERE a.created_by = $1 `;
      params.push(user.email);
    }

    sql += ` ORDER BY a.created_at DESC NULLS LAST, a.last_updated DESC NULLS LAST`;

    const { rows } = await pool.query(sql, params);
    return sendSuccess(res, rows);

  } catch (err) {
    console.error("Error listing actions:", err);
    return sendError(res, 500, "Failed to list actions");
  }
}


/* ============================
   GET /api/actions/:id
   ============================ */
export async function getAction(req, res) {
  try {
    const action = await findActionById(req.params.id);
    if (!action) {
      return sendError(res, 404, "Action not found");
    }

    // 🔐 Ownership check
    if (
      req.user.role !== "ADMIN" &&
      action.created_by !== req.user.email
    ) {
      return sendError(res, 403, "Forbidden");
    }

    return sendSuccess(res, action);
  } catch (err) {
    console.error("Error getting action:", err);
    return sendError(res, 500, "Failed to get action");
  }
}

/* ============================
   POST /api/actions
   (BM can ADD MULTIPLE)
   ============================ */
export async function createAction(req, res) {
  try {
    // 🧼 sanitize numeric field
    const cp = req.body.completion_percent;
    req.body.completion_percent =
      cp === "" || isNaN(cp) ? null : Number(cp);

    // 🆔 Auto-generate ID if not provided
    if (!req.body.action_id || req.body.action_id.trim() === "") {
      const { generateEntityId } = await import("../utils/idGenerator.js");
      req.body.action_id = await generateEntityId(
        req.user.email,
        req.body.project_name || "Default",
        "action"
      );
    }

    const created = await createActionModel({
      ...req.body,
      project_name: req.body.project_name,
      created_by: req.user.email,
    });

    return sendSuccess(res, created, "Action created", 201);
  } catch (err) {
    console.error("Create action error:", err);
    return sendError(res, 500, "Failed to create action");
  }
}

/* ============================
   PUT /api/actions/:id
   ============================ */
export async function updateActionHandler(req, res) {
  try {
    const { id } = req.params;

    const cp = req.body.completion_percent;
    req.body.completion_percent =
      cp === "" || cp === undefined ? null : Number(cp);

    const existing = await findActionById(id);
    if (!existing) {
      return sendError(res, 404, "Action not found");
    }

    // 🔐 ownership check
    if (
      req.user.role !== "ADMIN" &&
      existing.created_by !== req.user.email
    ) {
      return sendError(res, 403, "Forbidden");
    }

    await updateActionModel(id, {
      ...req.body,
      project_name: req.body.project_name,
    });
    const updated = await findActionById(id);

    // 🔔 notify admin on completion
    const normalize = (s) => s?.trim().toLowerCase();


    return sendSuccess(res, updated);
  } catch (err) {
    console.error("Update action error:", err);
    return sendError(res, 500, "Failed to update action");
  }
}

/* ============================
   POST /api/actions/decisions/:id
   ============================ */
export async function decideActionResolution(req, res) {
  try {
    const { notificationId } = req.params;
    const { decision, comment } = req.body;

    if (!decision) {
      return sendError(res, 400, "Decision is required");
    }

    const updated = await decideNotification({
      id: notificationId,
      adminUser: req.user.email,
      decision,
      comment: comment || null,
    });

    if (!updated) {
      return sendError(res, 404, "Notification not found");
    }

    return sendSuccess(res, updated, "Decision recorded");
  } catch (err) {
    console.error("Decision error:", err);
    return sendError(res, 500, "Failed to record decision");
  }
}
