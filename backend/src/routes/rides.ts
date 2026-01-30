import { Router } from "express";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { db } from "../services/db";
import { config } from "../config";
import { calculateFare, calculateAllFares, estimateETA, VEHICLE_TYPES, VehicleType } from "../utils/fare";
import { splitPayment } from "../utils/payment";
import { createPaymentIntent } from "../utils/stripe";
import { emitRideRequest, emitRideStatus } from "../realtime/socket";

const createSchema = z.object({
  riderId: z.string().uuid(),
  pickup: z.string().min(2),
  dropoff: z.string().min(2),
  pickupCoords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  dropoffCoords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  distanceKm: z.number().positive(),
  durationMin: z.number().positive(),
  paymentMethod: z.enum(["cash", "card"] as const),
  vehicleType: z.enum(["economy", "comfort", "premium", "xl", "bike"] as const).optional()
});

const acceptSchema = z.object({
  driverId: z.string().uuid()
});

const completeSchema = z.object({
  actualDistanceKm: z.number().positive().optional(),
  actualDurationMin: z.number().positive().optional(),
  paymentMethod: z.enum(["cash", "card"] as const).optional()
});

const estimateSchema = z.object({
  distanceKm: z.number().positive(),
  durationMin: z.number().positive(),
  vehicleType: z.enum(["economy", "comfort", "premium", "xl", "bike"] as const).optional()
});

const fareCompareSchema = z.object({
  distanceKm: z.number().positive(),
  durationMin: z.number().positive()
});

export const ridesRouter = Router();

// Get all vehicle types with pricing info
ridesRouter.get("/vehicle-types", async (req, res) => {
  try {
    const types = Object.entries(VEHICLE_TYPES).map(([key, value]) => ({
      type: key,
      ...value,
      baseRate: config.defaults.baseFare * value.multiplier,
      distanceRate: config.defaults.distanceRate * value.multiplier,
      timeRate: config.defaults.timeRate * value.multiplier,
    }));
    return res.json({ vehicleTypes: types });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch vehicle types" });
  }
});

// Compare fares across all vehicle types
ridesRouter.post("/fare-compare", async (req, res) => {
  const parsed = fareCompareSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });

  try {
    const allFares = calculateAllFares(
      parsed.data.distanceKm,
      parsed.data.durationMin,
      config.defaults
    );
    
    const eta = estimateETA(parsed.data.distanceKm);

    return res.json({
      fares: allFares,
      eta,
      distance: parsed.data.distanceKm,
      duration: parsed.data.durationMin,
      currency: "NGN",
      surgeActive: false,
      surgeMultiplier: 1.0
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to compare fares" });
  }
});

ridesRouter.post("/estimate", async (req, res) => {
  const parsed = estimateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });

  try {
    const vehicleType = parsed.data.vehicleType || 'economy';
    const vehicle = VEHICLE_TYPES[vehicleType];
    const fare = calculateFare(parsed.data.distanceKm, parsed.data.durationMin, config.defaults, vehicleType);
    const eta = estimateETA(parsed.data.distanceKm);

    // Calculate breakdown for transparency
    const breakdown = {
      baseFare: config.defaults.baseFare * vehicle.multiplier,
      distanceCharge: parsed.data.distanceKm * config.defaults.distanceRate * vehicle.multiplier,
      timeCharge: parsed.data.durationMin * config.defaults.timeRate * vehicle.multiplier,
      vehicleMultiplier: vehicle.multiplier,
      total: fare
    };

    return res.json({
      fare,
      breakdown,
      vehicleType,
      vehicleName: vehicle.name,
      vehicleIcon: vehicle.icon,
      eta,
      currency: "NGN"
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to calculate estimate" });
  }
});

ridesRouter.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });

  try {
    const rider = await db.getRider(parsed.data.riderId);
    if (!rider) return res.status(404).json({ message: "Rider not found" });

    const fare = calculateFare(parsed.data.distanceKm, parsed.data.durationMin, config.defaults);

    const ride = await db.putRide({
      id: uuid(),
      rider_id: parsed.data.riderId,
      pickup: parsed.data.pickup,
      dropoff: parsed.data.dropoff,
      distance_km: parsed.data.distanceKm,
      duration_min: parsed.data.durationMin,
      fare,
      status: "requested",
      payment_method: parsed.data.paymentMethod
    } as any);

    console.log(`\n📌 New ride created: ${ride.id}`);
    console.log(`   Pickup: ${parsed.data.pickup}`);
    console.log(`   Dropoff: ${parsed.data.dropoff}`);
    console.log(`   Coords: ${JSON.stringify(parsed.data.pickupCoords)}`);

    emitRideRequest({
      rideId: ride.id,
      pickup: parsed.data.pickup,
      dropoff: parsed.data.dropoff,
      fare,
      distanceKm: parsed.data.distanceKm,
      durationMin: parsed.data.durationMin,
      pickupCoords: parsed.data.pickupCoords,
      createdAt: ride.created_at || new Date()
    });

    return res.status(201).json({ ride });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create ride" });
  }
});

