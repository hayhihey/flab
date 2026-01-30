# 🗄️ Database Setup & Documentation

## Overview
All features are now stored in **Supabase (PostgreSQL)** database. No more in-memory storage - everything persists!

## 🚀 Quick Setup

### 1. Run the Migration

You need to run the SQL migration file to create all required tables:

```bash
# Option 1: Using Supabase CLI
cd backend
npx supabase db push

# Option 2: Using Supabase Dashboard
# 1. Go to https://supabase.com/dashboard
# 2. Select your project
# 3. Go to SQL Editor
# 4. Copy contents from backend/supabase/migrations/20260129_add_new_features.sql
# 5. Click "Run"
```

### 2. Verify Tables Created

After running the migration, these tables should exist:

```sql
-- Core tables (already exist)
✅ riders
✅ drivers  
✅ rides
✅ driver_locations

-- New feature tables (created by migration)
✅ loyalty_rewards
✅ subscriptions
✅ referrals
✅ corporate_accounts
✅ parcels
✅ safety_incidents
✅ driver_incentives
✅ saved_places
✅ wallet_transactions
```

### 3. Environment Variables

Make sure your `.env` file has these set:

```env
# Backend .env file
SUPABASE_URL=https://jtrsyorpstqvkyvpoonk.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 📊 Database Schema

### 🧑‍💼 **riders** table (Extended)

**New columns added:**
```sql
email TEXT                          -- User email
loyalty_tier TEXT DEFAULT 'bronze'  -- bronze, silver, gold, platinum
loyalty_points INTEGER DEFAULT 0    -- Redeemable points
total_rides INTEGER DEFAULT 0       -- Lifetime completed rides
subscription_plan TEXT              -- Active subscription plan
subscription_expires_at TIMESTAMP   -- Subscription end date
wallet_balance DECIMAL(10,2)        -- Wallet cash balance
referral_code TEXT UNIQUE           -- Unique referral code
carbon_offset DECIMAL(10,2)         -- Carbon saved (kg CO2)
```

### 🚗 **drivers** table (Extended)

**New columns added:**
```sql
email TEXT                           -- Driver email
vehicle_type TEXT                    -- Vehicle category
rating DECIMAL(3,2)                  -- Average rating (1-5)
total_rides INTEGER DEFAULT 0        -- Completed deliveries
total_earnings DECIMAL(10,2)         -- Lifetime earnings
equity_shares INTEGER DEFAULT 0      -- Driver co-ownership shares
referral_code TEXT UNIQUE            -- Driver referral code
gamification_points INTEGER          -- Challenge points
badges JSONB DEFAULT '[]'            -- Achievement badges
is_electric BOOLEAN DEFAULT FALSE    -- Electric vehicle flag
```

### 🚕 **rides** table (Extended)

**New columns added:**
```sql
pickup_coords JSONB                  -- {lat, lng} of pickup
dropoff_coords JSONB                 -- {lat, lng} of dropoff
ride_type TEXT DEFAULT 'standard'    -- standard, scheduled, recurring, carpool
scheduled_for TIMESTAMP              -- Future ride time
recurring_pattern TEXT               -- daily, weekdays, etc.
is_carpool BOOLEAN DEFAULT FALSE     -- Carpool ride flag
carpool_seats INTEGER                -- Available seats (1-3)
carpool_passengers JSONB             -- Array of passenger IDs
rating INTEGER (1-5)                 -- Rider's rating of driver
review TEXT                          -- Rider's text review
sos_triggered BOOLEAN DEFAULT FALSE  -- Emergency alert triggered
recording_consent BOOLEAN            -- Audio/video consent
carbon_saved DECIMAL(10,2)           -- CO2 saved vs car (kg)
```

### 🏆 **loyalty_rewards** table (NEW)

Tracks all loyalty point transactions:

```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL               -- Reference to riders.id
points INTEGER NOT NULL             -- Points earned/spent
tier TEXT NOT NULL                  -- Tier at time of transaction
cashback_percent DECIMAL(5,2)       -- Cashback rate applied
created_at TIMESTAMP DEFAULT NOW()
```

**Indexes:**
- `idx_loyalty_rewards_user_id` - Fast user lookups
- `idx_loyalty_rewards_created_at` - Chronological sorting

**Sample query:**
```sql
-- Get user's last 10 point transactions
SELECT * FROM loyalty_rewards 
WHERE user_id = 'xxx' 
ORDER BY created_at DESC 
LIMIT 10;
```

### 💳 **subscriptions** table (NEW)

Monthly/annual subscription plans:

```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL               -- Reference to riders.id
plan TEXT NOT NULL                  -- commuter, family, business, delivery_plus
rides_remaining INTEGER             -- NULL = unlimited
deliveries_remaining INTEGER        -- Parcel deliveries left
starts_at TIMESTAMP NOT NULL        -- Subscription start
expires_at TIMESTAMP NOT NULL       -- Subscription end
auto_renew BOOLEAN DEFAULT TRUE     -- Auto-renewal flag
price DECIMAL(10,2) NOT NULL        -- Monthly price paid
created_at TIMESTAMP DEFAULT NOW()
```

**Indexes:**
- `idx_subscriptions_user_id` - User's subscriptions
- `idx_subscriptions_expires_at` - Active/expired subscriptions

**Sample queries:**
```sql
-- Get user's active subscription
SELECT * FROM subscriptions 
WHERE user_id = 'xxx' 
AND expires_at > NOW() 
ORDER BY created_at DESC 
LIMIT 1;

