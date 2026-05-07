
import {
  findDependencies,
  findDependencyById,
  createDependency,
  updateDependency,
  countAll,
  findDependenciesByIds,
  deleteMultipleDependencies
} from "../models/dependencies.model.js";

import {
  createResolutionNotification,
  decideNotification,
  createBmNotificationForDependencyDecision,
} from "../models/notifications.model.js";

import { buildDependencyFilters, applyRoleRestrictions } from "../utils/filters.utils.js";
import { getAssignedProjects } from "../models/users.model.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";
import pool from "../db.js";

export async function listDependencies(req, res) {
  try {
    const user = req.user;
    const augmentedQuery = await applyRoleRestrictions(user, req.query || {});
    const filters = buildDependencyFilters(augmentedQuery);

    const deps = await findDependencies(filters);
    return sendSuccess(res, deps);
  } catch (err) {
    console.error("Error listing dependencies", err);
    return sendError(res, 500, "Failed to list dependencies");
  }
}

export async function getDependency(req, res) {
  try {
    const { id } = req.params;
    const dep = await findDependencyById(id);
    if (!dep) return sendError(res, 404, "Dependency not found");


    return sendSuccess(res, dep);

    return sendSuccess(res, dep);
  } catch (err) {
    console.error("Error getting dependency", err);
    return sendError(res, 500, "Failed to get dependency");
  }
}

export async function createDependencyHandler(req, res) {
  try {

    if (!req.body.dependency_id || req.body.dependency_id.trim() === "") {
      const { generateEntityId } = await import("../utils/idGenerator.js");
      req.body.dependency_id = await generateEntityId(
        req.user.email,
        req.body.account || "Default",
        "dependency"
      );
    }

    const payload = {
      ...req.body,
      reported_by: req.user.email,
    };


    ["manual_project_id", "project_description", "account"].forEach(f => {
      if (payload[f] === undefined) payload[f] = null;
    });

    const created = await createDependency(payload);

    if (payload.status?.toLowerCase() === "resolved" && req.user?.email) {
      await createResolutionNotification({
        module: "dependency",
        itemId: created.id,
        itemCode: created.dependency_id,
        statusBefore: "N/A (New Record)",
        statusAfter: payload.status,
        payload: {
          account: created.account,
          manual_project_id: created.manual_project_id,
          priority: created.priority,
          type: created.type,
          dependency_title: created.dependency_title,
          reported_date: created.reported_date,
        },
        bmUser: req.user.email,
      });
    }

    return sendSuccess(res, created, 201);
  } catch (err) {
    console.error("Error creating dependency", err);
    return sendError(res, 500, "Failed to create dependency");
  }
}


export async function updateDependencyHandler(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;

    const existing = await findDependencyById(id);
    if (!existing) return sendError(res, 404, "Dependency not found");



    const oldStatus = existing.status;
    const newStatus = payload.status;

    const updated = await updateDependency(id, payload);
    if (!updated) return sendError(res, 404, "Dependency not found");

    const normalize = (s) => s?.trim().toLowerCase();
    const becameResolved =
      normalize(oldStatus) !== "resolved" &&
      normalize(newStatus) === "resolved";


    if (becameResolved && req.user?.email) {
      await createResolutionNotification({
        module: "dependency",
        itemId: updated.id,
        itemCode: updated.dependency_id,
        statusBefore: oldStatus,
        statusAfter: newStatus,
        payload: {
          account: existing.account, manual_project_id: existing.manual_project_id,
          priority: updated.priority,
          type: updated.type,
          dependency_title: updated.dependency_title,
          reported_date: updated.reported_date,
        },
        bmUser: req.user.email,
      });
    }

    return sendSuccess(res, updated);
  } catch (err) {
    console.error("Error updating dependency", err);
    return sendError(res, 500, "Failed to update dependency");
  }
}

export async function decideDependencyResolution(req, res) {
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
    console.error("Dependency decision failed", err);
    return sendError(res, 500, "Failed to process decision");
  }
}

export const deleteDependenciesHandler = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendError(res, 400, "No ids provided for deletion.");
    }

    if (req.user?.role === "ADMIN") {
      return sendError(res, 403, "Admins are not allowed to delete dependencies.");
    }

    const records = await findDependenciesByIds(ids);
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

    const deletedCount = await deleteMultipleDependencies(ids);
    res.json({ message: `Successfully deleted ${deletedCount} entries.` });
  } catch (error) {
    console.error("deleteDependenciesHandler error:", error);
    sendError(res, 500, "Internal Server Error");
  }
};
