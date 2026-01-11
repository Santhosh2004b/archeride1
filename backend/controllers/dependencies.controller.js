// backend/controllers/dependencies.controller.js
import {
  findDependencies,
  findDependencyById,
  createDependency,
  updateDependency,
  countAll,
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

    // Access check by project_id disabled
    return sendSuccess(res, dep);

    return sendSuccess(res, dep);
  } catch (err) {
    console.error("Error getting dependency", err);
    return sendError(res, 500, "Failed to get dependency");
  }
}

export async function createDependencyHandler(req, res) {
  try {
    // 🆔 Auto-generate ID if not provided
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

    // Sanitize undefined -> null
    ["manual_project_id", "project_description", "account"].forEach(f => {
      if (payload[f] === undefined) payload[f] = null;
    });

    const created = await createDependency(payload);
    return sendSuccess(res, created, 201);
  } catch (err) {
    console.error("Error creating dependency", err);
    return sendError(res, 500, "Failed to create dependency");
  }
}

// BM updates a dependency; create notification if it becomes Completed
export async function updateDependencyHandler(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body;

    const existing = await findDependencyById(id);
    if (!existing) return sendError(res, 404, "Dependency not found");

    // Access check by project_id disabled

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
