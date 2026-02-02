-- ============================================================================
-- COMPREHENSIVE AUDIT & TRACKING SYSTEM FOR RIDE-HAILING PLATFORM
-- Created: 2026-02-02
-- Purpose: Track every process, state change, and business event for 
--          analytics, dispute resolution, and regulatory compliance
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geospatial queries

-- ============================================================================
-- 1. RIDE LIFECYCLE AUDIT TABLE
-- Captures complete ride history with full context at each state
-- ============================================================================
CREATE TABLE IF NOT EXISTS ride_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'ride_created', 'ride_requested', 'driver_assigned', 'driver_accepted',
    'driver_arrived', 'ride_started', 'ride_completed', 'ride_cancelled',
    'payment_initiated', 'payment_completed', 'payment_failed',
    'rating_submitted', 'sos_triggered'
  )),
  
  -- WHO performed the action
  actor_id UUID, -- User/driver/system who triggered the event
  actor_type TEXT CHECK (actor_type IN ('rider', 'driver', 'system', 'admin')),
  
  -- WHAT changed
  previous_state JSONB, -- Previous ride state snapshot
  new_state JSONB, -- New ride state snapshot
  changes JSONB, -- Specific fields that changed
  
  -- WHERE (geolocation at time of event)
  location JSONB, -- {lat, lng, accuracy, address}
  
  -- WHY (context and metadata)
  reason TEXT, -- Human-readable reason
  metadata JSONB, -- Additional event-specific data
  
  -- WHEN
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Request/response tracking
  request_id TEXT, -- Trace ID for debugging
  user_agent TEXT, -- Device/browser info
  ip_address INET -- IP for fraud detection
);

CREATE INDEX idx_ride_audit_logs_ride_id ON ride_audit_logs(ride_id);
CREATE INDEX idx_ride_audit_logs_event_type ON ride_audit_logs(event_type);
CREATE INDEX idx_ride_audit_logs_actor_id ON ride_audit_logs(actor_id);
CREATE INDEX idx_ride_audit_logs_created_at ON ride_audit_logs(created_at DESC);

COMMENT ON TABLE ride_audit_logs IS 'Complete audit trail of every ride event for compliance and dispute resolution';

