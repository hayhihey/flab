# 🚀 RideHub Quick Start Guide

## Welcome to RideHub! 

> Smart Mobility Solutions for Modern Cities

This guide will help you get started with the newly modernized RideHub application.

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies

```bash
# Backend
cd backend && npm install && cd ..

# Frontend  
cd frontend && npm install && cd ..
```

### Step 2: Configure Environment

**Backend** (`.env` in `backend/` directory):
```bash
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend** (`.env.local` in `frontend/` directory):
```bash
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:4000
```

### Step 3: Run Both Services

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
# Starts on http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
# Starts on http://localhost:3000
```

### Step 4: Open in Browser
```
http://localhost:3000
```

## 🎨 What's New?

### Visual Changes
- 🎯 Modern Indigo primary color (#6366F1)
- 🌿 Emerald accent color (#10B981)
- 🏷️ "RideHub" branding throughout
- 📍 New logo combining map pin + route
- 💫 Smooth animations and transitions
- 📱 Enhanced mobile responsiveness

### New Components
- **Header** - Sticky navigation with user menu
- **Modern Colors** - Cohesive design system
- **Better UX** - Improved navigation and layout

## 📁 Project Structure

```
ridehub/
├── frontend/              # React web app
│   ├── public/
│   │   ├── logo.svg      # NEW: RideHub logo
│   │   └── favicon.svg   # NEW: RideHub favicon
│   ├── src/
│   │   ├── components/
│   │   │   └── Header.tsx # NEW: Modern header
│   │   ├── pages/
│   │   │   └── Auth.tsx  # UPDATED: New branding
│   │   └── App.tsx       # UPDATED: Header integration
│   └── tailwind.config.js # UPDATED: New colors
│
├── backend/               # Node.js API
│   ├── src/
│   │   └── index.ts      # UPDATED: Branded startup
│   └── package.json      # UPDATED: Version 1.0.0
│
├── BRAND_GUIDELINES.md   # NEW: Design system
├── RIDEHUB_README.md   # NEW: Full documentation
└── MODERNIZATION_SUMMARY.md # NEW: Changes summary
```

## 🎯 Key Features

### For Riders
- 🗺️ Real-time ride tracking
- 💰 Transparent pricing
- 🎁 Loyalty rewards program
- 🚨 Emergency SOS feature
- 📱 Scheduled ride booking

### For Drivers
- 📊 Earnings dashboard
- 📍 Smart dispatch
- ✅ Easy verification
- 💸 Instant payouts
- ⭐ Rating system

### For Everyone
- 🌙 Dark mode by default
- ♿ Full accessibility (WCAG 2.1 AA)
- 📱 Mobile-first design
- ⚡ Fast and smooth
- 🔒 Secure and encrypted

## 🎨 Design System

### Colors

**Primary (Indigo)**
```css
#6366F1 (main)
#4F46E5 (hover)
#4338CA (active)
```

**Accent (Emerald)**
```css
#10B981 (main)
#059669 (hover)
#047857 (active)
```

**Cyan**
```css
#06B6D4 (highlights)
#0891B2 (hover)
```

### Fonts
- **Headings**: Plus Jakarta Sans (Bold)
- **Body**: Inter (Regular)

### Spacing
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px

## 🚀 Development

### Available Commands

**Frontend**
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

**Backend**
```bash
npm run dev      # Start with auto-reload
npm run build    # Compile TypeScript
npm start        # Run production build
```

## 📚 Documentation

### Important Files
- **[BRAND_GUIDELINES.md](./BRAND_GUIDELINES.md)** - Design standards
- **[RIDEHUB_README.md](./RIDEHUB_README.md)** - Full documentation
- **[MODERNIZATION_SUMMARY.md](./MODERNIZATION_SUMMARY.md)** - All changes

### API Documentation
```
GET    /health              # Health check
POST   /api/auth/signup     # Register
POST   /api/auth/signin     # Login
GET    /api/rides           # List rides
POST   /api/rides           # Create ride
```

## 🐛 Troubleshooting

### "Port already in use"
```bash
# Kill process on port 4000 or 3000
# macOS/Linux:
lsof -i :4000
kill -9 <PID>

# Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Maps not showing?
- Check `VITE_GOOGLE_MAPS_API_KEY` in `.env.local`
- Verify API key is valid in Google Cloud Console
- Check browser console for errors

### Backend not responding?
- Verify backend is running: `curl http://localhost:4000/health`
- Check `VITE_API_URL` matches backend port
- Check CORS settings in backend

## 🔧 Customization

### Change Brand Colors

Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: {
    DEFAULT: '#YOUR_COLOR',
    500: '#YOUR_COLOR',
    600: '#HOVER_COLOR',
    // ...
  },
  // ...
}
```

### Update Logo

Replace files:
- `frontend/public/logo.svg` (app logo)
- `frontend/public/favicon.svg` (browser tab icon)

### Modify Theme

Edit `frontend/tailwind.config.js` for:
- Colors
- Fonts
- Spacing
- Animations
- Breakpoints

## 📱 Testing

### Mobile View
```bash
# Firefox/Chrome DevTools
F12 → Toggle Device Toolbar (Ctrl+Shift+M)
```

### Test Breakpoints
- **Mobile**: 375px width
- **Tablet**: 768px width
- **Desktop**: 1024px+ width

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Railway/Heroku)
```bash
npm run build
npm start
```

## 📞 Getting Help

1. Check **[BRAND_GUIDELINES.md](./BRAND_GUIDELINES.md)** for design questions
2. Review **[RIDEHUB_README.md](./RIDEHUB_README.md)** for technical setup
3. Check GitHub issues for known problems
4. Contact support team

## ✅ Verification Checklist

- [ ] Backend running on port 4000
- [ ] Frontend running on port 3000
- [ ] No console errors
- [ ] Logos displaying correctly
- [ ] Colors match design system
- [ ] Header appears on all pages
- [ ] Mobile view is responsive
- [ ] Dark mode looks correct

## 🎉 You're Ready!

Start building with RideHub. Enjoy the modern, sleek interface and happy coding! 🗺️✨

---

**Questions?** Check the docs or open an issue on GitHub.

