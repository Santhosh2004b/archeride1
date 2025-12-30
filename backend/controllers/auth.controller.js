// backend/controllers/auth.controller.js
import * as usersModel from "../models/users.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function loginHandler(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await usersModel.findByEmail(email);

    /* =================================================
       FIRST LOGIN → CREATE USER, DO NOT LOGIN
       ================================================= */
    if (!user) {
      const password_hash = await bcrypt.hash(password, 10);
      const name = email.split("@")[0];

      await usersModel.createUser({
        name,
        email,
        password_hash,
        role: "BM", // or "PM" if you want
      });

      return res.status(200).json({
        success: true,
        isFirstLogin: true,
        message:
          "You are a new user. Your account has been created. Please refresh the page and log in again.",
      });
    }

    /* =================================================
       EXISTING USER CHECK
       ================================================= */
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "User is inactive",
      });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    /* =================================================
       SUCCESSFUL LOGIN
       ================================================= */
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

    return res.status(200).json({
      success: true,
      isFirstLogin: false,
      data: {
        token,
        user: payload,
      },
    });
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
}
