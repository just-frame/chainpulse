# Vault

A chain-agnostic crypto portfolio tracker. Track spot holdings, staking, NFTs, and domains across 11 blockchains in one sleek dashboard.

**Live Demo:** [chainpulsetest1.vercel.app](https://chainpulsetest1.vercel.app)

**Version:** v0.6.0-alpha

---

## Features

### Multi-Chain Portfolio
- **11 chains supported:** Solana, Ethereum, Bitcoin, Hyperliquid, XRP, Dogecoin, Litecoin, Cardano, Tron, Zcash
- Auto-detects chain from wallet address
- Aggregates balances from multiple wallets
- Real-time USD values with 24h change
- **Search & filter** assets by name, symbol, or chain

### Assets, NFTs & Domains
- Full token holdings with exact amounts
- NFT display with spam filtering
- Domain support (.sol, .eth)
- Staking detection (LSDs, native staking, delegated)

### Price Alerts
- Set alerts for price above/below targets
- Percentage change alerts
- Toggle, edit, or delete alerts
- In-app toast notifications
- Email notifications (Resend)

### Auth & Privacy
- Email/password authentication
- Google OAuth sign-in
- Wallet persistence for signed-in users
- LocalStorage for anonymous users
- Row Level Security — your data is private

### Design System
- **Cypher Theme** — MGS2/MGS4 codec aesthetic
- JetBrains Mono typography throughout
- Angular, terminal-style components
- Dark mode (cool black #08090b)
- Wide-screen 12-column layout
- Mobile responsive with 44px touch targets
- Smooth animations (slide panels, fade transitions)

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS + CSS Variables
- **Auth & DB:** Supabase
- **Email:** Resend
- **Deployment:** Vercel

### Data Sources
| Chain | API |
|-------|-----|
| Solana | Helius DAS |
| Ethereum | Alchemy |
| Bitcoin | Mempool.space |
| Hyperliquid | Hyperliquid API |
| XRP | XRPL |
| Dogecoin/Litecoin | Blockcypher |
| Cardano | Koios |
| Tron | TronGrid |
| Zcash | Blockchair |
| Prices | CoinGecko + DeFiLlama |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- API keys: Helius, Alchemy (optional for enhanced data)

### Installation

```bash
# Clone the repo
git clone https://github.com/just-frame/chainpulse.git
cd chainpulse/app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# APIs
HELIUS_API_KEY=your_helius_key
ALCHEMY_API_KEY=your_alchemy_key

# Email (optional)
RESEND_API_KEY=your_resend_key
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Setup

Run the schema in your Supabase SQL Editor:

```sql
-- See supabase-schema.sql in project root
```

This creates:
- `wallets` — user wallet addresses
- `alerts` — price alert configurations
- `portfolio_snapshots` — historical data (for future sparklines)
- `portfolio_daily` — aggregated daily values
- `invite_codes` — invite system (not enabled)

All tables have Row Level Security enabled.

---

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Set Root Directory to `app`
3. Add environment variables
4. Deploy!

Auto-deploys on every push to `main`.

---

## Roadmap

### Completed (v0.6.0)
- Multi-chain support (11 chains)
- NFT & domain detection
- User authentication (email + Google)
- Price alerts with in-app + email notifications
- Asset search & filtering
- Wide-screen layout optimization
- Input validation & security hardening
- Mobile responsive
- Cypher theme (MGS codec aesthetic)
- Alerts slide panel UX fix
- 44px touch targets for mobile accessibility

### Next Up
- Portfolio charts (sparklines, historical)
- P&L tracking
- Vercel KV price caching
- Parallel chain fetches
- Graceful degradation (partial data on API failures)

### Future
- DeFi positions (LPs, lending)
- Telegram/Discord alerts
- Portfolio sharing
- Whale tracking

---

## Contributing

This is a personal project but PRs are welcome! Please open an issue first to discuss changes.

---

## License

MIT

---

Built for sovereign traders.