-- List all expiring subscriptions (next 7 days)
SELECT * FROM subscriptions 
WHERE expires_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'
AND auto_renew = TRUE;
```

### 🎁 **referrals** table (NEW)

Referral tracking and rewards:

```sql
id UUID PRIMARY KEY
referrer_id UUID NOT NULL           -- User who referred
referee_id UUID NOT NULL            -- New user who signed up
type TEXT NOT NULL                  -- driver, rider
reward DECIMAL(10,2) NOT NULL       -- Reward amount (₦)
status TEXT DEFAULT 'pending'       -- pending, completed
created_at TIMESTAMP DEFAULT NOW()
```

**Indexes:**
- `idx_referrals_referrer_id` - Referrer's list
- `idx_referrals_referee_id` - Referee lookup
- `idx_referrals_status` - Pending vs completed

**Sample queries:**
```sql
-- Get referral stats for a user
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  SUM(reward) FILTER (WHERE status = 'completed') as earned
FROM referrals 
WHERE referrer_id = 'xxx';
```

### 📦 **parcels** table (NEW)

Package/cargo delivery system:

```sql
id UUID PRIMARY KEY
sender_id UUID NOT NULL             -- Reference to riders.id
receiver_id UUID                    -- Optional receiver account
receiver_name TEXT NOT NULL         -- Receiver full name
receiver_phone TEXT NOT NULL        -- Receiver contact
pickup TEXT NOT NULL                -- Pickup address
dropoff TEXT NOT NULL               -- Delivery address
pickup_coords JSONB                 -- {lat, lng}
dropoff_coords JSONB                -- {lat, lng}
driver_id UUID                      -- Assigned driver
size TEXT NOT NULL                  -- small, medium, large
weight DECIMAL(10,2)                -- Weight in kg
value DECIMAL(10,2)                 -- Declared value (₦)
insured BOOLEAN DEFAULT FALSE       -- Insurance flag
status TEXT NOT NULL                -- pending, assigned, picked_up, in_transit, delivered, failed
delivery_proof TEXT                 -- Photo URL or signature
fare DECIMAL(10,2) NOT NULL         -- Delivery cost
scheduled_for TIMESTAMP             -- Future pickup time
created_at TIMESTAMP DEFAULT NOW()
```

**Indexes:**
- `idx_parcels_sender_id` - Sender's parcels
- `idx_parcels_driver_id` - Driver's deliveries
- `idx_parcels_status` - Available vs in-progress
- `idx_parcels_scheduled_for` - Upcoming pickups

**Sample queries:**
```sql
-- Get available parcels for drivers
SELECT * FROM parcels 
WHERE status = 'pending' 
AND scheduled_for <= NOW() 
ORDER BY created_at ASC;

-- Track parcel delivery
SELECT 
  p.*,
  r.name as sender_name,
  d.name as driver_name
FROM parcels p
LEFT JOIN riders r ON p.sender_id = r.id
LEFT JOIN drivers d ON p.driver_id = d.id
WHERE p.id = 'xxx';
```

### 🚨 **safety_incidents** table (NEW)

Safety reports and SOS alerts:

```sql
id UUID PRIMARY KEY
ride_id UUID NOT NULL               -- Reference to rides.id
reported_by UUID NOT NULL           -- User who reported
type TEXT NOT NULL                  -- sos, route_deviation, speeding, accident, harassment
description TEXT                    -- Incident details
location JSONB                      -- GPS coordinates
resolved BOOLEAN DEFAULT FALSE      -- Resolution status
resolution TEXT                     -- Admin resolution notes
resolved_at TIMESTAMP               -- When resolved
created_at TIMESTAMP DEFAULT NOW()
```

**Indexes:**
- `idx_safety_incidents_ride_id` - Ride's incidents
- `idx_safety_incidents_reported_by` - User's reports
- `idx_safety_incidents_type` - Filter by incident type
- `idx_safety_incidents_resolved` - Unresolved incidents
- `idx_safety_incidents_created_at` - Recent alerts

**Sample queries:**
```sql
-- Get all unresolved SOS alerts
SELECT * FROM safety_incidents 
WHERE type = 'sos' 
AND resolved = FALSE 
ORDER BY created_at DESC;

