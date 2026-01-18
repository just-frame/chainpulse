# Chainpulse

**Multi-chain portfolio tracker** — See all your crypto in one place.

`v0.1.0-alpha`

---

## Features

### Chains Supported
| Chain | Tokens | Staking | NFTs | Domains |
|-------|--------|---------|------|---------|
| **Hyperliquid** | ✅ Spot balances | ✅ Staked HYPE | — | — |
| **Solana** | ✅ All SPL tokens | — | ✅ Full collection | ✅ .sol domains |
| Ethereum | 🔜 Coming soon | | | |
| Bitcoin | 🔜 Coming soon | | | |

### What You Get

**Tokens**
- Real-time prices via DeFiLlama
- 24h price change
- Auto-refresh every 30 seconds
- Dust filtering (hides tokens worth < $1)

**NFTs** (Solana)
- Full collection display
- Purchase price + date (even from 2021)
- Collection names
- Spam filtering (removes fake airdrops)

**Domains** (Solana)
- .sol domain detection via Bonfida
- Registration date + cost

**Icons**
- CoinGecko for major tokens
- DexScreener fallback for meme coins
- Works for basically every token

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
# Required for Solana (get free key at helius.dev)
HELIUS_API_KEY=your_key_here
```

---

## Usage

1. **Add wallet** — Paste any address, chain auto-detects:
   - `0x...` → Hyperliquid
   - Base58 (32-44 chars) → Solana

2. **View portfolio** — See aggregated holdings across all wallets

3. **Track multiple wallets** — Add as many as you want, balances combine

4. **Auto-refresh** — Prices update every 30 seconds

---

## Tech Stack

- **Frontend**: Next.js 14, TailwindCSS
- **APIs**: 
  - Hyperliquid (native API)
  - Helius (Solana DAS)
  - Bonfida (SNS domains)
  - DeFiLlama (prices)
  - DexScreener (icons)

---

## Roadmap

- [ ] Ethereum + EVM chains
- [ ] Bitcoin tracking
- [ ] Price alerts
- [ ] Portfolio history charts
- [ ] User accounts (Supabase)
- [ ] Mobile app (iOS)

---

## Alpha Notice

This is early software. Expect bugs. Your wallet addresses are not stored anywhere — everything runs locally in your browser.

---

**v0.1.0-alpha** • January 2026
