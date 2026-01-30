# Ride-Hailing Backend (Node + Express)

## Prerequisites

- Node.js 18+
- npm

## Quick start

1. Copy `.env.example` to `.env` and add your Supabase credentials and Stripe keys.
2. Install dependencies: `npm install`
3. Run in watch mode: `npm run dev`
4. Build and run compiled output: `npm run build` && `npm start`

## API surface (MVP)

- `POST /api/auth/sign-up` – register rider or driver with email and password.
- `POST /api/auth/sign-in` – authenticate with email and password.
- `POST /api/auth/sign-out` – log out user.
- `POST /api/rides` – create ride request, compute fare.
- `GET /api/rides/:rideId` – fetch ride details.
- `PATCH /api/rides/:rideId/accept` – driver accepts ride.
- `PATCH /api/rides/:rideId/complete` – finalize ride, split fare (platform vs driver).
- `POST /api/drivers/register` – submit driver for approval (email-based).
- `PATCH /api/drivers/:driverId/status` – toggle driver availability (requires approval).
- `GET /api/drivers/:driverId/earnings` – summarize driver earnings.
- `GET /api/admin/drivers/pending` – list pending drivers.
- `PATCH /api/admin/drivers/:driverId/approve` – approve/reject driver.
- `PATCH /api/admin/config/commission` – update commission percent.

## Notes

- Authentication uses Supabase Auth with email/password (formerly phone-based OTP).
- Data persisted in Supabase PostgreSQL.
- Commission defaults to 20%; adjustable at runtime via admin endpoint.
- Stripe integration for card payments.
- Socket.io for real-time location tracking.

