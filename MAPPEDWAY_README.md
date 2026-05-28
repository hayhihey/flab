# 🗺️ RideHub - Smart Mobility Solutions

> **Modern, AI-powered ride-hailing platform with intelligent routing and real-time tracking**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with React](https://img.shields.io/badge/Built%20with-React%2018-blue.svg)](https://react.dev)
[![Backend: Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green.svg)](https://nodejs.org)

## ✨ Features

### 🚗 For Riders
- **Smart Booking** - Real-time fare estimation with transparent pricing
- **Live Tracking** - Track your driver in real-time on interactive maps
- **Multiple Ride Types** - Standard rides, parcel delivery, and scheduled trips
- **Loyalty Rewards** - Earn points on every ride and redeem exclusive benefits
- **Safety Features** - Emergency SOS button, ride history, and safety ratings
- **Payment Flexibility** - Multiple payment options with automatic settlements

### 🔑 For Drivers
- **Earnings Dashboard** - Real-time earnings tracking and performance metrics
- **Smart Dispatch** - AI-powered ride matching and route optimization
- **Verification System** - Seamless onboarding with document verification
- **Commission Management** - Transparent commission structure and instant payouts

### 🛡️ For Admins
- **Complete Oversight** - Comprehensive audit logs and system monitoring
- **User Management** - Full control over riders, drivers, and support tickets
- **Analytics** - Deep insights into platform performance and trends
- **Business Rules** - Dynamic configuration of fares, commissions, and policies

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Maps API Key (get it [here](https://developers.google.com/maps/documentation/javascript/get-api-key))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ridehub.git
cd ridehub

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

#### Backend (.env)
```bash
cd backend
cat > .env << EOF
PORT=4000
BASE_FARE=2.5
DISTANCE_RATE=1.4
TIME_RATE=0.35
COMMISSION_PERCENT=20
ALLOWED_ORIGINS=http://localhost:3000
EOF
```

#### Frontend (.env.local)
```bash
cd frontend
cat > .env.local << EOF
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:4000
EOF
```

### Running the Application

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```
The API will be available at `http://localhost:4000`

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```
The app will be available at `http://localhost:3000`

## 📱 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/health
- **WebSocket**: ws://localhost:4000

## 🏗️ Architecture

### Frontend Stack
```
React 18 + TypeScript + Vite
├── State Management: Zustand
├── Routing: React Router v6
├── Maps: Google Maps API
├── Styling: Tailwind CSS + Custom Dark Theme
└── UI Components: Headless, Lucide Icons
```

### Backend Stack
```
Node.js + Express + TypeScript
├── Database: PostgreSQL (Supabase)
├── Real-time: Socket.io
├── Authentication: Token-based
├── Payments: Stripe Integration
└── SMS: Twilio
```

## 📊 Project Structure

```
ridehub/
├── frontend/                 # React web application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # Zustand stores
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                  # Node.js API server
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── realtime/        # WebSocket handlers
│   │   ├── utils/           # Utility functions
│   │   ├── config.ts        # Configuration
│   │   └── types.ts         # TypeScript types
│   ├── supabase/            # Database migrations
│   └── package.json
│
└── docs/                     # Documentation
```

## 🎨 Design System

### Color Palette
```
Primary:    #6366F1 (Indigo)
Accent:     #10B981 (Emerald)
Cyan:       #06B6D4 (Cyan)
Dark:       #0F172A (Slate)
Darker:     #020617 (Navy)
```

### Typography
- **Display Font**: Plus Jakarta Sans
- **Body Font**: Inter
- **Sizes**: 12px - 48px scale

## 📚 API Documentation

### Authentication
```
POST /api/auth/signup     - Register new user
POST /api/auth/signin     - Login user
POST /api/auth/verify-otp - Verify OTP
```

### Rides
```
POST   /api/rides           - Create new ride
GET    /api/rides/:id       - Get ride details
PUT    /api/rides/:id       - Update ride
GET    /api/rides/history   - User ride history
```

### Drivers
```
POST   /api/drivers/register - Register as driver
GET    /api/drivers/:id      - Get driver profile
PUT    /api/drivers/:id      - Update profile
GET    /api/drivers/earnings - Get earnings
```

For full API documentation, see [API Reference](./docs/api.md)

## 🔄 Real-time Features

- **Live Location Updates** - Driver location streamed to riders
- **Ride Status Changes** - Instant notifications on state changes
- **In-app Chat** - Direct communication between riders and drivers
- **Performance Metrics** - Real-time dashboard updates

## 🔒 Security

- **HTTPS/TLS** - All communications encrypted
- **CORS Protection** - Configured for production
- **Helmet.js** - HTTP security headers
- **Input Validation** - Server-side validation on all endpoints
- **JWT Tokens** - Secure authentication tokens
- **Rate Limiting** - Protection against abuse

## 📈 Production Deployment

### Frontend
```bash
npm run build        # Build production bundle
npm run preview      # Preview production build
```

### Backend
```bash
npm run build        # Compile TypeScript
npm start            # Run production server
```

**Deploy with:**
- Docker + Kubernetes
- Vercel (Frontend)
- Heroku/Railway (Backend)
- Cloudflare CDN (Static assets)

## 🚀 Roadmap

- [ ] Mobile apps (React Native, Flutter)
- [ ] AI-powered surge pricing
- [ ] Machine learning for ETA prediction
- [ ] Advanced analytics dashboard
- [ ] Accessibility improvements
- [ ] Multi-language support
- [ ] International expansion

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

```bash
# Create a feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m 'Add amazing feature'

# Push to branch
git push origin feature/amazing-feature

# Open a Pull Request
```

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## 💬 Support

- 📧 Email: support@ridehub.dev
- 💬 Discord: [Join Community](https://discord.gg/ridehub)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/ridehub/issues)

## 🙏 Acknowledgments

Built with ❤️ by the RideHub team. Special thanks to:
- Google Maps API
- Stripe for payments
- Twilio for SMS
- The open-source community

---

**Ready to transform mobility? Let's go! 🗺️🚀**
