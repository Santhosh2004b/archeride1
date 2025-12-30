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

import { buildDependencyFilters } from "../utils/filters.utils.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";
import pool from "../db.js";

export async function listDependencies(req, res) {
  try {
    const user = req.user;
    const filters = buildDependencyFilters(req.query || {});

    // 🔐 BM / PM → only own dependencies
    if (user.role !== "ADMIN") {
      filters.whereSql += filters.whereSql
        ? " AND d.reported_by = $X"
        : " WHERE d.reported_by = $X";

      filters.params.push(user.email);
      filters.whereSql = filters.whereSql.replace(
        "$X",
        `$${filters.params.length}`
      );
    }

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
  } catch (err) {
    console.error("Error getting dependency", err);
    return sendError(res, 500, "Failed to get dependency");
  }
}

export async function createDependencyHandler(req, res) {
  try {
    const payload = {
      ...req.body,
      project_name: req.body.project_name,
      reported_by: req.user.email, // 🔐 FORCE OWNER
    };

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
    // 🔐 OWNERSHIP CHECK
    if (req.user.role !== "ADMIN" && existing.reported_by !== req.user.email) {
      return sendError(res, 403, "Forbidden: Not your dependency");
    }

    const oldStatus = existing.status;
    const newStatus = payload.status;

    const updated = await updateDependency(id, {
      ...payload,
      project_name: payload.project_name,
    }); if (!updated) return sendError(res, 404, "Dependency not found");

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
          project_name: existing.project_name, // ✅ FIX
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

    await createBmNotificationForDependencyDecision({
      dependencyId: decided.item_id,
      bmEmail: decided.bm_user,
      decision,
      comment,
    });

    return sendSuccess(res, decided);
  } catch (err) {
    console.error("Dependency decision failed", err);
    return sendError(res, 500, "Failed to process decision");
  }
}
