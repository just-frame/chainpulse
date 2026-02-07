# Vault

**Multi-chain portfolio tracker** — See all your crypto in one place.

`v0.6.0-alpha`

---

## Features

### Chains Supported (11 total)
| Chain | Tokens | Staking | NFTs | Domains |
|-------|--------|---------|------|---------|
| **Hyperliquid** | Spot balances | Staked HYPE | — | — |
| **Solana** | All SPL tokens | Native staking | Full collection | .sol domains |
| **Ethereum** | ETH + ERC-20 | LSDs (stETH, rETH) | Full collection | ENS domains |
| **Bitcoin** | BTC balance | — | — | — |
| **XRP** | XRP balance | — | — | — |
| **Dogecoin** | DOGE balance | — | — | — |
| **Litecoin** | LTC balance | — | — | — |
| **Cardano** | ADA balance | Staking rewards | — | — |
| **Tron** | TRX + TRC-20 | Freeze staking | — | — |
| **Zcash** | ZEC (transparent) | — | — | — |

### Core Features
- Real-time prices via DeFiLlama + CoinGecko
- 24h price change (weighted by holdings)
- Auto-refresh every 30 seconds
- Dust filtering (hides tokens worth < $1)
- Asset search (filter by name, symbol, or chain)
- NFT display with spam filtering
- Domain display (.sol, .eth)
- Price alerts with in-app + email notifications

### Design
- **Cypher Theme** — MGS2/MGS4 codec aesthetic
- JetBrains Mono typography
- Angular, terminal-style UI
- Dark mode only

---

## Quick Start

```bash
cd app
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000)

### Environment Variables

Create `app/.env.local`:

```env
# Solana (get free key at helius.dev)
HELIUS_API_KEY=your_key_here

# Ethereum (optional, for EVM chains)
ALCHEMY_API_KEY=your_key_here

# Supabase (for auth + persistence)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# Email notifications (optional)
RESEND_API_KEY=your_key
```

---

## Usage

1. **Add wallet** — Paste any address, chain auto-detects
2. **View portfolio** — See aggregated holdings across all wallets
3. **Track multiple wallets** — Add as many as you want, balances combine
4. **Set alerts** — Get notified when prices cross your targets
5. **Sign in** — Sync wallets across devices (Google OAuth or email)

---

## Tech Stack

- **Frontend**: Next.js 14, TailwindCSS, JetBrains Mono
- **Auth + DB**: Supabase
- **Email**: Resend
- **Deployment**: Vercel

**Data Sources:**
- Helius (Solana)
- Alchemy (Ethereum)
- Mempool.space (Bitcoin)
- DeFiLlama + CoinGecko (prices)
- DexScreener (token icons)

---

## Alpha Notice

This is early software. Wallet addresses are **read-only** — no private keys ever.

---

**v0.6.0-alpha** • January 2026
