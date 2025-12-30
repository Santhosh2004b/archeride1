// backend/server.js
import express, { json } from "express";
import cors from "cors";
import { config } from "dotenv";

import notificationsRoutes from "./routes/notifications.routes.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
 
import dependenciesRoutes from "./routes/dependencies.routes.js";
import authRoutes from "./routes/auth.routes.js";
import risksRoutes from "./routes/risks.routes.js";
import issuesRoutes from "./routes/issues.routes.js";
import actionsRoutes from "./routes/actions.routes.js";
import appreciationsRoutes from "./routes/appreciations.routes.js";
import escalationsRoutes from "./routes/escalations.routes.js";
import collectionsRoutes from "./routes/collections.routes.js";
import metricsRoutes from "./routes/metrics.routes.js";   // ✅ keep this only
import projectRoutes from "./routes/projects.routes.js"; // 🧩 ADD THIS
import feedRoutes from "./routes/feed.routes.js";

config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(json());
app.use("/api/dashboard", dashboardRoutes);
app.use("/feed", feedRoutes);

// public
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Backend is running" });
});
app.use("/api/auth", authRoutes);

// everything else auth‑protected
app.use(authMiddleware);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/escalations", escalationsRoutes);
app.use("/api/collections", collectionsRoutes);
app.use("/api/issues", issuesRoutes);
app.use("/api/risks", risksRoutes);
app.use("/api/actions", actionsRoutes);
app.use("/api/dependencies", dependenciesRoutes);
app.use("/api/appreciations", appreciationsRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/projects", projectRoutes);  // 🔥 critical

app.use("/api/metrics", metricsRoutes);
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
