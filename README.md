# Ride-Hailing App

## Project Overview
A comprehensive ride-hailing and logistics platform with advanced features like loyalty rewards, subscriptions, parcel delivery, carpooling, safety/SOS system, and referral program. All data persists in **Supabase PostgreSQL** database.

## 🆕 Latest Features (v2.0)

- ✅ **Loyalty & Rewards** - 4-tier system (Bronze to Platinum) with 2-12% cashback
- ✅ **Subscription Plans** - Monthly plans with unlimited rides and significant savings
- ✅ **Parcel Delivery** - Integrated cargo/package delivery service
- ✅ **Carpooling** - Share rides with others and save 40-60%
- ✅ **Scheduled Rides** - Book rides up to 30 days in advance
- ✅ **Safety & SOS** - Emergency button with police alerts and live tracking
- ✅ **Referral System** - Earn ₦500-10,000 per successful referral
- ✅ **Wallet** - Digital wallet for seamless payments

## 🗄️ Database Setup (IMPORTANT!)

**All features require database migration to be run first:**

### 1. Run Migration
```bash
# Go to Supabase Dashboard → SQL Editor → Run this:
cd backend/supabase/migrations
# Copy and execute: 20260129_add_new_features.sql
```

This creates 9 new tables:
- `loyalty_rewards` - Points and tier tracking
- `subscriptions` - Monthly subscription plans
- `referrals` - Referral tracking and rewards
- `parcels` - Package delivery system
- `safety_incidents` - SOS alerts and reports
- `wallet_transactions` - Financial transaction history
- `saved_places` - Favorite locations (home, work)
- `corporate_accounts` - Business accounts
- `driver_incentives` - Gamification challenges

### 2. Verify Tables
Check in Supabase Dashboard → Table Editor that all tables exist.

**📚 Full Database Documentation:**
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Complete schema, queries, maintenance
- [API_DATABASE_MAPPING.md](./API_DATABASE_MAPPING.md) - API endpoints → DB operations

## Features
- Rider App
- Driver App
- Admin Panel

## Getting Started (Backend first)
1. Clone the repository and move into `backend`.
2. Copy `.env.example` to `.env` and adjust values.
3. Install dependencies with `npm install`.
4. Run the API in watch mode via `npm run dev`, or build and start with `npm run build` then `npm start`.

## Frontend Setup (React + Vite)
1. Navigate to `frontend` folder.
2. Copy `.env.example` to `.env.local` and add your Google Maps API key.
3. Install dependencies: `npm install`.
4. Run `npm run dev` to start the dev server (proxies `/api` calls to backend).
5. Build: `npm run build`, Preview: `npm run preview`.

## Backend API surface (MVP)

- `POST /api/auth/sign-up` – register rider or driver with email and password.
- `POST /api/auth/sign-in` – authenticate with email and password.
- `POST /api/auth/sign-out` – log out user.
- `POST /api/rides` – create ride and compute fare.
- `PATCH /api/rides/:rideId/accept` – assign driver.
- `PATCH /api/rides/:rideId/complete` – close ride, split fare (platform cut vs driver).
- `POST /api/drivers/register` – onboard driver; awaits admin approval.
- `PATCH /api/drivers/:driverId/status` – toggle availability (approved drivers).
- `GET /api/drivers/:driverId/earnings` – summarize earnings.
- `GET /api/admin/drivers/pending` – list pending drivers.
- `PATCH /api/admin/drivers/:driverId/approve` – approve/reject driver.
- `PATCH /api/admin/config/commission` – adjust commission percent.

## Frontend Features

✨ Modern gradient dark UI (inspired by Uber/Bolt)
🗺️ Real-time Google Maps with location search
📍 Geolocation detection
💳 Real-time fare estimation
🔐 Email/password authentication (Supabase Auth)
📱 Mobile-responsive React + Vite
🎨 Tailwind CSS with custom theme
⚡ Fast HMR development
🔄 Real-time driver location tracking (Socket.io)
💰 Stripe card payments

## License
This project is licensed under the MIT License.