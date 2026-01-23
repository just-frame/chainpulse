# Codebase Structure

**Analysis Date:** 2026-01-22

## Directory Layout

```
portfolio-tracker/
├── app/                           # Next.js application root
│   ├── app/                       # App Router directory
│   │   ├── api/                   # API routes
│   │   │   ├── portfolio/         # Portfolio data fetching
│   │   │   ├── alerts/            # Alert CRUD operations
│   │   │   └── cron/              # Background job endpoints
│   │   ├── auth/                  # Authentication endpoints
│   │   ├── page.tsx               # Main dashboard page
│   │   ├── layout.tsx             # Root layout with Providers
│   │   └── globals.css            # Global styles + theme definitions
│   ├── components/                # Reusable React components
│   │   ├── ui/                    # Base UI primitives (Toast, Skeleton)
│   │   └── [Component].tsx        # Feature components
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utility & service functions
│   │   ├── chains/                # Blockchain-specific integrations
│   │   ├── supabase.ts            # Client Supabase instance
│   │   ├── supabase-server.ts     # Server Supabase instance
│   │   ├── email.ts               # Email service wrapper
│   │   └── icons.ts               # Icon utility functions
│   ├── types/                     # TypeScript type definitions
│   ├── public/                    # Static assets
│   ├── package.json               # Dependencies & scripts
│   ├── next.config.mjs            # Next.js configuration
│   ├── tsconfig.json              # TypeScript configuration
│   ├── tailwind.config.js         # Tailwind CSS config
│   ├── postcss.config.mjs         # PostCSS config (Tailwind)
│   └── .env.local                 # Environment variables (secrets)
├── agents/                        # Agent specifications (GSD)
├── .planning/                     # GSD planning documents
└── CLAUDE.md                      # Project instructions
```

## Directory Purposes

**`app/app/`:**
- Purpose: Next.js App Router directory (server entry points, routes, layouts)
- Contains: Page components, API routes, layout hierarchy, authentication flows
- Key files: `page.tsx` (main dashboard), `layout.tsx` (root provider setup)

**`app/components/`:**
- Purpose: Reusable React components organized by feature
- Contains: UI components (Header, PortfolioTable, WalletInput, AlertModal, etc.)
- Subdirectories: `ui/` (base primitives like Toast, Skeleton)
- Pattern: Named exports, no barrel files (import from specific paths)

**`app/hooks/`:**
- Purpose: Custom React hooks for state management and business logic
- Contains: usePortfolio (state machine), useAlerts, useAuth, useWallets, useTheme, usePortfolioHistory
- Pattern: `'use client'` directive (client-side only), no server component hooks

**`app/lib/`:**
- Purpose: Shared utility functions, API clients, service wrappers
- Subdirectories:
  - `chains/` - Blockchain-specific integrations (getSolanaPortfolio, getEthereumPortfolio, etc.)
  - Root: Supabase clients, email service, icon utilities
- Pattern: Named exports, no async module top-level

**`app/lib/chains/`:**
- Purpose: Multi-chain portfolio data fetching and aggregation
- Contains: One file per chain (solana.ts, ethereum.ts, bitcoin.ts, etc.)
- Each exports: `getXPortfolio()` or `getXHoldings()` returning Asset[], NFT[], Domain[]
- Pattern: Internal caching where needed (e.g., Solana portfolio cache with 60s TTL)

**`app/types/`:**
- Purpose: Shared TypeScript type definitions
- Contains: `index.ts` with interfaces: Asset, NFT, Domain, Chain, Alert, User, Portfolio, etc.
- Pattern: Single barrel file, all exports from root
- Key exports: Discriminated union `Chain`, CHAIN_CONFIG record for metadata

**`app/public/`:**
- Purpose: Static assets served by Next.js
- Contains: favicon.ico, images
- Pattern: Referenced by absolute path `/` (e.g., `/favicon.ico`)

## Key File Locations

**Entry Points:**
- `app/app/page.tsx` - Main dashboard (root route /)
- `app/app/layout.tsx` - Root HTML layout, font loading, Providers wrapper
- `app/app/api/portfolio/route.ts` - GET portfolio for wallet+chain
- `app/app/api/alerts/route.ts` - CRUD operations on alerts
- `app/app/auth/callback/route.ts` - OAuth callback handler

**Configuration:**
- `app/next.config.mjs` - Image domain whitelist (CoinGecko, DexScreener, Helius, etc.)
- `app/tsconfig.json` - Path aliases (@/components, @/lib, @/types, @/hooks)
- `app/tailwind.config.js` - Tailwind configuration
- `app/postcss.config.mjs` - PostCSS + Tailwind integration
- `app/.env.local` - Environment secrets (SUPABASE_URL, SUPABASE_ANON_KEY, HELIUS_API_KEY, etc.)

**Core Logic:**
- `app/hooks/usePortfolio.ts` - Portfolio state machine (330 lines, most complex hook)
- `app/hooks/useAlerts.ts` - Alert management + polling
- `app/hooks/useAuth.ts` - Supabase auth state management
- `app/hooks/useWallets.ts` - Wallet persistence (Supabase CRUD)
- `app/lib/chains/solana.ts` - Solana portfolio fetching (Helius DAS API)
- `app/lib/chains/ethereum.ts` - Ethereum + Polygon + Base holdings

