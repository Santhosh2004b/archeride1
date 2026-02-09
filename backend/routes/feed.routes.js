import express from "express";
import {
  getLatestRisks,
  getLatestDependencies
} from "../controllers/feed.controller.js";

const router = express.Router();

router.get("/latest-risks", getLatestRisks);
router.get("/latest-dependencies", getLatestDependencies);

export default router;
