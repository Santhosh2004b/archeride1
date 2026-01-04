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
    // 5. Query DB for a valid user to use as "BM"
    // This prevents foreign key violations in tables like risks/issues
    import("../db.js").then(async ({ default: pool }) => {
      try {
        // Just grab the first user
        const { rows } = await pool.query("SELECT id, email, name, role FROM users LIMIT 1");
        if (rows.length === 0) {
          return res.status(500).json({
            success: false,
            message: "Dev Error: No users found in database. Please seed at least one user."
          });
        }

        const dbUser = rows[0];
        req.user = {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role || "BM",
          name: dbUser.name || "Dev User",
        };
        return next();
      } catch (dbErr) {
        console.error("Auth Middleware DB Error", dbErr);
        return res.status(500).json({ success: false, message: "Auth DB Error" });
      }
    });
    return; // Stop execution here, let the promise chain handle next()
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
