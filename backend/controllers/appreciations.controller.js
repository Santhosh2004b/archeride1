import {
  findAppreciations,
  findAppreciationById,
  createAppreciation,
  updateAppreciation,
  findAppreciationsByIds,
  deleteMultipleAppreciations,
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

export const deleteAppreciationsHandler = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendError(res, 400, "No ids provided for deletion.");
    }

    if (req.user?.role === "ADMIN") {
      return sendError(res, 403, "Admins are not allowed to delete appreciations.");
    }

    const records = await findAppreciationsByIds(ids);
    if (!records.length) {
      return sendError(res, 404, "None of the specified entries were found.");
    }

    if (req.user?.role !== "ADMIN") {
      const today = new Date().toDateString();
      for (const r of records) {
        const dateRaw = r.created_at || r.identified_date || r.reported_date || r.received_date || r.created_date || Date.now();
        const createdAt = new Date(dateRaw).toDateString();
        if (createdAt !== today) {
          return sendError(res, 403, "Deletion is restricted to same-day entries only.");
        }
      }
    }

    const deletedCount = await deleteMultipleAppreciations(ids);
    res.json({ message: `Successfully deleted ${deletedCount} entries.` });
  } catch (error) {
    console.error("deleteAppreciationsHandler error:", error);
    sendError(res, 500, "Internal Server Error");
  }
};
