# Portfolio Tracker - Design Session Resume

## Project
Crypto portfolio tracker with cypherpunk aesthetic for sovereign traders.

## Design Direction
**MGS2/MGS4 codec menus** - military precision, cool colors, clean negative space. NOT Bioshock/Fallout art deco warmth.

## What's Done

### 1. Single "Cypher" Theme
Consolidated from 4 themes to 1. Files:
- `/app/app/globals.css` - All CSS variables
- `/app/hooks/useTheme.ts` - Theme config
- `/app/app/layout.tsx` - JetBrains Mono font only

### 2. Color Palette (MGS Codec Teal)
```css
--accent-primary: #5aabb8;   /* codec teal */
--accent-green: #4eba6f;     /* tactical green */
--accent-red: #c45c5c;       /* muted red */
--text-primary: #e4e6eb;     /* clean white-gray */
--text-secondary: #8b919e;
--bg-primary: #08090b;       /* cool black, blue undertone */
--bg-secondary: #0d0e12;
--border: rgba(90, 160, 180, 0.08);
```

### 3. Alert Radio Buttons (AlertModal.tsx)
Replaced rounded iPhone-style with angular terminal controls:
- Corner bracket accents that light up
- Status indicator dots with glow
- Monospace uppercase labels
- Green (above) / Red (below) states
- CSS classes: `.cypher-radio`, `.cypher-radio-green`, `.cypher-radio-red`

### 4. UserMenu Auth Options
Shows directly in dropdown (no confusing "Connect"):
- Google OAuth button (prominent white)
- "or" divider
- Sign In | Sign Up buttons (side by side)
- Helper: "Sync portfolio across devices"

### 5. Supporting Styles
- `.cyber-btn` - Terminal button with sweep animation
- `.cypher-toggle` - On/off switch
- Scanline overlay on body
- Corner accent utilities
- Glow variables for each color

## What's Done - Spacing Overhaul

### Spacing/Layout (User Feedback: "Feels too small")
**COMPLETED** - MGS codec generous negative space applied:

#### Card Padding
- Base: 24px → 32px (mobile: 24px, desktop 1280px+: 36px)
- New `.card-spacious`: 40px (mobile: 28px, desktop: 48px)
- Portfolio summary uses `.card-spacious`

#### Typography Scale Increase
- `.text-display`: 1.75-2.5rem → 2.25-3.5rem
- New `.text-display-xl`: 2.75-4.5rem (for portfolio total)
- `.text-headline`: 1-1.25rem → 1.125-1.5rem
- `.text-body`: 0.875rem → 0.9375rem
- `.text-caption`: 0.625rem → 0.6875rem
- `.text-label`: 0.75rem → 0.8125rem

#### Layout Spacing
- Main padding: px-4/6/10/16 → px-5/8/12/20
- Main vertical: py-8/10 → py-10/14
- Grid gaps: 8/10 → 10/14
- Max-width: 1800px → 1920px
- Column gaps: gap-6 → gap-8

#### Table Spacing
- Header padding: 12px → 16px
- Row padding: 14px → 20px
- Header font: 10px → 11px
- Cell font: 13px → 14px

#### Component Updates
- PortfolioSummary: Uses text-display-xl, card-spacious
- Percentage badge: px-3 py-1.5 → px-4 py-2, text-lg
- Sparkline: 64px → 80px height
- Wallet rows: More padding, larger indicators

## Key Component Files

| File | Status | Purpose |
|------|--------|---------|
| `/app/app/globals.css` | Updated | Theme system, all styles |
| `/app/components/AlertModal.tsx` | Updated | Alert creation (radio done) |
| `/app/components/AlertsList.tsx` | Updated | Alert list display |
| `/app/components/UserMenu.tsx` | Updated | Auth options in dropdown |
| `/app/components/AuthModal.tsx` | Unchanged | Full auth modal |
| `/app/hooks/useTheme.ts` | Updated | Single theme |
| `/app/app/layout.tsx` | Updated | JetBrains Mono only |
| `/app/app/page.tsx` | Unchanged | Main dashboard |

## Dev Commands
```bash
cd "/Users/justframe/Desktop/vibecode2026/portfolio tracker/app"
npm run dev
# http://localhost:3000
```

## Design References
- MGS2/MGS4 codec screens
- Crypto Twitter dark mode aesthetic
- Military/tactical UI precision
- Cool temperature, not warm
