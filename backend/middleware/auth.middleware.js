// backend/middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  console.log("AUTH HEADER =", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  // DEV SHORTCUT: accept fake-token-* from frontend
  if (token.startsWith("fake-token-")) {
    // parse role/email from token if you encoded it, or just mark BM for now
    req.user = {
      id: null,
      email: "bm@example.com",
      role: "BM",
      name: "BM User",
    };
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    console.log("AUTH PAYLOAD =", payload);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
    next();
  } catch (err) {
    console.error("JWT verify error", err);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}
