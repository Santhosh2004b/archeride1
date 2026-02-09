import express from "express";
import { loginHandler, resetPasswordExpiredHandler, approveBMHandler, getApprovedBMsHandler } from "../controllers/auth.controller.js";
import { requireAdmin, authMiddleware } from "../middleware/auth.middleware.js"; 

const router = express.Router();

router.post("/login", loginHandler);
router.post("/approve-bm", authMiddleware, requireAdmin, approveBMHandler); 
router.get("/approved-bms", authMiddleware, requireAdmin, getApprovedBMsHandler); 
router.post("/reset-password-expired", resetPasswordExpiredHandler);

export default router;
