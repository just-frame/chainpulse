# Post-MVP Backlog

**Created:** 2026-01-22
**Trigger:** After MVP launch, before scaling

---

## Critical Scaling Fixes (Do Before Marketing Push)

### 1. Vercel KV Price Cache
- **Why:** In-memory cache is useless on serverless - every cold start = empty cache
- **Files:** `app/api/portfolio/route.ts`, `app/api/alerts/check/route.ts`
- **Effort:** 2 hours
- **Impact:** Cuts API costs 90%, prevents CoinGecko 429s

### 2. Parallel Chain Fetches
- **Why:** Sequential fetches timeout with many wallets
- **Files:** `app/api/portfolio/route.ts` (lines 205-499)
- **Effort:** 1 hour
- **Fix:** `Promise.allSettled()` with 5s timeout per chain

### 3. Graceful Degradation
- **Why:** One chain API down = entire portfolio fails
- **Files:** `app/api/portfolio/route.ts`
- **Effort:** 2 hours
- **Fix:** Return partial data, mark failed chains as unavailable

### 4. CoinGecko Fallback
- **Why:** Free tier = 10 calls/sec, will 429 under load
- **Effort:** 1 hour
- **Fix:** Add DeFiLlama as backup pricing source

### 5. Snapshot Cleanup Cron
- **Why:** 8,760 rows/user/year with no cleanup
- **Effort:** 30 minutes
- **Fix:** Delete snapshots > 90 days, add Vercel cron

---

## How to Start

```bash
/gsd:new-milestone
```

Then reference this backlog when defining requirements.

---

*Run `/gsd:progress` to check project state when you return.*
