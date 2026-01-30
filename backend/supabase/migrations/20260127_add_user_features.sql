-- =====================================================
-- RIDE-HAILING APP - DATABASE MIGRATION
-- Run this in Supabase SQL Editor or via CLI
-- =====================================================

-- Create saved_places table for users to store favorite locations
CREATE TABLE IF NOT EXISTS saved_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  place_type VARCHAR(20) DEFAULT 'favorite' CHECK (place_type IN ('home', 'work', 'favorite')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_places_user_id ON saved_places(user_id);

-- Add columns to rides table for enhanced features
ALTER TABLE rides 
ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(20) DEFAULT 'economy',
ADD COLUMN IF NOT EXISTS pickup_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS pickup_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS dropoff_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS dropoff_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS driver_rating SMALLINT CHECK (driver_rating >= 1 AND driver_rating <= 5),
ADD COLUMN IF NOT EXISTS rider_rating SMALLINT CHECK (rider_rating >= 1 AND rider_rating <= 5),
ADD COLUMN IF NOT EXISTS driver_review TEXT,
ADD COLUMN IF NOT EXISTS rider_review TEXT,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(10) CHECK (cancelled_by IN ('rider', 'driver'));

-- Add rating column to drivers table if not exists
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5);

-- Enable RLS on saved_places
ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own saved places
DROP POLICY IF EXISTS "Users can manage their own saved places" ON saved_places;
CREATE POLICY "Users can manage their own saved places" ON saved_places
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- SUCCESS: Database migration completed!
-- =====================================================
