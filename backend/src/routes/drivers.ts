import { Router } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { config } from "../config";
import { splitPayment } from "../utils/payment";
import { emitDriverLocation } from "../realtime/socket";

const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  licenseNumber: z.string().min(4).max(40),
  vehicle: z.string().min(2).max(80).optional()
});

const statusSchema = z.object({
  availability: z.enum(["online", "offline"] as const)
});

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  heading: z.number().min(0).max(360).optional(),
  speedKph: z.number().min(0).max(300).optional(),
  rideId: z.string().uuid().optional()
});

export const driversRouter = Router();

driversRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  
  try {
    const { name, email, licenseNumber, vehicle } = parsed.data;
    const driver = await db.upsertDriver(name, email, licenseNumber, vehicle, "pending");
    return res.status(201).json({ driver, message: "Driver submitted for approval" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register driver" });
  }
});

// Auto-approve driver endpoint (for testing)
driversRouter.post("/:driverId/approve", async (req, res) => {
  const params = z.object({ driverId: z.string().uuid() }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ message: "Invalid driver id" });

  try {
    const driver = await db.setDriverVerification(params.data.driverId, "approved");
    return res.json({ driver, message: "Driver approved" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to approve driver" });
  }
});

driversRouter.patch("/:driverId/status", async (req, res) => {
  const params = z.object({ driverId: z.string().uuid() }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ message: "Invalid driver id" });
  const body = statusSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ message: "Invalid payload", issues: body.error.issues });

  try {
    const driver = await db.getDriver(params.data.driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    if (driver.verification_status !== "approved")
      return res.status(403).json({ message: "Driver not approved" });

    await db.setDriverAvailability(driver.id, body.data.availability);
    return res.json({ driver });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update driver status" });
  }
});

driversRouter.get("/:driverId/earnings", async (req, res) => {
  const params = z.object({ driverId: z.string().uuid() }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ message: "Invalid driver id" });
  
  try {
    const rides = await db.listRidesForDriver(params.data.driverId, "completed");
    const totals = rides.reduce(
      (acc, ride) => {
        const split = ride.payment_split ?? splitPayment(ride.fare, config.defaults.commissionPercent);
        acc.gross += split.totalFare;
        acc.platform += split.platformShare;
        acc.driver += split.driverShare;
        return acc;
      },
      { gross: 0, platform: 0, driver: 0 }
    );

    return res.json({
      rides: rides.length,
      gross: Number(totals.gross.toFixed(2)),
      platform: Number(totals.platform.toFixed(2)),
      driver: Number(totals.driver.toFixed(2))
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch earnings" });
  }
});

driversRouter.post("/:driverId/location", async (req, res) => {
  const params = z.object({ driverId: z.string().uuid() }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ message: "Invalid driver id" });

  const body = locationSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ message: "Invalid payload", issues: body.error.issues });

  try {
    const driver = await db.getDriver(params.data.driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    if (driver.verification_status !== "approved") return res.status(403).json({ message: "Driver not approved" });

    let rideId = body.data.rideId;
    if (!rideId) {
      const activeRides = await db.listRidesForDriver(driver.id);
      const activeRide = activeRides.find((r) => r.status !== "completed" && r.status !== "cancelled");
      rideId = activeRide?.id;
    }

    const location = await db.setDriverLocation(
      driver.id,
      body.data.lat,
      body.data.lng,
      body.data.heading,
      body.data.speedKph,
      rideId
    );

    emitDriverLocation(location);

    return res.status(201).json({ location });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update location" });
  }
});
