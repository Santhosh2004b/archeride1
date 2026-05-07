import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { name } = req.query;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    let sql;
    let params;

    if (name) {
      sql = `SELECT id, name, description, account FROM projects WHERE name ILIKE $1 LIMIT 50`;
      params = [`%${name}%`];
    } else {
      sql = `SELECT id, name, description, account FROM projects ORDER BY name ASC LIMIT 100`;
      params = [];
    }

    const { rows } = await pool.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error("project lookup error:", err);
    return res.status(500).json({ message: "project lookup failed" });
  }
});

// Admin only Project Creation
router.post("/", async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (user.role !== "ADMIN") return res.status(403).json({ message: "Forbidden: Admin access only" });

    const { name, description, account } = req.body;
    if (!name || !account) {
      return res.status(400).json({ message: "Project ID and Account are required" });
    }

    // Check for duplicates
    const checkSql = `SELECT id FROM projects WHERE name = $1`;
    const checkRes = await pool.query(checkSql, [name]);
    if (checkRes.rows.length > 0) {
      return res.status(409).json({ message: "Project ID already exists" });
    }

    const sql = `
      INSERT INTO projects (name, description, account, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const params = [name, description, account, user.email];
    const { rows } = await pool.query(sql, params);

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Project creation error:", err);
    return res.status(500).json({ message: "Failed to create project" });
  }
});

// Admin only History Log
router.get("/history", async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (user.role !== "ADMIN") return res.status(403).json({ message: "Forbidden: Admin access only" });

    const sql = `
      SELECT name, account, description, created_by, created_at 
      FROM projects 
      WHERE created_at IS NOT NULL
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(sql);
    return res.json(rows);
  } catch (err) {
    console.error("Project history error:", err);
    return res.status(500).json({ message: "Failed to fetch project history" });
  }
});

export default router;