**Styling:**
- `app/app/globals.css` - Global styles + 4 theme definitions (noir, bloomberg, sakura, ember)
- Theme system: CSS variables (--bg-primary, --text-primary, --accent-blue, etc.)
- Active theme: Set via `document.documentElement.setAttribute('data-theme', themeName)`

**Components:**
- `app/components/Header.tsx` - Top navigation bar
- `app/components/PortfolioSummary.tsx` - Total value + 24h change card
- `app/components/PortfolioTable.tsx` - Asset holdings table
- `app/components/AlertModal.tsx` - Create/edit alert form
- `app/components/AlertsList.tsx` - List of saved alerts with toggle/delete
- `app/components/WalletInput.tsx` - Add new wallet form
- `app/components/NFTGrid.tsx` - NFT gallery view
- `app/components/DomainList.tsx` - Domain holdings list
- `app/components/TabNav.tsx` - Tab switcher (Assets/NFTs/Domains)
- `app/components/Providers.tsx` - Client-side context providers

**UI Primitives:**
- `app/components/ui/Toast.tsx` - Toast provider + useToast hook
- `app/components/ui/Skeleton.tsx` - Placeholder loading state

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g., Header.tsx, PortfolioTable.tsx)
- Hooks: `camelCase.ts` with `use` prefix (e.g., usePortfolio.ts)
- Utilities/Services: `camelCase.ts` (e.g., email.ts, icons.ts)
- Type definitions: `index.ts` in types/ directory
- API routes: `route.ts` in nested directories matching route structure

**Directories:**
- Feature components: `app/components/` (top-level, no nesting)
- Hooks: `app/hooks/` (all at same level)
- Chains: `app/lib/chains/` (one file per blockchain)
- API routes: `app/app/api/[feature]/route.ts` (directory per endpoint)

**TypeScript Types & Interfaces:**
- PascalCase: `Asset`, `Alert`, `NFT`, `Chain`, `User`
- Discriminated unions: `type Chain = 'bitcoin' | 'ethereum' | ...`
- Suffix `Data` for fetch responses: `WalletData`, `PortfolioData`
- Suffix `Return` for hook return types: `UsePortfolioReturn`, `UseAlertsReturn`

**Functions:**
- camelCase (e.g., `getSolanaPortfolio`, `fetchWalletData`, `getWalletKey`)
- Helper functions: prefix with underscore if internal only (not exported)
- Async functions: no special prefix, but return type clearly indicates Promise

## Where to Add New Code

**New Feature (Multi-part addition):**
1. **Types:** Add interface to `app/types/index.ts` (e.g., new alert type)
2. **Hook:** Create `app/hooks/use[Feature].ts` for state management
3. **Component:** Create `app/components/[Feature].tsx` for UI
4. **API Route:** Create `app/app/api/[feature]/route.ts` for backend
5. **Integration:** Wire hook into page or existing component via props

**New Component/Module:**
- Single-use component: `app/components/[Feature].tsx` (inline in page.tsx as needed)
- Reusable component: `app/components/[Feature].tsx` (export, import where used)
- UI primitive: `app/components/ui/[Primitive].tsx` + export from index

**New Blockchain Chain:**
1. Create `app/lib/chains/[chainname].ts`
2. Export `get[Chain]Portfolio(address: string): Promise<{ assets: Asset[], nfts: NFT[], domains: Domain[] }>`
3. Add chain to `ALLOWED_CHAINS` array in `app/app/api/portfolio/route.ts`
4. Add address validation regex to `ADDRESS_PATTERNS` in same file
5. Add route handler in `/api/portfolio` to call new function
6. Add chain to `Chain` union type in `app/types/index.ts`
7. Add CHAIN_CONFIG entry in `app/types/index.ts` for metadata (name, icon, color)

**New Utility/Helper:**
- Shared across components: `app/lib/[utility].ts` (e.g., lib/email.ts, lib/icons.ts)
- Chain-agnostic: `app/lib/[utility].ts`
- Chain-specific: `app/lib/chains/[chain].ts`

**New Hook:**
- Client-side state logic: `app/hooks/use[Feature].ts`
- Pattern: `'use client'` directive at top, export named function, return object with state + methods
- Example structure: useState for state, useCallback for async operations, useEffect for subscriptions

**New API Route:**
- Query/read operation: `app/app/api/[feature]/route.ts` with GET handler
- Create/update: POST handler in same file
- Delete: DELETE handler in same file
- Nested routes: `app/app/api/[feature]/[subfeature]/route.ts`

## Special Directories

**`.planning/`:**
- Purpose: GSD codebase mapping documents
- Generated: By `/gsd:map-codebase` command
- Committed: Yes (tracked in git)
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md

**`agents/`:**
- Purpose: GSD agent specifications
- Generated: As needed by project requirements
- Committed: Yes
- Contents: Agent specs for QA, implementation, research, etc.

**`node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in .gitignore)

**`.env.local`:**
- Purpose: Environment-specific secrets and configuration
- Generated: No (manual creation required)
- Committed: No (in .gitignore)
- Required vars: SUPABASE_URL, SUPABASE_ANON_KEY, HELIUS_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, RESEND_API_KEY

**`.next/`:**
- Purpose: Build output directory
- Generated: Yes (by `npm run build`)
- Committed: No
- Contents: Compiled Next.js pages, static optimization data

---

*Structure analysis: 2026-01-22*
