# Twilio SMS Setup Guide

## Why You're Not Getting SMS Messages

Currently, the app logs OTP codes to the **browser console** instead of sending SMS because Twilio credentials aren't configured. Here's how to set up real SMS delivery:

---

## Step 1: Create a Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up with your email
3. Verify your phone number (Twilio will call you with a code)
4. Complete the verification

## Step 2: Get Your Credentials

After verification, you'll see your **Account SID** and **Auth Token** on the dashboard:

```
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token:  your_auth_token_here
```

**⚠️ KEEP THESE SECRET!** Never share or commit them to GitHub.

## Step 3: Get a Phone Number

1. In Twilio dashboard, go to **Phone Numbers** → **Manage Numbers**
2. Click **Get your first Twilio phone number** or **Buy a Number**
3. Select your country
4. Choose a number (you'll get a free trial number)
5. Accept the terms and purchase (free for trial)

Example Twilio number: `+1234567890`

## Step 4: Update Environment Variables

Add your credentials to `.env`:

```env
# .env file in backend/

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

## Step 5: Restart the Backend

```powershell
cd ride-hailing-app/backend
npm run dev
```

## Step 6: Test It!

1. Go to http://localhost:3000
2. Sign up as a Rider or Driver
3. **Select your country** from the dropdown
4. Enter your phone number
5. Click "Request OTP"
6. **You should receive an SMS within 10 seconds!**

---

## Twilio Trial Limitations

- **Free for 30 days** with $15 trial credit
- Can only send SMS to **verified numbers** (numbers you manually verify in dashboard)
- Can send SMS **FROM** your Twilio number **TO** any number

### How to Verify Test Numbers:

1. Go to Twilio Dashboard → **Verified Caller IDs**
2. Add your personal phone number
3. Twilio will call you with a code
4. Enter the code to verify
5. Now you can receive SMS at that number!

---

## Production Setup (After Trial)

Once your trial ends or you need more numbers:

1. **Upgrade to paid account** (you'll get $15+ more credits)
2. **Buy dedicated numbers** for each country you operate in
3. Update credentials in production environment

### Popular Country Codes:

- **Nigeria:** +234 (Glo, MTN, Airtel SMS Gateway)
- **USA/Canada:** +1 (cheapest, ~$0.01 per SMS)
- **UK:** +44 (~$0.02 per SMS)
- **India:** +91 (~$0.005 per SMS)
- **South Africa:** +27 (~$0.015 per SMS)

---

## How OTP Currently Works

```
User Request OTP
    ↓
Backend generates 6-digit code (expires in 5 mins)
    ↓
If Twilio configured: Send SMS ✅
If Twilio NOT configured: Log to console ⚠️
    ↓
User enters OTP
    ↓
Backend verifies & creates account
    ↓
User logged in!
```

---

## Troubleshooting

### "OTP logged to console (Twilio not configured)"
- Check `.env` file has all three Twilio variables
- Restart `npm run dev`
- Check browser console for error messages

### "To number not verified for this account"
- Add your test number to Twilio Verified Caller IDs
- Wait for verification call

### "Invalid phone number format"
- Make sure country code is included (+234, +1, etc.)
- Use only digits after country code
- The app automatically removes spaces/dashes

### "Auth error: Account SID or token invalid"
- Copy-paste credentials again carefully
- Make sure there are no spaces before/after
- Check you used the right Account SID (not Project ID)

---

## Monitoring SMS in Twilio Dashboard

1. Go to Twilio Dashboard → **Messages**
2. See all SMS sent/received
3. Check delivery status, timestamps, and read logs

---

## Next: Add More Countries

To add more country options, update `COUNTRIES` array in [frontend/src/pages/Auth.tsx](./frontend/src/pages/Auth.tsx):

```tsx
const COUNTRIES = [
  { code: '+1', name: 'USA/Canada', flag: '🇺🇸' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  // Add more countries here...
  { code: '+237', name: 'Cameroon', flag: '🇨🇲' },
];
```

---

## Security Best Practices

✅ **DO:**
- Store credentials in `.env` (never in code)
- Use `.gitignore` to exclude `.env`
- Regenerate tokens if compromised
- Use environment variables in production

❌ **DON'T:**
- Commit credentials to GitHub
- Share tokens in messages/emails
- Hardcode numbers in source code
- Use test credentials in production

---

## FAQ

**Q: Can I use Twilio for international numbers?**
A: Yes! Twilio supports SMS in 180+ countries. Just buy numbers in those countries or use a shortcode.

**Q: How much will SMS cost?**
A: Typical rates: $0.01-0.02 per SMS. At scale, costs can be negotiated.

**Q: Can I send bulk OTP?**
A: Yes! Twilio can handle thousands of SMS/second. Great for production apps.

**Q: Do I need a Twilio number per country?**
A: Not required, but recommended for local presence and better delivery rates.

**Q: What if Twilio goes down?**
A: Implement retry logic or fallback to another SMS provider (AWS SNS, Firebase, etc.)

---

## Support

- Twilio Docs: https://www.twilio.com/docs
- API Reference: https://www.twilio.com/docs/sms/api
- Chat Support: Available in Twilio Console
