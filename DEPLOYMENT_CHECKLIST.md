# ✅ Production Deployment Checklist

## Pre-Deployment Tasks

### 1. Database Migration
- [ ] Logged into Supabase Dashboard
- [ ] Opened SQL Editor
- [ ] Copied `backend/supabase/migrations/20260129_add_new_features.sql`
- [ ] Executed migration successfully
- [ ] Verified all 13 tables exist:
  - [ ] `riders` (extended with new columns)
  - [ ] `drivers` (extended with new columns)
  - [ ] `rides` (extended with new columns)
  - [ ] `driver_locations`
  - [ ] `loyalty_rewards` ⭐ NEW
  - [ ] `subscriptions` ⭐ NEW
  - [ ] `referrals` ⭐ NEW
  - [ ] `parcels` ⭐ NEW
  - [ ] `safety_incidents` ⭐ NEW
  - [ ] `wallet_transactions` ⭐ NEW
  - [ ] `saved_places` ⭐ NEW
  - [ ] `corporate_accounts` ⭐ NEW
  - [ ] `driver_incentives` ⭐ NEW
- [ ] Verified all indexes created (20+ indexes)
- [ ] Tested sample queries (SELECT * FROM loyalty_rewards LIMIT 1)

### 2. Environment Variables

#### Backend `.env`
- [ ] `SUPABASE_URL` set correctly
- [ ] `SUPABASE_ANON_KEY` set correctly
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (critical!)
- [ ] `STRIPE_SECRET_KEY` set (if using payments)
- [ ] `STRIPE_WEBHOOK_SECRET` set (if using payments)
- [ ] `TWILIO_ACCOUNT_SID` set (if using SMS)
- [ ] `TWILIO_AUTH_TOKEN` set (if using SMS)
- [ ] `TWILIO_PHONE_NUMBER` set (if using SMS)
- [ ] `PORT` set to production port (e.g., 4000)
- [ ] `NODE_ENV` set to `production`

#### Frontend `.env.local` or `.env.production`
- [ ] `VITE_GOOGLE_MAPS_API_KEY` set with production key
- [ ] `VITE_API_URL` set to production backend URL
- [ ] `VITE_SOCKET_URL` set to production backend URL
- [ ] Google Maps API key has correct restrictions
- [ ] Google Maps API key has all required APIs enabled:
  - [ ] Maps JavaScript API
  - [ ] Places API
  - [ ] Distance Matrix API
  - [ ] Geocoding API

### 3. Code Quality Checks
- [ ] No `console.log()` statements in production code
- [ ] All TypeScript errors resolved (`npm run build`)
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend compiles successfully (`npm run build`)
- [ ] No hardcoded API keys in source code
- [ ] All sensitive data in environment variables
- [ ] Error handling implemented for all API routes
- [ ] CORS configured for production domains

### 4. API Testing
- [ ] Health check endpoint works: `GET /health`
- [ ] Auth endpoints work:
  - [ ] `POST /api/auth/sign-up`
  - [ ] `POST /api/auth/sign-in`
  - [ ] `POST /api/auth/sign-out`
- [ ] Ride endpoints work:
  - [ ] `POST /api/rides` (create ride)
  - [ ] `GET /api/rides/:id` (get ride)
  - [ ] `PATCH /api/rides/:id/accept` (driver accepts)
  - [ ] `PATCH /api/rides/:id/complete` (complete ride)
- [ ] Loyalty endpoints work:
  - [ ] `GET /api/loyalty/status/:userId`
  - [ ] `POST /api/loyalty/award`
  - [ ] `POST /api/loyalty/redeem`
- [ ] Subscription endpoints work:
  - [ ] `GET /api/subscriptions/plans`
  - [ ] `POST /api/subscriptions/subscribe`
  - [ ] `GET /api/subscriptions/user/:userId`
- [ ] Parcel endpoints work:
  - [ ] `POST /api/parcels`
  - [ ] `GET /api/parcels/track/:id`
  - [ ] `PATCH /api/parcels/:id/status`
- [ ] Safety endpoints work:
  - [ ] `POST /api/safety/sos`
  - [ ] `POST /api/safety/report`
- [ ] Referral endpoints work:
  - [ ] `GET /api/referrals/code/:userId`
  - [ ] `POST /api/referrals/apply`

### 5. Frontend Testing
- [ ] All pages load without errors
- [ ] Auth flow works (sign up, sign in, sign out)
- [ ] Main ride booking works:
  - [ ] Location search autocomplete
  - [ ] Map displays correctly
  - [ ] Fare estimation calculates
  - [ ] Ride request submits
