import {
  findCollectionsByUser,
  findAllCollections,
  findCollectionById,
  createCollection,
  updateCollection,
} from "../models/collections.model.js";

import { sendSuccess, sendError } from "../utils/response.utils.js";

/* =========================
   GET /api/collections
   ========================= */
export async function listCollectionsHandler(req, res) {
  try {
    if (req.user.role === "ADMIN") {
      const rows = await findAllCollections();
      return sendSuccess(res, rows);
    }

    const rows = await findCollectionsByUser(req.user.email);
    return sendSuccess(res, rows);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Failed to list collections");
  }
}

/* =========================
   GET /api/collections/:id
   ========================= */
export async function getCollectionByIdHandler(req, res) {
  try {
    const row = await findCollectionById(req.params.id);
    if (!row) return sendError(res, 404, "Not found");

    if (
      req.user.role !== "ADMIN" &&
      row.created_by !== req.user.email
    ) {
      return sendError(res, 403, "Forbidden");
    }

    return sendSuccess(res, row);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Failed to fetch collection");
  }
}

/* =========================
   POST /api/collections
   ========================= */
export async function createCollectionHandler(req, res) {
  try {
    // 🆔 Auto-generate ID if not provided
    if (!req.body.invoice_id || req.body.invoice_id.trim() === "") {
      const { generateEntityId } = await import("../utils/idGenerator.js");
      req.body.invoice_id = await generateEntityId(
        req.user.email,
        req.body.project_name || "Default",
        "collection"
      );
    }

    const created = await createCollection({
      ...req.body,
      created_by: req.user.email, // 🔥 FORCE OWNERSHIP
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("Create collection error:", err);
    return sendError(res, 500, "Failed to create collection");
  }
}


/* =========================
   PUT /api/collections/:id
   ========================= */
export async function updateCollectionHandler(req, res) {
  try {
    const existing = await findCollectionById(req.params.id);
    if (!existing) return sendError(res, 404, "Not found");

    if (
      req.user.role !== "ADMIN" &&
      existing.created_by !== req.user.email
    ) {
      return sendError(res, 403, "Forbidden");
    }

    const updated = await updateCollection(req.params.id, req.body);
    return sendSuccess(res, updated);
  } catch (err) {
    console.error(err);
    return sendError(res, 500, "Failed to update collection");
  }
}