ridesRouter.get("/:rideId", async (req, res) => {
  const params = z.object({ rideId: z.string().uuid() }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ message: "Invalid ride id" });
  
  try {
    const ride = await db.getRide(params.data.rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    return res.json({ ride });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch ride" });
  }
});

ridesRouter.patch("/:rideId/accept", async (req, res) => {
  const params = z.object({ rideId: z.string().uuid() }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ message: "Invalid ride id" });
  const body = acceptSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ message: "Invalid payload", issues: body.error.issues });

  try {
    const ride = await db.getRide(params.data.rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    const driver = await db.getDriver(body.data.driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    if (driver.verification_status !== "approved") return res.status(403).json({ message: "Driver not approved" });
    if (ride.status !== "requested") return res.status(409).json({ message: "Ride not available" });

    ride.status = "accepted";
    ride.driver_id = driver.id;
    await db.saveRide(ride);

    emitRideStatus(ride.id, "accepted", {
      driverId: driver.id,
      riderId: ride.rider_id,
      driver: {
        id: driver.id,
        name: (driver as any).name || (driver as any).full_name || "Driver",
        phone: (driver as any).phone || (driver as any).phone_number,
        vehicleType: (driver as any).vehicleType || (driver as any).vehicle_type,
        license: (driver as any).licenseNumber || (driver as any).license_number,
        rating: (driver as any).rating
      }
    });

    return res.json({ ride });
  } catch (error) {
    return res.status(500).json({ message: "Failed to accept ride" });
  }
});