- [ ] Dashboard displays user stats
- [ ] Loyalty page shows tier and points
- [ ] Subscriptions page displays plans
- [ ] Parcel delivery form submits
- [ ] Ride history loads and filters work
- [ ] Profile page loads user data
- [ ] Wallet displays balance and transactions
- [ ] Mobile responsive design works
- [ ] SOS button appears during rides

### 6. Database Verification
- [ ] Sample data inserted successfully
- [ ] Loyalty points persist after ride completion
- [ ] Wallet transactions recorded correctly
- [ ] Subscription usage decrements properly
- [ ] Referral codes generated and stored
- [ ] Safety incidents logged to database
- [ ] Parcel status updates save
- [ ] Scheduled rides stored with future dates
- [ ] Carpool passengers array updates
- [ ] Saved places stored correctly

### 7. Security Checks
- [ ] HTTPS enforced on production
- [ ] API rate limiting configured
- [ ] SQL injection protection verified
- [ ] XSS protection enabled (helmet.js)
- [ ] CSRF protection implemented
- [ ] Supabase Row Level Security (RLS) enabled
- [ ] Password hashing works (Supabase Auth)
- [ ] JWT tokens expire correctly
- [ ] Sensitive endpoints require authentication
- [ ] Admin endpoints restricted to admin role

### 8. Performance Optimization
- [ ] Database indexes created and tested
- [ ] Frontend bundle size optimized (<500KB)
- [ ] Images optimized and lazy-loaded
- [ ] API response times <200ms (average)
- [ ] Map loads in <2 seconds
- [ ] No memory leaks detected
- [ ] Socket.io connections close properly
- [ ] Database connection pooling configured

---

## Deployment Steps

### Backend Deployment (Render/Railway/Heroku)

#### Using Render:
1. [ ] Create new Web Service on Render
2. [ ] Connect GitHub repository
3. [ ] Set build command: `cd backend && npm install && npm run build`
4. [ ] Set start command: `cd backend && npm start`
5. [ ] Add all environment variables
6. [ ] Set instance type (minimum 512MB RAM)
7. [ ] Deploy and wait for build
8. [ ] Test health endpoint: `https://your-app.onrender.com/health`
9. [ ] Copy backend URL for frontend

#### Using Railway:
1. [ ] Create new project on Railway
2. [ ] Connect GitHub repository
3. [ ] Set root directory to `backend`
4. [ ] Add environment variables
5. [ ] Deploy automatically
6. [ ] Copy generated URL

### Frontend Deployment (Vercel/Netlify)

#### Using Vercel:
1. [ ] Create new project on Vercel
2. [ ] Connect GitHub repository
3. [ ] Set framework preset: Vite
4. [ ] Set root directory to `frontend`
5. [ ] Set build command: `npm run build`
6. [ ] Set output directory: `dist`
7. [ ] Add environment variables:
   - [ ] `VITE_GOOGLE_MAPS_API_KEY`
   - [ ] `VITE_API_URL` (production backend URL)
   - [ ] `VITE_SOCKET_URL` (production backend URL)
8. [ ] Deploy and wait for build
9. [ ] Test frontend: `https://your-app.vercel.app`
10. [ ] Configure custom domain (optional)

#### Using Netlify:
1. [ ] Create new site on Netlify
2. [ ] Connect GitHub repository
3. [ ] Set base directory: `frontend`
4. [ ] Set build command: `npm run build`
5. [ ] Set publish directory: `frontend/dist`
6. [ ] Add environment variables
7. [ ] Deploy site
8. [ ] Test deployment

### Database (Supabase)
1. [ ] Production project created on Supabase
2. [ ] Migration run successfully
3. [ ] Row Level Security policies configured
4. [ ] Backup schedule enabled (automatic on Supabase)
5. [ ] Connection pooler enabled (for scaling)
6. [ ] Realtime features enabled (if needed)

---

## Post-Deployment Verification

### Smoke Tests
- [ ] Homepage loads in production
- [ ] Can create new user account
- [ ] Can log in with test account
- [ ] Can create a ride request
- [ ] Can view dashboard stats
- [ ] Can redeem loyalty points
- [ ] Can subscribe to a plan
- [ ] Can create parcel delivery
- [ ] Can trigger SOS (test mode)
- [ ] Can apply referral code
- [ ] Map displays user location
- [ ] Fare estimation works

### Monitoring Setup
- [ ] Error logging configured (Sentry recommended)
- [ ] Performance monitoring enabled
- [ ] Database query monitoring active
- [ ] API endpoint monitoring setup
- [ ] Uptime monitoring configured (UptimeRobot, etc.)
- [ ] Alerts for critical errors configured
- [ ] Dashboard for key metrics created

