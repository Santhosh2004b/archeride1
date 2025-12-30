// backend/routes/collections.routes.js
import express from "express";
import {
  listCollectionsHandler,
  getCollectionByIdHandler,
  createCollectionHandler,
  updateCollectionHandler,
} from "../controllers/collections.controller.js";

const router = express.Router();

router.get("/", listCollectionsHandler);
router.get("/:id", getCollectionByIdHandler);
router.post("/", createCollectionHandler);
router.put("/:id", updateCollectionHandler);

export default router;
