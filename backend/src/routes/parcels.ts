import { Router } from "express";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { db } from "../services/db";
import { Parcel } from "../types";
import { calculateFare } from "../utils/fare";
import { config } from "../config";

export const parcelsRouter = Router();

const createParcelSchema = z.object({
  senderId: z.string().uuid(),
  receiverName: z.string().min(2),
  receiverPhone: z.string().min(10),
  pickup: z.string().min(2),
  dropoff: z.string().min(2),
  pickupCoords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  dropoffCoords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  distanceKm: z.number().positive(),
  durationMin: z.number().positive(),
  size: z.enum(["small", "medium", "large"] as const),
  weight: z.number().positive().optional(),
  value: z.number().positive().optional(),
  insured: z.boolean().default(false),
  scheduledFor: z.string().datetime().optional(),
  paymentMethod: z.enum(["cash", "card", "wallet", "mobile_money"] as const),
});

const updateStatusSchema = z.object({
  status: z.enum(["assigned", "picked_up", "in_transit", "delivered", "failed"] as const),
  deliveryProof: z.string().optional(), // Photo URL or signature data
});

// Calculate delivery fare (higher rates than rides)
function calculateDeliveryFare(distanceKm: number, size: string, insured: boolean, value?: number): number {
  const baseDeliveryFare = config.defaults.baseFare * 1.5;
  const deliveryDistanceRate = config.defaults.distanceRate * 1.3;
  
  // Size multipliers
  const sizeMultipliers = {
    small: 1.0,
    medium: 1.5,
    large: 2.5,
  };
  
  let fare = (baseDeliveryFare + (distanceKm * deliveryDistanceRate)) * sizeMultipliers[size as keyof typeof sizeMultipliers];
  
  // Add insurance cost (2% of declared value, minimum ₦200)
  if (insured && value) {
    const insuranceFee = Math.max(value * 0.02, 200);
    fare += insuranceFee;
  }
  
  return Math.round(fare);
}

// Create parcel delivery request
parcelsRouter.post("/", async (req, res) => {
  const parsed = createParcelSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });

  try {
    const fare = calculateDeliveryFare(
      parsed.data.distanceKm,
      parsed.data.size,
      parsed.data.insured,
      parsed.data.value
    );

    const parcel: Parcel = {
      id: uuid(),
      senderId: parsed.data.senderId,
      receiverName: parsed.data.receiverName,
      receiverPhone: parsed.data.receiverPhone,
      pickup: parsed.data.pickup,
      dropoff: parsed.data.dropoff,
      pickupCoords: parsed.data.pickupCoords,
      dropoffCoords: parsed.data.dropoffCoords,
      size: parsed.data.size,
      weight: parsed.data.weight,
      value: parsed.data.value,
      insured: parsed.data.insured,
      status: "pending",
      fare,
      scheduledFor: parsed.data.scheduledFor ? new Date(parsed.data.scheduledFor) : undefined,
      createdAt: new Date(),
    };

    if (!db.parcels) {
      db.parcels = new Map();
    }
    db.parcels.set(parcel.id, parcel);

    return res.status(201).json({
      message: "Parcel delivery request created",
      parcel,
      estimatedTime: `${Math.ceil(parsed.data.durationMin)} minutes`,
    });
  } catch (error) {
    console.error("Parcel creation error:", error);
    return res.status(500).json({ message: "Failed to create parcel delivery" });
  }
});

// Get parcel by ID
parcelsRouter.get("/:parcelId", async (req, res) => {
  const { parcelId } = req.params;

  try {
    if (!db.parcels) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    const parcel = db.parcels.get(parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    return res.json({ parcel });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch parcel" });
  }
});

// Get all parcels for a user (as sender)
parcelsRouter.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const status = req.query.status as string | undefined;

  try {
    if (!db.parcels) {
      return res.json({ parcels: [] });
    }

    const allParcels = Array.from(db.parcels.values());
    let userParcels = allParcels.filter(p => p.senderId === userId);

    if (status) {
      userParcels = userParcels.filter(p => p.status === status);
    }

    userParcels.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return res.json({ parcels: userParcels });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch parcels" });
  }
});

