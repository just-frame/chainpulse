# Architecture

**Analysis Date:** 2026-01-22

## Pattern Overview

**Overall:** Client-Server React/Next.js with Blockchain Data Aggregation

**Key Characteristics:**
- Next.js 14 with App Router (hybrid rendering: server-side data fetching, client-side interactivity)
- Multi-chain portfolio aggregation (13 blockchain networks)
- Supabase authentication + database for persistent user state
- Custom chain-specific data fetchers for heterogeneous blockchain queries
- Real-time price updates and alert polling
- CSS-in-JS with Tailwind + CSS variables for theme system

## Layers

**Presentation Layer:**
- Purpose: Render portfolio UI with responsive grid layouts, tabs, alerts, modals
- Location: `app/components/`, `app/app/page.tsx`, `app/app/layout.tsx`
- Contains: React components (Header, PortfolioTable, WalletInput, AlertModal, etc.), UI primitives (Toast, Skeleton), theme provider
- Depends on: Custom hooks, Tailwind CSS, theme system
- Used by: End user browser

**State Management Layer:**
- Purpose: Manage local and persistent client state (wallets, portfolio data, alerts, authentication)
- Location: `app/hooks/`
- Contains: usePortfolio, useAlerts, useAuth, useWallets, useTheme, usePortfolioHistory
- Depends on: Supabase client, localStorage, API routes
- Used by: Presentation components

**API / Data Aggregation Layer:**
- Purpose: Fetch and normalize blockchain data from multiple sources
- Location: `app/lib/chains/` (chain-specific fetchers), `app/app/api/portfolio/`
- Contains: Chain integrations (Solana, Ethereum, Bitcoin, etc.), external API clients (CoinGecko, Helius, DeFiLlama, DexScreener)
- Depends on: External blockchain RPCs, price APIs, NFT databases
- Used by: usePortfolio hook, portfolio API route

**Backend/Services Layer:**
- Purpose: Server-side operations: authentication, alerts, email, portfolio snapshots
- Location: `app/app/api/`, `app/lib/supabase-server.ts`, `app/lib/email.ts`
- Contains: Next.js API routes for portfolio, alerts, auth callback, cron snapshots
- Depends on: Supabase Auth, Supabase DB, Resend email service
- Used by: Client-side hooks via fetch(), cron jobs

**Data/Persistence Layer:**
- Purpose: Store and retrieve user data, alerts, portfolio history
- Location: Supabase (external), localStorage (browser)
- Contains: User accounts, wallet addresses, alerts, portfolio snapshots
- Depends on: Supabase PostgreSQL backend
- Used by: API routes, useAuth, useWallets hooks

## Data Flow

**Portfolio Load Sequence (Authenticated User):**

1. User loads app → layout.tsx renders Providers (Toast context) + page.tsx
2. useAuth hook checks Supabase session status (loading: true while checking)
3. useWallets loads user's saved wallets from Supabase (async)
4. usePortfolio aggregates wallets + loads portfolio data:
   - For each wallet: fetch(`/api/portfolio?address=X&chain=Y`) → chain-specific fetcher
   - Merge assets by symbol/chain, aggregate NFTs & domains
5. usePortfolio sets 30-second auto-refresh interval → calls refreshAll()
6. Dashboard renders PortfolioSummary, PortfolioTable, tabs
7. useAlerts loads user's alerts from Supabase, sets up polling

**Alert Trigger Flow:**

1. useAlerts.checkAlerts() called (manual or auto-check)
2. For each enabled alert: compare current asset price to threshold
3. If threshold crossed: POST to `/api/alerts/check` with triggered alerts
4. Client receives triggered alerts → displays toast notifications
5. AlertsList component renders triggered state with highlight

**Portfolio Data Fetch (Single Wallet):**

1. Wallet address + chain passed to `/api/portfolio` route
2. Route validates address format, routes to appropriate chain handler
3. Chain handler (e.g., getSolanaPortfolio):
   - Queries chain RPC or API (Helius for Solana, Etherscan for Ethereum)
   - Gets token balances, metadata
   - Fetches prices from DeFiLlama / CoinGecko
   - Fetches NFT metadata + floor prices
   - Filters dust (< $1 USD)
   - Returns normalized Asset[], NFT[], Domain[]
