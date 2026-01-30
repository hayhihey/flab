import { Router } from "express";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { db } from "../services/db";
import { SafetyIncident } from "../types";

export const safetyRouter = Router();

const sosSchema = z.object({
  rideId: z.string().uuid(),
  userId: z.string().uuid(),
  location: z.object({ lat: z.number(), lng: z.number() }),
  type: z.enum(["emergency", "unsafe_driving", "harassment", "accident", "other"] as const),
  description: z.string().optional(),
});

const incidentReportSchema = z.object({
  rideId: z.string().uuid(),
  reportedBy: z.string().uuid(),
  type: z.enum(["sos", "route_deviation", "speeding", "accident", "harassment"] as const),
  description: z.string().min(10),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

// Trigger SOS emergency
safetyRouter.post("/sos", async (req, res) => {
  const parsed = sosSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });

  try {
    const { rideId, userId, location, type, description } = parsed.data;

    // Get ride details
    const ride = db.rides.get(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Mark ride as SOS triggered
    ride.sosTriggered = true;
    await db.rides.set(rideId, ride);

    // Create safety incident
    const incident: SafetyIncident = {
      id: uuid(),
      rideId,
      reportedBy: userId,
      type: "sos",
      description: description || `SOS triggered: ${type}`,
      location,
      resolved: false,
      createdAt: new Date(),
    };

    if (!db.safetyIncidents) {
      db.safetyIncidents = new Map();
    }
    db.safetyIncidents.set(incident.id, incident);

    // Get user and driver info for emergency contacts
    const user = db.users.get(userId) || db.drivers.get(userId);
    const driver = ride.driverId ? db.drivers.get(ride.driverId) : null;

    // TODO: Real implementation would:
    // 1. Alert local police with GPS coordinates
    // 2. Send SMS to user's emergency contacts
    // 3. Start live audio/video recording if consent given
    // 4. Alert company control center
    // 5. Send push notification to driver (if passenger triggered)
    
    console.log("🚨 SOS TRIGGERED:", {
      incidentId: incident.id,
      rideId,
      location,
      type,
      user: user?.name,
      driver: driver?.name,
    });

    // Simulate emergency response
    const emergencyResponse = {
      incidentId: incident.id,
      status: "Emergency services alerted",
      policeDispatched: true,
      emergencyContactsNotified: true,
      estimatedResponseTime: "5-10 minutes",
      controlCenterContacted: true,
      recordingStarted: ride.recordingConsent || false,
    };

    return res.status(200).json({
      message: "SOS activated - Help is on the way",
      incident,
      emergencyResponse,
      ride: {
        id: ride.id,
        pickup: ride.pickup,
        dropoff: ride.dropoff,
        driverId: ride.driverId,
      },
    });
  } catch (error) {
    console.error("SOS error:", error);
    return res.status(500).json({ message: "Failed to process SOS" });
  }
});

// Report a safety incident
safetyRouter.post("/report", async (req, res) => {
  const parsed = incidentReportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });

  try {
    const incident: SafetyIncident = {
      id: uuid(),
      rideId: parsed.data.rideId,
      reportedBy: parsed.data.reportedBy,
      type: parsed.data.type,
      description: parsed.data.description,
      location: parsed.data.location,
      resolved: false,
      createdAt: new Date(),
    };

    if (!db.safetyIncidents) {
      db.safetyIncidents = new Map();
    }
    db.safetyIncidents.set(incident.id, incident);

    return res.status(201).json({
      message: "Safety incident reported",
      incident,
      ticketNumber: incident.id,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to report incident" });
  }
});

// Get safety incidents for a ride
safetyRouter.get("/ride/:rideId", async (req, res) => {
  const { rideId } = req.params;

  try {
    if (!db.safetyIncidents) {
      return res.json({ incidents: [] });
    }

    const allIncidents = Array.from(db.safetyIncidents.values());
    const rideIncidents = allIncidents.filter(i => i.rideId === rideId);

    return res.json({ incidents: rideIncidents });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch incidents" });
  }
});

// Get user's safety history
safetyRouter.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    if (!db.safetyIncidents) {
      return res.json({ incidents: [] });
    }

    const allIncidents = Array.from(db.safetyIncidents.values());
    const userIncidents = allIncidents.filter(i => i.reportedBy === userId);

    return res.json({ incidents: userIncidents });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch safety history" });
  }
});

