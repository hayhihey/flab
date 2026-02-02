import { createClient } from "@supabase/supabase-js";
import { v4 as uuid } from "uuid";
import {
  AvailabilityStatus,
  Driver,
  DriverLocation,
  Ride,
  RideStatus,
  User,
  VerificationStatus
} from "../types";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://jtrsyorpstqvkyvpoonk.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cnN5b3Jwc3Rxdmt5dnBvb25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczODg1NjYsImV4cCI6MjA2Mjk2NDU2Nn0.aOvJ4sQ7b7i5ONCDdq5E7VPUSaX43EDcAJ1CW8cJyWA";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Admin client for privileged actions (user creation, full-table access)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);
// Public client for user-facing auth (sign-in/out)
const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Reuse admin client for database reads/writes
const supabase = supabaseAdmin;

export const db = {
  // Auth methods using Supabase Auth
  signUpUser: async (email: string, password: string) => {
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Service role key missing. Set SUPABASE_SERVICE_ROLE_KEY for server-side signup.");
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (createError) throw new Error(`Sign up failed: ${createError.message}`);

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw new Error(`Sign in failed after sign up: ${error.message}`);
    return { user: data.user || created.user, session: data.session };
  },

  signInUser: async (email: string, password: string) => {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw new Error(`Sign in failed: ${error.message}`);
    return { user: data.user, session: data.session };
  },

  signOutUser: async () => {
    const { error } = await supabaseAuth.auth.signOut();
    if (error) throw new Error(`Sign out failed: ${error.message}`);
  },

  upsertRider: async (name: string, email: string) => {
    // Check if rider exists by email
    const { data: existing } = await supabase
      .from("riders")
      .select("*")
      .eq("email", email)
      .single();

    if (existing) return existing;

    // Create new rider
    const { data, error } = await supabase
      .from("riders")
      .insert({ id: uuid(), name, email, phone: email, role: "rider" })
      .select()
      .single();

    if (error) throw new Error(`Failed to create rider: ${error.message}`);
    return data;
  },

  getRider: async (id: string) => {
    const { data, error } = await supabase
      .from("riders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    return data;
  },

  getRiderByEmail: async (email: string) => {
    const { data, error } = await supabase
      .from("riders")
      .select("*")
      .eq("email", email)
      .single();

    if (error) return undefined;
    return data;
  },

  listRiders: async () => {
    const { data, error } = await supabase.from("riders").select("*");
    if (error) throw new Error(`Failed to list riders: ${error.message}`);
    return data || [];
  },

  // Driver methods
  upsertDriver: async (
    name: string,
    email: string,
    licenseNumber?: string,
    vehicle?: string,
    status: VerificationStatus = "pending"
  ) => {
    // Check if driver exists by email
    const { data: existing } = await supabase
      .from("drivers")
      .select("*")
      .eq("email", email)
      .single();

    if (existing) return existing;

    const license = licenseNumber || "";

    const { data, error } = await supabase
      .from("drivers")
      .insert({
        id: uuid(),
        name,
        email,
        phone: email,
        license_number: license,
        vehicle,
        verification_status: status,
        availability: "offline",
        role: "driver"
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create driver: ${error.message}`);
    return data;
  },

  getDriver: async (id: string) => {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    return data;
  },

  listDrivers: async (filter?: Partial<any>) => {
    let query = supabase.from("drivers").select("*");

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list drivers: ${error.message}`);
    return data || [];
  },

  setDriverVerification: async (id: string, status: VerificationStatus) => {
    const { data, error } = await supabase
      .from("drivers")
      .update({ verification_status: status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update driver verification: ${error.message}`);
    return data;
  },

  setDriverAvailability: async (id: string, availability: AvailabilityStatus) => {
    const { data, error } = await supabase
      .from("drivers")
      .update({ availability })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update driver availability: ${error.message}`);
    return data;
  },

  // Ride methods
  putRide: async (ride: Omit<Ride, "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("rides")
      .insert({
        ...ride,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create ride: ${error.message}`);
    return data;
  },

  getRide: async (id: string) => {
    const { data, error } = await supabase
      .from("rides")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    return data;
  },

  saveRide: async (ride: Ride) => {
    const { data, error } = await supabase
      .from("rides")
      .update({
        ...ride,
        updated_at: new Date().toISOString()
      })
      .eq("id", ride.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update ride: ${error.message}`);
    return data;
  },

  listRidesForDriver: async (driverId: string, status?: RideStatus) => {
    let query = supabase
      .from("rides")
      .select("*")
      .eq("driver_id", driverId);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list driver rides: ${error.message}`);
    return data || [];
  },

  // Get pending rides that haven't been accepted yet
  getPendingRides: async (vehicleType?: string) => {
    let query = supabase
      .from("rides")
      .select("*")
      .eq("status", "requested")
      .is("driver_id", null)
      .order("created_at", { ascending: false });

    if (vehicleType) {
      query = query.eq("vehicle_type", vehicleType);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to get pending rides: ${error.message}`);
    return data || [];
  },

  // Driver Location methods
  setDriverLocation: async (
    driverId: string,
    lat: number,
    lng: number,
    heading?: number,
    speedKph?: number,
    rideId?: string
  ) => {
    const { data, error } = await supabase
      .from("driver_locations")
      .upsert({
        driver_id: driverId,
        lat,
        lng,
        heading,
        speed_kph: speedKph,
        ride_id: rideId,
        updated_at: new Date().toISOString()
      }, { onConflict: "driver_id" })
      .select()
      .single();

    if (error) throw new Error(`Failed to update driver location: ${error.message}`);
    return data;
  },

  getDriverLocation: async (driverId: string) => {
    const { data, error } = await supabase
      .from("driver_locations")
      .select("*")
      .eq("driver_id", driverId)
      .single();

    if (error) return undefined;
    return data;
  },

  listDriverLocations: async () => {
    const { data, error } = await supabase
      .from("driver_locations")
      .select("*");

    if (error) throw new Error(`Failed to list driver locations: ${error.message}`);
    return data || [];
  },

  getDriverByEmail: async (email: string) => {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("email", email)
      .single();

    if (error) return undefined;
    return data;
  },

  // Ride history for riders with pagination and filters
  listRidesForRider: async (
    riderId: string,
    status?: RideStatus,
    limit: number = 20,
    offset: number = 0,
    startDate?: string,
    endDate?: string
  ) => {
    let query = supabase
      .from("rides")
      .select("*")
      .eq("rider_id", riderId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list rider rides: ${error.message}`);
    return data || [];
  },

  // Get rider statistics
  getRiderStats: async (riderId: string) => {
    const { data: rides, error } = await supabase
      .from("rides")
      .select("fare, distance_km, duration_min, status, created_at")
      .eq("rider_id", riderId);

    if (error) throw new Error(`Failed to get rider stats: ${error.message}`);

    const completedRides = (rides || []).filter(r => r.status === "completed");
    const cancelledRides = (rides || []).filter(r => r.status === "cancelled");
    
    const totalSpent = completedRides.reduce((sum, r) => sum + (r.fare || 0), 0);
    const totalDistance = completedRides.reduce((sum, r) => sum + (r.distance_km || 0), 0);
    const totalDuration = completedRides.reduce((sum, r) => sum + (r.duration_min || 0), 0);

    // Get rides this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const thisMonthRides = completedRides.filter(r => r.created_at >= startOfMonth);
    const thisMonthSpent = thisMonthRides.reduce((sum, r) => sum + (r.fare || 0), 0);

    return {
      totalRides: completedRides.length,
      totalSpent: Number(totalSpent.toFixed(2)),
      totalDistance: Number(totalDistance.toFixed(2)),
      totalDuration: Math.round(totalDuration),
      cancelledRides: cancelledRides.length,
      thisMonthRides: thisMonthRides.length,
      thisMonthSpent: Number(thisMonthSpent.toFixed(2)),
      averageFare: completedRides.length > 0 
        ? Number((totalSpent / completedRides.length).toFixed(2)) 
        : 0,
      memberSince: rides && rides.length > 0 
        ? rides.reduce((min, r) => r.created_at < min ? r.created_at : min, rides[0].created_at)
        : null
    };
  },

  // Saved places management
  getSavedPlaces: async (userId: string) => {
    const { data, error } = await supabase
      .from("saved_places")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      // Table might not exist yet, return empty array
      console.warn("Could not fetch saved places:", error.message);
      return [];
    }
    return data || [];
  },

  savePlaces: async (place: {
    userId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    type?: string;
  }) => {
    const { data, error } = await supabase
      .from("saved_places")
      .insert({
        id: uuid(),
        user_id: place.userId,
        name: place.name,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        place_type: place.type || "favorite",
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save place: ${error.message}`);
    return data;
  },

  deletePlace: async (placeId: string) => {
    const { error } = await supabase
      .from("saved_places")
      .delete()
      .eq("id", placeId);

    if (error) throw new Error(`Failed to delete place: ${error.message}`);
  },

  // Update driver's average rating
  updateDriverRating: async (driverId: string) => {
    const { data: rides, error: ridesError } = await supabase
      .from("rides")
      .select("driver_rating")
      .eq("driver_id", driverId)
      .not("driver_rating", "is", null);

    if (ridesError) throw new Error(`Failed to get driver ratings: ${ridesError.message}`);

    if (rides && rides.length > 0) {
      const avgRating = rides.reduce((sum, r) => sum + r.driver_rating, 0) / rides.length;
      
      const { error: updateError } = await supabase
        .from("drivers")
        .update({ rating: Number(avgRating.toFixed(2)) })
        .eq("id", driverId);

      if (updateError) throw new Error(`Failed to update driver rating: ${updateError.message}`);
    }
  },

  // ============================================
  // LOYALTY REWARDS METHODS
  // ============================================
  
  getLoyaltyStatus: async (userId: string) => {
    const { data, error } = await supabase
      .from("riders")
      .select("loyalty_tier, loyalty_points, total_rides")
      .eq("id", userId)
      .single();

    if (error) return null;
    return data;
  },

  updateLoyaltyTier: async (userId: string, tier: string, points: number) => {
    const { data, error } = await supabase
      .from("riders")
      .update({ loyalty_tier: tier, loyalty_points: points })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update loyalty tier: ${error.message}`);
    return data;
  },

  createLoyaltyReward: async (reward: {
    userId: string;
    points: number;
    tier: string;
    cashbackPercent: number;
  }) => {
    const { data, error } = await supabase
      .from("loyalty_rewards")
      .insert({
        id: uuid(),
        user_id: reward.userId,
        points: reward.points,
        tier: reward.tier,
        cashback_percent: reward.cashbackPercent,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create loyalty reward: ${error.message}`);
    return data;
  },

  getLoyaltyHistory: async (userId: string, limit: number = 50) => {
    const { data, error } = await supabase
      .from("loyalty_rewards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return data || [];
  },

  getLoyaltyLeaderboard: async (limit: number = 10) => {
    const { data, error } = await supabase
      .from("riders")
      .select("id, name, loyalty_tier, loyalty_points, total_rides")
      .order("loyalty_points", { ascending: false })
      .limit(limit);

    if (error) return [];
    return data || [];
  },

  // ============================================
  // SUBSCRIPTION METHODS
  // ============================================

  createSubscription: async (subscription: {
    userId: string;
    plan: string;
    ridesRemaining?: number;
    deliveriesRemaining: number;
    startsAt: Date;
    expiresAt: Date;
    price: number;
    autoRenew: boolean;
  }) => {
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        id: uuid(),
        user_id: subscription.userId,
        plan: subscription.plan,
        rides_remaining: subscription.ridesRemaining,
        deliveries_remaining: subscription.deliveriesRemaining,
        starts_at: subscription.startsAt.toISOString(),
        expires_at: subscription.expiresAt.toISOString(),
        auto_renew: subscription.autoRenew,
        price: subscription.price,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create subscription: ${error.message}`);
    return data;
  },

  getActiveSubscription: async (userId: string) => {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data;
  },

  updateSubscriptionUsage: async (subscriptionId: string, type: "ride" | "delivery") => {
    const field = type === "ride" ? "rides_remaining" : "deliveries_remaining";
    
    const { data: current } = await supabase
      .from("subscriptions")
      .select(field)
      .eq("id", subscriptionId)
      .single();

    if (!current) throw new Error("Subscription not found");

    const newValue = Math.max(0, (current[field] || 0) - 1);

    const { data, error } = await supabase
      .from("subscriptions")
      .update({ [field]: newValue })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update subscription usage: ${error.message}`);
    return data;
  },

  cancelSubscription: async (subscriptionId: string) => {
    const { data, error } = await supabase
      .from("subscriptions")
      .update({ auto_renew: false })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) throw new Error(`Failed to cancel subscription: ${error.message}`);
    return data;
  },

  // ============================================
  // REFERRAL METHODS
  // ============================================

  createReferral: async (referral: {
    referrerId: string;
    refereeId: string;
    type: string;
    reward: number;
  }) => {
    const { data, error } = await supabase
      .from("referrals")
      .insert({
        id: uuid(),
        referrer_id: referral.referrerId,
        referee_id: referral.refereeId,
        type: referral.type,
        reward: referral.reward,
        status: "pending",
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create referral: ${error.message}`);
    return data;
  },

  completeReferral: async (referralId: string) => {
    const { data, error } = await supabase
      .from("referrals")
      .update({ status: "completed" })
      .eq("id", referralId)
      .select()
      .single();

    if (error) throw new Error(`Failed to complete referral: ${error.message}`);
    return data;
  },

  getReferralStats: async (userId: string) => {
    const { data, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", userId);

    if (error) return { total: 0, completed: 0, pending: 0, earned: 0 };

    const referrals = data || [];
    return {
      total: referrals.length,
      completed: referrals.filter(r => r.status === "completed").length,
      pending: referrals.filter(r => r.status === "pending").length,
      earned: referrals
        .filter(r => r.status === "completed")
        .reduce((sum, r) => sum + r.reward, 0)
    };
  },

  getReferralByRefereeId: async (refereeId: string) => {
    const { data, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referee_id", refereeId)
      .single();

    if (error) return null;
    return data;
  },

  // ============================================
  // PARCEL DELIVERY METHODS
  // ============================================

  createParcel: async (parcel: {
    senderId: string;
    receiverName: string;
    receiverPhone: string;
    pickup: string;
    dropoff: string;
    pickupCoords: any;
    dropoffCoords: any;
    size: string;
    weight?: number;
    value?: number;
    insured: boolean;
    fare: number;
    scheduledFor?: Date;
  }) => {
    const { data, error } = await supabase
      .from("parcels")
      .insert({
        id: uuid(),
        sender_id: parcel.senderId,
        receiver_name: parcel.receiverName,
        receiver_phone: parcel.receiverPhone,
        pickup: parcel.pickup,
        dropoff: parcel.dropoff,
        pickup_coords: parcel.pickupCoords,
        dropoff_coords: parcel.dropoffCoords,
        size: parcel.size,
        weight: parcel.weight,
        value: parcel.value,
        insured: parcel.insured,
        fare: parcel.fare,
        status: "pending",
        scheduled_for: parcel.scheduledFor?.toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create parcel: ${error.message}`);
    return data;
  },

  getParcel: async (parcelId: string) => {
    const { data, error } = await supabase
      .from("parcels")
      .select("*")
      .eq("id", parcelId)
      .single();

    if (error) return null;
    return data;
  },

  listAvailableParcels: async () => {
    const { data, error } = await supabase
      .from("parcels")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) return [];
    return data || [];
  },

  assignParcelToDriver: async (parcelId: string, driverId: string) => {
    const { data, error } = await supabase
      .from("parcels")
      .update({ driver_id: driverId, status: "assigned" })
      .eq("id", parcelId)
      .select()
      .single();

    if (error) throw new Error(`Failed to assign parcel: ${error.message}`);
    return data;
  },

  updateParcelStatus: async (parcelId: string, status: string, deliveryProof?: string) => {
    const update: any = { status };
    if (deliveryProof) update.delivery_proof = deliveryProof;

    const { data, error } = await supabase
      .from("parcels")
      .update(update)
      .eq("id", parcelId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update parcel status: ${error.message}`);
    return data;
  },

  listUserParcels: async (userId: string) => {
    const { data, error } = await supabase
      .from("parcels")
      .select("*")
      .eq("sender_id", userId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data || [];
  },

  listDriverParcels: async (driverId: string) => {
    const { data, error } = await supabase
      .from("parcels")
      .select("*")
      .eq("driver_id", driverId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data || [];
  },

  // ============================================
  // SAFETY INCIDENT METHODS
  // ============================================

  createSafetyIncident: async (incident: {
    rideId: string;
    reportedBy: string;
    type: string;
    description?: string;
    location?: any;
  }) => {
    const { data, error } = await supabase
      .from("safety_incidents")
      .insert({
        id: uuid(),
        ride_id: incident.rideId,
        reported_by: incident.reportedBy,
        type: incident.type,
        description: incident.description,
        location: incident.location,
        resolved: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create safety incident: ${error.message}`);
    return data;
  },

  getSafetyIncident: async (incidentId: string) => {
    const { data, error } = await supabase
      .from("safety_incidents")
      .select("*")
      .eq("id", incidentId)
      .single();

    if (error) return null;
    return data;
  },

  listSafetyIncidentsByRide: async (rideId: string) => {
    const { data, error } = await supabase
      .from("safety_incidents")
      .select("*")
      .eq("ride_id", rideId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data || [];
  },

  listUserSafetyIncidents: async (userId: string) => {
    const { data, error } = await supabase
      .from("safety_incidents")
      .select("*")
      .eq("reported_by", userId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data || [];
  },

  listAllSafetyIncidents: async (resolved?: boolean) => {
    let query = supabase
      .from("safety_incidents")
      .select("*")
      .order("created_at", { ascending: false });

    if (resolved !== undefined) {
      query = query.eq("resolved", resolved);
    }

    const { data, error } = await query;
    if (error) return [];
    return data || [];
  },

  resolveSafetyIncident: async (incidentId: string, resolution: string) => {
    const { data, error } = await supabase
      .from("safety_incidents")
      .update({
        resolved: true,
        resolution,
        resolved_at: new Date().toISOString()
      })
      .eq("id", incidentId)
      .select()
      .single();

    if (error) throw new Error(`Failed to resolve safety incident: ${error.message}`);
    return data;
  },

  // ============================================
  // WALLET TRANSACTION METHODS
  // ============================================

  createWalletTransaction: async (transaction: {
    userId: string;
    type: string;
    amount: number;
    description?: string;
    referenceId?: string;
    referenceType?: string;
  }) => {
    // Get current wallet balance
    const { data: rider } = await supabase
      .from("riders")
      .select("wallet_balance")
      .eq("id", transaction.userId)
      .single();

    const currentBalance = rider?.wallet_balance || 0;
    const newBalance = transaction.type === "credit" 
      ? currentBalance + transaction.amount 
      : currentBalance - transaction.amount;

    // Create transaction record
    const { data, error } = await supabase
      .from("wallet_transactions")
      .insert({
        id: uuid(),
        user_id: transaction.userId,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        reference_id: transaction.referenceId,
        reference_type: transaction.referenceType,
        balance_after: newBalance,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create wallet transaction: ${error.message}`);

    // Update rider wallet balance
    await supabase
      .from("riders")
      .update({ wallet_balance: newBalance })
      .eq("id", transaction.userId);

    return data;
  },

  getWalletBalance: async (userId: string) => {
    const { data, error } = await supabase
      .from("riders")
      .select("wallet_balance")
      .eq("id", userId)
      .single();

    if (error) return 0;
    return data?.wallet_balance || 0;
  },

  listWalletTransactions: async (userId: string, limit: number = 50) => {
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return data || [];
  },

  // ============================================
  // SCHEDULED RIDES METHODS
  // ============================================

  createScheduledRide: async (ride: any) => {
    const { data, error } = await supabase
      .from("rides")
      .insert({
        ...ride,
        id: uuid(),
        status: "scheduled",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create scheduled ride: ${error.message}`);
    return data;
  },

  listScheduledRides: async (userId: string) => {
    const { data, error } = await supabase
      .from("rides")
      .select("*")
      .eq("rider_id", userId)
      .in("status", ["scheduled", "recurring"])
      .gte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true });

    if (error) return [];
    return data || [];
  },

  listAvailableCarpools: async (pickup: string, dropoff: string) => {
    const { data, error } = await supabase
      .from("rides")
      .select("*")
      .eq("is_carpool", true)
      .eq("status", "scheduled")
      .gte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true });

    if (error) return [];
    return data || [];
  },

  joinCarpool: async (rideId: string, passengerId: string) => {
    const { data: ride } = await supabase
      .from("rides")
      .select("carpool_passengers")
      .eq("id", rideId)
      .single();

    if (!ride) throw new Error("Ride not found");

    const passengers = ride.carpool_passengers || [];
    passengers.push(passengerId);

    const { data, error } = await supabase
      .from("rides")
      .update({ carpool_passengers: passengers })
      .eq("id", rideId)
      .select()
      .single();

    if (error) throw new Error(`Failed to join carpool: ${error.message}`);
    return data;
  }
};
