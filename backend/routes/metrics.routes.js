
import express from "express";
// backend/routes/metrics.routes.js
import { Router } from "express";
import { getSummaryMetrics } from "../controllers/metrics.controller.js";
import {
  countAll as countRisks,
  countByStatus as countRisksByStatus,
} from "../models/risks.model.js";
import {
  countAll as countIssues,
  countByStatus as countIssuesByStatus,
} from "../models/issues.model.js";
import {
  countAll as countActions,
  countByStatus as countActionsByStatus,
  countOverdue as countActionsOverdue,
} from "../models/actions.model.js";
import { countAll as countDependencies } from "../models/dependencies.model.js";
import { countAll as countEscalations } from "../models/escalations.model.js";
import { countAll as countAppreciations } from "../models/appreciations.model.js";
import {
  countAll as countCollections,
  countByStatus as countCollectionsByStatus,
} from "../models/collections.model.js";

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const [
      risksTotal,
      risksOpen,
      issuesTotal,
      issuesOpen,
      actionsTotal,
      actionsOpen,
      actionsOverdue,
      depsTotal,
      escTotal,
      appTotal,
      collTotal,
      collPending,
    ] = await Promise.all([
      countRisks(),
      countRisksByStatus("Open"),
      countIssues(),
      countIssuesByStatus("Open"),
      countActions(),
      countActionsByStatus("Open"),
      countActionsOverdue(),
      countDependencies(),
      countEscalations(),
      countAppreciations(),
      countCollections(),
      countCollectionsByStatus("Pending"),
    ]);

    res.json({
      risks: { total: risksTotal, open: risksOpen },
      issues: { total: issuesTotal, open: issuesOpen },
      actions: { total: actionsTotal, open: actionsOpen, overdue: actionsOverdue },
      dependencies: { total: depsTotal },
      escalations: { total: escTotal },
      appreciations: { total: appTotal },
      collections: { total: collTotal, pending: collPending },
    });
  } catch (err) {
    console.error("Metrics error", err);
    res.status(500).json({ message: "Failed to load metrics" });
  }
});
router.get("/summary", getSummaryMetrics);

export default router;
