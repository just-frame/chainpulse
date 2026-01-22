# External Integrations

**Analysis Date:** 2026-01-22

## APIs & External Services

**Blockchain RPC Providers:**
- Helius API (`https://mainnet.helius-rpc.com/`)
  - What: Solana RPC + DAS API for token/NFT metadata and transaction parsing
  - SDK: @supabase/supabase-js (used indirectly)
  - Auth: `HELIUS_API_KEY` environment variable
  - Usage: `lib/chains/solana.ts` - Portfolio fetching, token metadata, NFT enrichment, domain prices
  - Fallback: Public Solana RPC if key not set

- Alchemy API
  - What: EVM RPC provider fallback
  - Auth: `ALCHEMY_API_KEY` environment variable
  - Usage: Referenced in `.env.local` but implementation location TBD

- Public Solana RPC (`https://api.mainnet-beta.solana.com`)
  - Used when Helius API key not configured

**Blockchain Indexers & Data:**
- DeFiLlama Prices API (`https://coins.llama.fi/prices/current`)
  - What: Token price data for Solana and other chains
  - Auth: None (free public API)
  - Usage: `lib/chains/solana.ts` - Price fetching for fungible tokens
  - Format: Maps `solana:mint` to USD prices

- DexScreener API (`https://api.dexscreener.com/latest/dex/tokens`)
  - What: DEX token metadata including icons
  - Auth: None (free public API, rate-limited)
  - Usage: `lib/chains/solana.ts` - Token icon lookup for meme coins/low-liquidity tokens
  - Rate Limiting: Batched with comma-separated addresses

- CoinGecko API (`https://api.coingecko.com/api/v3/simple/price`)
  - What: Centralized price data for major tokens and 24h change
  - Auth: None (free public API, 50 calls/min)
  - Usage: `app/api/portfolio/route.ts` - Price enrichment for all assets
  - Caching: 30-second in-memory cache to avoid rate limits
  - Symbols mapped to CoinGecko IDs: bitcoin, ethereum, solana, hyperliquid, jup, bonk, etc.

**Domain Services:**
- Bonfida SNS API (`https://sns-sdk-proxy.bonfida.workers.dev/domains/{address}`)
  - What: Solana .sol domain lookup
  - Auth: None (proxy service)
  - Usage: `lib/chains/solana.ts` - Domain enumeration for Solana wallets
  - Also fetches purchase prices via Helius transaction history

**Chain-Specific Providers:**
- Bitcoin:
  - BlockCypher API (implied in `lib/chains/bitcoin.ts`)
  - Or Bitcoin Core RPC
  - Used for balance + UTXO queries

- Ethereum:
  - Etherscan API (or Alchemy)
  - Used in `lib/chains/ethereum.ts` for token contracts, NFTs, ENS

- XRP Ledger:
  - xrpl.org RPC
  - Used in `lib/chains/xrp.ts`

- Tron:
  - TronGrid API
  - Used in `lib/chains/tron.ts` for TRX + TRC-20 token balances

- Cardano:
  - Koios or similar Cardano indexer
  - Used in `lib/chains/cardano.ts`

- Other chains (Dogecoin, Zcash, Litecoin, Hyperliquid):
  - Various public RPCs and indexers
  - See individual chain files in `lib/chains/`

## Data Storage

**Databases:**
- Supabase (PostgreSQL)
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` (public), `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - Client: @supabase/supabase-js (browser) + @supabase/ssr (server)
  - Tables used:
    - `wallets` - User wallet addresses and chains
    - `alerts` - Price/percent change alerts
    - `users` (implicit via auth)
  - Auth: Supabase Auth (email/password + Google OAuth)

**File Storage:**
- None - Images stored externally (CoinGecko, DexScreener, Helius CDN)

**Caching:**
- In-Memory:
  - Portfolio cache (60-second TTL) in `lib/chains/solana.ts`
  - Price cache (30-second TTL) in `app/api/portfolio/route.ts`
  - No Redis/external cache

- Browser:
  - localStorage for anonymous user wallets (`chainpulse_wallets` key)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Implementation: `lib/supabase.ts`, `lib/supabase-server.ts`, `hooks/useAuth.ts`
  - Methods:
    - Email/password (signInWithEmail, signUpWithEmail)
    - Google OAuth (signInWithGoogle via `signInWithOAuth` with provider: 'google')
  - Redirect: `window.location.origin/auth/callback` for OAuth
  - Session: Managed via Supabase client, persisted in secure HTTP-only cookies (SSR mode)
  - User ID: Used as `user_id` foreign key in alerts and wallets tables

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Rollbar, etc.)

**Logs:**
- Console.log/console.error in development
- Server-side logs via Next.js deployment (Vercel)
- Performance logging in API routes (e.g., `console.time()`)

## CI/CD & Deployment

**Hosting:**
- Vercel (chainpulsetest1.vercel.app)
- Deployment via git push (inferred from Next.js setup)

**CI Pipeline:**
- None detected (no GitHub Actions, no CI config)

## Environment Configuration

**Required env vars:**

Public (frontend-accessible):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous client key
- `NEXT_PUBLIC_APP_URL` - Application base URL for links/callbacks

Server-only:
- `HELIUS_API_KEY` - Solana RPC + DAS API (rate-limited, not exposed to client)
- `ALCHEMY_API_KEY` - EVM RPC (rate-limited, not exposed to client)
- `SUPABASE_SERVICE_ROLE_KEY` - Admin access to Supabase (used in API routes)
- `RESEND_API_KEY` - Email API (used in API routes for price alert notifications)

Optional:
- `ALCHEMY_API_KEY` - Fallback if Helius unavailable

**Secrets location:**
- Development: `.env.local` (committed as `.env.example` without values)
- Production: Vercel environment variables

## Webhooks & Callbacks

**Incoming:**
- `/auth/callback` - Google OAuth callback (handles redirect from Supabase)
- `/api/cron/snapshot` - Implied cron job for portfolio snapshots (for history tracking)

**Outgoing:**
- Resend emails - Triggered when price alerts match conditions via `lib/email.ts`

---

*Integration audit: 2026-01-22*
