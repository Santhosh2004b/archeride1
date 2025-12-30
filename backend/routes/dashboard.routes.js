import express from "express";
import { getDashboardMetrics } from "../controllers/dashboard.controller.js";

const router = express.Router();

// ❌ remove requireAuth usage for now
router.get("/metrics", getDashboardMetrics);

export default router;
