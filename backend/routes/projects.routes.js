import { Router } from "express";
import pool from "../db.js";
import { getAssignedProjects } from "../models/users.model.js";

const router = Router();

// GET /api/projects?name=xyz
router.get("/", async (req, res) => {
  try {
    // List all or search by name
    const { name } = req.query;

    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    let sql;
    let params;

    if (user.role === "ADMIN") {
      if (name) {
        sql = `SELECT id, name, description, account FROM projects WHERE name ILIKE $1 LIMIT 50`;
        params = [`%${name}%`];
      } else {
        sql = `SELECT id, name, description, account FROM projects ORDER BY name ASC LIMIT 100`;
        params = [];
      }
    } else {
      // Non-admins only search within their assigned projects
      const assigned = await getAssignedProjects(user.id);
      const projectIds = assigned.map(p => p.id);

      if (projectIds.length === 0) return res.json([]);

      if (name) {
        sql = `SELECT id, name, description, account FROM projects WHERE name ILIKE $1 AND id = ANY($2) LIMIT 50`;
        params = [`%${name}%`, projectIds];
      } else {
        sql = `SELECT id, name, description, account FROM projects WHERE id = ANY($1) ORDER BY name ASC LIMIT 100`;
        params = [projectIds];
      }
    }

    const { rows } = await pool.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error("project lookup error:", err);
    return res.status(500).json({ message: "project lookup failed" });
  }
});

export default router;
