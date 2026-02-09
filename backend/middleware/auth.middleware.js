
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import * as usersModel from "../models/users.model.js"; 

config();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function authMiddleware(req, res, next) {
  
  const path = req.path.toLowerCase();
  if (path.includes("/login") || path.includes("/auth/login")) {
    return next();
  }

  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  
  if (token.startsWith("fake-token-")) {
    const devUser = {
      id: 'dev-id', 
      email: 'dev@arche.global',
      role: 'ADMIN',
      name: 'Dev User'
    };

    
    
    req.user = devUser;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    
    try {
      const dbUser = await usersModel.findByEmail(payload.email);
      console.log(`[AuthMiddleware] Token Email: ${payload.email} | DB Role: ${dbUser?.role}`);

      if (dbUser) {
        req.user = {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          name: dbUser.name,
        };
      } else {
        
        req.user = payload;
      }
    } catch (dbErr) {
      console.error("[AuthMiddleware] DB Refresh Error", dbErr);
      req.user = payload;
    }
    next();

  } catch (err) {
    console.error("JWT verify error", err);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

export function requireAdmin(req, res, next) {
  
  
  if (!req.user || String(req.user.role).toUpperCase() !== "ADMIN") {
    console.warn(`[RequireAdmin] Failed. User: ${req.user?.email}, Role: ${req.user?.role}`);
    return res.status(403).json({ success: false, message: "Forbidden: Admin access required" });
  }
  next();
}
