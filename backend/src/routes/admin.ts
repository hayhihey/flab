import { Router } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { config } from "../config";

const commissionSchema = z.object({ commissionPercent: z.number().min(0).max(100) });

export const adminRouter = Router();

adminRouter.get("/drivers/pending", async (_req, res) => {
  try {
    const pending = await db.listDrivers({ verification_status: "pending" });
    return res.json({ drivers: pending });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch pending drivers" });
  }
});

adminRouter.patch("/drivers/:driverId/approve", async (req, res) => {
  const params = z.object({ driverId: z.string().uuid() }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ message: "Invalid driver id" });
  const action = z.object({ approve: z.boolean() }).safeParse(req.body);
  if (!action.success) return res.status(400).json({ message: "Invalid payload", issues: action.error.issues });

  try {
    const driver = await db.getDriver(params.data.driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    await db.setDriverVerification(driver.id, action.data.approve ? "approved" : "rejected");
    return res.json({ driver });
  } catch (error) {
    return res.status(500).json({ message: "Failed to approve driver" });
  }
});

adminRouter.get("/users", async (_req, res) => {
  try {
    const riders = await db.listRiders();
    const drivers = await db.listDrivers();
    return res.json({ riders, drivers });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
});

adminRouter.patch("/config/commission", (req, res) => {
  const parsed = commissionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  // Note: Commission percent is now stored in config.defaults in config.ts
  // This endpoint is kept for API compatibility
  return res.json({ settings: { commissionPercent: parsed.data.commissionPercent } });
});
