// backend/controllers/collections.controller.js
import {
  findAllCollections,
  findCollectionById,
  createCollection,
  updateCollection,
} from "../models/collections.model.js";

import { buildCollectionFilters, applyRoleRestrictions } from "../utils/filters.utils.js";
import { getAssignedProjects } from "../models/users.model.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";

export async function listCollectionsHandler(req, res) {
  try {
    const user = req.user;
    const augmentedQuery = await applyRoleRestrictions(user, req.query || {});
    const filters = buildCollectionFilters(augmentedQuery);

    const rows = await findAllCollections(filters); // Need to update findAllCollections to accept filters
    return sendSuccess(res, rows);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Failed to list collections");
  }
}

export async function getCollectionByIdHandler(req, res) {
  try {
    const row = await findCollectionById(req.params.id);
    if (!row) return sendError(res, 404, "Not found");

    if (req.user.role !== "ADMIN") {
      const assigned = await getAssignedProjects(req.user.id);
      const projectIds = assigned.map(p => p.id);
      if (!projectIds.includes(row.project_id)) {
        return sendError(res, 403, "Forbidden: Not assigned to this project");
      }
    }

    return sendSuccess(res, row);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Failed to fetch collection");
  }
}

export async function createCollectionHandler(req, res) {
  try {
    if (!req.body.invoice_id || req.body.invoice_id.trim() === "") {
      const { generateEntityId } = await import("../utils/idGenerator.js");
      req.body.invoice_id = await generateEntityId(
        req.user.email,
        req.body.account || "Default",
        "collection"
      );
    }

    const payload = {
      ...req.body,
      created_by: req.user.email,
    };

    // Sanitize undefined -> null
    ["project_id", "project_description", "account"].forEach(f => {
      if (payload[f] === undefined) payload[f] = null;
    });

    // Sanitize invoice_amount (numeric)
    if (payload.invoice_amount) {
      const parsed = parseFloat(payload.invoice_amount);
      if (isNaN(parsed)) {
        console.warn(`Invalid invoice_amount "${payload.invoice_amount}", defaulting to 0`);
        payload.invoice_amount = 0;
      } else {
        payload.invoice_amount = parsed;
      }
    } else {
      payload.invoice_amount = 0; // Default if missing
    }

    const created = await createCollection(payload);

    return sendSuccess(res, created, 201);
  } catch (err) {
    console.error("Create collection error:", err);
    return sendError(res, 500, "Failed to create collection");
  }
}

export async function updateCollectionHandler(req, res) {
  try {
    const existing = await findCollectionById(req.params.id);
    if (!existing) return sendError(res, 404, "Not found");

    /*
    if (req.user.role !== "ADMIN") {
      const assigned = await getAssignedProjects(req.user.id);
      const projectIds = assigned.map(p => p.id);
      if (!projectIds.includes(existing.project_id)) {
        return sendError(res, 403, "Forbidden: Not assigned to this project");
      }
    }
    */

    const updated = await updateCollection(req.params.id, req.body);
    return sendSuccess(res, updated);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Failed to update collection");
  }
}
