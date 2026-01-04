// backend/controllers/risks.controller.js
import { buildRiskFilters } from "../utils/filters.utils.js";
function toYYYYMMDD(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}
import {
  findRisks,
  findRiskById,
  createRisk,
  updateRisk,
} from "../models/risks.model.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";
import { createResolutionNotification } from "../models/notifications.model.js";
import { updateRiskStatus } from "../models/risks.model.js";
import pool from "../db.js";   // ✅ ADD THIS LINE

import { decideNotification } from "../models/notifications.model.js";
/* ============================
   LIST RISKS (BM vs ADMIN)
   ============================ */
export async function listRisks(req, res) {
  try {
    const user = req.user;
    const filters = buildRiskFilters(req.query);

    // 🔐 BM / PM → only own risks
    if (user.role !== "ADMIN") {
      filters.whereSql += filters.whereSql
        ? " AND r.created_by = $X"
        : " WHERE r.created_by = $X";
      filters.params.push(user.id);
      filters.whereSql = filters.whereSql.replace(
        "$X",
        `$${filters.params.length}`
      );
    }

    const rows = await findRisks(filters);
    return sendSuccess(res, rows);
  } catch (err) {
    console.error("Error listing risks", err);
    return sendError(res, 500, "Failed to list risks");
  }
}

/* ============================
   GET RISK
   ============================ */
export async function getRisk(req, res) {
  try {
    const risk = await findRiskById(req.params.id);
    if (!risk) return sendError(res, 404, "Risk not found");

    // 🔐 Ownership check
    if (req.user.role !== "ADMIN" && risk.created_by !== req.user.id) {
      return sendError(res, 403, "Forbidden");
    }

    return sendSuccess(res, risk);
  } catch (err) {
    return sendError(res, 500, "Failed to get risk");
  }
}

/* ============================
   CREATE RISK
   ============================ */
export async function createRiskHandler(req, res) {
  try {
    // 🆔 Auto-generate ID if not provided
    if (!req.body.risk_id || req.body.risk_id.trim() === "") {
      const { generateEntityId } = await import("../utils/idGenerator.js");
      req.body.risk_id = await generateEntityId(
        req.user.email,
        req.body.project_name || "Default",
        "risk"
      );
    }

    // Format all date fields as YYYY-MM-DD
    const dateFields = [
      "identified_date",
      "target_mitigation_date",
      "last_reviewed_date"
    ];
    const payload = {
      ...req.body,
      project_name: req.body.project_name,
      created_by: req.user.id,
    };
    dateFields.forEach((field) => {
      if (payload[field]) payload[field] = toYYYYMMDD(payload[field]);
      else payload[field] = null;
    });
    // Allow null for all optional fields
    [
      "risk_score",
      "mitigation_strategy",
      "mitigation_owner",
      "current_status",
      "comments"
    ].forEach((field) => {
      if (payload[field] === undefined) payload[field] = null;
    });
    const created = await createRisk(payload);
    return sendSuccess(res, created, 201);
  } catch (err) {
    console.error("Create risk error", err);
    return sendError(res, 500, "Failed to create risk");
  }
}


/* ============================
   UPDATE RISK
   ============================ */

export async function updateRiskHandler(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;

    const existing = await findRiskById(id);
    if (!existing) {
      return sendError(res, 404, "Risk not found");
    }

    if (req.user.role !== "ADMIN" && existing.created_by !== req.user.id) {
      return sendError(res, 403, "Forbidden");
    }

    const oldStatus = existing.status;
    const newStatus = payload.status;

    const normalize = (s) => s?.trim().toLowerCase();
    const becameResolved =
      normalize(oldStatus) !== "resolved" &&
      normalize(newStatus) === "resolved";

    const updated = await updateRisk(id, {
      ...payload,
      project_name: payload.project_name,
    });


    // ✅ USE existing.project_name (safe)
    if (becameResolved && req.user?.email) {
      await createResolutionNotification({
        module: "risk",
        itemId: updated.id,
        itemCode: updated.risk_id,
        statusBefore: oldStatus,
        statusAfter: newStatus,
        payload: {
          project_name: existing.project_name,
          priority: updated.priority,
          category: updated.category,
          risk_title: updated.risk_title,
          identified_date: updated.identified_date,
        },
        bmUser: req.user.email,
      });
    }

    return sendSuccess(res, updated);
  } catch (err) {
    console.error("Failed to update risk", err);
    return sendError(res, 500, "Failed to update risk");
  }
}
export async function decideRiskResolution(req, res) {
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
    console.error("Risk decision failed", err);
    return sendError(res, 500, "Failed to process decision");
  }
}

