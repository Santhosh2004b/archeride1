import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /api/projects?name=xyz
router.get("/", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.json([]);    // no search → empty

    const sql = `SELECT id, name FROM projects WHERE name ILIKE $1 LIMIT 1`;
    const { rows } = await pool.query(sql, [`%${name}%`]);

    if (rows.length === 0) return res.json({});
    return res.json(rows[0]);
  } catch (err) {
    console.error("project lookup error:", err);
    return res.status(500).json({ message: "project lookup failed" });
  }
});

export default router;
