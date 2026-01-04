import {
  findAppreciations,
  findAppreciationById,
  createAppreciation,
  updateAppreciation,
} from "../models/appreciations.model.js";

import { buildAppreciationFilters } from "../utils/filters.utils.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";

/* ============================
   GET /api/appreciations
   ============================ */
export async function listAppreciations(req, res) {
  try {
    const user = req.user;
    const filters = buildAppreciationFilters(req.query || {});

    // 🔐 BM / PM → only own
    if (user.role !== "ADMIN") {
      filters.whereSql += filters.whereSql
        ? " AND a.recorded_by = $X"
        : " WHERE a.recorded_by = $X";

      filters.params.push(user.email);
      filters.whereSql = filters.whereSql.replace(
        "$X",
        `$${filters.params.length}`
      );
    }

    const rows = await findAppreciations(filters);
    return sendSuccess(res, rows);
  } catch (err) {
    console.error("Error listing appreciations", err);
    return sendError(res, 500, "Failed to list appreciations");
  }
}

/* ============================
   GET /api/appreciations/:id
   ============================ */
export async function getAppreciation(req, res) {
  try {
    const { id } = req.params;
    const row = await findAppreciationById(id);

    if (!row) return sendError(res, 404, "Appreciation not found");

    // 🔐 ownership check
    if (
      req.user.role !== "ADMIN" &&
      row.recorded_by !== req.user.email
    ) {
      return sendError(res, 403, "Forbidden");
    }

    return sendSuccess(res, row);
  } catch (err) {
    console.error("Error getting appreciation", err);
    return sendError(res, 500, "Failed to get appreciation");
  }
}

/* ============================
   POST /api/appreciations
   ============================ */
export async function createAppreciationHandler(req, res) {
  try {
    // 🆔 Auto-generate ID if not provided
    if (!req.body.appreciation_id || req.body.appreciation_id.trim() === "") {
      const { generateEntityId } = await import("../utils/idGenerator.js");
      req.body.appreciation_id = await generateEntityId(
        req.user.email,
        req.body.project_name || "Default",
        "appreciation"
      );
    }

    const created = await createAppreciation({
      ...req.body,
      recorded_by: req.user.email,
    });

    return sendSuccess(res, created, "Appreciation created", 201);
  } catch (err) {
    console.error("Error creating appreciation", err);
    return sendError(res, 500, "Failed to create appreciation");
  }
}

/* ============================
   PUT /api/appreciations/:id
   ============================ */
export async function updateAppreciationHandler(req, res) {
  try {
    const { id } = req.params;

    const existing = await findAppreciationById(id);
    if (!existing) return sendError(res, 404, "Appreciation not found");

    // 🔐 ownership check
    if (
      req.user.role !== "ADMIN" &&
      existing.recorded_by !== req.user.email
    ) {
      return sendError(res, 403, "Forbidden");
    }

    const updated = await updateAppreciation(id, {
      ...req.body,
      recorded_by: existing.recorded_by,
    });

    return sendSuccess(res, updated);
  } catch (err) {
    console.error("Error updating appreciation", err);
    return sendError(res, 500, "Failed to update appreciation");
  }
}
