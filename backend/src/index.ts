import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import { config } from "./config";
import { authRouter } from "./routes/auth";
import { ridesRouter } from "./routes/rides";
import { driversRouter } from "./routes/drivers";
import { adminRouter } from "./routes/admin";
import { webhookRouter } from "./routes/webhooks";
import { scheduledRouter } from "./routes/scheduled";
import { loyaltyRouter } from "./routes/loyalty";
import { subscriptionsRouter } from "./routes/subscriptions";
import { parcelsRouter } from "./routes/parcels";
import { safetyRouter } from "./routes/safety";
import { referralsRouter } from "./routes/referrals";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { initSocket } from "./realtime/socket";

const app = express();
const server = createServer(app);

initSocket(server);

// Configure CORS properly for preflight requests
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || config.allowedOrigins.includes("*") || config.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Stripe webhooks need raw body, so register before express.json
app.use("/api/webhooks", webhookRouter);
app.use(express.json());

// Core routes
app.use("/api/auth", authRouter);
app.use("/api/rides", ridesRouter);
app.use("/api/drivers", driversRouter);
app.use("/api/admin", adminRouter);

// New feature routes
app.use("/api/scheduled", scheduledRouter);
app.use("/api/loyalty", loyaltyRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/parcels", parcelsRouter);
app.use("/api/safety", safetyRouter);
app.use("/api/referrals", referralsRouter);

app.use(notFound);
app.use(errorHandler);

server.listen(Number(config.port), () => {
  console.log(`
╭──────────────────────────────────────╮
│   🗺️  RideHub - Smart Mobility     │
│     API running on port ${config.port}      │
╰──────────────────────────────────────╯
  `);
});
