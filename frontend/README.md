# RideHub Frontend

## Features
- ✨ Modern, gradient-rich UI inspired by next-generation ride-hailing apps
- 🗺️ Real-time Google Maps integration with location search
- 📍 Geolocation & automatic location detection
- 💳 Real-time fare estimation (distance + time-based)
- � **Multi-vehicle type selection** (Economy, Comfort, Premium, XL, Bike)
- 📊 **User Dashboard** with ride statistics and history
- 📜 **Full Ride History** with filtering and pagination
- 💰 **Fare Calculator** - check prices before booking
- 📌 **Saved Places** - save home, work, and favorite destinations
- ⭐ **Ride Rating System** - rate your drivers
- 🔐 Email/password authentication with Supabase
- 📱 Fully responsive mobile-first design
- ⚡ Lightning-fast Vite development server
- 🎨 Dark mode with accent colors (primary/secondary gradients)
- 🔄 Real-time state management (Zustand)
- 🚀 TypeScript for type safety

## New Features (v2.0)

### 🚗 Vehicle Type Selection
Choose from 5 vehicle categories with transparent pricing:
- **Economy** - Budget-friendly rides (1.0x rate)
- **Comfort** - More space and comfort (1.4x rate)
- **Premium** - Luxury vehicles (2.0x rate)
- **XL** - 6-seater vehicles (1.8x rate)
- **Bike** - Quick motorcycle rides (0.5x rate)

### 📊 User Dashboard
Comprehensive dashboard showing:
- Total rides and spending statistics
- This month's activity summary
- Quick access to booking, history, and fare calculator
- Saved places management
- Profile and settings

### 💰 Fare Calculator
Check ride prices before booking:
- Enter distance and duration
- Compare prices across all vehicle types
- See fare breakdown (base + distance + time charges)
- Estimated arrival times

### 📜 Ride History
Full history of all your rides:
- Filter by status (completed, cancelled, in-progress)
- View ride details, fares, and ratings
- Pagination for large history
- Export-ready data format

## Quick Start

### Prerequisites
- Node.js 18+
- Google Maps API key

### Setup
1. Copy `.env.example` to `.env.local` and add your Google Maps API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the dev server (proxies `/api` to `http://localhost:4000`):
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser.

## Building for Production
```bash
npm run build
npm run preview
```

## Architecture
- **State Management**: Zustand stores for auth, rides, location, UI
- **API**: Axios with interceptors for auth tokens
- **Maps**: Google Maps API Loader for lazy loading
- **Routing**: React Router v6 with protected routes
- **Styling**: Tailwind CSS with custom dark theme
- **Build**: Vite for ultra-fast HMR and optimized bundles

## Key Components
- `Auth.tsx` – Email/password login and signup
- `Dashboard.tsx` – User dashboard with stats and quick actions
- `RiderHome.tsx` – Main ride booking interface with map and vehicle selection
- `RideHistory.tsx` – Full ride history with filters
- `FareCalculator.tsx` – Compare fares across vehicle types
- `LocationSearch.tsx` – Google Places autocomplete with predictions
- `MapComponent.tsx` – Dark-themed Google Map with custom markers
- `RideEstimate.tsx` – Real-time fare display component
- `ProtectedRoute.tsx` – Route-level authentication guard

## API Endpoints Used
- `POST /api/rides/estimate` - Get fare estimate for a route
- `POST /api/rides/fare-compare` - Compare fares across vehicle types
- `GET /api/rides/vehicle-types` - Get available vehicle types
- `GET /api/rides/history/:riderId` - Get user's ride history
- `GET /api/rides/stats/:riderId` - Get user's statistics
- `POST /api/rides/places` - Save a favorite place
- `GET /api/rides/places/:userId` - Get saved places
- `POST /api/rides/:rideId/rate` - Rate a completed ride

## Notes
- Ensure the backend API is running on http://localhost:4000
- Google Maps API key must have Places, Maps, and DistanceMatrix libraries enabled
- Dark theme uses slate colors (#0F172A) with primary (#FF6B6B) and secondary (#4ECDC4) accents
- Location permissions required for geolocation features
