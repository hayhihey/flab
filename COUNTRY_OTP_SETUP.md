# Country-Based OTP & Twilio Integration

## What's New ✨

Your ride-hailing app now supports:
- ✅ **Country selector** in sign-up (8 countries: Nigeria, USA, UK, India, etc.)
- ✅ **Dynamic phone number formatting** with country codes
- ✅ **Real SMS delivery** via Twilio
- ✅ **Fallback to console logging** for testing without Twilio

---

## How It Works

### User Flow:
```
1. User selects country (e.g., Nigeria 🇳🇬 +234)
2. User enters phone number (e.g., 8012345678)
3. App combines: +234 + 8012345678 = +2348012345678
4. Backend sends OTP via SMS (if Twilio configured)
5. User receives SMS in 5-10 seconds ✅
```

### Current Status:

| Feature | Status | Notes |
|---------|--------|-------|
| Country Selection | ✅ Active | 8 countries supported |
| Phone Format | ✅ Active | Automatically adds country code |
| Twilio Integration | ⚠️ Inactive | Needs credentials (see setup guide) |
| Console Fallback | ✅ Active | OTP logged for testing |
| SMS Delivery | ⚠️ Disabled | Awaiting Twilio config |

---

## Quick Start: Get SMS Working

### 1. Get Twilio Account (Free)
```
Visit: https://www.twilio.com/try-twilio
Sign up → Verify phone → Get Account SID & Auth Token
```

### 2. Get a Twilio Number
```
In Twilio Dashboard:
Phone Numbers → Get your first Twilio phone number
(Free trial number included)
```

### 3. Configure Backend
Update `.env` file:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 4. Restart Backend
```powershell
cd ride-hailing-app/backend
npm run dev
```

### 5. Test It!
```
1. Open http://localhost:3000
2. Sign up as Rider/Driver
3. Select country (e.g., Nigeria)
4. Enter phone number
5. Request OTP → SMS received! ✅
```

---

## Supported Countries

| Country | Code | Flag | SMS Cost |
|---------|------|------|----------|
| Nigeria | +234 | 🇳🇬 | ~₦200/SMS |
| USA/Canada | +1 | 🇺🇸 | ~$0.01/SMS |
| UK | +44 | 🇬🇧 | ~£0.01/SMS |
| India | +91 | 🇮🇳 | ~₹0.50/SMS |
| South Africa | +27 | 🇿🇦 | ~R0.20/SMS |
| Uganda | +256 | 🇺🇬 | ~USh100/SMS |
| Kenya | +254 | 🇰🇪 | ~KSh5/SMS |
| Tanzania | +255 | 🇹🇿 | ~TSh100/SMS |

**Add more countries** in [frontend/src/pages/Auth.tsx](./frontend/src/pages/Auth.tsx):

```tsx
const COUNTRIES = [
  // ... existing countries ...
  { code: '+237', name: 'Cameroon', flag: '🇨🇲' },
  { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
];
```

---

## Technical Details

### Frontend Changes:
- Added `COUNTRIES` array with country codes and flags
- Added country selector `<select>` dropdown
- Phone number now combines: `country + number`
- Accessible labels and form validation

### Backend Changes:
- Twilio `sendOTP()` now accepts full phone number (with country code)
- Automatically detects if Twilio is configured
- Falls back to console logging if credentials missing
- OTP expires in 5 minutes

### Files Modified:
1. `frontend/src/pages/Auth.tsx` - Country selector UI
2. Backend remains unchanged (already supports any phone format)

---

## Testing Without Twilio

Currently, when you request OTP:

```
✅ OTP code is generated (6 digits)
✅ Valid for 5 minutes
⚠️ Logged to server console (not SMS)

Check backend terminal for: [SMS] OTP for +2348012345678: 123456
```

To test the flow:
1. Open backend terminal
2. Look for `[SMS] OTP for...` message
3. Use that code in the app

---

## Troubleshooting

### "OTP logged to console (Twilio not configured)"
- Twilio credentials missing from `.env`
- Restart backend after adding credentials
- Check for typos in credential values

### "Invalid phone number"
- Must include country code (auto-added now)
- Digits only (spaces/dashes auto-removed)
- Standard international format: +234XXXXXXXXXX

### "To number not verified"
- Twilio trial: Only verified numbers can receive SMS
- Add your number to Twilio Dashboard → Verified Caller IDs
- Wait for verification call

### Can't see OTP code
1. Sign up with test phone number
2. Check backend console for `[SMS] OTP for...`
3. Copy the 6-digit code
4. Enter it in the app

---

## Production Checklist

Before going live:

- [ ] Get Twilio paid account (upgrades from trial)
- [ ] Buy phone numbers for each country you operate in
- [ ] Add real phone numbers to Verified Caller IDs
- [ ] Configure `.env` with production credentials
- [ ] Test SMS delivery end-to-end
- [ ] Set up SMS alerts for failures
- [ ] Monitor SMS costs and delivery rates
- [ ] Implement SMS retry logic for failures
- [ ] Add SMS rate limiting (max 3 per hour per number)

---

## SMS Cost Estimation

At scale:

| Volume | Daily Cost | Monthly Cost | Provider |
|--------|-----------|-------------|----------|
| 100 OTPs | ~$1 | ~$30 | Twilio |
| 1,000 OTPs | ~$10 | ~$300 | Twilio |
| 10,000 OTPs | ~$100 | ~$3,000 | Twilio |
| 100,000 OTPs | ~$1,000 | ~$30,000 | Twilio |

*Costs vary by country and SMS type*

---

## Next Steps

1. ✅ Get Twilio account (5 mins)
2. ✅ Configure `.env` (2 mins)
3. ✅ Restart backend (1 min)
4. ✅ Test SMS (2 mins)
5. ✅ Done! 🎉

**See [TWILIO_SETUP.md](./TWILIO_SETUP.md) for detailed setup guide.**

---

## Support

- Twilio Docs: https://www.twilio.com/docs
- SMS API: https://www.twilio.com/docs/sms/api
- Error Codes: https://www.twilio.com/docs/errors
