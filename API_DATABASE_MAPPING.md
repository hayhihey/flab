# 🔍 API → Database Mapping

Quick reference showing which API endpoints write to which database tables.

## 📊 Data Flow Overview

```
Frontend → API Endpoint → Backend Route → DB Service Function → Supabase Table
```

## 🏆 Loyalty & Rewards System

| API Endpoint | Method | Database Operations | Tables |
|--------------|--------|---------------------|---------|
| `/api/loyalty/status/:userId` | GET | Read user's tier, points, total rides | `riders` |
| `/api/loyalty/award` | POST | - Award points<br>- Update tier<br>- Create reward record | `riders`<br>`loyalty_rewards` |
| `/api/loyalty/redeem` | POST | - Deduct points<br>- Create wallet transaction<br>- Update balance | `riders`<br>`wallet_transactions` |
| `/api/loyalty/history/:userId` | GET | Read reward transaction history | `loyalty_rewards` |
| `/api/loyalty/leaderboard` | GET | Read top users by points | `riders` |

**Database writes:**
```typescript
// Award points after ride
UPDATE riders SET loyalty_points = loyalty_points + 150 WHERE id = 'xxx';
INSERT INTO loyalty_rewards (user_id, points, tier, ...) VALUES (...);

// Redeem points
UPDATE riders SET loyalty_points = loyalty_points - 100 WHERE id = 'xxx';
INSERT INTO wallet_transactions (user_id, type='credit', amount=100, ...) VALUES (...);
UPDATE riders SET wallet_balance = wallet_balance + 100 WHERE id = 'xxx';
```

---

## 💳 Subscriptions

| API Endpoint | Method | Database Operations | Tables |
|--------------|--------|---------------------|---------|
| `/api/subscriptions/plans` | GET | Return hardcoded plans (no DB) | - |
| `/api/subscriptions/subscribe` | POST | Create new subscription record | `subscriptions` |
| `/api/subscriptions/user/:userId` | GET | Read active subscription | `subscriptions` |
| `/api/subscriptions/use/:subscriptionId` | POST | Decrement rides/deliveries remaining | `subscriptions` |
| `/api/subscriptions/:subscriptionId` | DELETE | Set `auto_renew = false` | `subscriptions` |

**Database writes:**
```typescript
// Subscribe to plan
INSERT INTO subscriptions (
  user_id, plan, rides_remaining, expires_at, price, auto_renew
) VALUES ('xxx', 'commuter', 60, NOW() + INTERVAL '30 days', 15000, TRUE);

// Use subscription ride
UPDATE subscriptions 
SET rides_remaining = rides_remaining - 1 
WHERE id = 'xxx';

// Cancel subscription
UPDATE subscriptions 
SET auto_renew = FALSE 
WHERE id = 'xxx';
```

---

## 📦 Parcel Delivery

| API Endpoint | Method | Database Operations | Tables |
|--------------|--------|---------------------|---------|
| `/api/parcels` | POST | Create parcel delivery request | `parcels` |
| `/api/parcels/:parcelId` | GET | Read parcel details | `parcels` |
| `/api/parcels/user/:userId` | GET | List user's sent parcels | `parcels` |
| `/api/parcels/available/list` | GET | List pending deliveries (drivers) | `parcels` |
| `/api/parcels/:parcelId/accept` | PATCH | Assign driver, change status | `parcels` |
| `/api/parcels/:parcelId/status` | PATCH | Update delivery status | `parcels` |
| `/api/parcels/track/:parcelId` | GET | Public tracking (read-only) | `parcels` |
| `/api/parcels/stats/:userId` | GET | Calculate user's parcel stats | `parcels` |