-- Get safety history for a ride
SELECT * FROM safety_incidents 
WHERE ride_id = 'xxx' 
ORDER BY created_at ASC;
```

### 💰 **wallet_transactions** table (NEW)

Financial transaction history:

```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL               -- Reference to riders.id
type TEXT NOT NULL                  -- credit, debit, refund, withdrawal
amount DECIMAL(10,2) NOT NULL       -- Transaction amount
description TEXT                    -- Transaction notes
reference_id UUID                   -- Related ride/parcel ID
reference_type TEXT                 -- ride, parcel, referral, loyalty, subscription
balance_after DECIMAL(10,2)         -- Balance after transaction
created_at TIMESTAMP DEFAULT NOW()
```

**Indexes:**
- `idx_wallet_transactions_user_id` - User's transactions
- `idx_wallet_transactions_created_at` - Transaction history

**Sample queries:**
```sql
-- Get user's wallet balance
SELECT wallet_balance FROM riders WHERE id = 'xxx';

-- Get transaction history (last 30 days)
SELECT * FROM wallet_transactions 
WHERE user_id = 'xxx' 
AND created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- Monthly spend summary
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(amount) FILTER (WHERE type = 'debit') as spent,
  SUM(amount) FILTER (WHERE type = 'credit') as earned
FROM wallet_transactions 
WHERE user_id = 'xxx'
GROUP BY month 
ORDER BY month DESC;
```

### 🏠 **saved_places** table (NEW)

User's favorite locations:

```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL               -- Reference to riders.id
type TEXT NOT NULL                  -- home, work, favorite
name TEXT NOT NULL                  -- Place nickname
address TEXT NOT NULL               -- Full address
coords JSONB NOT NULL               -- {lat, lng}
created_at TIMESTAMP DEFAULT NOW()

CONSTRAINT UNIQUE(user_id, type)    -- One home, one work per user
```

**Indexes:**
- `idx_saved_places_user_id` - User's places

**Sample query:**
```sql
-- Get user's saved places
SELECT * FROM saved_places 
WHERE user_id = 'xxx' 
ORDER BY type ASC;
```

### 🏢 **corporate_accounts** table (NEW)

Business/enterprise accounts:

```sql
id UUID PRIMARY KEY
company_name TEXT NOT NULL          -- Company legal name
admin_user_id UUID NOT NULL         -- Account admin
employees JSONB DEFAULT '[]'        -- Array of employee IDs
monthly_budget DECIMAL(12,2)        -- Spending limit
cost_centers JSONB DEFAULT '[]'     -- Departments/teams
billing_cycle TEXT NOT NULL         -- weekly, monthly
created_at TIMESTAMP DEFAULT NOW()
```

**Index:**
- `idx_corporate_accounts_admin_user_id` - Admin's accounts

### 🎮 **driver_incentives** table (NEW)

Gamification challenges and bonuses:

```sql
id UUID PRIMARY KEY
driver_id UUID NOT NULL             -- Reference to drivers.id
type TEXT NOT NULL                  -- challenge, bonus, streak
name TEXT NOT NULL                  -- Challenge name
description TEXT NOT NULL           -- Requirements
reward DECIMAL(10,2) NOT NULL       -- Reward amount (₦)
requirement INTEGER NOT NULL        -- Target (e.g., 100 rides)
progress INTEGER DEFAULT 0          -- Current progress
completed BOOLEAN DEFAULT FALSE     -- Completion status
expires_at TIMESTAMP                -- Challenge deadline
created_at TIMESTAMP DEFAULT NOW()
```

**Indexes:**
- `idx_driver_incentives_driver_id` - Driver's challenges
- `idx_driver_incentives_completed` - Active vs completed
- `idx_driver_incentives_expires_at` - Expiring soon

## 🔄 Database Functions (db.ts)

All routes now use these Supabase functions:

### Loyalty Functions
```typescript
db.getLoyaltyStatus(userId)                    // Get tier, points, total rides
db.updateLoyaltyTier(userId, tier, points)     // Update user's tier
db.createLoyaltyReward({userId, points, ...})  // Record point transaction
db.getLoyaltyHistory(userId, limit)            // Get transaction history
db.getLoyaltyLeaderboard(limit)                // Top users by points
```

### Subscription Functions
```typescript
db.createSubscription({userId, plan, ...})     // New subscription
db.getActiveSubscription(userId)               // Current active plan
db.updateSubscriptionUsage(subscriptionId, type) // Deduct ride/delivery
db.cancelSubscription(subscriptionId)          // Disable auto-renewal
```

### Referral Functions
```typescript
db.createReferral({referrerId, refereeId, ...}) // Track referral
db.completeReferral(referralId)                 // Mark as completed, award reward
db.getReferralStats(userId)                     // Total, completed, earned
db.getReferralByRefereeId(refereeId)           // Check if user was referred
```

### Parcel Functions
```typescript
db.createParcel({senderId, receiverName, ...})  // New delivery
db.getParcel(parcelId)                          // Parcel details
db.listAvailableParcels()                       // Pending deliveries
db.assignParcelToDriver(parcelId, driverId)    // Driver accepts
db.updateParcelStatus(parcelId, status, proof)  // Update delivery status
db.listUserParcels(userId)                      // User's sent parcels
db.listDriverParcels(driverId)                  // Driver's deliveries
```

### Safety Functions
```typescript
db.createSafetyIncident({rideId, reportedBy, ...}) // Report incident
db.getSafetyIncident(incidentId)                   // Incident details
db.listSafetyIncidentsByRide(rideId)              // Ride's incidents
db.listUserSafetyIncidents(userId)                 // User's reports
db.listAllSafetyIncidents(resolved?)               // Admin view
db.resolveSafetyIncident(incidentId, resolution)   // Admin resolution
```

### Wallet Functions
```typescript
db.createWalletTransaction({userId, type, amount, ...}) // Record transaction
db.getWalletBalance(userId)                             // Current balance
db.listWalletTransactions(userId, limit)                // Transaction history
```

### Scheduled Rides Functions
```typescript
db.createScheduledRide(ride)                           // Future ride
db.listScheduledRides(userId)                          // User's scheduled rides
db.listAvailableCarpools(pickup, dropoff)              // Find carpools
db.joinCarpool(rideId, passengerId)                    // Join existing carpool
```

## 🧪 Testing Queries

### Test loyalty system:
```sql
-- Award points after ride
INSERT INTO loyalty_rewards (id, user_id, points, tier, cashback_percent)
VALUES (gen_random_uuid(), 'user-123', 150, 'silver', 5.00);

