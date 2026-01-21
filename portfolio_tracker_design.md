# Chainpulse — Design Specification

> A chain-agnostic portfolio tracker that doesn't suck.

---

## Current Status: v0.2.0-alpha (LIVE)

**Production URL:** https://chainpulsetest1.vercel.app

---

## ✅ Completed Features

### Supported Chains (11 total)
| Chain | What We Track | Status |
|-------|---------------|--------|
| **Hyperliquid L1** | HYPE spot + staked | ✅ |
| **Solana** | SOL, SPL tokens, staking, NFTs, domains | ✅ |
| **Ethereum** | ETH, ERC-20, LSDs (stETH, rETH), NFTs, ENS | ✅ |
| **Bitcoin** | BTC balance | ✅ |
| **XRP** | XRP balance | ✅ |
| **Dogecoin** | DOGE balance | ✅ |
| **Litecoin** | LTC balance | ✅ |
| **Cardano** | ADA balance + staking | ✅ |
| **Tron** | TRX, TRC-20, freeze staking | ✅ |
| **Zcash** | ZEC (transparent addresses) | ✅ |

### Core Features
- [x] Wallet address input with auto-chain detection
- [x] Multi-wallet support
- [x] Portfolio total value (USD)
- [x] Individual asset breakdown
- [x] Staking detection (Hyperliquid, Solana native, ETH LSDs, Cardano, Tron)
- [x] 24h change indicators (weighted by holdings)
- [x] NFT display with spam filtering
- [x] Domain display (.sol, .eth)
- [x] Tabbed navigation (Assets / NFTs / Domains)
- [x] Loading skeletons
- [x] Mobile responsive design
- [x] Toast notifications system
- [x] Auto-refresh every 30s

### Auth & Data
- [x] Email/password auth (Supabase)
- [x] Wallet persistence (signed-in users)
- [x] LocalStorage fallback (anonymous users)
- [x] Row Level Security (RLS) — users can't see each other's data
- [x] Portfolio clears on sign-out (privacy)
- [x] Portfolio snapshots schema (ready for sparklines)

### Price Alerts (Phase 1.5 — COMPLETE)
- [x] Alert creation modal UI
- [x] Alert types: price above/below, % change
- [x] Alert list with toggle/edit/delete
- [x] Duplicate alert prevention
- [x] Per-asset alerts stored in Supabase
- [x] RLS security on alerts table

### Deployment
- [x] Vercel (Hobby tier)
- [x] Supabase (Auth + DB)
- [x] GitHub integration (auto-deploy on push)

---

## 🚧 Remaining (Phase 1.5)

### Email Notifications
- [ ] Resend integration for alert emails
- [ ] Background job to check alert conditions
- [ ] Email templates for price alerts

---

## 📋 Phase 2 (Future)

- [ ] Sparkline charts (requires cron job — Pro tier or external cron)
- [ ] Historical portfolio value chart
- [ ] OAuth (Google)
- [ ] Web3 sign-in (wallet connect)
- [ ] Hyperliquid perps/positions
- [ ] LP positions + DeFi protocols
- [ ] Telegram/Discord notifications
- [ ] Whale movement alerts
- [ ] Multiple themes
- [ ] PWA / Mobile app
- [ ] Portfolio sharing (public links)

---

## Tech Stack

```
Frontend:       Next.js 14 (App Router)
Styling:        TailwindCSS + CSS Variables
Auth + DB:      Supabase
Deployment:     Vercel

Data Sources:
├── Solana      → Helius DAS API
├── Ethereum    → Alchemy
├── Bitcoin     → Mempool.space
├── Hyperliquid → Hyperliquid API
├── XRP         → XRPL API
├── Dogecoin    → Blockcypher
├── Litecoin    → Blockcypher
├── Cardano     → Koios API
├── Tron        → TronGrid
├── Zcash       → Blockchair
└── Prices      → DeFiLlama + CoinGecko
```

---

## Database Schema (Supabase)

```sql
-- Wallets (with RLS)
wallets (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  address text NOT NULL,
  chain text NOT NULL,
  label text,
  created_at timestamp
)

-- Alerts (with RLS)
alerts (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  type text, -- 'price', 'percent_change'
  asset text,
  asset_name text,
  condition text, -- 'above', 'below'
  threshold numeric,
  enabled boolean DEFAULT true,
  last_triggered timestamp,
  created_at timestamp
)

-- Portfolio Snapshots (for sparklines)
portfolio_snapshots (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  total_value numeric,
  value_by_chain jsonb,
  created_at timestamp
)

-- Daily Aggregates (for long-term charts)
portfolio_daily (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  date date,
  open_value numeric,
  close_value numeric,
  high_value numeric,
  low_value numeric,
  UNIQUE(user_id, date)
)
```

---

## Security

- ✅ Wallets are **read-only** — no private keys ever
- ✅ User data isolated by RLS (auth.uid() = user_id)
- ✅ API keys stored in environment variables
- ✅ No sensitive data in client bundle
- ✅ Alerts can only be viewed/modified by owner
- See `chainpulse_security.md` for full audit

---

## File Structure

```
portfolio-tracker/
├── app/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       ├── portfolio/
│   │       │   ├── route.ts
│   │       │   └── history/route.ts
│   │       ├── alerts/route.ts
│   │       └── cron/snapshot/route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Skeleton.tsx
│   │   │   └── Toast.tsx
│   │   ├── Header.tsx
│   │   ├── PortfolioSummary.tsx
│   │   ├── PortfolioTable.tsx
│   │   ├── AssetRow.tsx
│   │   ├── NFTGrid.tsx
│   │   ├── DomainList.tsx
│   │   ├── TabNav.tsx
│   │   ├── WalletInput.tsx
│   │   ├── AuthModal.tsx
│   │   ├── AlertModal.tsx
│   │   ├── AlertsList.tsx
│   │   └── Providers.tsx
│   ├── hooks/
│   │   ├── usePortfolio.ts
│   │   ├── useAuth.ts
│   │   ├── useWallets.ts
│   │   ├── useAlerts.ts
│   │   └── usePortfolioHistory.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── supabase-server.ts
│   │   └── chains/
│   │       ├── bitcoin.ts
│   │       ├── cardano.ts
│   │       ├── dogecoin.ts
│   │       ├── ethereum.ts
│   │       ├── hyperliquid.ts
│   │       ├── litecoin.ts
│   │       ├── solana.ts
│   │       ├── tron.ts
│   │       ├── xrp.ts
│   │       └── zcash.ts
│   └── types/index.ts
├── supabase-schema.sql
├── chainpulse_security.md
└── portfolio_tracker_design.md
```

---

## Let's Ship 🚀