**Database writes:**
```typescript
// Create delivery
INSERT INTO parcels (
  sender_id, receiver_name, receiver_phone, pickup, dropoff,
  size, fare, status='pending'
) VALUES (...);

// Driver accepts
UPDATE parcels 
SET driver_id = 'driver-123', status = 'assigned' 
WHERE id = 'xxx';

// Update status
UPDATE parcels 
SET status = 'delivered', delivery_proof = 'photo_url' 
WHERE id = 'xxx';
```

---

## 🚨 Safety & SOS

| API Endpoint | Method | Database Operations | Tables |
|--------------|--------|---------------------|---------|
| `/api/safety/sos` | POST | - Create SOS incident<br>- Update ride (sos_triggered) | `safety_incidents`<br>`rides` |
| `/api/safety/report` | POST | Create safety incident report | `safety_incidents` |
| `/api/safety/ride/:rideId` | GET | List incidents for a ride | `safety_incidents` |
| `/api/safety/user/:userId` | GET | List user's reported incidents | `safety_incidents` |
| `/api/safety/admin/all` | GET | List all incidents (admin) | `safety_incidents` |
| `/api/safety/admin/:incidentId/resolve` | PATCH | Mark incident as resolved | `safety_incidents` |
| `/api/safety/share-ride` | POST | Generate shareable link (no DB) | - |
| `/api/safety/check-route` | POST | Check route deviation (no DB) | - |
| `/api/safety/check-speed` | POST | Check driver speed (no DB) | - |

**Database writes:**
```typescript
// Trigger SOS
INSERT INTO safety_incidents (
  ride_id, reported_by, type='sos', description, location
) VALUES (...);
UPDATE rides SET sos_triggered = TRUE WHERE id = 'xxx';

// Resolve incident (admin)
UPDATE safety_incidents 
SET resolved = TRUE, resolution = 'Police contacted, situation handled', resolved_at = NOW()
WHERE id = 'xxx';
```

---

## 🎁 Referral System

| API Endpoint | Method | Database Operations | Tables |
|--------------|--------|---------------------|---------|
| `/api/referrals/code/:userId` | GET | Read or generate referral code | `riders` or `drivers` |
| `/api/referrals/apply` | POST | - Create referral record<br>- Award welcome bonus | `referrals`<br>`wallet_transactions` |
| `/api/referrals/check-completion` | POST | - Complete referral<br>- Award referrer reward | `referrals`<br>`wallet_transactions` |
| `/api/referrals/stats/:userId` | GET | Calculate referral statistics | `referrals` |
| `/api/referrals/leaderboard` | GET | Top referrers by rewards earned | `referrals` |

**Database writes:**
```typescript
// Apply referral code (signup)
INSERT INTO referrals (
  referrer_id, referee_id, type='rider', reward=500, status='pending'
) VALUES (...);

// Award welcome bonus to referee
INSERT INTO wallet_transactions (
  user_id='referee-id', type='credit', amount=200, 
  description='Referral welcome bonus', reference_type='referral'
) VALUES (...);

// Complete referral (after required trips)
UPDATE referrals SET status = 'completed' WHERE id = 'xxx';
INSERT INTO wallet_transactions (
  user_id='referrer-id', type='credit', amount=500,
  description='Referral reward: 5 trips completed', reference_type='referral'
) VALUES (...);
```

---

## 🗓️ Scheduled Rides

| API Endpoint | Method | Database Operations | Tables |
|--------------|--------|---------------------|---------|
| `/api/scheduled` | POST | Create scheduled/recurring ride | `rides` |
| `/api/scheduled/user/:userId` | GET | List upcoming scheduled rides | `rides` |
| `/api/scheduled/:rideId` | DELETE | Cancel scheduled ride | `rides` |
| `/api/scheduled/carpool` | POST | Create carpool ride request | `rides` |
| `/api/scheduled/carpool/available` | GET | Find available carpools | `rides` |
| `/api/scheduled/carpool/:rideId/join` | POST | Add passenger to carpool | `rides` |