### Documentation
- [ ] Production API URL documented
- [ ] Admin credentials stored securely
- [ ] Deployment runbook created
- [ ] Database backup procedure documented
- [ ] Rollback procedure documented
- [ ] Incident response plan created

---

## Ongoing Maintenance Tasks

### Daily
- [ ] Check error logs
- [ ] Monitor API response times
- [ ] Review safety incidents
- [ ] Check pending referral completions

### Weekly
- [ ] Review new user signups
- [ ] Check subscription renewals
- [ ] Verify wallet transaction accuracy
- [ ] Recalculate loyalty tiers
- [ ] Review driver earnings

### Monthly
- [ ] Database backup verification
- [ ] Security audit
- [ ] Performance review
- [ ] Update dependencies
- [ ] Review and archive old data

---

## Rollback Plan

If deployment fails:

1. **Backend Rollback:**
   ```bash
   # Render/Railway: Revert to previous deployment in dashboard
   # Or manually:
   git revert HEAD
   git push origin main
   ```

2. **Frontend Rollback:**
   ```bash
   # Vercel/Netlify: Revert to previous deployment in dashboard
   # Or redeploy from previous commit
   ```

3. **Database Rollback:**
   ```sql
   -- If migration fails, drop new tables
   DROP TABLE IF EXISTS loyalty_rewards CASCADE;
   DROP TABLE IF EXISTS subscriptions CASCADE;
   -- ... (repeat for all new tables)
   
   -- Or restore from backup
   ```

4. **Verify Rollback:**
   - [ ] Old version loads successfully
   - [ ] Core features work
   - [ ] No data loss
   - [ ] Users can access their accounts

---

## Launch Checklist

### Before Going Live:
- [ ] All checklist items above completed
- [ ] Beta testing completed with 10+ users
- [ ] Load testing completed (100+ concurrent users)
- [ ] Payment flow tested end-to-end
- [ ] SMS notifications tested (if enabled)
- [ ] Customer support team trained
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] FAQ page created
- [ ] Help documentation complete

### Launch Day:
- [ ] Monitor error logs continuously
- [ ] Watch database performance
- [ ] Check API response times
- [ ] Monitor user signups
- [ ] Respond to support tickets promptly
- [ ] Track key metrics:
  - [ ] New user registrations
  - [ ] Ride requests created
  - [ ] Successful ride completions
  - [ ] Payment success rate
  - [ ] Error rate (<1%)

### Post-Launch (First Week):
- [ ] Daily performance reviews
- [ ] User feedback collection
- [ ] Bug fixes prioritized and deployed
- [ ] Feature usage analytics reviewed
- [ ] Database query optimization
- [ ] Cost monitoring and optimization

---

## Success Metrics

Track these KPIs:

### Technical Metrics
- [ ] API uptime: >99.9%
- [ ] Average response time: <200ms
- [ ] Error rate: <0.1%
- [ ] Page load time: <3 seconds
- [ ] Database query time: <50ms

### Business Metrics
- [ ] Daily active users (DAU)
- [ ] Ride completion rate: >90%
- [ ] User retention rate (7-day): >40%
- [ ] Average ride fare
- [ ] Loyalty program adoption: >50%
- [ ] Subscription conversion: >10%
- [ ] Referral success rate: >20%

---

## Emergency Contacts

Document these for production issues:

- **DevOps Lead:** [Name, Phone, Email]
- **Backend Developer:** [Name, Phone, Email]
- **Frontend Developer:** [Name, Phone, Email]
- **Database Admin:** [Name, Phone, Email]
- **Product Manager:** [Name, Phone, Email]
- **Supabase Support:** support@supabase.io
- **Stripe Support:** support@stripe.com
- **Vercel Support:** support@vercel.com

---

## 🎉 Production Launch Approved

Once all items checked:

**Signed off by:**
- [ ] Backend Developer: _______________  Date: _______
- [ ] Frontend Developer: _______________  Date: _______
- [ ] QA Engineer: _______________  Date: _______
- [ ] Product Manager: _______________  Date: _______
- [ ] CTO/Tech Lead: _______________  Date: _______

**Go Live Date:** _______________________

---

**🚀 Ready for production deployment!**

For any issues, refer to:
- [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- [API_DATABASE_MAPPING.md](./API_DATABASE_MAPPING.md)
- [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
- [NEW_FEATURES_README.md](./NEW_FEATURES_README.md)
