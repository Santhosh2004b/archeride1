import express, { json } from "express";
import cors from "cors";
import helmet from "helmet";
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
import metricsRoutes from "./routes/metrics.routes.js";
import projectRoutes from "./routes/projects.routes.js";
import feedRoutes from "./routes/feed.routes.js";
import userRoutes from "./routes/users.routes.js";
import layoutRoutes from "./routes/layout.routes.js";
import utilsRoutes from "./routes/utils.routes.js";

config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Configurations (Helmet)
// Security Configurations (Helmet)
app.disable('x-powered-by'); // Explicitly disable X-Powered-By header

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
                imgSrc: ["'self'", "data:", "https://RIDE.arche.global"],
                connectSrc: ["'self'", "https://RIDE.arche.global"],
                mediaSrc: ["'self'", "https://RIDE.arche.global"],
                frameAncestors: ["'self'"],
                objectSrc: ["'none'"],
                baseUri: ["'self'"],
                upgradeInsecureRequests: [],
            },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "same-origin" },
        strictTransportSecurity: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true,
        },
        xContentTypeOptions: true,
        xFrameOptions: { action: "deny" },
        xPoweredBy: false,
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
);

// Global Cache Control to prevent data leakage in browser cache
app.use((req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.set("Surrogate-Control", "no-store");
    next();
});

app.use(cors({
    origin: ["https://ride.arche.global", "http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(json());
app.use("/uploads", express.static("uploads"));




app.get("/api/health", (req, res) => res.json({ success: true, message: "Backend is running" }));


app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/feed", feedRoutes);




app.use(authMiddleware);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/escalations", escalationsRoutes);
app.use("/api/issues", issuesRoutes);
app.use("/api/risks", risksRoutes);
app.use("/api/actions", actionsRoutes);
app.use("/api/dependencies", dependenciesRoutes);
app.use("/api/appreciations", appreciationsRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/layout", layoutRoutes);
app.use("/api/utils", utilsRoutes);


app.use("/api/*", (req, res) => {
    res.status(404).json({ success: false, message: "API Route Not Found" });
});


app.use((err, req, res, next) => {
    console.error("Global Error:", err);
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} `);
});
