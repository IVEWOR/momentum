# Momentum ⚡️

**Execution Intelligence & Resource Allocation Engine**

Momentum is a purpose-built execution tracker and financial ledger designed for independent professionals, technical consultants, and agency operators.

It moves away from the traditional, fragile "to-do list" model and instead utilizes a document-based daily logging architecture. This system tightly couples execution telemetry (time tracking, completion rates) with financial data (retainers, fixed budgets, acquisition costs), providing a unified dashboard for operational health.

## 🏗 System Architecture & Domain Logic

- **Document-Based Daily Logs:** Days are treated as immutable ledgers. Tasks and execution metrics are bound to specific `DailyLog` entities rather than floating dates.
- **Multi-Model Financial Tracking:** \* Supports `EARNING` (Client Revenue) and `SPENDING` (Acquisition/Bidding) project types.
  - Handles diverse billing structures: `FIXED`, `HOURLY`, `MONTHLY` (Retainers), and `PER_TASK` (e.g., cost per proposal).
- **Manual Payment Ledger:** Bypasses theoretical revenue calculations by utilizing a hard-coded manual payment ledger to calculate true Lifetime Value (LTV) and remaining budgets.
- **Multi-Currency Native:** First-class support for cross-border operations (USD `$` and INR `₹`).

## Tech Stack & Infrastructure

This stack was chosen for type safety, rapid iteration, and serverless scalability.

- **Core:** [Next.js](https://nextjs.org/) (App Router) – Leveraging React Server Components (RSC) and Server Actions for secure, zero-API-route data mutations.
- **Database:** PostgreSQL hosted on [Supabase](https://supabase.com/).
- **ORM:** [Prisma](https://www.prisma.io/) – For end-to-end type safety and schema-driven development.
- **UI/Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) – Accessible, unstyled primitives for a maintainable, low-bloat design system.
- **Deployment:** [Vercel](https://vercel.com/)

## Local Development Setup

### 1. Repository & Dependencies

```bash
git clone [https://github.com/IVEWOR/momentum.git](https://github.com/IVEWOR/momentum.git)
cd momentum
npm install
```

### 2. Environment Configuration

Create a `.env` file.

```env
# Database (Supabase IPv4 Pooler - Port 6543 for transaction pooling)
DATABASE_URL="postgresql://postgres.[YOUR_REF]:[PASSWORD]@[aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true](https://aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true)"

# Direct connection (Supabase Direct URL - Port 5432 for migrations)
DIRECT_URL="postgresql://postgres.[YOUR_REF]:[PASSWORD]@[aws-0-ap-south-1.pooler.supabase.com:5432/postgres](https://aws-0-ap-south-1.pooler.supabase.com:5432/postgres)"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

```

### 3. Database Sync & Client Generation

Push the schema to your Postgres instance and generate the typed Prisma client:

```bash
npx prisma db push
npx prisma generate
```

### 4. Boot up

```bash
npm run dev
```

## Deployment (Vercel)

The deployment pipeline is configured for Vercel's serverless environment.

### Critical Build Step

Because Vercel caches the `node_modules` directory, the Prisma client must be explicitly generated during the build phase. This is handled by the `postinstall` hook in `package.json`:

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

_Failure to run this step will result in a `.prisma/client/default module not found` error at runtime._

### Environment Variables

Ensure all keys from your `.env` (excluding `NODE_OPTIONS`) are mirrored in your Vercel Project Settings. Both `DATABASE_URL` and `DIRECT_URL` are required for the build to succeed.
