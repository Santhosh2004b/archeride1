
import * as usersModel from "../models/users.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const ADMIN_CREDENTIALS = {
  "admin@arche.global": "Admin@Arche2026",
  "sindhu@arche.global": "Sindhu@Arche2026",
  "rachana.pk@arche.global": "Rachana@Arche2026",
  "santhosh.b@arche.global": "Santhosh@Arche2026",
  "sukanya.p@arche.global": "Sukanya@Arche2026",
  "ajaykumar.j@arche.global": "Ajaykumar@Arche2026",
  "sathishbalaji.k@arche.global": "Sathishbalaji@Arche2026"
};

const ADMIN_WHITELIST = Object.keys(ADMIN_CREDENTIALS);


export async function loginHandler(req, res) {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const emailLower = email.toLowerCase().trim();


    if (!emailLower.endsWith("@arche.global")) {
      return res.status(403).json({ success: false, message: "Access restricted to @arche.global domain" });
    }


    let user = await usersModel.findByEmail(emailLower);



    if (ADMIN_WHITELIST.includes(emailLower) && !user) {
      const specificPass = ADMIN_CREDENTIALS[emailLower] || "Admin@Arche2026";
      const defaultHash = await bcrypt.hash(specificPass, 10);

      user = await usersModel.createUser({
        name: emailLower.split("@")[0].split(".")[0], // Simple name extraction
        email: emailLower,
        password_hash: defaultHash,
        role: "ADMIN"
      });
      console.log(`[Auth] Auto-created ADMIN user: ${emailLower}`);
    }


    if (!user) {
      return res.status(403).json({ success: false, message: "Access Denied: Account not found or not approved." });
    }


    if (!user.password_hash) {
      return res.status(200).json({
        success: true,
        isFirstLogin: true,
        message: "Welcome! Please set your password to continue.",
        role: user.role
      });
    }


    if (!password) return res.status(400).json({ success: false, message: "Password required" });

    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    return sendLoginResponse(res, user);

  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
}


function sendLoginResponse(res, user) {

  if (user.password_updated_at) {
    const lastUpdate = new Date(user.password_updated_at);
    const now = new Date();
    const diffInDays = (now - lastUpdate) / (1000 * 60 * 60 * 24);

    if (diffInDays > 90) {
      return res.status(200).json({
        success: false,
        passwordExpired: true,
        message: "Your password has expired (90 days). Please update it."
      });
    }
  }

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
    data: { token, user: payload },
  });
}


export async function approveBMHandler(req, res) {
  try {



    const { bmEmail } = req.body;

    if (!bmEmail) {
      return res.status(400).json({ success: false, message: "BM Email is required" });
    }

    const bmEmailLower = bmEmail.toLowerCase().trim();

    if (!bmEmailLower.endsWith("@arche.global")) {
      return res.status(400).json({ success: false, message: "Only @arche.global emails allowed for BM" });
    }


    const existingBM = await usersModel.findByEmail(bmEmailLower);
    if (existingBM) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }


    await usersModel.createUser({
      name: bmEmailLower.split("@")[0],
      email: bmEmailLower,
      password_hash: null,
      role: "BM"
    });

    return res.status(200).json({ success: true, message: `Success! BM Account for ${bmEmailLower} is approved.` });

  } catch (err) {
    console.error("Approve BM Error", err);
    return res.status(500).json({ success: false, message: "Failed to approve BM" });
  }
}


export async function resetPasswordExpiredHandler(req, res) {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    const emailLower = email.toLowerCase().trim();

    const user = await usersModel.findByEmail(emailLower);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });


    if (user.password_hash) {
      if (!oldPassword) return res.status(400).json({ success: false, message: "Old password required" });

      const oldPasswordOk = await bcrypt.compare(oldPassword, user.password_hash);
      if (!oldPasswordOk) {
        return res.status(401).json({ success: false, message: "Incorrect old password" });
      }
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await usersModel.updatePassword(user.id, newPasswordHash);

    return res.status(200).json({ success: true, message: "Password set successfully." });

  } catch (err) {
    console.error("Reset password error", err);
    return res.status(500).json({ success: false, message: "Failed to reset password" });
  }
}


export async function getApprovedBMsHandler(req, res) {
  try {

    const result = await usersModel.listAllUsers();

    const bms = result.filter(u => u.role === "BM" || u.role === "PM");


    bms.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));


    const data = bms.map(u => ({
      email: u.email,
      approvedAt: u.created_at
    }));

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Get Approved BMs Error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch BMs" });
  }
}
