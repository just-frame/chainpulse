# Testing Patterns

**Analysis Date:** 2026-01-22

## Test Framework

**Status:** Not detected - No tests present in codebase

- No Jest config found
- No Vitest config found
- No test files (`.test.ts`, `.test.tsx`, `.spec.ts`) in source directories
- No test runner configured in `package.json`
- `package.json` contains no testing dependencies (jest, vitest, testing-library, etc.)

**Recommended Setup (if needed):**
For a Next.js 14 project with React 18 and TypeScript, consider:
- **Jest** with `@testing-library/react` and `@testing-library/jest-dom`
- **Vitest** as a faster alternative for unit tests
- **Playwright** or **Cypress** for E2E testing

## Current Testing Approach

**Validation:**
- Input validation exists at API route layer (type checks, address format validation)
- Example from `app/api/portfolio/route.ts`:
  - Address pattern validation using RegExp per chain
  - Type validation for required fields
  - Status codes indicate validation failures (400, 401)

**Type Safety:**
- TypeScript strict mode catches many errors at compile time
- Interfaces enforce shape contracts (`Asset`, `Alert`, `Chain`)
- Type imports used for compile-time safety: `import type { Asset }`

**Runtime Checks:**
- Condition validation in API handlers: `if (!['price', 'percent_change'].includes(type))`
- Authentication checks: `if (authError || !user) { return 401 }`
- Optional chaining and nullish coalescing: `data?.error || 'Default message'`

## Data Validation Pattern (No Tests)

**From `app/api/portfolio/route.ts`:**
```typescript
const ADDRESS_PATTERNS: Record<string, RegExp> = {
  ethereum: /^0x[a-fA-F0-9]{40}$/,
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  bitcoin: /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{39,59})$/,
  // ... other chains
};

function isValidChain(chain: string): chain is Chain {
  return ALLOWED_CHAINS.includes(chain as Chain);
}

function isValidAddress(address: string, chain: Chain): boolean {
  const pattern = ADDRESS_PATTERNS[chain];
  if (!pattern) return false;
  return pattern.test(address);
}
```

These validation functions are called in route handlers but are not covered by automated tests.

## Hooks Testing Approach (No Tests)

**From `hooks/usePortfolio.ts`:**

Hooks use common React testing patterns but no test files:
- State management with `useState`
- Effects with `useEffect` for initialization
- Refs (`useRef`) for tracking mount state and preventing duplicate loads
- Memoization with `useMemo` for derived state

```typescript
const hasMounted = useRef(false);
const hasLoadedSavedWallets = useRef(false);

useEffect(() => {
  setHasMounted(true);
  try {
    const saved = localStorage.getItem('chainpulse_wallets');
    if (saved) {
      const parsed = JSON.parse(saved);
      // ...
    }
  } catch (e) {
    console.error('Error loading wallets from localStorage:', e);
  }
}, []);
```

If tests were implemented, this pattern would require:
- Mock localStorage
- Mock fetch for API calls
- Act() wrapper for state updates

## Component Testing Approach (No Tests)

**From `components/AssetCard.tsx`:**

Components use local state and props but lack integration tests:
- `useState` for UI state (image errors, expanded state)
- Props-driven rendering
- Event handlers attached to buttons and clickable elements

```typescript
interface AssetCardProps {
  asset: Asset;
  index: number;
}

export default function AssetCard({ asset, index }: AssetCardProps) {
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div onClick={() => setExpanded(!expanded)}>
      {/* ... */}
    </div>
  );
}
```

Testing would require:
- Render component with mock Asset prop
- Verify image load error handling
- Click handlers toggle expanded state
- Snapshot testing for DOM structure

## API Route Testing Approach (No Tests)

**From `app/api/alerts/route.ts`:**

API routes use standard Next.js patterns with error handling but no test coverage:

```typescript
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('[Alerts API] Error fetching alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }

  return NextResponse.json(alerts || []);
}
```

If tests existed, they would:
- Mock Supabase client
- Verify auth checks return 401
- Verify database errors return 500
- Verify successful response structure

## Potential Test File Locations

If tests were added, follow Next.js conventions:

**Unit Tests (co-located):**
```
hooks/
  usePortfolio.ts
  usePortfolio.test.ts

lib/
  email.ts
  email.test.ts
```

**Component Tests:**
```
components/
  AssetCard.tsx
  AssetCard.test.tsx

  AlertModal.tsx
  AlertModal.test.tsx
```

**Integration/Route Tests:**
```
app/
  api/
    alerts/
      route.ts
      route.test.ts
```

## Validation Patterns (No Automated Tests)

Currently, validation happens at runtime but is not tested:

1. **API Route Validation** - `app/api/portfolio/route.ts`:
   - Address format per chain
   - Chain type validation
   - Required field presence

2. **Input Sanitization** - `components/WalletInput.tsx`:
   - Likely validates user input before submission
   - Format checking before API call

3. **Error State Handling** - All hooks have error states:
   ```typescript
   const [error, setError] = useState<string | null>(null);
   ```

## Manual Testing Indicators

**Logging suggests manual test coverage:**
- Contextual console.logs with prefixes: `[AlertCheck]`, `[useAlerts]`, `[Alerts API]`
- Price checking logic logged: `console.log('[AlertCheck] Returning cached price...')`
- Error details logged for debugging

This indicates active manual testing during development but no automated test suite.

## Recommended Testing Strategy

**Priority 1 - Unit Tests:**
- Validation functions in `lib/` (address formats, type guards)
- Utility functions like `getWalletKey()`, `formatCurrency()`
- Hook logic with mock Supabase and localStorage

**Priority 2 - Integration Tests:**
- API routes with mocked Supabase
- Alert checking logic end-to-end

**Priority 3 - E2E Tests:**
- Critical user flows (add wallet, create alert, view portfolio)
- Cross-browser compatibility

**Test Command Pattern (if implemented):**
```bash
npm test                    # Run all tests
npm test -- --watch       # Watch mode
npm test -- --coverage    # Coverage report
```

## Key Areas Without Test Coverage

1. **Wallet validation** - Address format checking per chain
2. **Alert logic** - Price/percent change comparisons
3. **Data aggregation** - `usePortfolio` combining multi-chain data
4. **API error handling** - Supabase connection failures
5. **Authentication flows** - Auth modal and login verification
6. **Email sending** - `lib/email.ts` uses Resend API
7. **NFT/Domain parsing** - Complex chain-specific logic
8. **Theme system** - CSS variable switching
9. **LocalStorage persistence** - Wallet storage fallback

---

*Testing analysis: 2026-01-22*
