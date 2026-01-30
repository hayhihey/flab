-- Add new columns to existing riders table
ALTER TABLE riders
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_rides INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT CHECK (subscription_plan IN ('commuter', 'family', 'business', 'delivery_plus')),
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS carbon_offset DECIMAL(10,2) DEFAULT 0.00;

-- Add new columns to existing drivers table
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS total_rides INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS equity_shares INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS gamification_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_electric BOOLEAN DEFAULT FALSE;

-- Add new columns to existing rides table
ALTER TABLE rides
ADD COLUMN IF NOT EXISTS pickup_coords JSONB,
ADD COLUMN IF NOT EXISTS dropoff_coords JSONB,
ADD COLUMN IF NOT EXISTS ride_type TEXT DEFAULT 'standard' CHECK (ride_type IN ('standard', 'scheduled', 'recurring', 'carpool')),
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS recurring_pattern TEXT,
ADD COLUMN IF NOT EXISTS is_carpool BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS carpool_seats INTEGER,
ADD COLUMN IF NOT EXISTS carpool_passengers JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS review TEXT,
ADD COLUMN IF NOT EXISTS sos_triggered BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recording_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS carbon_saved DECIMAL(10,2);

-- Create loyalty_rewards table
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  cashback_percent DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_user_id ON loyalty_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_created_at ON loyalty_rewards(created_at DESC);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('commuter', 'family', 'business', 'delivery_plus')),
  rides_remaining INTEGER,
  deliveries_remaining INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL,
  referee_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('driver', 'rider')),
  reward DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Create corporate_accounts table
CREATE TABLE IF NOT EXISTS corporate_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  admin_user_id UUID NOT NULL,
  employees JSONB DEFAULT '[]',
  monthly_budget DECIMAL(12,2),
  cost_centers JSONB DEFAULT '[]',
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('weekly', 'monthly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corporate_accounts_admin_user_id ON corporate_accounts(admin_user_id);

-- Create parcels table
CREATE TABLE IF NOT EXISTS parcels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL,
  receiver_id UUID,
  receiver_name TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  pickup TEXT NOT NULL,
  dropoff TEXT NOT NULL,
  pickup_coords JSONB,
  dropoff_coords JSONB,
  driver_id UUID,
  size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  weight DECIMAL(10,2),
  value DECIMAL(10,2),
  insured BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed')),
  delivery_proof TEXT,
  fare DECIMAL(10,2) NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parcels_sender_id ON parcels(sender_id);
CREATE INDEX IF NOT EXISTS idx_parcels_driver_id ON parcels(driver_id);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON parcels(status);
CREATE INDEX IF NOT EXISTS idx_parcels_scheduled_for ON parcels(scheduled_for);

-- Create safety_incidents table
CREATE TABLE IF NOT EXISTS safety_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL,
  reported_by UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sos', 'route_deviation', 'speeding', 'accident', 'harassment')),
  description TEXT,
  location JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_incidents_ride_id ON safety_incidents(ride_id);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_reported_by ON safety_incidents(reported_by);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_type ON safety_incidents(type);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_resolved ON safety_incidents(resolved);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_created_at ON safety_incidents(created_at DESC);

-- Create driver_incentives table
CREATE TABLE IF NOT EXISTS driver_incentives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('challenge', 'bonus', 'streak')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  reward DECIMAL(10,2) NOT NULL,
  requirement INTEGER NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_incentives_driver_id ON driver_incentives(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_incentives_completed ON driver_incentives(completed);
CREATE INDEX IF NOT EXISTS idx_driver_incentives_expires_at ON driver_incentives(expires_at);

-- Create saved_places table
CREATE TABLE IF NOT EXISTS saved_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('home', 'work', 'favorite')),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  coords JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_saved_places_user_id ON saved_places(user_id);

-- Create wallet_transactions table for financial tracking
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'refund', 'withdrawal')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type TEXT CHECK (reference_type IN ('ride', 'parcel', 'referral', 'loyalty', 'subscription')),
  balance_after DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE loyalty_rewards IS 'Tracks loyalty points earned by users';
COMMENT ON TABLE subscriptions IS 'User subscription plans with ride/delivery limits';
COMMENT ON TABLE referrals IS 'Referral tracking and reward system';
COMMENT ON TABLE corporate_accounts IS 'Business accounts with employee management';
COMMENT ON TABLE parcels IS 'Package and cargo delivery requests';
COMMENT ON TABLE safety_incidents IS 'Safety incidents and SOS alerts';
COMMENT ON TABLE driver_incentives IS 'Gamification challenges and bonuses for drivers';
COMMENT ON TABLE saved_places IS 'User saved locations (home, work, favorites)';
COMMENT ON TABLE wallet_transactions IS 'Financial transaction history for user wallets';
