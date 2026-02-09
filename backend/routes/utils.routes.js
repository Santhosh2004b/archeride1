import express from "express";
import { previewIdHandler } from "../controllers/utils.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/preview-id", authMiddleware, previewIdHandler);

export default router;
