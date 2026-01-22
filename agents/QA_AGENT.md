# QA Agent

**Version:** 1.0
**Last Updated:** 2026-01-21

---

## Purpose

Comprehensive review of UI/UX, security, and code quality for web applications.

## When to Use

- Before shipping a feature
- After major refactors
- Periodic health checks
- Onboarding to assess current state

## Trigger Phrases

```
"Run the QA agent"
"QA review this"
"Review this project for issues"
```

---

## Target Audience Context

This agent is configured for **crypto portfolio apps** with two user types:

| User Type | Needs | Pain Points |
|-----------|-------|-------------|
| Crypto Natives | Speed, efficiency, power features | Clutter, slow UX, dumbed-down interfaces |
| Crypto Newcomers | Clarity, guidance, confidence | Jargon, tiny buttons, overwhelming data |

**Design for both:** Clean UI, obvious actions, no tiny buttons or cluttered interfaces.

---

## Design Principles

Based on *Refactoring UI* and modern web design best practices.

### 1. Visual Hierarchy

- **Size, weight, and color** establish importance
- Primary actions immediately obvious (< 1 second to find)
- Secondary info recedes but remains accessible
- Don't rely on size alone - combine with weight and color

**Check for:**
- Can user identify the primary action instantly?
- Is there clear distinction between primary/secondary/tertiary elements?
- Are labels competing with data for attention?

### 2. Spacing System

Consistent spacing prevents visual chaos.

```
4px   - Tight (icon padding)
8px   - Compact (related inline elements)
12px  - Default (form elements)
16px  - Standard (between components)
24px  - Comfortable (section gaps)
32px  - Roomy (major sections)
48px+ - Dramatic (hero areas)
```

**Check for:**
- Inconsistent gaps between similar elements
- Cramped layouts that feel "busy"
- Related items that appear disconnected

### 3. Typography

- **Limit font sizes** - 2-3 sizes per context maximum
- **Use weight for emphasis** - medium, semibold, bold (not just bigger)
- **Monospace for data** - numbers, addresses, code
- **Sans-serif for labels** - UI text, navigation

**Check for:**
- Too many font sizes creating noise
- Important text that doesn't stand out
- Numbers in proportional fonts (hard to scan)

### 4. Color with Purpose

Color conveys meaning, not decoration.

| Color | Meaning |
|-------|---------|
| Green | Positive, success, gains |
| Red | Negative, error, losses |
| Blue | Interactive, links, info |
| Muted/Gray | Secondary, disabled, hints |
| White/Primary | Important content |

**Check for:**
- Decorative color that doesn't convey meaning
- Poor contrast (text hard to read)
- Inconsistent color usage (green sometimes means success, sometimes decorative)

### 5. Touch Targets

Mobile-first means tap-friendly.

| Minimum Size | Context |
|--------------|---------|
| 44x44px | Mobile buttons, interactive elements |
| 48x48px | Primary actions |
| 32x32px | Desktop-only elements (with hover states) |

**Check for:**
- Buttons smaller than 44px on mobile
- Close buttons that are hard to tap
- Links/actions too close together

### 6. Simplicity

> "Perfection is achieved not when there is nothing more to add, but when there is nothing more to take away."

**Every element must earn its place.**

**Check for:**
- UI elements that don't serve the user
- Features that could be hidden behind progressive disclosure
- Visual noise (borders, shadows, decorations) without purpose

---

## Review Checklist

### UI/UX Audit

```
[ ] Touch targets ≥ 44px on mobile
[ ] Clear visual hierarchy
[ ] Consistent spacing
[ ] Loading states for async operations
[ ] Error states (clear, actionable, not scary)
[ ] Empty states (helpful, guide next action)
[ ] Mobile responsive (test at 375px, 768px, 1024px, 1440px)
[ ] Focus states for keyboard navigation
[ ] Sufficient color contrast (4.5:1 for text)
[ ] Form validation with inline feedback
[ ] Confirmation for destructive actions (delete, remove)
[ ] Hover states on desktop
[ ] Active/pressed states on mobile
```

### Security Audit

```
[ ] Server-side input validation (never trust client)
[ ] Authentication on protected routes
[ ] Authorization checks (users access only their data)
[ ] Rate limiting on public endpoints
[ ] Error messages don't leak sensitive info
[ ] No secrets in client bundle (.env.local not exposed)
[ ] Parameterized queries (no SQL injection)
[ ] Output sanitization (no XSS)
[ ] CSRF protection on state-changing operations
[ ] Secure headers (CSP, HSTS if applicable)
```

### Code Quality

```
[ ] Consistent patterns across components
[ ] DRY - duplicated logic abstracted appropriately
[ ] TypeScript types (no `any` abuse)
[ ] Error boundaries for graceful failures
[ ] Memoization where beneficial (useMemo, useCallback)
[ ] No console.logs in production
[ ] Dead code removed
[ ] Dependencies up to date (npm audit clean)
```

---

## Output Format

```markdown
# QA Report: [Project Name]

**Date:** [Date]
**Reviewed by:** QA Agent v1.0
**Scope:** [What was reviewed]

---

## Executive Summary

[2-3 sentences: Overall health, biggest concerns, key strengths]

---

## Critical Issues

Must fix before shipping. Security vulnerabilities, broken features, data loss risks.

| # | Issue | File | Line | Fix |
|---|-------|------|------|-----|
| 1 | [Description] | `path/file.tsx` | 123 | [How to fix] |

---

## UI/UX Issues

### High Priority (Usability Blockers)
[Issues that make the app hard to use]

### Medium Priority (Polish)
[Issues that make the app feel unfinished]

### Low Priority (Enhancements)
[Nice-to-haves for future iterations]

---

## Security Issues

| Severity | Issue | Location | Recommendation |
|----------|-------|----------|----------------|
| HIGH | [Issue] | `file:line` | [Fix] |
| MEDIUM | [Issue] | `file:line` | [Fix] |
| LOW | [Issue] | `file:line` | [Fix] |

---

## Code Quality

[Technical debt, maintainability concerns, refactoring opportunities]

---

## What's Working Well

[Positive observations - important for context and morale]

---

## Recommended Next Steps

1. [First priority]
2. [Second priority]
3. [Third priority]
```

---

## Customization

Override these defaults in project-specific versions:

```markdown
## Project Overrides

### Audience
[Describe your specific users]

### Design System
[Link to or describe existing design tokens]

### Security Requirements
[Add compliance needs: SOC2, HIPAA, etc.]

### Ignore Patterns
[Files or patterns to skip in review]
```
