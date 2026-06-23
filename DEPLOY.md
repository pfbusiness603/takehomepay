# TakeHomePay — Deployment Guide

## Prerequisites
- Node.js 18+
- Vercel account (free tier works)
- Stripe account
- Supabase account (optional but recommended)
- Google AdSense account (apply once deployed)
- Google Analytics account

---

## 1. Clone & Install

```bash
cd C:\Users\flana\takehomepay
npm install
```

---

## 2. Stripe Setup

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Create a product: **"Professional PDF Pay Stub"** — one-time price: **$2.99 USD**
3. Copy your **Secret Key** (`sk_live_...`) and **Publishable Key** (`pk_live_...`)
4. Set up a webhook:
   - Endpoint URL: `https://yourdomain.com/api/webhook`
   - Events to listen for: `checkout.session.completed`
   - Copy the **Webhook Signing Secret** (`whsec_...`)

For local testing:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhook
```
Copy the `whsec_...` key it prints and use it as `STRIPE_WEBHOOK_SECRET` locally.

---

## 3. Supabase Setup (Optional)

1. Create a new project at [https://supabase.com](https://supabase.com)
2. Open the **SQL Editor** and run the contents of `supabase-schema.sql`
3. Copy your **Project URL** and **Anon Key** from Settings → API
4. Copy your **Service Role Key** (keep this server-side only)

---

## 4. Google Analytics

1. Create a GA4 property at [https://analytics.google.com](https://analytics.google.com)
2. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

---

## 5. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 6. Test Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and test:
- [ ] Calculator computes correct results
- [ ] Hourly toggle works
- [ ] "Share results" copies URL
- [ ] "Generate PDF — $2.99" redirects to Stripe test checkout
- [ ] After Stripe test payment → success page → PDF downloads
- [ ] PDF contains correct employee/employer info and figures

---

## 7. Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

When prompted, set all env vars from step 5 in the Vercel dashboard:
- **Settings → Environment Variables** → add each one

Or use the CLI:
```bash
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
# ... repeat for each var
```

After deploy, update your Stripe webhook URL to the production URL.

---

## 8. Google AdSense

1. Apply at [https://adsense.google.com](https://adsense.google.com) with your production URL
2. Once approved, replace `ca-pub-XXXXXXXXXXXXXXXXX` in:
   - `.env.local` / Vercel env: `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-YOURID`
   - `app/layout.tsx` script src (uses env var automatically)
3. Update each `AdUnit` component's `slot` prop with real ad unit IDs from AdSense

> **AdSense tip:** Use **Auto Ads** for the easiest setup — AdSense places ads automatically. For manual control, create ad units in the AdSense dashboard and use their slot IDs.

---

## 9. Custom Domain

In Vercel dashboard: **Settings → Domains** → Add your domain (e.g., `takehomepay.app`).

Update `NEXT_PUBLIC_SITE_URL` env var to your production domain.

---

## Architecture Notes

- **561 static pages** pre-generated at build time (50 state pages + 500 state×job pages + home/success/sitemap)
- **Stripe webhook** at `/api/webhook` is the authoritative payment confirmation — the PDF is only served after `payment_status === 'paid'`
- **PDF generation** happens server-side at `/api/generate-pdf?session_id=...` — Stripe session is re-verified on each request
- **AdSense placements**: sidebar rectangle (desktop only) + horizontal below-fold — non-intrusive

---

## Revenue Projections (rough)

| Source | Assumption | Monthly |
|--------|-----------|---------|
| AdSense | 10k pageviews/mo × $3 RPM | ~$30 |
| PDF stubs | 1% conversion × 10k visits × $2.99 | ~$300 |
| Combined | Scale with SEO | $300–$3,000+ |
