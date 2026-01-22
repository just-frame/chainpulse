# Codebase Concerns

**Analysis Date:** 2026-01-22

## Security Issues

**Exposed API Keys in `.env.local`:**
- Files: `.env.local`
- Risk: Private API keys (Helius, Alchemy, Supabase service role, Resend) are hardcoded in version control
- Current mitigation: `.env.local` should be in `.gitignore` but presence indicates past or potential exposure
- Recommendations:
  - Immediately rotate all exposed keys (HELIUS_API_KEY, ALCHEMY_API_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY)
  - Ensure `.env.local` is in `.gitignore`
  - Use Supabase environment variables for deployment instead of hardcoded values
  - Consider using environment variable management system for local development

**Weak Admin Authentication:**
- Files: `app/app/api/invite/route.ts`
- Risk: Admin protection relies on simple string comparison of `process.env.ADMIN_KEY`
- Current mitigation: Environment variable-based (better than hardcoded)
- Recommendations:
  - Implement proper API key hashing/validation
  - Add rate limiting to invite endpoint
  - Log all admin operations
  - Consider requiring multi-factor verification for sensitive operations

**Permissive RLS Policy on Portfolio Snapshots:**
- Files: `supabase-schema.sql` (line 95-96)
- Risk: `FOR INSERT WITH CHECK (true)` allows any authenticated user to insert snapshots for any user when using service role
- Current mitigation: Relies on service role key being private
- Recommendations:
  - Restrict insert to authenticated user only: `WITH CHECK (auth.uid() = user_id)`
  - Add validation in cron endpoint before snapshot insertion

**Unvalidated External Data in Email Templates:**
- Files: `app/lib/email.ts`
- Risk: User-supplied alert thresholds are interpolated directly into HTML without escaping
- Symptoms: Potential XSS if threshold values contain HTML
- Workaround: Currently mitigated by numeric validation in alerts, but defensive
- Recommendations:
  - Use template escaping library instead of string interpolation
  - Validate all numeric inputs are indeed numbers before email send

---

## Tech Debt

**Percent Change Alerts Not Implemented:**
- Files: `app/app/api/alerts/check/route.ts` (line 141)
- Issue: TODO comment indicates percent_change alerts are stubbed but non-functional
- Impact: Feature advertised in alerts UI but does not execute
- Fix approach: Implement comparison against previous price lookup (requires price history table)

**In-Memory Price Cache - Not Production-Ready:**
- Files: `app/app/api/portfolio/route.ts` (line 90), `app/app/api/alerts/check/route.ts` (line 6)
- Issue: Global `priceCache` object in Node.js process - lost on deploy, not shared across instances
- Impact: Each serverless function invocation starts with empty cache; generates excessive API calls
- Workaround: 30-60 second TTL helps but insufficient for high-traffic apps
- Fix approach: Move to Redis or Supabase cache with 5-minute TTL

**Inefficient NFT Price Enrichment:**
- Files: `app/lib/chains/solana.ts` (line 858)
- Issue: Comment states "too slow - TODO: lazy load prices on demand" - NFTs without floor prices are returned
- Impact: Performance degradation with large NFT collections; incomplete data
- Fix approach: Implement lazy loading endpoint or async price fetching with UI skeleton states

**Hardcoded Token Mappings:**
- Files: `app/app/api/portfolio/route.ts` (lines 48-87), `app/lib/chains/solana.ts` (lines 88-109)
- Issue: Extensive hardcoded token symbol-to-name and token ID-to-icon mappings
- Impact: Manual maintenance required for new tokens; brittle for meme coins with dynamic metadata
- Fix approach: Source from Supabase token registry or on-chain metadata APIs

**CoinGecko API Dependency - No Fallback:**
- Files: Multiple chain integrations
- Issue: Heavy reliance on CoinGecko for price data with no alternative source when rate limited
- Impact: 429 errors cause portfolio to return stale/missing prices
- Fix approach: Implement fallback to DEX Screener, DeFiLlama, or cached prices

---

## Performance Bottlenecks

**Portfolio Fetch - Sequential Chain Calls:**
- Files: `app/app/api/portfolio/route.ts` (lines 205-499)
- Problem: Each chain's holdings fetched sequentially (Hyperliquid, Bitcoin, XRP, Dogecoin, Zcash, Cardano, Litecoin, Tron, Ethereum, Solana)
- Symptoms: Response time scales linearly with number of wallets; timeouts on many-wallet portfolios
- Cause: No Promise.all/Promise.allSettled batching
- Improvement path:
  - Replace sequential awaits with Promise.allSettled()
  - Implement timeout per chain (5s) to prevent hanging
  - Return partial results rather than failing entire request

**Solana Portfolio Integration - Expensive API Calls:**
- Files: `app/lib/chains/solana.ts` (large file: 878 lines)
- Problem: Multiple Helius/RPC calls per wallet (tokens, NFTs, transaction history for pricing)
- Symptoms: High API costs; rate limit hits with multiple wallets
- Cause: Granular API design without request batching
- Improvement path:
  - Batch DAS API requests
  - Cache token metadata for 24h
  - Implement request deduplication across concurrent wallets

