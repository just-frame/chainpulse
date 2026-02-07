# Technology Stack

**Analysis Date:** 2026-01-22

## Languages

**Primary:**
- TypeScript 5.x - Full codebase (frontend components, hooks, API routes, utilities)
- JavaScript (Node.js runtime for API routes and build)

**Secondary:**
- CSS/Tailwind - Styling via Tailwind CSS v4

## Runtime

**Environment:**
- Node.js (via Next.js 14)
- Browser (React 18 - client components)

**Package Manager:**
- npm 10.x
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 14.2.5 - Full-stack React framework with API routes and SSR
  - App Router (file-based routing in `app/` directory)
  - Server Components (via Supabase SSR)
  - API Routes (`app/api/`)

**UI/Frontend:**
- React 18.3.1 - UI library
- Recharts 3.6.0 - Charts for portfolio visualization

**Database/Backend:**
- Supabase 2.90.1 - PostgreSQL database + auth + real-time
- @supabase/ssr 0.8.0 - Server-side auth helpers for Next.js
- Resend 6.8.0 - Email service for alerts

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework via @tailwindcss/postcss
- CSS Variables - Custom theme system (--bg-primary, --text-primary, etc.)

**Testing:**
- None detected in codebase (no test files, no jest/vitest config)

**Build/Dev:**
- Next.js built-in build system
- PostCSS 4 - CSS processing via postcss.config.mjs

## Key Dependencies

**Critical:**
- `@supabase/ssr` ^0.8.0 - Auth state management and server-side client creation
- `@supabase/supabase-js` ^2.90.1 - Official Supabase client for database + auth
- `recharts` ^3.6.0 - Chart rendering for portfolio visualization
- `resend` ^6.8.0 - Email notifications for price alerts

**Infrastructure:**
- `@tailwindcss/postcss` ^4 - Tailwind CSS processor
- `tailwindcss` ^4 - Tailwind CSS core
- `typescript` ^5 - TypeScript compiler

## Configuration

**Environment:**
- `.env.local` file required with:
  - `HELIUS_API_KEY` - Solana RPC and DAS API
  - `ALCHEMY_API_KEY` - EVM RPC fallback
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
  - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role (server-only)
  - `NEXT_PUBLIC_APP_URL` - Application URL
  - `RESEND_API_KEY` - Resend email API key

**Build:**
- `tsconfig.json` - TypeScript configuration with path aliases (@/*)
- `next.config.mjs` - Next.js configuration
- `postcss.config.mjs` - PostCSS configuration for Tailwind
- `.eslintrc` (ESLint 9) - Linting rules
- `eslint-config-next` - Next.js-specific ESLint preset

## Platform Requirements

**Development:**
- Node.js 18+ (implied by package.json)
- npm 10.x
- Supabase account (for development database)
- API keys: Helius, Alchemy, Resend (optional for some features)

**Production:**
- Vercel (deployed to vault-portfolio.vercel.app)
- Supabase hosted instance
- Environment variables for all integrations

---

*Stack analysis: 2026-01-22*