**Database writes:**
```typescript
// Schedule ride
INSERT INTO rides (
  rider_id, pickup, dropoff, ride_type='scheduled', 
  scheduled_for='2026-02-01 08:00', status='scheduled'
) VALUES (...);

// Create carpool
INSERT INTO rides (
  rider_id, pickup, dropoff, is_carpool=TRUE, carpool_seats=2,
  scheduled_for='2026-02-01 08:00', fare=fare*0.5
) VALUES (...);

// Join carpool
UPDATE rides 
SET carpool_passengers = carpool_passengers || '["passenger-id"]'::jsonb
WHERE id = 'xxx';
```

---

## 💰 Wallet Transactions

| API Endpoint | Method | Database Operations | Tables |
|--------------|--------|---------------------|---------|
| `/api/rides/complete` | POST | - Complete ride<br>- Debit wallet<br>- Award loyalty points | `rides`<br>`wallet_transactions`<br>`loyalty_rewards` |
| Loyalty redeem | POST | Credit wallet from points | `wallet_transactions`<br>`riders` |
| Referral reward | POST | Credit wallet from referrals | `wallet_transactions`<br>`riders` |
| Subscription use | POST | Debit subscription (or wallet) | `subscriptions`<br>`wallet_transactions` |

**Database writes:**
```typescript
// Complete ride (debit)
INSERT INTO wallet_transactions (
  user_id, type='debit', amount=1500, 
  description='Ride fare payment', 
  reference_id='ride-id', reference_type='ride',
  balance_after=8500
) VALUES (...);
UPDATE riders SET wallet_balance = 8500 WHERE id = 'xxx';

// Referral reward (credit)
INSERT INTO wallet_transactions (
  user_id, type='credit', amount=500,
  description='Referral reward earned',
  reference_type='referral',
  balance_after=9000
) VALUES (...);
UPDATE riders SET wallet_balance = 9000 WHERE id = 'xxx';
```

---

## 🏠 Saved Places

| API Endpoint | Method | Database Operations | Tables |
|--------------|--------|---------------------|---------|
| `/api/rides/places/:userId` | GET | List saved places | `saved_places` |
| `/api/rides/places` | POST | Save new place | `saved_places` |
| `/api/rides/places/:placeId` | DELETE | Delete saved place | `saved_places` |

**Database writes:**
```typescript
// Save place
INSERT INTO saved_places (
  user_id, type='home', name='Home', address='123 Main St',
  coords='{"lat": 6.5244, "lng": 3.3792}'::jsonb
) VALUES (...);

// Delete place
DELETE FROM saved_places WHERE id = 'xxx' AND user_id = 'xxx';
```

---

## 📈 Analytics & Stats

| API Endpoint | Method | Database Operations | Tables |
|--------------|--------|---------------------|---------|
| `/api/rides/stats/:riderId` | GET | - Total rides, spending<br>- This month activity | `rides` |
| `/api/drivers/:driverId/earnings` | GET | Calculate driver earnings | `rides`<br>`parcels` |
| `/api/parcels/stats/:userId` | GET | Parcel statistics | `parcels` |
| `/api/referrals/stats/:userId` | GET | Referral statistics | `referrals` |

**Database reads:**
```sql
-- Rider stats
SELECT 
  COUNT(*) as total_rides,
  SUM(fare) as total_spent,
  SUM(distance_km) as total_distance
FROM rides 
WHERE rider_id = 'xxx' AND status = 'completed';

-- Driver earnings
SELECT 
  COUNT(*) as total_rides,
  SUM(fare * 0.82) as total_earnings  -- 18% commission
FROM rides 
WHERE driver_id = 'xxx' AND status = 'completed';
```

---

## 🔄 Background Jobs (Future)

These operations should run as cron jobs/scheduled tasks:

