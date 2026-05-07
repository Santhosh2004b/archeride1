
import { buildRiskFilters, applyRoleRestrictions } from "../utils/filters.utils.js";
import { getAssignedProjects } from "../models/users.model.js";
import {
  findRisks,
  findRiskById,
  createRisk,
  updateRisk,
  findRisksByIds,
  deleteMultipleRisks,
} from "../models/risks.model.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";
import { createResolutionNotification } from "../models/notifications.model.js";
import { decideNotification } from "../models/notifications.model.js";

function toYYYYMMDD(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}


export async function listRisks(req, res) {
  try {
    const user = req.user;
    const augmentedQuery = await applyRoleRestrictions(user, req.query);
    const filters = buildRiskFilters(augmentedQuery);

    const rows = await findRisks(filters);
    return sendSuccess(res, rows);
  } catch (err) {
    console.error("Error listing risks", err);
    return sendError(res, 500, "Failed to list risks");
  }
}


export async function getRisk(req, res) {
  try {
    const risk = await findRiskById(req.params.id);
    if (!risk) return sendError(res, 404, "Risk not found");



    return sendSuccess(res, risk);

    return sendSuccess(res, risk);
  } catch (err) {
    return sendError(res, 500, "Failed to get risk");
  }
}


export async function createRiskHandler(req, res) {
  try {

    if (!req.body.risk_id || req.body.risk_id.trim() === "") {
      const { generateEntityId } = await import("../utils/idGenerator.js");
      req.body.risk_id = await generateEntityId(
        req.user.email,
        req.body.account || "Default",
        "risk"
      );
    }


    const calculateRiskScore = (prob, imp) => {
      const probMap = { "Rare": 1, "Possible": 2, "Likely (Regularly)": 3 };
      const impactMap = { "Minor": 1, "Moderate": 2, "Major": 3 };
      const p = probMap[prob];
      const i = impactMap[imp];
      if (!p || !i) return null;
      const score = p * i;
      let label = "";
      if (score === 1 || score === 2) label = "Low";
      else if (score === 3) label = "Medium";
      else if (score === 4 || score === 6) label = "High";
      else if (score === 9) label = "Critical";
      return label ? `${score} - ${label}` : String(score);
    };

    const payload = {
      ...req.body,
      created_by: req.user.id,
      identified_by: req.body.identified_by || req.user.email,
    };

    const dateFields = [
      "identified_date",
      "target_mitigation_date",
      "last_reviewed_date"
    ];

    if (payload.probability && payload.impact) {
      const calculated = calculateRiskScore(payload.probability, payload.impact);
      if (calculated) payload.risk_score = calculated;
    }

    dateFields.forEach((field) => {
      if (payload[field]) {
        payload[field] = toYYYYMMDD(payload[field]);
      } else {

        if (field === "identified_date") {
          payload[field] = toYYYYMMDD(new Date());
        } else {
          payload[field] = null;
        }
      }
    });

    [
      "manual_project_id",
      "project_description",
      "account",
      "risk_score",
      "mitigation_strategy",
      "mitigation_owner",
      "current_status"
    ].forEach((field) => {
      if (payload[field] === undefined) payload[field] = null;
    });
    const created = await createRisk(payload);

    if (payload.status?.toLowerCase() === "resolved" && req.user?.email) {
      await createResolutionNotification({
        module: "risk",
        itemId: created.id,
        itemCode: created.risk_id,
        statusBefore: "N/A (New Record)",
        statusAfter: payload.status,
        payload: {
          account: created.account,
          manual_project_id: created.manual_project_id,
          priority: created.priority,
          category: created.category,
          risk_title: created.risk_title,
          identified_date: created.identified_date,
        },
        bmUser: req.user.email,
      });
    }

    return sendSuccess(res, created, 201);
  } catch (err) {
    console.error("Create risk error", err);
    return sendError(res, 500, "Failed to create risk");
  }
}




export async function updateRiskHandler(req, res) {
  try {
    const { id } = req.params;
    const existing = await findRiskById(id);
    if (!existing) {
      return sendError(res, 404, "Risk not found");
    }

    const calculateRiskScore = (prob, imp) => {
      const probMap = { "Rare": 1, "Possible": 2, "Likely (Regularly)": 3 };
      const impactMap = { "Minor": 1, "Moderate": 2, "Major": 3 };
      const p = probMap[prob];
      const i = impactMap[imp];
      if (!p || !i) return null;
      const score = p * i;
      let label = "";
      if (score === 1 || score === 2) label = "Low";
      else if (score === 3) label = "Medium";
      else if (score === 4 || score === 6) label = "High";
      else if (score === 9) label = "Critical";
      return label ? `${score} - ${label}` : String(score);
    };

    const payload = { ...req.body };
    const prob = payload.probability || existing.probability;
    const imp = payload.impact || existing.impact;

    if (prob && imp) {
      const calculated = calculateRiskScore(prob, imp);
      if (calculated) payload.risk_score = calculated;
    }

    const oldStatus = existing.status;
    const newStatus = payload.status;

    const normalize = (s) => s?.trim().toLowerCase();
    const becameResolved =
      normalize(oldStatus) !== "resolved" &&
      normalize(newStatus) === "resolved";

    const updated = await updateRisk(id, {
      ...payload,
    });



    if (becameResolved && req.user?.email) {
      await createResolutionNotification({
        module: "risk",
        itemId: updated.id,
        itemCode: updated.risk_id,
        statusBefore: oldStatus,
        statusAfter: newStatus,
        payload: {
          account: existing.account, manual_project_id: existing.manual_project_id,
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

export async function deleteRisksHandler(req, res) {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendError(res, 400, "No valid IDs provided for deletion");
    }

    const risks = await findRisksByIds(ids);
    if (!risks || risks.length === 0) {
      return sendError(res, 404, "No matching risks found to delete");
    }

    // Role-based deletion logic: PMs can only delete same-day records.
    // If Admin needs to be totally prevented from deleting (as per task), we check if role is ADMIN and block completely.
    if (req.user?.role === "ADMIN") {
      return sendError(res, 403, "Admins are not allowed to delete risks. This action is restricted to PMs.");
    }

    // If not Admin, enforce same-day rule
    if (req.user?.role !== "ADMIN") {
      const today = new Date().toDateString();
      for (const r of risks) {
        const createdAt = new Date(r.created_at || r.identified_date).toDateString();
        if (createdAt !== today) {
          return sendError(
            res, 
            403, 
            "Deletion is restricted to same-day entries only."
          );
        }
      }
    }

    const count = await deleteMultipleRisks(ids);
    return sendSuccess(res, { deleted: count }, 200, "Risks deleted successfully");
  } catch (err) {
    console.error("Error deleting risks", err);
    return sendError(res, 500, "Failed to delete risks");
  }
}