ridesRouter.patch("/:rideId/complete", async (req, res) => {
  const params = z.object({ rideId: z.string().uuid() }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ message: "Invalid ride id" });
  const body = completeSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ message: "Invalid payload", issues: body.error.issues });

  try {
    const ride = await db.getRide(params.data.rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (!ride.driver_id) return res.status(409).json({ message: "No driver assigned" });
    if (ride.status === "completed") return res.status(409).json({ message: "Ride already completed" });

    if (body.data.actualDistanceKm) ride.distance_km = body.data.actualDistanceKm;
    if (body.data.actualDurationMin) ride.duration_min = body.data.actualDurationMin;
    if (body.data.paymentMethod) ride.payment_method = body.data.paymentMethod;

    ride.fare = calculateFare(ride.distance_km, ride.duration_min, config.defaults);
    const paymentSplit = splitPayment(ride.fare, config.defaults.commissionPercent);
    ride.platform_share = paymentSplit.platformShare;
    ride.driver_share = paymentSplit.driverShare;
    ride.status = "completed";

    // Process payment if payment method is card
    let paymentStatus = "completed";
    if (ride.payment_method === "card") {
      try {
        const amountCents = Math.round(ride.fare * 100);
        const paymentIntent = await createPaymentIntent(
          ride.id,
          amountCents,
          `Ride ${ride.id}: ${ride.pickup} to ${ride.dropoff}`
        );

        if (paymentIntent.status !== "completed") {
          paymentStatus = "pending";
        }

        ride.payment_intent_id = paymentIntent.id;
        ride.payment_status = paymentStatus;
      } catch (error) {
        console.error("Payment processing failed:", error);
        return res.status(402).json({
          message: "Payment processing failed",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    await db.saveRide(ride);

    emitRideStatus(ride.id, "completed", { driverId: ride.driver_id, fare: ride.fare, paymentStatus });

    return res.json({
      ride,
      payment: {
        status: paymentStatus,
        riderAmount: ride.driver_share,
        platformCommission: ride.platform_share
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to complete ride" });
  }
});

/**
 * Endpoint to create payment intent (called from frontend to initialize Stripe payment)
 */
ridesRouter.post("/:rideId/payment-intent", async (req, res) => {
  const params = z.object({ rideId: z.string().uuid() }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ message: "Invalid ride id" });

  try {
    const ride = await db.getRide(params.data.rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.status !== "completed") return res.status(409).json({ message: "Ride not completed yet" });

    const amountCents = Math.round(ride.fare * 100);
    const paymentIntent = await createPaymentIntent(
      ride.id,
      amountCents,
      `Ride ${ride.id}: ${ride.pickup} to ${ride.dropoff}`
    );

    ride.payment_intent_id = paymentIntent.id;
    await db.saveRide(ride);

    return res.json({
      clientSecret: paymentIntent.clientSecret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create payment intent" });
  }
});

// ==================== RIDE HISTORY ENDPOINTS ====================

// Get rider's ride history with pagination and filters
ridesRouter.get("/history/:riderId", async (req, res) => {
  const params = z.object({ riderId: z.string().uuid() }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ message: "Invalid rider id" });

  const querySchema = z.object({
    limit: z.string().optional().transform(v => v ? parseInt(v) : 20),
    offset: z.string().optional().transform(v => v ? parseInt(v) : 0),
    status: z.enum(["requested", "accepted", "in_progress", "completed", "cancelled"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  });
  
  const query = querySchema.safeParse(req.query);
  if (!query.success) return res.status(400).json({ message: "Invalid query params" });

  try {
    const rides = await db.listRidesForRider(
      params.data.riderId,
      query.data.status,
      query.data.limit,
      query.data.offset,
      query.data.startDate,
      query.data.endDate
    );
    
    const stats = await db.getRiderStats(params.data.riderId);
    
    return res.json({ 
      rides,
      stats,
      pagination: {
        limit: query.data.limit,
        offset: query.data.offset,
        hasMore: rides.length === query.data.limit
      }
    });
  } catch (error) {
    console.error("Failed to fetch ride history:", error);
    return res.status(500).json({ message: "Failed to fetch ride history" });
  }
});

// Get rider statistics summary
ridesRouter.get("/stats/:riderId", async (req, res) => {
  const params = z.object({ riderId: z.string().uuid() }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ message: "Invalid rider id" });

  try {
    const stats = await db.getRiderStats(params.data.riderId);
    return res.json({ stats });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch rider stats" });
  }
});

// ==================== SAVED PLACES ENDPOINTS ====================

// Get user's saved places
ridesRouter.get("/places/:userId", async (req, res) => {
  const params = z.object({ userId: z.string().uuid() }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ message: "Invalid user id" });

  try {
    const places = await db.getSavedPlaces(params.data.userId);
    return res.json({ places });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch saved places" });
  }
});

// Save a new place
ridesRouter.post("/places", async (req, res) => {
  const schema = z.object({
    userId: z.string().uuid(),
    name: z.string().min(1),
    address: z.string().min(2),
    lat: z.number(),
    lng: z.number(),
    type: z.enum(["home", "work", "favorite"]).optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });

  try {
    const place = await db.savePlaces(parsed.data);
    return res.status(201).json({ place });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save place" });
  }
});

// Delete a saved place
ridesRouter.delete("/places/:placeId", async (req, res) => {
  const params = z.object({ placeId: z.string().uuid() }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ message: "Invalid place id" });

  try {
    await db.deletePlace(params.data.placeId);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete place" });
  }
});

// ==================== RIDE ACTIONS ====================

// Cancel a ride
ridesRouter.patch("/:rideId/cancel", async (req, res) => {
  const params = z.object({ rideId: z.string().uuid() }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ message: "Invalid ride id" });
  
  const schema = z.object({
    reason: z.string().optional(),
    cancelledBy: z.enum(["rider", "driver"]).optional()
  });
  const body = schema.safeParse(req.body);

  try {
    const ride = await db.getRide(params.data.rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.status === "completed" || ride.status === "cancelled") {
      return res.status(409).json({ message: "Ride cannot be cancelled" });
    }

    ride.status = "cancelled";
    ride.cancellation_reason = body.data?.reason;
    ride.cancelled_by = body.data?.cancelledBy || "rider";
    await db.saveRide(ride);

    emitRideStatus(ride.id, "cancelled", { 
      driverId: ride.driver_id, 
      riderId: ride.rider_id,
      reason: body.data?.reason 
    });

    return res.json({ ride });
  } catch (error) {
    return res.status(500).json({ message: "Failed to cancel ride" });
  }
});

// Rate a completed ride
ridesRouter.post("/:rideId/rate", async (req, res) => {
  const params = z.object({ rideId: z.string().uuid() }).safeParse(req.params);
  if (!params.success) return res.status(400).json({ message: "Invalid ride id" });

  const schema = z.object({
    rating: z.number().min(1).max(5),
    review: z.string().optional(),
    ratedBy: z.enum(["rider", "driver"])
  });
  const body = schema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ message: "Invalid payload", issues: body.error.issues });

  try {
    const ride = await db.getRide(params.data.rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.status !== "completed") return res.status(409).json({ message: "Can only rate completed rides" });

    if (body.data.ratedBy === "rider") {
      ride.driver_rating = body.data.rating;
      ride.driver_review = body.data.review;
    } else {
      ride.rider_rating = body.data.rating;
      ride.rider_review = body.data.review;
    }
    
    await db.saveRide(ride);
    
    // Update driver's average rating if rated by rider
    if (body.data.ratedBy === "rider" && ride.driver_id) {
      await db.updateDriverRating(ride.driver_id);
    }

    return res.json({ ride });
  } catch (error) {
    return res.status(500).json({ message: "Failed to rate ride" });
  }
});