### Daily at 00:00 UTC
```sql
-- Expire old scheduled rides
UPDATE rides 
SET status = 'cancelled' 
WHERE status = 'scheduled' 
AND scheduled_for < NOW() - INTERVAL '1 day';

-- Check for expiring subscriptions (notify users)
SELECT * FROM subscriptions 
WHERE expires_at BETWEEN NOW() AND NOW() + INTERVAL '3 days'
AND auto_renew = TRUE;
```

### Weekly on Sunday
```sql
-- Recalculate loyalty tiers
UPDATE riders 
SET loyalty_tier = CASE
  WHEN total_rides >= 501 THEN 'platinum'
  WHEN total_rides >= 201 THEN 'gold'
  WHEN total_rides >= 51 THEN 'silver'
  ELSE 'bronze'
END;
```

### Monthly on 1st
```sql
-- Renew subscriptions
INSERT INTO subscriptions (user_id, plan, ...)
SELECT user_id, plan, ...
FROM subscriptions 
WHERE expires_at < NOW() 
AND auto_renew = TRUE;

-- Calculate driver equity shares (based on total rides)
UPDATE drivers
SET equity_shares = equity_shares + FLOOR(total_rides / 100);
```

---

## 🧪 Testing Database Operations

### Test complete ride flow:
```bash
# 1. Create ride
curl -X POST http://localhost:4000/api/rides \
  -H "Content-Type: application/json" \
  -d '{
    "riderId": "user-123",
    "pickup": "Location A",
    "dropoff": "Location B"
  }'

# 2. Accept ride (driver)
curl -X PATCH http://localhost:4000/api/rides/RIDE-ID/accept \
  -H "Content-Type: application/json" \
  -d '{"driverId": "driver-456"}'

# 3. Complete ride (triggers loyalty points, wallet debit)
curl -X PATCH http://localhost:4000/api/rides/RIDE-ID/complete \
  -H "Content-Type: application/json"

# 4. Check loyalty points awarded
curl http://localhost:4000/api/loyalty/status/user-123

# 5. Check wallet balance
curl http://localhost:4000/api/rides/stats/user-123
```

### Verify in Supabase:
```sql
-- Check loyalty rewards created
SELECT * FROM loyalty_rewards WHERE user_id = 'user-123' ORDER BY created_at DESC LIMIT 1;

-- Check wallet transaction recorded
SELECT * FROM wallet_transactions WHERE user_id = 'user-123' ORDER BY created_at DESC LIMIT 1;

-- Check rider's updated balance and tier
SELECT loyalty_tier, loyalty_points, wallet_balance FROM riders WHERE id = 'user-123';
```

---

## 📊 Database Size Estimates (1000 active users)

| Table | Rows/Month | Storage/Row | Total |
|-------|-----------|-------------|-------|
| `rides` | ~50,000 | ~1KB | ~50MB |
| `parcels` | ~10,000 | ~1KB | ~10MB |
| `loyalty_rewards` | ~50,000 | ~0.5KB | ~25MB |
| `wallet_transactions` | ~100,000 | ~0.5KB | ~50MB |
| `safety_incidents` | ~100 | ~1KB | ~100KB |
| `subscriptions` | ~1,000 | ~0.5KB | ~500KB |
| `referrals` | ~200 | ~0.5KB | ~100KB |
| **Total** | | | **~135MB/month** |

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] Migration file ran successfully
- [ ] All 9 new tables created
- [ ] Indexes created (check with `\di` in psql)
- [ ] Sample data inserted and queryable
- [ ] API endpoints return data from Supabase (not in-memory)
- [ ] Loyalty points persist after server restart
- [ ] Wallet transactions recorded correctly
- [ ] Referral codes generated and stored
- [ ] Subscription usage decrements properly
- [ ] Safety incidents logged to database

Test command:
```bash
# Restart backend server
cd backend
npm run dev

# Make API call
curl http://localhost:4000/api/loyalty/leaderboard

# Should return data from Supabase, not empty array
```

---

**🎉 All features now persist in Supabase PostgreSQL!**

For more details, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)
