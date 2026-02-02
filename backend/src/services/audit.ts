/**
 * COMPREHENSIVE AUDIT LOGGING SERVICE
 * Handles all audit trail, tracking, and analytics logging
 * Production-grade implementation for Uber/Bolt-level tracking
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://jtrsyorpstqvkyvpoonk.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cnN5b3Jwc3Rxdmt5dnBvb25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczODg1NjYsImV4cCI6MjA2Mjk2NDU2Nn0.aOvJ4sQ7b7i5ONCDdq5E7VPUSaX43EDcAJ1CW8cJyWA";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);
const supabase = supabaseAdmin;

export interface AuditLogEntry {
  ride_id: string;
  event_type: string;
  actor_id?: string;
  actor_type?: 'rider' | 'driver' | 'system' | 'admin';
  previous_state?: any;
  new_state?: any;
  changes?: any;
  location?: { lat: number; lng: number; accuracy?: number; address?: string };
  reason?: string;
  metadata?: any;
  request_id?: string;
  user_agent?: string;
  ip_address?: string;
}

export interface DriverSnapshot {
  ride_id: string;
  pickup_location: { lat: number; lng: number; address: string };
  search_radius_km: number;
  requested_vehicle_type?: string;
  available_drivers: any[];
  total_available: number;
  total_nearby: number;
  total_qualified: number;
  surge_multiplier?: number;
  demand_level?: 'low' | 'medium' | 'high' | 'critical';
  matching_algorithm?: string;
  matching_criteria?: any;
}

export interface MatchingAttempt {
  ride_id: string;
  driver_id: string;
  distance_to_pickup_km?: number;
  eta_to_pickup_min?: number;
  match_score?: number;
  match_rank?: number;
  offer_expires_at?: Date;
  offer_fare?: number;
  response?: 'pending' | 'accepted' | 'declined' | 'timeout' | 'cancelled';
  responded_at?: Date;
  response_time_seconds?: number;
  decline_reason?: string;
  driver_location?: { lat: number; lng: number };
  driver_status?: string;
  driver_rating?: number;
  driver_acceptance_rate?: number;
}

export interface UserActivityLog {
  user_id: string;
  user_type: 'rider' | 'driver' | 'admin';
  action_type: string;
  action_category?: string;
  details?: any;
  resource_id?: string;
  resource_type?: string;
  location?: { lat: number; lng: number };
  device_info?: any;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'failure' | 'error';
  error_message?: string;
}

export interface LocationHistoryEntry {
  driver_id: string;
  ride_id?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  driver_status?: string;
  is_moving?: boolean;
  geohash?: string;
}

export const auditService = {
  /**
   * Log a ride state change to audit trail
   */
  logRideEvent: async (entry: AuditLogEntry): Promise<void> => {
    try {
      const { error } = await supabase
        .from('ride_audit_logs')
        .insert({
          ride_id: entry.ride_id,
          event_type: entry.event_type,
          actor_id: entry.actor_id,
          actor_type: entry.actor_type || 'system',
          previous_state: entry.previous_state,
          new_state: entry.new_state,
          changes: entry.changes,
          location: entry.location,
          reason: entry.reason,
          metadata: entry.metadata,
          request_id: entry.request_id,
          user_agent: entry.user_agent,
          ip_address: entry.ip_address,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Failed to log ride event:', error);
      } else {
        console.log(`✅ Logged ride event: ${entry.event_type} for ride ${entry.ride_id}`);
      }
    } catch (error) {
      console.error('❌ Error logging ride event:', error);
    }
  },

  /**
   * Capture snapshot of available drivers at booking time
   */
  captureDriverSnapshot: async (snapshot: DriverSnapshot): Promise<void> => {
    try {
      const { error } = await supabase
        .from('ride_driver_snapshots')
        .insert({
          ride_id: snapshot.ride_id,
          snapshot_time: new Date().toISOString(),
          pickup_location: snapshot.pickup_location,
          search_radius_km: snapshot.search_radius_km,
          requested_vehicle_type: snapshot.requested_vehicle_type,
          available_drivers: snapshot.available_drivers,
          total_available: snapshot.total_available,
          total_nearby: snapshot.total_nearby,
          total_qualified: snapshot.total_qualified,
          surge_multiplier: snapshot.surge_multiplier || 1.0,
          demand_level: snapshot.demand_level || 'medium',
          matching_algorithm: snapshot.matching_algorithm || 'closest_first',
          matching_criteria: snapshot.matching_criteria,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Failed to capture driver snapshot:', error);
      } else {
        console.log(`✅ Captured driver snapshot for ride ${snapshot.ride_id}: ${snapshot.total_available} drivers available`);
      }
    } catch (error) {
      console.error('❌ Error capturing driver snapshot:', error);
    }
  },

  /**
   * Log a driver matching attempt
   */
  logMatchingAttempt: async (attempt: MatchingAttempt): Promise<void> => {
    try {
      const { error } = await supabase
        .from('ride_matching_attempts')
        .insert({
          ride_id: attempt.ride_id,
          driver_id: attempt.driver_id,
          distance_to_pickup_km: attempt.distance_to_pickup_km,
          eta_to_pickup_min: attempt.eta_to_pickup_min,
          match_score: attempt.match_score,
          match_rank: attempt.match_rank,
          offered_at: new Date().toISOString(),
          offer_expires_at: attempt.offer_expires_at?.toISOString(),
          offer_fare: attempt.offer_fare,
          response: attempt.response || 'pending',
          responded_at: attempt.responded_at?.toISOString(),
          response_time_seconds: attempt.response_time_seconds,
          decline_reason: attempt.decline_reason,
          driver_location: attempt.driver_location,
          driver_status: attempt.driver_status,
          driver_rating: attempt.driver_rating,
          driver_acceptance_rate: attempt.driver_acceptance_rate,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Failed to log matching attempt:', error);
      } else {
        console.log(`✅ Logged matching attempt: ride ${attempt.ride_id} → driver ${attempt.driver_id}`);
      }
    } catch (error) {
      console.error('❌ Error logging matching attempt:', error);
    }
  },

  /**
   * Update matching attempt response
   */
  updateMatchingResponse: async (
    rideId: string,
    driverId: string,
    response: 'accepted' | 'declined' | 'timeout',
    declineReason?: string
  ): Promise<void> => {
    try {
      const now = new Date();
      const { data: attempt } = await supabase
        .from('ride_matching_attempts')
        .select('offered_at')
        .eq('ride_id', rideId)
        .eq('driver_id', driverId)
        .single();

      let responseTimeSeconds: number | undefined;
      if (attempt?.offered_at) {
        const offeredAt = new Date(attempt.offered_at);
        responseTimeSeconds = Math.floor((now.getTime() - offeredAt.getTime()) / 1000);
      }

      const { error } = await supabase
        .from('ride_matching_attempts')
        .update({
          response,
          responded_at: now.toISOString(),
          response_time_seconds: responseTimeSeconds,
          decline_reason: declineReason
        })
        .eq('ride_id', rideId)
        .eq('driver_id', driverId);

      if (error) {
        console.error('❌ Failed to update matching response:', error);
      } else {
        console.log(`✅ Updated matching response: ${response} (${responseTimeSeconds}s)`);
      }
    } catch (error) {
      console.error('❌ Error updating matching response:', error);
    }
  },

  /**
   * Log user activity
   */
  logUserActivity: async (activity: UserActivityLog): Promise<void> => {
    try {
      const { error } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: activity.user_id,
          user_type: activity.user_type,
          action_type: activity.action_type,
          action_category: activity.action_category,
          details: activity.details,
          resource_id: activity.resource_id,
          resource_type: activity.resource_type,
          location: activity.location,
          device_info: activity.device_info,
          ip_address: activity.ip_address,
          user_agent: activity.user_agent,
          status: activity.status,
          error_message: activity.error_message,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Failed to log user activity:', error);
      }
    } catch (error) {
      console.error('❌ Error logging user activity:', error);
    }
  },

  /**
   * Track driver location history
   */
  trackDriverLocation: async (entry: LocationHistoryEntry): Promise<void> => {
    try {
      const { error } = await supabase
        .from('driver_location_history')
        .insert({
          driver_id: entry.driver_id,
          ride_id: entry.ride_id,
          latitude: entry.latitude,
          longitude: entry.longitude,
          accuracy: entry.accuracy,
          heading: entry.heading,
          speed: entry.speed,
          driver_status: entry.driver_status,
          is_moving: entry.is_moving,
          geohash: entry.geohash,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Failed to track driver location:', error);
      }
    } catch (error) {
      console.error('❌ Error tracking driver location:', error);
    }
  },

  /**
   * Get complete ride details with all audit context
   */
  getRideCompleteDetails: async (rideId: string): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('v_ride_complete_details')
        .select('*')
        .eq('id', rideId)
        .single();

      if (error) {
        console.error('❌ Failed to get ride details:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Error getting ride details:', error);
      return null;
    }
  },

  /**
   * Get audit trail for a specific ride
   */
  getRideAuditTrail: async (rideId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('ride_audit_logs')
        .select('*')
        .eq('ride_id', rideId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Failed to get audit trail:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting audit trail:', error);
      return [];
    }
  },

  /**
   * Get driver snapshot for a ride
   */
  getDriverSnapshot: async (rideId: string): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('ride_driver_snapshots')
        .select('*')
        .eq('ride_id', rideId)
        .single();

      if (error) {
        console.error('❌ Failed to get driver snapshot:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Error getting driver snapshot:', error);
      return null;
    }
  },

  /**
   * Get all matching attempts for a ride
   */
  getMatchingAttempts: async (rideId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('ride_matching_attempts')
        .select('*')
        .eq('ride_id', rideId)
        .order('match_rank', { ascending: true });

      if (error) {
        console.error('❌ Failed to get matching attempts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting matching attempts:', error);
      return [];
    }
  },

  /**
   * Get available drivers in real-time
   */
  getAvailableDrivers: async (
    location?: { lat: number; lng: number },
    radiusKm?: number,
    vehicleType?: string
  ): Promise<any[]> => {
    try {
      let query = supabase
        .from('v_available_drivers_now')
        .select('*');

      if (vehicleType) {
        query = query.eq('vehicle_type', vehicleType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Failed to get available drivers:', error);
        return [];
      }

      // If location and radius provided, filter by distance (simple implementation)
      if (location && radiusKm && data) {
        return data.filter((driver: any) => {
          if (!driver.latitude || !driver.longitude) return false;
          
          const distance = calculateDistance(
            location.lat,
            location.lng,
            driver.latitude,
            driver.longitude
          );
          
          return distance <= radiusKm;
        });
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting available drivers:', error);
      return [];
    }
  },

  /**
   * Get user activity history
   */
  getUserActivity: async (
    userId: string,
    limit: number = 50,
    actionType?: string
  ): Promise<any[]> => {
    try {
      let query = supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (actionType) {
        query = query.eq('action_type', actionType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Failed to get user activity:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting user activity:', error);
      return [];
    }
  },

  /**
   * Get driver location history for a ride
   */
  getDriverLocationHistory: async (
    driverId: string,
    rideId?: string
  ): Promise<any[]> => {
    try {
      let query = supabase
        .from('driver_location_history')
        .select('*')
        .eq('driver_id', driverId)
        .order('timestamp', { ascending: true });

      if (rideId) {
        query = query.eq('ride_id', rideId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Failed to get location history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting location history:', error);
      return [];
    }
  }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Export utility function for generating geohash (simplified)
export function generateGeohash(lat: number, lon: number, precision: number = 6): string {
  // Simplified geohash implementation
  // In production, use a proper geohash library like 'ngeohash'
  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let hash = '';
  let bits = 0;
  let bitsTotal = 0;
  let latRange = [-90, 90];
  let lonRange = [-180, 180];
  let isEven = true;

  while (hash.length < precision) {
    if (isEven) {
      const mid = (lonRange[0] + lonRange[1]) / 2;
      if (lon > mid) {
        bits |= (1 << (4 - bitsTotal));
        lonRange[0] = mid;
      } else {
        lonRange[1] = mid;
      }
    } else {
      const mid = (latRange[0] + latRange[1]) / 2;
      if (lat > mid) {
        bits |= (1 << (4 - bitsTotal));
        latRange[0] = mid;
      } else {
        latRange[1] = mid;
      }
    }

    isEven = !isEven;
    bitsTotal++;

    if (bitsTotal === 5) {
      hash += base32[bits];
      bits = 0;
      bitsTotal = 0;
    }
  }

  return hash;
}

export default auditService;
