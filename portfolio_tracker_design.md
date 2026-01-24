# Chainpulse — Design Specification

> A chain-agnostic portfolio tracker that doesn't suck.

---

## Current Status: v0.5.0-alpha (LIVE)

**Production URL:** https://chainpulsetest1.vercel.app

### Latest Update (v0.5.0) — UI/UX Overhaul
Major design refinements focused on typography, spacing, and component polish.

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
- [x] **Asset search** — filter by name, symbol, or chain
- [x] Staking detection (Hyperliquid, Solana native, ETH LSDs, Cardano, Tron)
- [x] 24h change indicators (weighted by holdings)
- [x] NFT display with spam filtering
- [x] Domain display (.sol, .eth)
- [x] Tabbed navigation (Assets / NFTs / Domains)
- [x] Loading skeletons
- [x] Mobile responsive design
- [x] **Wide-screen layout** — 12-column grid for ultrawide displays
- [x] Toast notifications system
- [x] Auto-refresh every 30s

### Design System (v0.5 - "Obsidian Luxe" Refined)

#### Typography (NEW)
- [x] **Plus Jakarta Sans** — body text (replaces Inter)
- [x] **Instrument Sans** — display/headlines
- [x] **JetBrains Mono** — numbers and data

#### Component Redesigns (NEW)
- [x] **TimeRangeSelector** — larger touch targets, sliding indicator animation
- [x] **AlertsList** — compact one-line format, color-coded accent bars, live pulse indicator
- [x] **TabNav** — clean underline indicator with smooth animation, larger text
- [x] **Theme Selector** — circular swatches with accent borders, glow effects, checkmark indicator
- [x] **Tracked Wallets** — proper card container, green status dots, "WATCHING" header

#### Spacing & Layout (NEW)
- [x] **Increased padding** — cards 28px (up from 24px), mobile 24px
- [x] **Larger border-radius** — 20px (up from 16px)
- [x] **Table rows** — 18px padding for better scanning
- [x] **Grid gaps** — 8-10px between major sections

#### Core Design Elements
- [x] **Premium glass morphism** — backdrop-blur effects, subtle transparency layers
- [x] **Refined color system** — luminous accents with proper opacity hierarchy
- [x] **Enhanced CSS variables** — `--bg-glass`, `--accent-glow`, `--shadow-glow`, gradient overlays
- [x] **Shimmer loading animation** — replaces basic pulse for skeleton states
- [x] **Interactive row highlights** — accent line indicators on hover
- [x] **Display typography** — large monospace numbers with tight letter-spacing (-0.035em)
- [x] **Directional indicators** — arrows (↗/↘) with colored badges for price changes
- [x] **Icon glow effects** — chain-colored glow on asset icons
- [x] **Expandable cards** — mobile asset cards with smooth expand animation
- [x] **Fade-in-scale animations** — refined motion for dropdowns and modals

### Auth & User Experience
- [x] Email/password auth (Supabase)
- [x] Google OAuth sign-in
- [x] **User menu dropdown** — compact theme swatches + auth section
- [x] **4 color themes** — Noir, Bloomberg, Sakura, Ember (visual swatches with accent borders)
- [x] Wallet persistence (signed-in users)
- [x] LocalStorage fallback (anonymous users)
- [x] Row Level Security (RLS) — users can't see each other's data
- [x] Portfolio clears on sign-out (privacy)
- [x] Portfolio snapshots schema (ready for sparklines)

### Price Alerts
- [x] Alert creation modal UI
- [x] Alert types: price above/below, % change
- [x] Alert list with toggle/edit/delete
- [x] Duplicate alert prevention
- [x] Per-asset alerts stored in Supabase
- [x] RLS security on alerts table
- [x] **In-app toast notifications** when alerts trigger
- [x] Email notifications via Resend (requires domain verification)

### Security
- [x] **Input validation** — chain-specific address regex patterns
- [x] Address length limits
- [x] Chain whitelist validation
- [x] All user data isolated by RLS

### Deployment
- [x] Vercel (Hobby tier)
- [x] Supabase (Auth + DB)
- [x] GitHub integration (auto-deploy on push)

---

## 🚧 Planned (Phase 2)

### Analytics & Performance
- [ ] Sparkline charts (requires cron job — Pro tier or external cron)
- [ ] Historical portfolio value chart (1D, 1W, 1M, 1Y)
- [ ] P&L tracking
- [ ] Asset allocation breakdown

### DeFi Positions
- [ ] LP positions (Raydium, Orca, Uniswap)
- [ ] Lending positions (Aave, Kamino, MarginFi)
- [ ] Yield farming APYs

### Trading
- [ ] Swap integration (Jupiter, 1inch)
- [ ] Bridge support

### Social
- [ ] Portfolio sharing (public links)
- [ ] Whale wallet tracking
- [ ] Follow wallets

### Other
- [ ] Hyperliquid perps/positions
- [ ] Telegram/Discord notifications
- [ ] PWA / Mobile app
- [ ] Invite-only access system (built, not enabled)

---

## Tech Stack

```
Frontend:       Next.js 14 (App Router)
Styling:        TailwindCSS + CSS Variables (Obsidian Luxe design system)
Typography:     Plus Jakarta Sans, Instrument Sans, JetBrains Mono (Google Fonts)
Auth + DB:      Supabase
Email:          Resend
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

-- Invite Codes (not enabled yet)
invite_codes (
  id uuid PRIMARY KEY,
  code text UNIQUE,
  max_uses int,
  current_uses int,
  created_at timestamp
)
```

---

## Security

- ✅ Wallets are **read-only** — no private keys ever
- ✅ User data isolated by RLS (auth.uid() = user_id)
- ✅ API keys stored in environment variables
- ✅ No sensitive data in client bundle
- ✅ Alerts can only be viewed/modified by owner
- ✅ Input validation with chain-specific regex
- ✅ Address length limits (max 150 chars)
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
│   │       ├── portfolio/route.ts
│   │       ├── alerts/route.ts
│   │       ├── alerts/check/route.ts
│   │       └── invite/route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Skeleton.tsx
│   │   │   └── Toast.tsx
│   │   ├── Header.tsx
│   │   ├── UserMenu.tsx
│   │   ├── PortfolioSummary.tsx
│   │   ├── PortfolioTable.tsx
│   │   ├── AssetRow.tsx
│   │   ├── AssetCard.tsx
│   │   ├── NFTGrid.tsx
│   │   ├── DomainList.tsx
│   │   ├── TabNav.tsx
│   │   ├── WalletInput.tsx
│   │   ├── AuthModal.tsx
│   │   ├── AlertModal.tsx
│   │   ├── AlertsList.tsx
│   │   ├── InviteCodeModal.tsx
│   │   ├── Sparkline.tsx
│   │   ├── TimeRangeSelector.tsx
│   │   └── Providers.tsx
│   ├── hooks/
│   │   ├── usePortfolio.ts
│   │   ├── useAuth.ts
│   │   ├── useWallets.ts
│   │   ├── useAlerts.ts
│   │   ├── useTheme.ts
│   │   └── usePortfolioHistory.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── supabase-server.ts
│   │   ├── email.ts
│   │   └── chains/
│   │       └── [10 chain modules]
│   └── types/index.ts
├── supabase-schema.sql
└── portfolio_tracker_design.md
```

---

## Let's Ship 🚀