**In-Memory Cache Thrashing:**
- Files: `app/hooks/usePortfolio.ts`, `app/hooks/useAlerts.ts`
- Problem: No cache invalidation strategy; old cached data persists across tab refreshes
- Symptoms: Stale portfolio values shown until manual refresh
- Cause: `useRef` counters prevent updates but don't clear old wallet data
- Improvement path: Implement cache TTL with automatic invalidation

---

## Known Bugs & Fragile Areas

**Wallet Address Case Sensitivity Edge Cases:**
- Files: `app/hooks/useWallets.ts` (lines 59-93)
- Issue: Complex case-sensitivity handling with `ilike` queries may have race conditions
- Symptoms: Potential duplicate wallet entries in race condition scenarios
- Safe modification:
  - Add database-level UNIQUE constraint check before insert
  - Use advisory locks during add/duplicate detection
  - Add comprehensive integration tests

**Alert Spam Prevention - 1 Hour Hardcoded:**
- Files: `app/app/api/alerts/check/route.ts` (line 114)
- Issue: Hard-coded 1-hour cooldown between alert triggers
- Impact: Users cannot get rapid alerts for volatile assets; cannot customize frequency
- Fix approach: Add configurable cooldown per alert (UI not yet built)

**Cron Job Security - Vercel-Specific:**
- Files: `app/app/api/cron/snapshot/route.ts`
- Issue: Relies on Vercel sending specific header; fails if deployed elsewhere
- Impact: App locked to Vercel; manual cron setup unclear for self-hosted
- Fix approach: Implement generic Bearer token validation, document cron setup

**NFT Collection Attribution - Fallback to Empty String:**
- Files: `app/lib/chains/solana.ts` (line 479-489)
- Issue: NFT collection name defaults to undefined if not found
- Impact: UI rendering issues or missing collection grouping
- Fix approach: Fetch collection name from Metaplex onchain program or DexScreener

---

## Scaling Limits

**Portfolio Snapshots - Unbounded Growth:**
- Files: `supabase-schema.sql` (line 74-100)
- Current capacity: Hourly snapshots = 24 per user per day = 8,760/year
- Limit: Storage grows unbounded; queries on large user bases become slow
- Issue: No automatic cleanup scheduled (comment at line 99-100)
- Scaling path:
  - Implement automatic daily rollup to aggregated snapshots
  - Delete snapshots older than 90 days from portfolio_snapshots table
  - Run vacuum after deletions
  - Add index on (user_id, created_at DESC) for time-range queries

**API Rate Limits - Per-Wallet Cumulative:**
- Problem: Each wallet added compounds API call count
- Current: ~5-8 API calls per wallet per fetch (Helius, Alchemy, CoinGecko, etc.)
- With 10 wallets across 10 users = 500-800 API calls per portfolio refresh cycle
- Scaling path:
  - Implement request coalescing (merge overlapping requests for same addresses)
  - Add queue system for portfolio updates (async, not real-time)
  - Implement smarter caching with per-chain TTLs

**Database Connections - Next.js Serverless:**
- Files: All API routes
- Issue: Each serverless function creates new Supabase connection; connection pooling not obvious
- Risk: Connection exhaustion with concurrent requests
- Improvement: Use PgBouncer or similar connection pooling layer

---

## Test Coverage Gaps

**No Tests for Alert Logic:**
- Untested area: Price comparison, alert triggering, email sending
- Files: `app/app/api/alerts/check/route.ts`, `app/lib/email.ts`
- Risk: Alert features could silently break (e.g., "above" condition logic inverted)
- Priority: High - users depend on alerts for trading signals

**No Tests for Chain Integrations:**
- Untested area: Bitcoin, Ethereum, Solana portfolio fetches
- Files: `app/lib/chains/*.ts`
- Risk: API response format changes break silently; invalid addresses accepted
- Priority: High - core app functionality

**No Tests for Concurrent Wallet Operations:**
- Untested area: Race conditions when adding/removing wallets rapidly
- Files: `app/hooks/useWallets.ts`, `app/app/api/portfolio/route.ts`
- Risk: Duplicate wallets, missing data, database constraint violations
- Priority: Medium - low-frequency user action

**No Integration Tests for API Routes:**
- Untested area: Authentication flows, input validation, error responses
- Files: All files in `app/app/api/`
- Risk: Security issues undetected; API contract changes break silently
- Priority: High - production endpoints

**Missing Error Scenarios:**
- Untested: API rate limits, network timeouts, malformed responses from external APIs
- Risk: Unhandled promise rejections, server crashes, poor error messages to users
- Priority: Medium - stability impact

---

## Dependencies at Risk

