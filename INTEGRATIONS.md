# SMS + Payment Integration Guide

## ✅ Completed Integrations

### 1. Twilio SMS Integration
**Status:** ✅ Implemented

#### Features:
- OTP delivery via SMS (replaces console logging)
- Ride status notifications (driver assigned, arriving, completed)
- Phone validation (E.164 format recommended)

#### Setup:
1. Create a Twilio account at https://www.twilio.com
2. Get your Account SID, Auth Token, and Phone Number
3. Add to `.env`:
```bash
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### Endpoints Using SMS:
- `POST /api/auth/request-otp` - Sends OTP via SMS
- `PATCH /api/rides/:rideId/accept` - Notifies rider of driver assignment
- `PATCH /api/rides/:rideId/complete` - Sends ride completion SMS

---

### 2. Stripe Payment Integration
**Status:** ✅ Implemented

#### Features:
- Payment Intent creation for card payments
- Real-time payment status tracking
- Webhook support for payment confirmation
- Automatic payment split (20% platform, 80% driver)
- Payment refund handling

#### Setup:
1. Create a Stripe account at https://stripe.com
2. Get your Secret Key and Public Key
3. Add to `.env`:
```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

#### Endpoints:
- `POST /api/rides` - Creates ride with payment method
- `PATCH /api/rides/:rideId/complete` - Processes payment (if card)
- `POST /api/rides/:rideId/payment-intent` - Creates Stripe PaymentIntent
- `POST /api/webhooks/stripe` - Webhook for payment status updates

#### Payment Flow:
1. Rider creates ride with `paymentMethod: "card"`
2. Ride is accepted by driver
3. On completion, system creates Stripe PaymentIntent
4. Frontend captures card details and confirms payment
5. Stripe webhook notifies backend of payment status
6. Payment is split: 20% → platform, 80% → driver

---

## 📱 Frontend Integration Required

Add Stripe.js to frontend for card payment UI:

```bash
npm install @stripe/react-stripe-js @stripe/js
```

Create a payment component:

```typescript
import { loadStripe } from '@stripe/js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export function PaymentForm({ rideId }) {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async () => {
    const response = await fetch(`/api/rides/${rideId}/payment-intent`, {
      method: 'POST'
    });
    const { clientSecret } = await response.json();
    
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { name: 'Rider Name' }
      }
    });
    
    if (result.error) {
      console.error(result.error.message);
    } else {
      console.log('Payment successful!', result.paymentIntent);
    }
  };

  return (
    <div>
      <CardElement />
      <button onClick={handlePayment}>Pay ${fare}</button>
    </div>
  );
}
```

---

## 🔄 Testing

### Test SMS OTP:
```bash
curl -X POST http://localhost:4000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "role": "rider",
    "name": "John Doe"
  }'
```

### Test Payment Intent Creation:
```bash
curl -X POST http://localhost:4000/api/rides/{rideId}/payment-intent \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### Stripe Test Cards:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Auth Required:** 4000 2500 0000 3155

---

### 3. Real-time Tracking (Socket.io)
**Status:** ✅ Implemented

#### Features:
- Live driver location streaming via WebSockets
- Ride status events (accepted, completed)
- REST fallback to push locations if sockets unavailable

#### Setup:
1. Backend already includes Socket.io server.
2. Connect from frontend/mobile with `socket.io-client` and join ride rooms.
3. Emit driver locations from the driver app.

#### Client Usage:
```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

// Join a ride room to receive location + status updates
socket.emit("join:ride", { rideId });

// Listen for driver locations
socket.on("driver:location", (payload) => {
  // payload: { driverId, lat, lng, heading?, speedKph?, rideId?, updatedAt }
});

// Listen for ride status changes
socket.on("ride:status", (payload) => {
  // payload: { rideId, status, driverId?, riderId?, fare?, paymentStatus? }
});

// Driver app: push location updates
socket.emit("driver:location", { driverId, lat, lng, heading, speedKph, rideId });
```

#### REST Fallback (if websockets blocked):
`POST /api/drivers/:driverId/location`
```json
{
  "lat": 37.78,
  "lng": -122.42,
  "heading": 90,
  "speedKph": 35,
  "rideId": "uuid-optional"
}
```

---

## 🚀 Next Steps

### Phase 4: Database Migration
- PostgreSQL for persistent data
- Redis for live location caching
- Migration scripts

### Phase 5: Mobile Apps
- React Native driver app
- Flutter rider app
- Native background location tracking

---

## 📊 API Response Examples

### OTP Request (with Twilio):
```json
{
  "message": "OTP sent successfully",
  "code": null,
  "expiresAt": "2026-01-24T10:30:00Z",
  "smsSent": true
}
```

### Ride Completion (with Stripe):
```json
{
  "ride": {
    "id": "uuid",
    "status": "completed",
    "fare": 15.50,
    "paymentMethod": "card",
    "paymentStatus": "completed",
    "paymentIntentId": "pi_xxxxxxxxxxxx",
    "paymentSplit": {
      "totalFare": 15.50,
      "platformShare": 3.10,
      "driverShare": 12.40,
      "commissionPercent": 20
    }
  },
  "payment": {
    "status": "completed",
    "riderAmount": 12.40,
    "platformCommission": 3.10
  }
}
```

---

## 🔐 Security Notes

- Never commit `.env` files with real API keys
- Use environment-specific keys (test vs. production)
- Implement rate limiting on SMS endpoints
- Validate all phone numbers before sending SMS
- Use HTTPS for all Stripe communications
- Verify webhook signatures from Stripe

---

**Last Updated:** January 24, 2026
