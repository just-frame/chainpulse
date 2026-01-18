# Portfolio Tracker — Design Specification

> A chain-agnostic portfolio tracker that doesn't suck.

---

## Vision

Track all your crypto assets in one place — Bitcoin, Ethereum, Solana, Hyperliquid, and beyond. Sleek, fast, private.

---

## Phase 1 Scope (MVP)

### Supported Chains
| Chain | What We Track | Primary API | Fallback |
|-------|---------------|-------------|----------|
| **Hyperliquid L1** | HYPE spot, staked, rewards | Hyperliquid API | Zerion |
| **HyperEVM** | ERC-20 tokens | Hyperliquid API | — |
| **Bitcoin** | BTC balance | Mempool.space | Blockstream |
| **Ethereum** | ETH + ERC-20 | Alchemy | Moralis |
| **Solana** | SOL + SPL tokens | Helius | Shyft |
| **Prices** | All assets | CoinGecko | DeFiLlama |

### Core Features
- [ ] Wallet address input (read-only tracking)
- [ ] Multi-wallet support
- [ ] Portfolio total value (USD)
- [ ] Individual asset breakdown
- [ ] Staked HYPE detection + rewards
- [ ] 24h change indicators
- [ ] Sparkline charts (7D)

### Auth
- [ ] Email/password
- [ ] OAuth (Google)
- [ ] Web3 sign-in (optional)

### Alerts (Phase 1.5)
- [ ] Price alerts (email + in-app)
- [ ] Portfolio value thresholds

---

## Phase 2 (Future)

- Hyperliquid perps/positions tracking
- LP positions + DeFi protocols
- Historical portfolio value chart
- Telegram/Discord notifications
- Whale movement alerts
- Multiple themes
- Mobile app (PWA or native)

---

## Tech Stack

```
Frontend:       Next.js 14 (App Router)
Styling:        TailwindCSS + CSS Variables
Animations:     Framer Motion (subtle)
Auth + DB:      Supabase
Cache:          Upstash Redis
Deployment:     Vercel

Data Sources:
├── Solana      → Helius
├── Ethereum    → Alchemy  
├── Bitcoin     → Mempool.space
├── Hyperliquid → Hyperliquid API
└── Prices      → CoinGecko
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│               Next.js 14 + TailwindCSS + Framer             │
│          Dark mode default • Responsive • Clean             │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                       API LAYER                             │
│                   Next.js API Routes                        │
│    • /api/portfolio    • /api/prices    • /api/alerts       │
└─────────────────────────┬───────────────────────────────────┘
                          │
    ┌─────────────────────┼─────────────────────┐
    ▼                     ▼                     ▼
┌────────┐          ┌──────────┐          ┌──────────┐
│Supabase│          │ Upstash  │          │  Chain   │
│  Auth  │          │  Redis   │          │  APIs    │
│   DB   │          │  Cache   │          │          │
└────────┘          └──────────┘          └────┬─────┘
                                               │
      ┌──────────┬──────────┬──────────┬───────┴───────┐
      ▼          ▼          ▼          ▼               ▼
 ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     ┌──────────┐
 │ Helius │ │Alchemy │ │Hyper-  │ │Mempool │     │ CoinGecko│
 │(Solana)│ │ (EVM)  │ │liquid  │ │ (BTC)  │     │ (Prices) │
 └────────┘ └────────┘ └────────┘ └────────┘     └──────────┘
```

---

## Database Schema (Supabase)

```sql
-- Users
users (
  id uuid PRIMARY KEY,
  email text,
  created_at timestamp
)

-- Wallets  
wallets (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  address text NOT NULL,
  chain text NOT NULL, -- 'ethereum', 'solana', 'bitcoin', 'hyperliquid'
  label text,
  created_at timestamp
)

-- Alerts
alerts (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  type text, -- 'price', 'portfolio_value', 'percent_change'
  asset text,
  condition text, -- 'above', 'below'
  threshold numeric,
  enabled boolean DEFAULT true,
  created_at timestamp
)
```

---

## Aesthetic Direction

**Inspiration:** checkprice.com (Dieter Rams theme vibes)

### Design Principles
1. **Dark by default** — Deep blacks (#0a0a0a), not gray
2. **Color discipline** — Only green/red for price action
3. **Typography-driven** — Let the numbers speak
4. **Data-dense, not cluttered** — Every pixel earns its place
5. **No decoration** — No gradients, no shadows, no glow
6. **Feels like a tool** — Professional, not playful

### Color Tokens (CSS Variables)
```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #111111;
  --bg-tertiary: #1a1a1a;
  
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --text-muted: #666666;
  
  --accent-green: #22c55e;
  --accent-red: #ef4444;
  
  --border: #222222;
}
```

### Typography
- Font: Inter or SF Pro (system)
- Monospace for numbers: JetBrains Mono or SF Mono
- Sizes: 12px (labels), 14px (body), 16px (emphasis), 24px+ (hero numbers)

---

## File Structure

```
portfolio-tracker/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Dashboard
│   ├── globals.css
│   ├── api/
│   │   ├── portfolio/
│   │   ├── prices/
│   │   └── alerts/
│   └── (auth)/
│       ├── login/
│       └── signup/
├── components/
│   ├── ui/                   # Primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── PortfolioTable.tsx
│   ├── AssetRow.tsx
│   ├── Sparkline.tsx
│   ├── WalletInput.tsx
│   └── Header.tsx
├── lib/
│   ├── supabase.ts
│   ├── chains/
│   │   ├── bitcoin.ts
│   │   ├── ethereum.ts
│   │   ├── solana.ts
│   │   └── hyperliquid.ts
│   └── prices.ts
├── hooks/
│   ├── usePortfolio.ts
│   └── usePrices.ts
└── types/
    └── index.ts
```

---

## API Endpoints

### GET /api/portfolio?address={address}&chain={chain}
Returns holdings for a single wallet.

### GET /api/portfolio/aggregate?userId={userId}
Returns combined holdings across all user wallets.

### GET /api/prices?symbols=BTC,ETH,SOL,HYPE
Returns current prices + 24h change.

### POST /api/alerts
Create a new alert.

### GET /api/alerts?userId={userId}
List user's alerts.

---

## Security

- Wallets are **read-only** — we never ask for private keys
- User data isolated by user_id (RLS in Supabase)
- No wallet addresses exposed in URLs
- Rate limiting on API routes

---

## Deployment

| Service | Purpose | Cost |
|---------|---------|------|
| Vercel | Frontend + API | Free tier |
| Supabase | Auth + DB | Free tier (500MB) |
| Upstash | Redis cache | Free tier |

**Total cost to start: $0**

---

## Success Metrics (Phase 1)

- [ ] Can add a Hyperliquid address and see staked HYPE
- [ ] Can add BTC/ETH/SOL addresses and see balances
- [ ] Portfolio total updates in real-time
- [ ] Looks as good as checkprice
- [ ] Works on mobile
- [ ] Auth works (can save wallets)

---

## Let's Ship 🚀