// Driver: Get available parcel deliveries (not yet assigned)
parcelsRouter.get("/available/list", async (req, res) => {
  const { lat, lng, maxDistance } = req.query;

  try {
    if (!db.parcels) {
      return res.json({ parcels: [] });
    }

    const allParcels = Array.from(db.parcels.values());
    const availableParcels = allParcels.filter(p => 
      p.status === "pending" && 
      (!p.scheduledFor || p.scheduledFor <= new Date())
    );

    // TODO: Filter by proximity if lat/lng provided
    // For now, return all available

    return res.json({ parcels: availableParcels });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch available parcels" });
  }
});

// Driver: Accept parcel delivery
parcelsRouter.patch("/:parcelId/accept", async (req, res) => {
  const { parcelId } = req.params;
  const { driverId } = req.body;

  if (!driverId) {
    return res.status(400).json({ message: "driverId is required" });
  }

  try {
    if (!db.parcels) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    const parcel = db.parcels.get(parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    if (parcel.status !== "pending") {
      return res.status(400).json({ message: "Parcel already assigned or completed" });
    }

    // Verify driver exists
    const driver = db.drivers.get(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (driver.verificationStatus !== "approved") {
      return res.status(403).json({ message: "Driver not approved" });
    }

    parcel.driverId = driverId;
    parcel.status = "assigned";
    db.parcels.set(parcelId, parcel);

    return res.json({
      message: "Parcel delivery accepted",
      parcel,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to accept parcel" });
  }
});

// Update parcel status (driver actions)
parcelsRouter.patch("/:parcelId/status", async (req, res) => {
  const { parcelId } = req.params;
  const parsed = updateStatusSchema.safeParse(req.body);
  
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });

  try {
    if (!db.parcels) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    const parcel = db.parcels.get(parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    parcel.status = parsed.data.status;
    if (parsed.data.deliveryProof) {
      parcel.deliveryProof = parsed.data.deliveryProof;
    }

    db.parcels.set(parcelId, parcel);

    // TODO: Send notification to sender about status update
    // TODO: If delivered, process payment to driver

    return res.json({
      message: "Parcel status updated",
      parcel,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update parcel status" });
  }
});

// Track parcel (public endpoint with tracking code)
parcelsRouter.get("/track/:parcelId", async (req, res) => {
  const { parcelId } = req.params;

  try {
    if (!db.parcels) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    const parcel = db.parcels.get(parcelId);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    // Return limited info for privacy
    const trackingInfo = {
      id: parcel.id,
      status: parcel.status,
      pickup: parcel.pickup,
      dropoff: parcel.dropoff,
      createdAt: parcel.createdAt,
      estimatedDelivery: parcel.scheduledFor,
    };

    // If assigned, include driver location
    if (parcel.driverId && db.driverLocations) {
      const driverLocation = db.driverLocations.get(parcel.driverId);
      if (driverLocation) {
        (trackingInfo as any).driverLocation = {
          lat: driverLocation.lat,
          lng: driverLocation.lng,
          updatedAt: driverLocation.updatedAt,
        };
      }
    }

    return res.json({ tracking: trackingInfo });
  } catch (error) {
    return res.status(500).json({ message: "Failed to track parcel" });
  }
});

// Get delivery statistics for a user
parcelsRouter.get("/stats/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    if (!db.parcels) {
      return res.json({ 
        totalParcels: 0,
        delivered: 0,
        inTransit: 0,
        failed: 0,
        totalSpent: 0,
      });
    }

    const allParcels = Array.from(db.parcels.values());
    const userParcels = allParcels.filter(p => p.senderId === userId);

    const stats = {
      totalParcels: userParcels.length,
      delivered: userParcels.filter(p => p.status === "delivered").length,
      inTransit: userParcels.filter(p => ["assigned", "picked_up", "in_transit"].includes(p.status)).length,
      failed: userParcels.filter(p => p.status === "failed").length,
      totalSpent: userParcels.reduce((sum, p) => sum + p.fare, 0),
    };

    return res.json({ stats });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch parcel statistics" });
  }
});
