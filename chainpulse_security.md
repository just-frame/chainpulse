# Chainpulse Security Documentation

**Internal Document — Red Team Reference**

---

## API Key Management

### Current Keys in Use

| Key | Service | Location | Exposure Risk |
|-----|---------|----------|---------------|
| `HELIUS_API_KEY` | Helius (Solana) | `.env.local` | Server-side only ✅ |
| `ALCHEMY_API_KEY` | Alchemy (Ethereum) | `.env.local` | Server-side only ✅ |

### Security Checklist

- [ ] Rotate keys after any accidental exposure (chat, logs, commits)
- [ ] Set domain restrictions in Alchemy dashboard
- [ ] Set domain restrictions in Helius dashboard
- [ ] Never commit `.env.local` to git (already in `.gitignore`)
- [ ] Use environment variables in production (Vercel/hosting provider)

---

## User Input Fields — Attack Surface

### 1. Wallet Address Input

**Location:** `app/components/WalletInput.tsx`

**Field:** Single text input for wallet addresses

| Test | Description | Status |
|------|-------------|--------|
| XSS | Inject `<script>` tags in address field | 🔴 Untested |
| SQL Injection | N/A (no SQL database yet) | ⚪ N/A |
| Oversized Input | Extremely long strings (10K+ chars) | 🔴 Untested |
| Unicode/Special Chars | Emojis, null bytes, RTL chars | 🔴 Untested |
| Format Bypass | Addresses that pass regex but are invalid | 🔴 Untested |
| Rate Limiting | Rapid-fire submissions | 🔴 No limit implemented |

**Current Validation:**
```typescript
// Ethereum/Hyperliquid: 0x + 40 hex chars
/^0x[a-fA-F0-9]{40}$/

// Solana: Base58, 32-44 chars
/^[1-9A-HJ-NP-Za-km-z]{32,44}$/

// Bitcoin: Multiple patterns (P2PKH, P2SH, Bech32)
```

**Recommendations:**
- [ ] Add input length limit (max 100 chars)
- [ ] Sanitize before rendering in UI
- [ ] Add rate limiting (max 10 wallets per session)
- [ ] Validate addresses server-side before API calls

---

### 2. Chain Selection

**Location:** `app/components/WalletInput.tsx`

**Field:** Button group for chain selection (when 0x address detected)

| Test | Description | Status |
|------|-------------|--------|
| Invalid Chain Value | Modify request to send unsupported chain | 🔴 Untested |
| Type Confusion | Send non-string chain value | 🔴 Untested |

**Current Validation:**
- Client-side only (TypeScript enum)
- Server accepts `chain` as query param without validation

**Recommendations:**
- [ ] Validate chain param server-side against allowed list
- [ ] Return 400 for invalid chain values

---

## API Routes — Attack Surface

### GET `/api/portfolio`

**Location:** `app/app/api/portfolio/route.ts`

**Parameters:**
- `address` (required) — wallet address
- `chain` (required) — blockchain identifier

| Test | Description | Status |
|------|-------------|--------|
| Missing Params | Omit address or chain | ✅ Returns 400 |
| Invalid Address Format | Garbage string | 🔴 Untested (may cause upstream API errors) |
| SSRF | Address that triggers internal network calls | 🔴 Untested |
| Rate Limiting | Flood endpoint | 🔴 No limit implemented |
| Response Size | Wallet with 10K+ tokens | 🔴 Untested |

**Recommendations:**
- [ ] Validate address format server-side before external API calls
- [ ] Add rate limiting (IP-based or session-based)
- [ ] Cap response size / token count
- [ ] Add request timeout handling

---

## External API Calls — Trust Boundaries

### Outbound Requests

| Service | Endpoint | Data Sent | Risk |
|---------|----------|-----------|------|
| Hyperliquid | `api.hyperliquid.xyz` | Wallet address | Low |
| Helius | `mainnet.helius-rpc.com` | Wallet address | Low |
| Alchemy | `eth-mainnet.g.alchemy.com` | Wallet address | Low |
| DeFiLlama | `coins.llama.fi` | Token contract addresses | Low |
| DexScreener | `api.dexscreener.com` | Token contract addresses | Low |
| Bonfida | `sns-sdk-proxy.bonfida.workers.dev` | Wallet address | Low |
| CoinGecko | `api.coingecko.com` | Token IDs | Low |

**Recommendations:**
- [ ] Add timeout to all external API calls
- [ ] Handle API failures gracefully (don't expose error details)
- [ ] Cache responses to reduce external calls
- [ ] Monitor for API deprecations/changes

---

## Future Security Considerations

### When Adding User Authentication (Supabase)

- [ ] Implement proper session management
- [ ] Add CSRF protection
- [ ] Secure password requirements
- [ ] Rate limit login attempts
- [ ] Email verification
- [ ] OAuth state parameter validation

### When Adding Alerts/Notifications

- [ ] Validate email addresses
- [ ] Rate limit alert creation
- [ ] Sanitize alert names/descriptions
- [ ] Prevent alert spam (cooldown periods)

### When Adding Database (Supabase)

- [ ] Use parameterized queries (Supabase handles this)
- [ ] Row-level security policies
- [ ] Audit logging for sensitive operations
- [ ] Data encryption at rest

---

## Incident Response

### If API Key is Exposed

1. Immediately rotate the key in provider dashboard
2. Update `.env.local` with new key
3. Redeploy if in production
4. Check provider logs for unauthorized usage
5. Document incident

### If Vulnerability is Found

1. Document reproduction steps
2. Assess severity (CVSS score)
3. Fix in development
4. Test fix
5. Deploy
6. Post-mortem

---

## Red Team Testing Checklist

### Pre-Launch (MVP)

- [ ] Input validation on all user fields
- [ ] Error handling doesn't leak internals
- [ ] API keys not exposed in client bundle
- [ ] Rate limiting on API routes
- [ ] CORS configured properly

### Post-Launch

- [ ] Penetration testing
- [ ] Dependency vulnerability scan (`npm audit`)
- [ ] Security headers (CSP, HSTS, etc.)
- [ ] Regular key rotation schedule

---

*Last updated: January 2026*
*Document owner: Internal*