4. usePortfolio.fetchWalletData aggregates results
5. Component re-renders with new data

**Authentication State:**

1. useAuth listens to Supabase auth state changes
2. On successful sign-up/sign-in → usePortfolio resets and loads saved wallets
3. On sign-out → usePortfolio clears all data, clears refresh interval
4. Guest users: wallets stored in localStorage only

## Key Abstractions

**Chain Handler:**
- Purpose: Normalize heterogeneous blockchain APIs into uniform Asset/NFT/Domain interfaces
- Examples: `lib/chains/solana.ts`, `lib/chains/ethereum.ts`, `lib/chains/bitcoin.ts`
- Pattern: Each chain exports `getXPortfolio(address: string)` returning standardized types

**usePortfolio Hook:**
- Purpose: Central state machine for portfolio data lifecycle
- Pattern: Single source of truth for wallet list, asset aggregation, refresh timing
- Key logic: Deduplication (prevents duplicate wallet adds), refresh interval management, data merging across wallets

**API Route Pattern:**
- Purpose: Next.js API routes act as server-side proxies/adapters
- Pattern: Validation → chain routing → normalization → response
- Example: `/api/portfolio` validates address, routes to getSolanaPortfolio/getEthereumPortfolio/etc, returns JSON

**Toast/Alert System:**
- Purpose: Non-blocking user notifications
- Pattern: React Context provider (ToastProvider) + useToast hook + Toast component
- Used for: Wallet additions, price alerts, errors

## Entry Points

**Main Application:**
- Location: `app/app/page.tsx`
- Triggers: Browser navigation to /
- Responsibilities: Main dashboard layout, state orchestration (portfolio + alerts), tab navigation, modal management

**API Routes:**
- `/api/portfolio` - Fetch portfolio for single wallet (GET)
- `/api/alerts` - CRUD alerts (GET/POST/DELETE)
- `/api/alerts/check` - Manual alert check (POST)
- `/api/portfolio/history` - Get portfolio snapshots (GET)
- `/api/cron/snapshot` - Triggered by external cron service (POST)
- `/auth/callback` - Google OAuth callback (GET)

**Hooks (Internal Entry Points):**
- `usePortfolio()` - Portfolio state machine
- `useAlerts()` - Alert management
- `useAuth()` - Authentication state
- `useWallets()` - Wallet persistence (Supabase)
- `useTheme()` - Theme switching

## Error Handling

**Strategy:** Graceful degradation with user-facing toast notifications and fallback UI states

**Patterns:**

- **Network Timeouts:** 30-second timeout on portfolio fetches, returns empty portfolio on timeout, user can retry
- **Invalid Addresses:** Client-side regex validation before API call, API returns 400 with error message
- **API Failures:** Per-wallet error handling in usePortfolio.refreshAll(), keeps existing data on failure
- **Authentication Errors:** useAuth catches auth state changes, displays AuthModal for re-login
- **Supabase Connection:** Fallback to localStorage for unauthenticated state, no data loss

## Cross-Cutting Concerns

**Logging:**
- Approach: console.log with `[Module]` prefix for context (e.g., `[usePortfolio]`, `[api/portfolio]`)
- Used for: Debug wallet fetching, data aggregation, caching decisions
- Not persisted to backend

**Validation:**
- Address format validation: chain-specific regex patterns in `/api/portfolio` route
- Input sanitization: URL encoding for addresses in fetch calls
- Type safety: TypeScript interfaces enforce shape of Asset, NFT, Domain, etc.

**Authentication:**
- Supabase Auth (email/password + Google OAuth)
- Session stored in Supabase cookie
- useAuth listens to auth state changes
- Authenticated endpoints: useWallets makes authenticated Supabase calls

**Rate Limiting:**
- External API caching: Solana portfolio cache (60-second TTL) to avoid 429s
- Auto-refresh interval: 30 seconds between portfolio refreshes
- Alert checks: Manual user-triggered or scheduled (no aggressive polling)

**Styling:**
- Tailwind CSS utility classes (PostCSS plugin)
- CSS variables for "Cypher" theme (single theme, MGS codec aesthetic)
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Dark mode only (cool black #08090b, teal accent #5aabb8)

---

*Architecture analysis: 2026-01-22*
