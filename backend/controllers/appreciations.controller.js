// backend/controllers/appreciations.controller.js
import {
  findAppreciations,
  findAppreciationById,
  createAppreciation,
  updateAppreciation,
} from "../models/appreciations.model.js";

import { buildAppreciationFilters, applyRoleRestrictions } from "../utils/filters.utils.js";
import { getAssignedProjects } from "../models/users.model.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";

export async function listAppreciations(req, res) {
  try {
    const user = req.user;
    const augmentedQuery = await applyRoleRestrictions(user, req.query || {});
    const filters = buildAppreciationFilters(augmentedQuery);

    const rows = await findAppreciations(filters);
    return sendSuccess(res, rows);
  } catch (err) {
    console.error("Error listing appreciations", err);
    return sendError(res, 500, "Failed to list appreciations");
  }
}

export async function getAppreciation(req, res) {
  try {
    const { id } = req.params;
    const row = await findAppreciationById(id);

    if (!row) return sendError(res, 404, "Appreciation not found");

    if (req.user.role !== "ADMIN") {
      const assigned = await getAssignedProjects(req.user.id);
      const projectIds = assigned.map(p => p.id);
      if (!projectIds.includes(row.project_id)) {
        return sendError(res, 403, "Forbidden: Not assigned to this project");
      }
    }

    return sendSuccess(res, row);
  } catch (err) {
    console.error("Error getting appreciation", err);
    return sendError(res, 500, "Failed to get appreciation");
  }
}

export async function createAppreciationHandler(req, res) {
  try {
    if (!req.body.appreciation_id || req.body.appreciation_id.trim() === "") {
      const { generateEntityId } = await import("../utils/idGenerator.js");
      req.body.appreciation_id = await generateEntityId(
        req.user.email,
        req.body.account || "Default",
        "appreciation"
      );
    }

    const payload = {
      ...req.body,
      recorded_by: req.user.email,
    };

    // Sanitize undefined -> null
    ["project_id", "project_description", "account"].forEach(f => {
      if (payload[f] === undefined) payload[f] = null;
    });

    const created = await createAppreciation(payload);

    return sendSuccess(res, created, 201);
  } catch (err) {
    console.error("Error creating appreciation", err);
    return sendError(res, 500, "Failed to create appreciation");
  }
}

export async function updateAppreciationHandler(req, res) {
  try {
    const { id } = req.params;

    const existing = await findAppreciationById(id);
    if (!existing) return sendError(res, 404, "Appreciation not found");

    /*
    if (req.user.role !== "ADMIN") {
      const assigned = await getAssignedProjects(req.user.id);
      const projectIds = assigned.map(p => p.id);
      if (!projectIds.includes(existing.project_id)) {
        return sendError(res, 403, "Forbidden: Not assigned to this project");
      }
    }
    */

    const updated = await updateAppreciation(id, {
      ...req.body,
      recorded_by: existing.recorded_by,
    });

    return sendSuccess(res, updated);
  } catch (err) {
    console.error("Error updating appreciation:", err);
    return sendError(res, 500, `Failed to update appreciation: ${err.message}`);
  }
}