-- Update user tier
UPDATE riders 
SET loyalty_tier = 'silver', loyalty_points = loyalty_points + 150
WHERE id = 'user-123';
```

### Test subscriptions:
```sql
-- Create active subscription
INSERT INTO subscriptions (
  id, user_id, plan, rides_remaining, deliveries_remaining, 
  starts_at, expires_at, price
) VALUES (
  gen_random_uuid(), 
  'user-123', 
  'commuter', 
  60, 
  0, 
  NOW(), 
  NOW() + INTERVAL '30 days', 
  15000.00
);
```

### Test parcels:
```sql
-- Create delivery request
INSERT INTO parcels (
  id, sender_id, receiver_name, receiver_phone,
  pickup, dropoff, size, fare, status
) VALUES (
  gen_random_uuid(),
  'user-123',
  'John Doe',
  '+2348012345678',
  '123 Main St',
  '456 Oak Ave',
  'medium',
  2500.00,
  'pending'
);
```

## 📋 Maintenance Tasks

### Daily
- Check for expiring subscriptions
- Process pending referral rewards
- Clean up old scheduled rides (past date)

### Weekly
- Recalculate loyalty tiers (total_rides threshold)
- Archive completed safety incidents
- Generate driver incentive reports

### Monthly
- Renew active subscriptions
- Calculate driver equity shares
- Carbon offset reporting

## 🔒 Security Notes

1. **Row Level Security (RLS)** is enabled on `saved_places` table
2. All sensitive operations use `SUPABASE_SERVICE_ROLE_KEY`
3. User authentication verified before database operations
4. Referral codes are unique (enforced by database constraint)
5. Wallet balances calculated atomically in transactions

## 🚨 Troubleshooting

### Migration fails?
```bash
# Check which tables already exist
psql $DATABASE_URL -c "\dt"

# Drop a table if needed (CAUTION!)
DROP TABLE IF EXISTS loyalty_rewards CASCADE;

# Re-run migration
```

### Missing data?
```sql
-- Check if user exists in riders table
SELECT * FROM riders WHERE email = 'user@example.com';

-- Check if migration ran
SELECT COUNT(*) FROM loyalty_rewards;  -- Should work if table exists
```

### API returns "table does not exist"?
- Run the migration file first!
- Check Supabase project URL and keys in `.env`
- Verify network connection to Supabase

## 📞 Need Help?

Check these files for reference:
- [Backend README](./backend/README.md) - API documentation
- [Frontend README](./frontend/README.md) - UI documentation
- [Migration File](./backend/supabase/migrations/20260129_add_new_features.sql) - Full schema
- [DB Service](./backend/src/services/db.ts) - All database functions

---

**✅ All features are now persisted in Supabase!** No more data loss on server restart.
