
import pool from "../db.js";
import {
  findActionById,
  createAction as createActionModel,
  updateAction as updateActionModel,
} from "../models/actions.model.js";

import { buildActionFilters, applyRoleRestrictions } from "../utils/filters.utils.js";
import { getAssignedProjects } from "../models/users.model.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";
import {
  createResolutionNotification,
  decideNotification,
} from "../models/notifications.model.js";

export async function listActions(req, res) {
  try {
    const user = req.user;
    const augmentedQuery = await applyRoleRestrictions(user, req.query || {});
    const filters = buildActionFilters(augmentedQuery);

    const { whereSql, params } = filters;
    const sql = `
      SELECT a.*
      FROM actions a
      ${whereSql || ""}
      ORDER BY a.created_at DESC NULLS LAST, a.last_updated DESC NULLS LAST
    `;

    const { rows } = await pool.query(sql, params);
    return sendSuccess(res, rows);

  } catch (err) {
    console.error("Error listing actions:", err);
    return sendError(res, 500, "Failed to list actions");
  }
}

export async function getAction(req, res) {
  try {
    const action = await findActionById(req.params.id);
    if (!action) {
      return sendError(res, 404, "Action not found");
    }

    if (req.user.role !== "ADMIN") {
      const assigned = await getAssignedProjects(req.user.id);
      const projectIds = assigned.map(p => p.id);
      if (!projectIds.includes(action.project_id)) {
        return sendError(res, 403, "Forbidden: Not assigned to this project");
      }
    }

    return sendSuccess(res, action);
  } catch (err) {
    console.error("Error getting action", err);
    return sendError(res, 500, "Failed to get action");
  }
}

export async function createActionHandler(req, res) {
  try {
    if (!req.body.action_id || req.body.action_id.trim() === "") {
      const { generateEntityId } = await import("../utils/idGenerator.js");
      req.body.action_id = await generateEntityId(
        req.user.email,
        req.body.account || "Default",
        "action"
      );
    }

    const payload = {
      ...req.body,
      created_by: req.user.email,
    };

    
    ["project_id", "project_description", "account", "priority", "category"].forEach(f => {
      if (payload[f] === undefined) payload[f] = null;
    });

    
    if (payload.completion_percent) {
      const parsed = parseFloat(payload.completion_percent);
      payload.completion_percent = isNaN(parsed) ? null : parsed;
    } else {
      payload.completion_percent = null;
    }

    const created = await createActionModel(payload);

    return sendSuccess(res, created, 201);
  } catch (err) {
    console.error("Error creating action:", err);
    return sendError(res, 500, "Failed to create action");
  }
}

export async function updateActionHandler(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;

    const existing = await findActionById(id);
    if (!existing) return sendError(res, 404, "Action not found");

    

    const oldStatus = existing.status;
    const newStatus = payload.status;

    
    if (payload.completion_percent !== undefined) {
      const parsed = parseFloat(payload.completion_percent);
      payload.completion_percent = isNaN(parsed) ? null : parsed;
    }

    const updated = await updateActionModel(id, payload);
    if (!updated) return sendError(res, 404, "Action not found");

    const normalize = (s) => s?.trim().toLowerCase();
    const becameResolved =
      normalize(oldStatus) !== "resolved" &&
      normalize(newStatus) === "resolved";

    if (becameResolved && req.user?.email) {
      await createResolutionNotification({
        module: "action",
        itemId: updated.id,
        itemCode: updated.action_id,
        statusBefore: oldStatus,
        statusAfter: newStatus,
        payload: {
          account: existing.account, project_id: existing.project_id,
          priority: updated.priority,
          related_to_type: updated.related_to_type,
          action_title: updated.action_title,
          created_date: updated.created_date,
        },
        bmUser: req.user.email,
      });
    }

    return sendSuccess(res, updated);
  } catch (err) {
    console.error("Error updating action:", err);
    return sendError(res, 500, "Failed to update action");
  }
}

export async function decideActionResolution(req, res) {
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

    return sendSuccess(res, decided);
  } catch (err) {
    console.error("Action decision failed", err);
    return sendError(res, 500, "Failed to process decision");
  }
}