**Resend Email Service - Unverified Domain:**
- Risk: Emails sent from `onboarding@resend.dev` - typically goes to spam
- Impact: Users miss critical price alerts
- Migration plan:
  - Verify custom domain in Resend
  - Switch `FROM_EMAIL` to verified domain
  - Add DKIM/SPF records
  - Test email deliverability

**CoinGecko API - Free Tier Rate Limits:**
- Risk: 10 calls/second free tier; shared across all app instances
- Impact: 429 rate limit errors during market volatility
- Migration plan:
  - Upgrade to CoinGecko paid tier or
  - Implement local price cache with 5-min TTL or
  - Switch to DeFiLlama + DEX Screener for decentralized pricing

**Helius RPC - API Key in Code:**
- Risk: API key exposed; if compromised, attacker can consume quota
- Impact: Portfolio fetches fail for Solana wallets
- Migration plan: See "Exposed API Keys" security section above

---

## Missing Critical Features

**Price History Tracking:**
- Problem: No way to calculate percent change - required for percent_change alerts
- Blocks: Percent change alerts, 24h change sparklines
- Implementation: Store price snapshots with timestamps in Supabase, add to portfolio_snapshots

**Portfolio Performance Analytics:**
- Problem: No P&L tracking, cost basis, or performance attribution
- Blocks: Users cannot answer "how have my investments performed?"
- Implementation: Track purchase price/date for assets, calculate returns

**Wallet Labeling - UI Only:**
- Problem: Label field exists in schema but not shown/used in UI
- Blocks: User experience for managing many wallets
- Implementation: Display labels in wallet list, allow editing

**NFT Floor Price Updates:**
- Problem: Floor prices fetched once; become stale over time
- Blocks: Accurate net worth tracking for NFT-heavy portfolios
- Implementation: Add background job to refresh NFT prices hourly

---

## Architecture Concerns

**No Request Deduplication:**
- Problem: Multiple simultaneous requests for same wallet address result in duplicate API calls
- Files: All chain integrations
- Impact: Wasted API quota, slow response times
- Solution: Implement request-level caching with abort on duplicate in-flight requests

**Mix of Client-Side & Server-Side Caching:**
- Problem: Price cache in `portfolio/route.ts` and in-memory cache in `solana.ts` with different TTLs
- Impact: Inconsistent pricing across requests; difficult to debug stale data
- Solution: Centralize cache layer (Redis or Supabase KV) with single source of truth

**No Graceful Degradation:**
- Problem: If one chain API fails, entire portfolio request fails
- Files: `app/app/api/portfolio/route.ts`
- Impact: Portfolio returns 500 instead of partial data
- Solution: Return successful chains, mark failed chains as "data unavailable"

---

## Deployment & Operations

**Missing CI/CD Validation:**
- Problem: No automated tests or linting in deployment pipeline
- Impact: Broken code can be deployed
- Solution: Add GitHub Actions for ESLint, type checking, basic tests

**No Monitoring/Alerting for API Failures:**
- Problem: If Helius/Alchemy goes down, app fails silently
- Impact: Users see empty portfolios with no error messages
- Solution: Add Sentry/LogRocket for error tracking; set up Slack alerts

**Cron Job Not Documented:**
- Problem: Portfolio snapshot cron job not described in setup docs
- Impact: Snapshots not generated; sparkline charts show no data
- Solution: Add to README with setup instructions for alternative deploy platforms

---

## Code Quality Issues

**Excessive Logging in Production:**
- Files: Alert check, portfolio fetch, all chain integrations
- Issue: `console.log` statements with sensitive data (addresses, prices, API calls)
- Impact: Logs bloat; potential PII exposure in log aggregation
- Fix: Use structured logging with appropriate log levels; filter sensitive data

**Error Messages Leak Implementation Details:**
- Example: "Failed to fetch portfolio data" doesn't tell users if it's network, auth, or validation
- Impact: Poor debugging experience; users don't know what went wrong
- Fix: Implement error codes + user-friendly messages

**Type Safety Gaps:**
- Problem: `any` types used in several places (price data transformations, API responses)
- Impact: Runtime errors from malformed external API data
- Fix: Create strict TypeScript interfaces for all external API responses

---

## Documentation Gaps

**No Architecture Documentation:**
- Problem: How data flows through chains, caches, and UI is not documented
- Impact: Onboarding developers takes longer; bug fixes are risky
- Solution: Create architecture diagram and data flow documentation

**API Endpoint Documentation Missing:**
- Problem: No OpenAPI/Swagger docs for internal API routes
- Impact: Hard to understand expected input/output contracts
- Solution: Add JSDoc comments with @param, @returns to all route handlers

**Chain Integration Assumptions Not Listed:**
- Problem: No documentation of which APIs are used for which chains
- Impact: Surprising to discover Helius is required for Solana, Alchemy for Ethereum
- Solution: Create chain integration matrix (chain, API, cost per call, rate limit)

---

*Concerns audit: 2026-01-22*
