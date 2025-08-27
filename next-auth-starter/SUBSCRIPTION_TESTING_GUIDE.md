# 🧪 Subscription Flow Testing Guide

This guide walks you through testing your freemium subscription system completely **without needing real Stripe payments** during development.

## 🚀 Quick Setup & Testing

### 1. Database Migration
```bash
# Generate and apply the subscription schema
npx prisma migrate dev --name add-subscription-schema
npx prisma generate
```

### 2. Environment Variables (For Testing)
```bash
# Add to your .env.local (minimum for testing - no real Stripe keys needed yet)
STRIPE_SECRET_KEY=sk_test_fake_for_testing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_fake_for_testing
STRIPE_WEBHOOK_SECRET=whsec_fake_for_testing
STRIPE_PRO_PRICE_ID=price_fake_pro
STRIPE_ENTERPRISE_PRICE_ID=price_fake_enterprise
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Add Subscription Section to Dashboard

In your existing dashboard page, add the `"use client"` directive and include our subscription components:

```typescript
// src/app/dashboard/page.tsx (or wherever your dashboard is)
"use client"

import { DashboardSubscriptionSection } from '@/components/subscription/dashboard-subscription-section'

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      
      {/* Your existing dashboard content */}
      
      {/* Add subscription section */}
      <DashboardSubscriptionSection />
    </div>
  )
}
```

## 🧪 Testing the Complete Flow

### Phase 1: Basic Usage Tracking

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Visit your dashboard** (`http://localhost:3000/dashboard`)

3. **Test usage tracking**:
   - Click "Test API Call" button several times
   - Watch the usage quota update in real-time
   - Notice the progress bar filling up

4. **Test the upgrade prompt**:
   - Keep clicking until you hit the 100-call limit (free tier)
   - The upgrade modal should automatically appear
   - You'll see the conversion-optimized messaging

### Phase 2: Test Different Plans

Use the test API endpoints to simulate different subscription states:

```bash
# Reset usage to zero
curl -X POST http://localhost:3000/api/test/subscription \
  -H "Content-Type: application/json" \
  -d '{"action": "reset_usage"}'

# Simulate upgrading to Pro
curl -X POST http://localhost:3000/api/test/subscription \
  -H "Content-Type: application/json" \
  -d '{"action": "simulate_upgrade"}'

# Simulate downgrading back to Free
curl -X POST http://localhost:3000/api/test/subscription \
  -H "Content-Type: application/json" \
  -d '{"action": "simulate_downgrade"}'

# Max out usage to test limits
curl -X POST http://localhost:3000/api/test/subscription \
  -H "Content-Type: application/json" \
  -d '{"action": "max_out_usage"}'
```

### Phase 3: Test Your Actual Features

In your real API routes, add usage tracking:

```typescript
// Example: In your actual API route
import { withUsageLimit } from '@/lib/usage-tracker'

export async function POST(request: NextRequest) {
  // Check usage limit before processing
  const usageCheck = await withUsageLimit('api_call')()
  if (usageCheck.error) {
    return NextResponse.json(usageCheck, { status: usageCheck.status })
  }
  
  // Your actual feature logic here
  const result = await yourFeatureFunction()
  
  return NextResponse.json({ success: true, data: result })
}
```

## 💳 Testing Real Stripe Integration (Optional)

### 1. Set Up Stripe Test Mode

1. Create a Stripe account (if you don't have one)
2. Go to Stripe Dashboard → Developers → API Keys
3. Copy your **test** keys (they start with `sk_test_` and `pk_test_`)
4. Create products and prices in test mode

### 2. Create Test Products

In Stripe Dashboard:
1. **Products** → Create Product
2. Create "Pro Plan" with monthly price ($19.99)
3. Create "Enterprise Plan" with monthly price ($99.99)
4. Copy the price IDs (they start with `price_`)

### 3. Set Up Webhook Endpoint

1. **Developers** → **Webhooks** → **Add endpoint**
2. URL: `https://your-domain.com/api/webhooks/stripe` (use ngrok for local testing)
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 4. Test Real Payments

Use Stripe's test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0000 0000 3220`

## 🎯 What to Look For During Testing

### ✅ Conversion Optimization Features
- [ ] **Usage transparency**: Users always see remaining quota
- [ ] **Soft limits**: Graceful handling when approaching limits
- [ ] **Strategic timing**: Upgrade prompts appear during engagement
- [ ] **Value-first messaging**: "Continue your workflow" vs "Remove limits"
- [ ] **One-click upgrade**: Seamless flow from limit → payment

### ✅ Technical Functionality
- [ ] **Usage tracking**: Accurate counting across all actions
- [ ] **Limit enforcement**: Hard stops when limits exceeded
- [ ] **Plan transitions**: Smooth upgrades/downgrades
- [ ] **UI updates**: Real-time quota updates
- [ ] **Error handling**: Graceful failures

### ✅ User Experience
- [ ] **Clear messaging**: Users understand their limits
- [ ] **Non-punitive limits**: Doesn't feel restrictive
- [ ] **Upgrade value**: Clear benefit to upgrading
- [ ] **Mobile responsive**: Works on all devices

## 🔧 Debugging Common Issues

### "Unauthorized" errors
- Make sure you're signed in with Clerk
- Check that `userId` is being passed correctly

### Usage not tracking
- Verify database migration ran successfully
- Check browser network tab for API errors
- Ensure your actual features call the usage tracker

### Components not updating
- Make sure components have `"use client"` directive
- Check React hooks are working in client components
- Verify state management in parent components

### Stripe integration issues
- Confirm webhook endpoint is reachable
- Check webhook secret in environment variables
- Verify price IDs match your Stripe products

## 📊 Expected Results

After implementing this system, you should see:

- **2-5% free-to-paid conversion** (industry standard)
- **Higher user engagement** (generous free tier)
- **Smooth upgrade experience** (better retention)
- **Clear usage patterns** (analytics for optimization)

## 🚀 Going to Production

1. **Replace test Stripe keys** with live keys
2. **Set up production webhook endpoint**
3. **Remove test API routes** (`/api/test/subscription`)
4. **Configure production environment variables**
5. **Run final security audit**

---

**🎉 You now have a fully testable freemium subscription system!** 

The beauty of this setup is you can test the entire user experience without needing real payments during development, then seamlessly switch to production when ready.