-- ============================================================================
-- 2. AVAILABLE DRIVERS SNAPSHOT
-- Captures which drivers were online/available when rider booked
-- ============================================================================
CREATE TABLE IF NOT EXISTS ride_driver_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL,
  snapshot_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Booking context
  pickup_location JSONB NOT NULL, -- {lat, lng, address}
  search_radius_km DECIMAL(10,2) NOT NULL,
  requested_vehicle_type TEXT,
  
  -- Available drivers at this moment
  available_drivers JSONB NOT NULL, -- Array of driver objects with full context
  total_available INTEGER NOT NULL,
  total_nearby INTEGER NOT NULL, -- Within search radius
  total_qualified INTEGER NOT NULL, -- Matching vehicle type
  
  -- Market conditions
  surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
  demand_level TEXT CHECK (demand_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Matching algorithm metadata
  matching_algorithm TEXT DEFAULT 'closest_first',
  matching_criteria JSONB, -- What criteria were used
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ride_driver_snapshots_ride_id ON ride_driver_snapshots(ride_id);
CREATE INDEX idx_ride_driver_snapshots_snapshot_time ON ride_driver_snapshots(snapshot_time DESC);

COMMENT ON TABLE ride_driver_snapshots IS 'Snapshot of available drivers at the moment of ride booking for transparency';

-- ============================================================================
-- 3. DRIVER MATCHING ATTEMPTS
-- Tracks which drivers were offered the ride and their responses
-- ============================================================================
CREATE TABLE IF NOT EXISTS ride_matching_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL,
  driver_id UUID NOT NULL,
  
  -- Matching details
  distance_to_pickup_km DECIMAL(10,2),
  eta_to_pickup_min INTEGER,
  match_score DECIMAL(5,2), -- Algorithm confidence score (0-100)
  match_rank INTEGER, -- 1st choice, 2nd choice, etc.
  
  -- Offer details
  offered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  offer_expires_at TIMESTAMP WITH TIME ZONE,
  offer_fare DECIMAL(10,2),
  
  -- Driver response
  response TEXT CHECK (response IN ('pending', 'accepted', 'declined', 'timeout', 'cancelled')),
  responded_at TIMESTAMP WITH TIME ZONE,
  response_time_seconds INTEGER,
  decline_reason TEXT,
  
  -- Context
  driver_location JSONB, -- Driver's location when offered
  driver_status TEXT, -- Driver's status at offer time
  driver_rating DECIMAL(3,2),
  driver_acceptance_rate DECIMAL(5,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ride_matching_attempts_ride_id ON ride_matching_attempts(ride_id);
CREATE INDEX idx_ride_matching_attempts_driver_id ON ride_matching_attempts(driver_id);
CREATE INDEX idx_ride_matching_attempts_response ON ride_matching_attempts(response);
CREATE INDEX idx_ride_matching_attempts_offered_at ON ride_matching_attempts(offered_at DESC);

COMMENT ON TABLE ride_matching_attempts IS 'Tracks driver matching algorithm decisions and responses';

-- ============================================================================
-- 4. RIDER DETAILS & CONTEXT (Enhanced)
-- Comprehensive rider profile with behavioral patterns
-- ============================================================================
CREATE TABLE IF NOT EXISTS rider_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Identity
  full_name TEXT,
  email TEXT,
  phone TEXT,
  profile_photo_url TEXT,
  
  -- Verification status
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  id_verified BOOLEAN DEFAULT FALSE,
  
  -- Behavioral metrics
  total_rides INTEGER DEFAULT 0,
  completed_rides INTEGER DEFAULT 0,
  cancelled_rides INTEGER DEFAULT 0,
  cancellation_rate DECIMAL(5,2) DEFAULT 0.00,
  
  average_rating DECIMAL(3,2),
  total_spent DECIMAL(12,2) DEFAULT 0.00,
  lifetime_value DECIMAL(12,2) DEFAULT 0.00,
  
  -- Preferences
  preferred_vehicle_types TEXT[], -- Array of preferred vehicle types
  preferred_payment_method TEXT,
  preferred_drivers UUID[], -- List of favorite drivers
  saved_locations JSONB, -- Home, work, etc.
  
  -- Risk & fraud indicators
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  fraud_flags JSONB DEFAULT '[]',
  is_blocked BOOLEAN DEFAULT FALSE,
  block_reason TEXT,
  
  -- Timestamps
  first_ride_at TIMESTAMP WITH TIME ZONE,
  last_ride_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rider_profiles_user_id ON rider_profiles(user_id);
CREATE INDEX idx_rider_profiles_email ON rider_profiles(email);
CREATE INDEX idx_rider_profiles_phone ON rider_profiles(phone);
CREATE INDEX idx_rider_profiles_risk_score ON rider_profiles(risk_score);

COMMENT ON TABLE rider_profiles IS 'Comprehensive rider profiles with behavioral analytics';

-- ============================================================================
-- 5. DRIVER DETAILS & CONTEXT (Enhanced)
-- ============================================================================
CREATE TABLE IF NOT EXISTS driver_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  driver_id UUID NOT NULL UNIQUE,
  
  -- Identity
  full_name TEXT,
  email TEXT,
  phone TEXT,
  profile_photo_url TEXT,
  license_number TEXT,
  license_expiry DATE,
  
  -- Vehicle details
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_plate TEXT,
  vehicle_color TEXT,
  vehicle_type TEXT,
  
  -- Verification
  background_check_status TEXT CHECK (background_check_status IN ('pending', 'approved', 'rejected', 'expired')),
  background_check_date DATE,
  insurance_verified BOOLEAN DEFAULT FALSE,
  insurance_expiry DATE,
  
  -- Performance metrics
  total_rides INTEGER DEFAULT 0,
  completed_rides INTEGER DEFAULT 0,
  cancelled_rides INTEGER DEFAULT 0,
  acceptance_rate DECIMAL(5,2) DEFAULT 0.00,
  cancellation_rate DECIMAL(5,2) DEFAULT 0.00,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  
  average_rating DECIMAL(3,2),
  total_earnings DECIMAL(12,2) DEFAULT 0.00,
  total_commission DECIMAL(12,2) DEFAULT 0.00,
  
  -- Availability patterns
  online_hours_week DECIMAL(5,2) DEFAULT 0.00,
  peak_hours_worked DECIMAL(5,2) DEFAULT 0.00,
  preferred_zones TEXT[],
  
  -- Current status
  is_online BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT FALSE,
  current_location JSONB,
  last_location_update TIMESTAMP WITH TIME ZONE,
  
  -- Risk & compliance
  violation_count INTEGER DEFAULT 0,
  last_violation_date DATE,
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  
  -- Timestamps
  onboarded_at TIMESTAMP WITH TIME ZONE,
  first_ride_at TIMESTAMP WITH TIME ZONE,
  last_ride_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_driver_profiles_user_id ON driver_profiles(user_id);
CREATE INDEX idx_driver_profiles_driver_id ON driver_profiles(driver_id);
CREATE INDEX idx_driver_profiles_email ON driver_profiles(email);
CREATE INDEX idx_driver_profiles_phone ON driver_profiles(phone);
CREATE INDEX idx_driver_profiles_is_online ON driver_profiles(is_online);
CREATE INDEX idx_driver_profiles_is_available ON driver_profiles(is_available);

COMMENT ON TABLE driver_profiles IS 'Comprehensive driver profiles with performance metrics';

-- ============================================================================
-- 6. RIDE DETAILS (Enhanced main table)
-- ============================================================================
ALTER TABLE rides ADD COLUMN IF NOT EXISTS 
  -- Enhanced location tracking
  pickup_address TEXT,
  dropoff_address TEXT,
  pickup_lat DECIMAL(10,8),
  pickup_lng DECIMAL(11,8),
  dropoff_lat DECIMAL(10,8),
  dropoff_lng DECIMAL(11,8),
  
  -- Journey tracking
  actual_pickup_time TIMESTAMP WITH TIME ZONE,
  actual_dropoff_time TIMESTAMP WITH TIME ZONE,
  route_polyline TEXT, -- Encoded polyline of actual route taken
  distance_actual_km DECIMAL(10,2),
  duration_actual_min INTEGER,
  
  -- Driver details at booking
  driver_name TEXT,
  driver_phone TEXT,
  driver_photo_url TEXT,
  vehicle_details JSONB, -- {make, model, plate, color}
  
  -- Rider details at booking
  rider_name TEXT,
  rider_phone TEXT,
  rider_photo_url TEXT,
  
  -- Pricing breakdown
  base_fare DECIMAL(10,2),
  distance_fare DECIMAL(10,2),
  time_fare DECIMAL(10,2),
  surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  tip_amount DECIMAL(10,2) DEFAULT 0.00,
  platform_fee DECIMAL(10,2),
  driver_payout DECIMAL(10,2),
  
  -- Payment details
  payment_method TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_transaction_id TEXT,
  payment_gateway TEXT,
  
  -- Ratings & feedback
  rider_rating INTEGER CHECK (rider_rating >= 1 AND rider_rating <= 5),
  rider_feedback TEXT,
  driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
  driver_feedback TEXT,
  
  -- Safety & compliance
  sos_triggered BOOLEAN DEFAULT FALSE,
  sos_triggered_at TIMESTAMP WITH TIME ZONE,
  recording_active BOOLEAN DEFAULT FALSE,
  route_deviation_detected BOOLEAN DEFAULT FALSE,
  
  -- Business logic
  cancellation_fee DECIMAL(10,2) DEFAULT 0.00,
  cancelled_by TEXT CHECK (cancelled_by IN ('rider', 'driver', 'system')),
  cancellation_reason TEXT,
  
  -- Metadata
  booking_source TEXT DEFAULT 'mobile_app', -- mobile_app, web, api, corporate
  device_type TEXT,
  app_version TEXT,
  
  -- Timestamps (enhanced)
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  arrived_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_rides_rider_id ON rides(rider_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_requested_at ON rides(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_rides_payment_status ON rides(payment_status);
CREATE INDEX IF NOT EXISTS idx_rides_sos_triggered ON rides(sos_triggered) WHERE sos_triggered = TRUE;

-- ============================================================================
-- 7. USER ACTIVITY LOGS
-- Track all user actions for security and analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_type TEXT CHECK (user_type IN ('rider', 'driver', 'admin')),
  
  action_type TEXT NOT NULL, -- 'login', 'logout', 'profile_update', 'location_update', etc.
  action_category TEXT, -- 'auth', 'ride', 'payment', 'profile', 'navigation'
  
  details JSONB, -- Action-specific details
  resource_id UUID, -- ID of affected resource (ride_id, etc.)
  resource_type TEXT, -- 'ride', 'payment', 'profile'
  
  -- Context
  location JSONB,
  device_info JSONB, -- {device_type, os, app_version, device_id}
  ip_address INET,
  user_agent TEXT,
  
  -- Result
  status TEXT CHECK (status IN ('success', 'failure', 'error')),
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_action_type ON user_activity_logs(action_type);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX idx_user_activity_logs_resource_id ON user_activity_logs(resource_id);

COMMENT ON TABLE user_activity_logs IS 'Comprehensive user activity tracking for security and analytics';

-- ============================================================================
-- 8. DRIVER LOCATION HISTORY
-- Real-time and historical driver location tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS driver_location_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL,
  ride_id UUID, -- NULL if driver is just cruising
  
  -- Location data
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  accuracy DECIMAL(10,2), -- GPS accuracy in meters
  heading DECIMAL(5,2), -- Direction of travel (0-360)
  speed DECIMAL(6,2), -- Speed in km/h
  
  -- Status at this point
  driver_status TEXT, -- 'available', 'on_ride', 'offline'
  is_moving BOOLEAN DEFAULT TRUE,
  
  -- Geohash for spatial indexing
  geohash TEXT,
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_driver_location_history_driver_id ON driver_location_history(driver_id);
CREATE INDEX idx_driver_location_history_ride_id ON driver_location_history(ride_id);
CREATE INDEX idx_driver_location_history_timestamp ON driver_location_history(timestamp DESC);
CREATE INDEX idx_driver_location_history_geohash ON driver_location_history(geohash);

COMMENT ON TABLE driver_location_history IS 'Real-time driver location tracking for route playback and analytics';

-- ============================================================================
-- 9. PAYMENT TRANSACTIONS (Enhanced)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL,
  
  -- Parties involved
  payer_id UUID NOT NULL,
  payer_type TEXT CHECK (payer_type IN ('rider', 'corporate')),
  payee_id UUID, -- Driver who receives payout
  
  -- Transaction details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  payment_gateway TEXT,
  transaction_ref TEXT UNIQUE, -- External gateway reference
  
  -- Splits (for transparency)
  driver_amount DECIMAL(10,2),
  platform_commission DECIMAL(10,2),
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  tip_amount DECIMAL(10,2) DEFAULT 0.00,
  
  -- Status tracking
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed')),
  failure_reason TEXT,
  refund_amount DECIMAL(10,2),
  refund_reason TEXT,
  
  -- Timestamps
  initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_transactions_ride_id ON payment_transactions(ride_id);
CREATE INDEX idx_payment_transactions_payer_id ON payment_transactions(payer_id);
CREATE INDEX idx_payment_transactions_payee_id ON payment_transactions(payee_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

COMMENT ON TABLE payment_transactions IS 'Complete payment transaction history with split tracking';

-- ============================================================================
-- 10. TRIGGERS FOR AUTOMATIC AUDIT LOGGING
-- ============================================================================

-- Function to log ride state changes
CREATE OR REPLACE FUNCTION log_ride_state_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ride_audit_logs (
    ride_id,
    event_type,
    actor_type,
    previous_state,
    new_state,
    changes
  ) VALUES (
    NEW.id,
    CASE 
      WHEN OLD.status IS NULL THEN 'ride_created'
      WHEN NEW.status = 'accepted' THEN 'driver_accepted'
      WHEN NEW.status = 'started' THEN 'ride_started'
      WHEN NEW.status = 'completed' THEN 'ride_completed'
      WHEN NEW.status = 'cancelled' THEN 'ride_cancelled'
      ELSE 'ride_updated'
    END,
    'system',
    row_to_json(OLD),
    row_to_json(NEW),
    jsonb_build_object(
      'status_changed', OLD.status IS DISTINCT FROM NEW.status,
      'old_status', OLD.status,
      'new_status', NEW.status
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to rides table
DROP TRIGGER IF EXISTS trigger_log_ride_changes ON rides;
CREATE TRIGGER trigger_log_ride_changes
  AFTER INSERT OR UPDATE ON rides
  FOR EACH ROW
  EXECUTE FUNCTION log_ride_state_change();

-- Function to update rider profile metrics
CREATE OR REPLACE FUNCTION update_rider_metrics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO rider_profiles (
    user_id,
    total_rides,
    completed_rides,
    cancelled_rides,
    last_ride_at,
    first_ride_at
  ) VALUES (
    NEW.rider_id,
    1,
    CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'cancelled' THEN 1 ELSE 0 END,
    NEW.created_at,
    NEW.created_at
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_rides = rider_profiles.total_rides + 1,
    completed_rides = rider_profiles.completed_rides + 
      CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    cancelled_rides = rider_profiles.cancelled_rides + 
      CASE WHEN NEW.status = 'cancelled' THEN 1 ELSE 0 END,
    last_ride_at = NEW.created_at,
    cancellation_rate = 
      ROUND((rider_profiles.cancelled_rides + CASE WHEN NEW.status = 'cancelled' THEN 1 ELSE 0 END)::numeric / 
      NULLIF(rider_profiles.total_rides + 1, 0) * 100, 2),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
DROP TRIGGER IF EXISTS trigger_update_rider_metrics ON rides;
CREATE TRIGGER trigger_update_rider_metrics
  AFTER INSERT OR UPDATE OF status ON rides
  FOR EACH ROW
  EXECUTE FUNCTION update_rider_metrics();

-- Function to update driver profile metrics
CREATE OR REPLACE FUNCTION update_driver_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.driver_id IS NOT NULL THEN
    INSERT INTO driver_profiles (
      user_id,
      driver_id,
      total_rides,
      completed_rides,
      cancelled_rides,
      last_ride_at,
      first_ride_at
    ) VALUES (
      NEW.driver_id,
      NEW.driver_id,
      1,
      CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
      CASE WHEN NEW.status = 'cancelled' AND NEW.cancelled_by = 'driver' THEN 1 ELSE 0 END,
      NEW.created_at,
      NEW.created_at
    )
    ON CONFLICT (driver_id) DO UPDATE SET
      total_rides = driver_profiles.total_rides + 1,
      completed_rides = driver_profiles.completed_rides + 
        CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
      cancelled_rides = driver_profiles.cancelled_rides + 
        CASE WHEN NEW.status = 'cancelled' AND NEW.cancelled_by = 'driver' THEN 1 ELSE 0 END,
      last_ride_at = NEW.created_at,
      cancellation_rate = 
        ROUND((driver_profiles.cancelled_rides + 
        CASE WHEN NEW.status = 'cancelled' AND NEW.cancelled_by = 'driver' THEN 1 ELSE 0 END)::numeric / 
        NULLIF(driver_profiles.total_rides + 1, 0) * 100, 2),
      completion_rate = 
        ROUND((driver_profiles.completed_rides + 
        CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END)::numeric / 
        NULLIF(driver_profiles.total_rides + 1, 0) * 100, 2),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
DROP TRIGGER IF EXISTS trigger_update_driver_metrics ON rides;
CREATE TRIGGER trigger_update_driver_metrics
  AFTER INSERT OR UPDATE OF status, driver_id ON rides
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_metrics();

-- ============================================================================
-- VIEWS FOR EASY QUERYING
-- ============================================================================

-- Complete ride details with all context
CREATE OR REPLACE VIEW v_ride_complete_details AS
SELECT 
  r.*,
  rp.full_name as rider_full_name,
  rp.email as rider_email,
  rp.phone as rider_phone_number,
  rp.average_rating as rider_avg_rating,
  rp.total_rides as rider_total_rides,
  
  dp.full_name as driver_full_name,
  dp.email as driver_email,
  dp.phone as driver_phone_number,
  dp.average_rating as driver_avg_rating,
  dp.total_rides as driver_total_rides,
  dp.vehicle_make,
  dp.vehicle_model,
  dp.vehicle_plate,
  
  rds.total_available as available_drivers_at_booking,
  rds.surge_multiplier as market_surge,
  rds.demand_level as market_demand,
  
  pt.status as payment_status_detailed,
  pt.transaction_ref as payment_reference,
  pt.driver_amount,
  pt.platform_commission,
  pt.tip_amount
FROM rides r
LEFT JOIN rider_profiles rp ON r.rider_id = rp.user_id
LEFT JOIN driver_profiles dp ON r.driver_id = dp.driver_id
LEFT JOIN ride_driver_snapshots rds ON r.id = rds.ride_id
LEFT JOIN payment_transactions pt ON r.id = pt.ride_id;

COMMENT ON VIEW v_ride_complete_details IS 'Single view with all ride, rider, driver, and market context';

-- Available drivers real-time view
CREATE OR REPLACE VIEW v_available_drivers_now AS
SELECT 
  dp.*,
  dlh.latitude,
  dlh.longitude,
  dlh.timestamp as last_location_update,
  EXTRACT(EPOCH FROM (NOW() - dlh.timestamp)) as seconds_since_update
FROM driver_profiles dp
JOIN LATERAL (
  SELECT * FROM driver_location_history
  WHERE driver_id = dp.driver_id
  ORDER BY timestamp DESC
  LIMIT 1
) dlh ON TRUE
WHERE dp.is_online = TRUE 
  AND dp.is_available = TRUE
  AND dp.is_suspended = FALSE;

COMMENT ON VIEW v_available_drivers_now IS 'Real-time available drivers with current locations';

-- ============================================================================
-- PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Partitioning for large tables (by month)
-- Note: Requires PostgreSQL 10+

-- Partition ride_audit_logs by month (example)
-- CREATE TABLE ride_audit_logs_2026_02 PARTITION OF ride_audit_logs
--   FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- ============================================================================
-- GRANT PERMISSIONS (adjust based on your auth setup)
-- ============================================================================

-- Grant read access to authenticated users (adjust as needed)
GRANT SELECT ON v_ride_complete_details TO authenticated;
GRANT SELECT ON v_available_drivers_now TO authenticated;

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Add admin notes
INSERT INTO ride_audit_logs (
  ride_id,
  event_type,
  actor_type,
  reason,
  metadata
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'ride_created',
  'system',
  'Comprehensive audit system initialized',
  jsonb_build_object(
    'version', '1.0.0',
    'created_at', NOW(),
    'features', ARRAY[
      'ride_lifecycle_tracking',
      'available_drivers_snapshot',
      'driver_matching_attempts',
      'enhanced_profiles',
      'activity_logging',
      'location_history',
      'payment_tracking',
      'automatic_triggers',
      'analytics_views'
    ]
  )
);

COMMENT ON DATABASE CURRENT_DATABASE() IS 'Ride-hailing platform with comprehensive audit and tracking';
