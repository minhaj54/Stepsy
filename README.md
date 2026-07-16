# Zarwinto — Premium Footwear Marketplace

A multi-brand footwear e-commerce store built with Next.js 16, TypeScript, Tailwind CSS, and Supabase.

## Phase 1 MVP Status

| Feature | Status |
|---------|--------|
| Home, Shop, Product Detail, Search | Done (mock + Supabase ready) |
| Cart, Checkout, Coupons | Done (localStorage) |
| Customer Account (Profile, Orders, Wishlist, Addresses) | Done |
| Blog | Done |
| Phone OTP Auth (Twilio + Supabase) | Done |
| Database Schema + RLS | Done (see `supabase/migrations/`) |
| Admin Dashboard | Done (metrics, products, orders, customers) |
| Razorpay Payments | Pending |
| SEO Structured Data | Pending |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run in demo mode (no Supabase)

```bash
npm run dev
```

The app works out of the box with mock data and a demo user. Open [http://localhost:3000](http://localhost:3000).

### 3. Connect Supabase + Twilio (production)

#### Step 1 — Create a Supabase project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to provision

#### Step 2 — Set environment variables
1. In Supabase: **Project Settings → API**
2. Copy **Project URL**, **anon key**, and **service_role key**
3. Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_VERIFY_SERVICE_SID=your-twilio-verify-service-sid
```

#### Step 3 — Run database migrations
In Supabase **SQL Editor**, run these files in order:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_phone_auth.sql`

#### Step 4 — Set up Twilio Verify
1. Go to [twilio.com/console](https://www.twilio.com/console)
2. Navigate to **Verify → Services → Create new Service**
3. Name it (e.g. `Zarwinto OTP`) and copy the **Service SID** into `TWILIO_VERIFY_SERVICE_SID`
4. Copy your **Account SID** and **Auth Token** from the Twilio console dashboard
5. For trial accounts: verify your test phone number under **Phone Numbers → Verified Caller IDs**

#### Step 5 — Create an admin user
1. Restart the dev server: `npm run dev`
2. Go to [http://localhost:3000](http://localhost:3000) → **Sign In** → **Create account**
3. Enter your name and mobile number, verify the OTP
4. In Supabase SQL Editor, promote your account:

```sql
UPDATE public.users SET role = 'admin' WHERE phone = '+919876543210';
```

Replace with your verified phone number in E.164 format (e.g. `+919876543210`).

Refresh the site — an **Admin** button will appear in the header.

### 4. Build for production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/auth/         # send-otp, verify-otp API routes
│   ├── admin/            # Admin dashboard (protected)
│   ├── auth/             # Phone OTP login & signup
│   ├── account/          # Customer account
│   ├── cart/             # Shopping cart
│   ├── checkout/         # Checkout flow
│   ├── product/          # Product detail pages
│   ├── shop/             # Category/brand catalog
│   └── blog/             # Content engine
├── components/           # Shared UI components
├── context/              # Auth + Cart state
├── lib/
│   ├── supabase/         # Supabase client + admin utilities
│   ├── twilio.ts         # Twilio Verify OTP
│   └── data/             # Data fetching layer
└── types/                # TypeScript interfaces
supabase/
└── migrations/           # Database schema + seed data
```

## Blueprint

See `Zarwinto - world_of_shoes_marketplace_blueprint.md` for the full implementation plan covering Phase 1 (MVP store) through Phase 3 (marketplace ecosystem).

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Auth:** Twilio Verify (SMS OTP) + Supabase sessions
- **Payments:** Razorpay (planned)
- **Deployment:** Vercel
