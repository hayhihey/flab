import { Router } from "express";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { db } from "../services/db";
import { Ride } from "../types";

const scheduledRideSchema = z.object({
  riderId: z.string().uuid(),
  pickup: z.string().min(2),
  dropoff: z.string().min(2),
  pickupCoords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  dropoffCoords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  distanceKm: z.number().positive(),
  durationMin: z.number().positive(),
  paymentMethod: z.enum(["cash", "card", "wallet", "mobile_money"] as const),
  vehicleType: z.enum(["economy", "comfort", "premium", "xl", "bike"] as const).optional(),
  scheduledFor: z.string().datetime(), // ISO datetime string
  isRecurring: z.boolean().optional(),
  recurringPattern: z.string().optional(), // e.g., "monday_9am", "daily_6pm"
});

const carpoolSchema = z.object({
  riderId: z.string().uuid(),
  pickup: z.string().min(2),
  dropoff: z.string().min(2),
  pickupCoords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  dropoffCoords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  distanceKm: z.number().positive(),
  durationMin: z.number().positive(),
  seatsNeeded: z.number().int().min(1).max(3),
  paymentMethod: z.enum(["cash", "card", "wallet", "mobile_money"] as const),
});

export const scheduledRouter = Router();

// Create a scheduled ride
scheduledRouter.post("/", async (req, res) => {
  const parsed = scheduledRideSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });

  try {
    const scheduledFor = new Date(parsed.data.scheduledFor);
    const now = new Date();
    
    // Validate scheduled time is in the future
    if (scheduledFor <= now) {
      return res.status(400).json({ message: "Scheduled time must be in the future" });
    }

    // Validate not more than 30 days in advance
    const maxAdvance = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (scheduledFor > maxAdvance) {
      return res.status(400).json({ message: "Cannot schedule rides more than 30 days in advance" });
    }

    const ride: Ride = {
      id: uuid(),
      riderId: parsed.data.riderId,
      pickup: parsed.data.pickup,
      dropoff: parsed.data.dropoff,
      pickupCoords: parsed.data.pickupCoords,
      dropoffCoords: parsed.data.dropoffCoords,
      distanceKm: parsed.data.distanceKm,
      durationMin: parsed.data.durationMin,
      fare: 0, // Calculate fare at scheduling time
      status: "requested",
      rideType: parsed.data.isRecurring ? "recurring" : "scheduled",
      scheduledFor,
      recurringPattern: parsed.data.recurringPattern,
      paymentMethod: parsed.data.paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Calculate fare (import from fare utils)
    const { calculateFare } = await import("../utils/fare");
    const { config } = await import("../config");
    ride.fare = calculateFare(
      parsed.data.distanceKm,
      parsed.data.durationMin,
      config.defaults,
      parsed.data.vehicleType || "economy"
    );

    await db.rides.set(ride.id, ride);

    return res.status(201).json({ 
      message: "Scheduled ride created successfully",
      ride,
      scheduledFor: scheduledFor.toISOString(),
    });
  } catch (error) {
    console.error("Scheduled ride creation error:", error);
    return res.status(500).json({ message: "Failed to create scheduled ride" });
  }
});

// Get all scheduled rides for a user
scheduledRouter.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const allRides = Array.from(db.rides.values());
    const scheduledRides = allRides.filter(
      ride => 
        ride.riderId === userId && 
        (ride.rideType === "scheduled" || ride.rideType === "recurring") &&
        ride.status === "requested" &&
        ride.scheduledFor &&
        ride.scheduledFor > new Date()
    );

    return res.json({
      scheduledRides: scheduledRides.sort((a, b) => 
        (a.scheduledFor?.getTime() || 0) - (b.scheduledFor?.getTime() || 0)
      ),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch scheduled rides" });
  }
});

// Cancel a scheduled ride
scheduledRouter.delete("/:rideId", async (req, res) => {
  const { rideId } = req.params;

  try {
    const ride = db.rides.get(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "requested") {
      return res.status(400).json({ message: "Cannot cancel ride that is already in progress" });
    }

    ride.status = "cancelled";
    ride.updatedAt = new Date();
    await db.rides.set(rideId, ride);

    return res.json({ message: "Scheduled ride cancelled successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to cancel scheduled ride" });
  }
});

// Create carpool request
scheduledRouter.post("/carpool", async (req, res) => {
  const parsed = carpoolSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });

  try {
    const ride: Ride = {
      id: uuid(),
      riderId: parsed.data.riderId,
      pickup: parsed.data.pickup,
      dropoff: parsed.data.dropoff,
      pickupCoords: parsed.data.pickupCoords,
      dropoffCoords: parsed.data.dropoffCoords,
      distanceKm: parsed.data.distanceKm,
      durationMin: parsed.data.durationMin,
      fare: 0,
      status: "requested",
      rideType: "carpool",
      isCarpool: true,
      carpoolSeats: parsed.data.seatsNeeded,
      carpoolPassengers: [parsed.data.riderId], // Initial passenger
      paymentMethod: parsed.data.paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Calculate discounted fare for carpool (40% cheaper)
    const { calculateFare } = await import("../utils/fare");
    const { config } = await import("../config");
    const standardFare = calculateFare(
      parsed.data.distanceKm,
      parsed.data.durationMin,
      config.defaults,
      "economy"
    );
    ride.fare = standardFare * 0.6; // 40% discount

    await db.rides.set(ride.id, ride);

    return res.status(201).json({ 
      message: "Carpool request created successfully",
      ride,
      savings: standardFare - ride.fare,
    });
  } catch (error) {
    console.error("Carpool creation error:", error);
    return res.status(500).json({ message: "Failed to create carpool request" });
  }
});

// Find available carpool rides
scheduledRouter.get("/carpool/available", async (req, res) => {
  const { pickup, dropoff, maxDistance } = req.query;

  try {
    const allRides = Array.from(db.rides.values());
    const availableCarpools = allRides.filter(
      ride => 
        ride.isCarpool === true &&
        ride.status === "requested" &&
        (ride.carpoolSeats || 0) > (ride.carpoolPassengers?.length || 0) &&
        // TODO: Add distance matching logic here
        true
    );

    return res.json({ carpools: availableCarpools });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch available carpools" });
  }
});

// Join an existing carpool
scheduledRouter.post("/carpool/:rideId/join", async (req, res) => {
  const { rideId } = req.params;
  const { passengerId } = req.body;

  try {
    const ride = db.rides.get(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Carpool not found" });
    }

    if (!ride.isCarpool) {
      return res.status(400).json({ message: "Not a carpool ride" });
    }

    const currentPassengers = ride.carpoolPassengers?.length || 0;
    if (currentPassengers >= (ride.carpoolSeats || 1)) {
      return res.status(400).json({ message: "Carpool is full" });
    }

    if (ride.carpoolPassengers?.includes(passengerId)) {
      return res.status(400).json({ message: "Already in this carpool" });
    }

    ride.carpoolPassengers = [...(ride.carpoolPassengers || []), passengerId];
    ride.updatedAt = new Date();
    await db.rides.set(rideId, ride);

    return res.json({ 
      message: "Successfully joined carpool",
      ride,
      seatsRemaining: (ride.carpoolSeats || 1) - ride.carpoolPassengers.length,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to join carpool" });
  }
});
