import { Router } from "express";
import pool from "../db.js";
import { getAssignedProjects } from "../models/users.model.js";

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

export default router;
