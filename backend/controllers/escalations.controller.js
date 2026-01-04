// backend/controllers/escalations.controller.js
import { buildEscalationFilters } from "../utils/filters.utils.js";
import {
  findEscalations,
  findEscalationById,
  findEscalationByUser,   // ✅ ADD THIS
  createEscalation,
  updateEscalation,
} from "../models/escalations.model.js";

import {
  createResolutionNotification,
  decideNotification,
  createBmNotificationForEscalationDecision,
} from "../models/notifications.model.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";
import pool from "../db.js";

export async function listEscalations(req, res) {
  try {
    const filters = buildEscalationFilters(req.query);

    // BM / PM → only their own escalations
    if (req.user.role !== "ADMIN") {
      filters.whereSql += filters.whereSql
        ? " AND e.created_by = $X"
        : " WHERE e.created_by = $X";

      filters.params.push(req.user.id);
      filters.whereSql = filters.whereSql.replace(
        "$X",
        `$${filters.params.length}`
      );
    }

    const rows = await findEscalations(filters);
    return sendSuccess(res, rows);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Failed to list escalations");
  }
}



export async function getEscalation(req, res) {
  try {
    const row = await findEscalationById(req.params.id);
    if (!row) return sendError(res, 404, "Escalation not found");

    if (req.user.role !== "ADMIN" && row.created_by !== req.user.id) {
      return sendError(res, 403, "Access denied");
    }

    return sendSuccess(res, row);
  } catch (err) {
    return sendError(res, 500, "Failed to get escalation");
  }
}

export async function createEscalationHandler(req, res) {
  try {
    // 🆔 Auto-generate ID if not provided
    if (!req.body.escalation_id || req.body.escalation_id.trim() === "") {
      const { generateEntityId } = await import("../utils/idGenerator.js");
      req.body.escalation_id = await generateEntityId(
        req.user.email,
        req.body.project_name || "Default",
        "escalation"
      );
    }

    const created = await createEscalation(
      {
        ...req.body,
        project_name: req.body.project_name,
      },
      req.user.id
    );

    return sendSuccess(res, created, 201);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Failed to create escalation");
  }
}


export async function updateEscalationHandler(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;

    const existing = await findEscalationById(id);
    if (!existing) return sendError(res, 404, "Escalation not found");

    const oldStatus = existing.status;
    const newStatus = payload.status;

    const updated = await updateEscalation(id, {
      ...payload,
      project_name: payload.project_name,
    }); if (!updated) return sendError(res, 404, "Escalation not found");

    const normalize = (s) => s?.trim().toLowerCase();
    const becameResolved =
      normalize(oldStatus) !== "resolved" &&
      normalize(newStatus) === "resolved";

    if (becameResolved && req.user?.email) {
      await createResolutionNotification({
        module: "escalation",
        itemId: updated.id,
        itemCode: updated.escalation_id,
        statusBefore: oldStatus,
        statusAfter: newStatus,
        payload: {
          project_name: updated.project_name,
          priority: updated.priority,
          category: updated.category,
          title: updated.title,
          reported_date: updated.reported_date,
        },
        bmUser: req.user.email,
      });
    }

    return sendSuccess(res, updated);
  } catch (err) {
    console.error("Error updating escalation", err);
    return sendError(res, 500, "Failed to update escalation");
  }
}
export async function decideEscalationResolution(req, res) {
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

    await createBmNotificationForEscalationDecision({
      escalationId: decided.item_id,
      bmEmail: decided.bm_user,
      decision,
      comment,
    });

    return sendSuccess(res, decided);
  } catch (err) {
    console.error("Escalation decision failed", err);
    return sendError(res, 500, "Failed to process decision");
  }
}