// Admin: Get all safety incidents
safetyRouter.get("/admin/all", async (req, res) => {
  const { resolved } = req.query;

  try {
    if (!db.safetyIncidents) {
      return res.json({ incidents: [] });
    }

    let incidents = Array.from(db.safetyIncidents.values());
    
    if (resolved !== undefined) {
      const isResolved = resolved === "true";
      incidents = incidents.filter(i => i.resolved === isResolved);
    }

    incidents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return res.json({ incidents });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch incidents" });
  }
});

// Admin: Resolve safety incident
safetyRouter.patch("/admin/:incidentId/resolve", async (req, res) => {
  const { incidentId } = req.params;
  const { resolution } = req.body;

  try {
    if (!db.safetyIncidents) {
      return res.status(404).json({ message: "Incident not found" });
    }

    const incident = db.safetyIncidents.get(incidentId);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    incident.resolved = true;
    (incident as any).resolution = resolution;
    (incident as any).resolvedAt = new Date();

    db.safetyIncidents.set(incidentId, incident);

    return res.json({
      message: "Incident resolved",
      incident,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to resolve incident" });
  }
});

// Share ride with trusted contacts
safetyRouter.post("/share-ride", async (req, res) => {
  const { rideId, userId, contacts } = req.body;

  if (!rideId || !userId || !contacts || !Array.isArray(contacts)) {
    return res.status(400).json({ message: "rideId, userId, and contacts array are required" });
  }

  try {
    const ride = db.rides.get(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Generate shareable link
    const shareLink = `${process.env.APP_URL || 'http://localhost:3000'}/track/${rideId}`;
    
    // TODO: Send SMS/email to contacts with tracking link
    // For now, just return the link
    
    console.log("📍 Ride shared with contacts:", {
      rideId,
      userId,
      contacts: contacts.length,
      shareLink,
    });

    return res.json({
      message: "Ride shared with trusted contacts",
      shareLink,
      contactsNotified: contacts.length,
      tracking: {
        pickup: ride.pickup,
        dropoff: ride.dropoff,
        status: ride.status,
        driverId: ride.driverId,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to share ride" });
  }
});

// Check for route deviation
safetyRouter.post("/check-route", async (req, res) => {
  const { rideId, currentLocation, expectedRoute } = req.body;

  try {
    const ride = db.rides.get(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // TODO: Implement actual route deviation detection using Google Maps API
    // For now, simulate check
    
    const deviation = {
      isDeviated: false,
      deviationDistance: 0, // meters
      alert: false,
    };

    // If deviation > 500m, create alert
    if (deviation.deviationDistance > 500) {
      const incident: SafetyIncident = {
        id: uuid(),
        rideId,
        reportedBy: "system",
        type: "route_deviation",
        description: `Driver deviated ${deviation.deviationDistance}m from optimal route`,
        location: currentLocation,
        resolved: false,
        createdAt: new Date(),
      };

      if (!db.safetyIncidents) {
        db.safetyIncidents = new Map();
      }
      db.safetyIncidents.set(incident.id, incident);

      deviation.alert = true;
    }

    return res.json({ deviation });
  } catch (error) {
    return res.status(500).json({ message: "Failed to check route" });
  }
});

// Check driver speed
safetyRouter.post("/check-speed", async (req, res) => {
  const { driverId, speedKph, location } = req.body;

  try {
    const SPEED_LIMIT = 120; // km/h
    
    if (speedKph > SPEED_LIMIT) {
      // Find active ride for this driver
      const allRides = Array.from(db.rides.values());
      const activeRide = allRides.find(
        r => r.driverId === driverId && r.status === "in_progress"
      );

      if (activeRide) {
        const incident: SafetyIncident = {
          id: uuid(),
          rideId: activeRide.id,
          reportedBy: "system",
          type: "speeding",
          description: `Driver exceeded speed limit: ${speedKph} km/h (limit: ${SPEED_LIMIT} km/h)`,
          location,
          resolved: false,
          createdAt: new Date(),
        };

        if (!db.safetyIncidents) {
          db.safetyIncidents = new Map();
        }
        db.safetyIncidents.set(incident.id, incident);

        return res.json({
          warning: true,
          message: "Speed limit exceeded",
          speedKph,
          limit: SPEED_LIMIT,
          incidentId: incident.id,
        });
      }
    }

    return res.json({
      warning: false,
      message: "Speed within limits",
      speedKph,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to check speed" });
  }
});
