# Coding Conventions

**Analysis Date:** 2026-01-22

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `AssetCard.tsx`, `PortfolioTable.tsx`, `AlertModal.tsx`)
- Hooks: camelCase prefixed with `use` (e.g., `usePortfolio.ts`, `useAlerts.ts`, `useAuth.ts`)
- Utilities/libraries: camelCase (e.g., `email.ts`, `icons.ts`, `supabase.ts`)
- Route handlers: lowercase (e.g., `route.ts`, `callback/route.ts`)
- Types/interfaces: Separate `index.ts` files in type directories (e.g., `types/index.ts`)

**Functions:**
- camelCase for all function declarations
- Prefix hooks with `use` (e.g., `usePortfolio`, `useAlerts`, `checkAlerts`)
- API handlers: uppercase HTTP method names (`GET`, `POST`, `DELETE`, `PATCH`)
- Helper functions: descriptive camelCase (e.g., `getWalletKey`, `isValidChain`, `formatCurrency`, `getIconUrl`)

**Variables:**
- camelCase for all variables and constants
- Boolean variables/functions often prefixed: `is`, `has`, `can`, `should` (e.g., `isLoading`, `hasCheckedAlerts`, `isAuthenticated`)
- Constants in context: Local const within functions (no UPPER_CASE constants)
- Refs: Suffix with `Ref` for useRef hooks (e.g., `refreshIntervalRef`, `lastCheckRef`, `hasLoadedSavedWallets`)

**Types:**
- PascalCase for interfaces and types (e.g., `Asset`, `Alert`, `AlertCheckResult`, `Chain`)
- Use `type` for union types and simple aliases (e.g., `type Chain = 'bitcoin' | 'ethereum'`)
- Use `interface` for object shapes (e.g., `interface Asset { }`)

## Code Style

**Formatting:**
- No explicit Prettier config detected; uses ESLint defaults
- 2-space indentation (inferred from codebase)
- Single quotes for strings (as seen in imports and literals)
- Semicolons present throughout
- Trailing commas in multi-line objects/arrays

**Linting:**
- ESLint 9 with flat config (`eslint.config.mjs`)
- Uses `eslint-config-next/core-web-vitals` for Web Vitals compliance
- Uses `eslint-config-next/typescript` for TypeScript support
- Configured ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Import Organization

**Order:**
1. Built-in React/Next imports (`import { useState } from 'react'`)
2. Next.js specific imports (`import { NextRequest, NextResponse } from 'next/server'`)
3. Internal imports with `@/` alias (`import Header from '@/components/Header'`)
4. Type imports on same or separate line (`import type { Chain } from '@/types'`)

**Path Aliases:**
- `@/*` resolves to root of `app/` directory (configured in `tsconfig.json`)
- Used consistently throughout: `@/components`, `@/hooks`, `@/lib`, `@/types`

**Example from `page.tsx`:**
```typescript
import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import PortfolioSummary from '@/components/PortfolioSummary';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAlerts, type Alert, type AlertCheckResult } from '@/hooks/useAlerts';
import { useToast } from '@/components/ui/Toast';
import type { Chain } from '@/types';
```

## Error Handling

**Patterns:**
- Explicit try-catch blocks for async operations (fetch, API calls, JSON parsing)
- Errors captured as `Error` instances or typed as `unknown` then checked
- API errors logged with context prefix: `console.error('[Module] Description:', error)`
- HTTP error responses return `NextResponse.json({ error: 'message' }, { status: code })`
- Input validation before processing (status 400 for bad requests, 401 for auth)

**Example from `useAlerts.ts`:**
```typescript
try {
  const response = await fetch('/api/alerts');
  if (!response.ok) {
    throw new Error('Failed to fetch alerts');
  }
  const data = await response.json();
  setAlerts(data);
} catch (err) {
  console.error('[useAlerts] Error fetching alerts:', err);
  setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
} finally {
  setLoading(false);
}
```

**Example from API route (`route.ts`):**
```typescript
if (authError || !user) {
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
}

if (!type || !asset || !condition || threshold === undefined) {
  return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
}
```

## Logging

**Framework:** `console` (no dedicated logging library)

**Patterns:**
- Context prefixes in brackets: `[Module Name] or [FunctionName]`
- Used at key decision points and error conditions
- Examples: `[useAlerts]`, `[AlertCheck]`, `[Alerts API]`
- Console errors include the actual error object for debugging

**Example:**
```typescript
console.log(`[AlertCheck] Mapped symbol "${symbol}" to CoinGecko ID: "${coinId}"`);
console.error(`[AlertCheck] CoinGecko error for ${symbol}: status ${response.status}`);
console.error('[Alerts API] Error fetching alerts:', error);
```

## Comments

**When to Comment:**
- JSDoc-style comments for exported functions and types
- Inline comments for non-obvious logic or workarounds
- Section dividers for major logical blocks (e.g., `// Helper to create wallet key`)

**JSDoc/TSDoc:**
- Minimal usage observed
- API route handlers have JSDoc blocks with HTTP method and description:

**Example from `route.ts`:**
```typescript
/**
 * GET /api/alerts
 * Returns all alerts for the authenticated user
 */
export async function GET() { ... }

/**
 * POST /api/alerts
 * Create a new alert
 */
export async function POST(request: NextRequest) { ... }
```

## Function Design

**Size:**
- Components range 50-450 lines (with JSX)
- Hooks range 50-350 lines (including useState/effects)
- API routes 50-150 lines
- Utility functions 10-50 lines

**Parameters:**
- Props interfaces separate above component function
- Destructure immediately: `function MyComponent({ prop1, prop2 }: MyComponentProps)`
- API handlers receive `NextRequest` parameter for body access
- Callbacks wrapped in `useCallback` for stability

**Return Values:**
- Components return JSX elements
- Hooks return object with named properties (state + callbacks)
- API handlers return `NextResponse.json()`
- Utility functions return explicit types

## Module Design

**Exports:**
- Components export as `export default function ComponentName()`
- Hooks export as `export function useHookName()`
- Utilities export named functions: `export async function sendPriceAlertEmail()`
- Types exported at top of type files

**Barrel Files:**
- `types/index.ts` exports all types and config constants
- No barrel files in components or hooks directories (direct imports preferred)
- API routes export individual HTTP method handlers

**Example barrel pattern (`types/index.ts`):**
```typescript
export interface Asset { ... }
export type Chain = 'bitcoin' | 'ethereum' | ...;
export const CHAIN_CONFIG: Record<Chain, ChainConfig> = { ... };
```

## TypeScript Configuration

**Strict Mode:** Enabled (`"strict": true`)
- Full type safety enforced
- All return types must be explicit or inferable
- No implicit `any` allowed

**Key Settings:**
- `"target": "ES2017"` - Modern JavaScript target
- `"jsx": "preserve"` - Let Next.js handle JSX transformation
- `"moduleResolution": "bundler"` - Next.js bundler resolution

## Component Props Pattern

All component props defined in interfaces above the component:

**Example from `AssetCard.tsx`:**
```typescript
interface AssetCardProps {
  asset: Asset;
  index: number;
}

export default function AssetCard({ asset, index }: AssetCardProps) { ... }
```

This pattern is consistent across all components in `components/` directory.

---

*Convention analysis: 2026-01-22*
