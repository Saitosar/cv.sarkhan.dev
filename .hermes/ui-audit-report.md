# UI Audit Report: cv.sarkhan.dev — Stitch Confidence Design System

**Date:** 2026-07-14  
**Auditor:** Hermes Agent  
**Scope:** All visible components, color tokens, glass effects, responsive behavior  
**Severity Scale:** P0 (Critical) → P1 (High) → P2 (Medium) → P3 (Low)

---

## Executive Summary

The project suffers from **severe design language fragmentation**. Five different purple shades are in active use across components, three different glass-effect CSS classes compete with each other, and the burger menu overlaps the logo on mobile. The designer has not adhered to a single color palette — every major component (SideNav, MobileTabBar, ChatHeader) uses a different purple. This creates a "frankenstein" visual experience.

**Total Findings: 12 (P0: 2, P1: 5, P2: 3, P3: 2)**

---

## P0 — CRITICAL (Must Fix Immediately)

### P0-1: 🚩 5 Different Purple Palettes in Active Use

The codebase uses **five distinct purple/indigo hex values** across components, with no single source of truth.

| Color | Hex | Used In | Count |
|-------|-----|---------|-------|
| Deep Purple | `#6001d1` | SideNav, PricingCard, ProFeatureGate, PricingToggle, shimmer-bg, chat-glow, SuggestionChips, UserMessage, ResumeSection, ChatInput, JobSearch | **~30+ locations** |
| Indigo | `#4F46E5` | SideNav logo gradient, ats-glow, PulseRing, CircularScore, PricingCard ATS preview, shimmer-bg | **~10 locations** |
| Purple-500 | `#8B5CF6` | **MobileTabBar** active state, BackgroundFX, `.glow` class, `.glass-card` gradient, `.card-button`, `.signin-button`, gradient-border, SubscriptionBadge, PricingCard Pro border | **~12 locations** |
| Light Purple | `#d2bbff` | **ChatHeader**, CHAT_MODES config, AgentMessage, TypingIndicator, SuggestionChips, ChatInput, VoiceButton, Landing page, ATSScoreWidget, SuggestionPanel, SuggestionCard, ResumeHeader, ResumeSection, JobCard, JobSearchForm, ProFeatureGate, PricingCard features, SubscriptionBadge | **~30+ locations** |
| Chart Purple | `#8a4ecf` | `--chart-1`, `--sidebar-primary` CSS vars (unused in components) | **2 locations** |

**Impact:** Every major component group uses a different purple. The app looks like it was designed by 3 different people who never spoke to each other.

**Fix:** Define a SINGLE purple palette in `globals.css` CSS custom properties and use `var(--accent)` / `var(--accent-foreground)` everywhere. Recommended palette:
- Primary: `#6001d1` (deep purple — already the most used)
- Gradient partner: `#4F46E5` (indigo — for shimmer/gradients)
- Light variant: `#d2bbff` (light purple — for text on dark, badges)
- **ELIMINATE** `#8B5CF6` from all component code — replace with `#6001d1` or `var(--accent)`

---

### P0-2: 🚩 Burger Menu Overlaps Logo When Panel Opens (SideNav.tsx)

**File:** `src/components/SideNav.tsx` (lines 70-78)

**Bug:** The hamburger button is always rendered with `fixed top-4 left-4 z-[60]`. When `isOpen=true` on mobile:
- The hamburger (Menu icon) stays visible at z-60
- The side panel slides in from the left
- The hamburger overlaps the "AI" logo badge inside the panel

**Evidence from code:**
```tsx
// Line 70-78 — ALWAYS rendered, never conditionally hidden
<button
  className="fixed top-4 left-4 z-[60] flex md:hidden ..."
  onClick={() => setIsOpen(!isOpen)}
>
  {<Menu size={20} />}  {/* Always shows Menu icon, never switches to X */}
</button>
```

**Fix:** Add `isOpen && 'opacity-0 pointer-events-none'` to the hamburger's className:
```tsx
className={cn(
  'fixed top-4 left-4 z-[60] flex md:hidden ...',
  isOpen && 'opacity-0 pointer-events-none'
)}
```

**Verification:** On mobile viewport (< 768px), open the side panel. The hamburger must be invisible. Only the close button (X) inside the panel should be visible.

---

## P1 — HIGH (Must Fix)

### P1-1: 🚩 MobileTabBar Uses Completely Different Design Language

**File:** `src/components/MobileTabBar.tsx`

**Issues:**
1. Active tab color: `#8B5CF6` (purple-500) — doesn't match SideNav's `#6001d1`
2. Uses `.glass` class (background: `rgba(10, 17, 30, .58)`, blur: 22px) — different from `.glass-panel` (background: `rgba(20, 19, 19, 0.7)`, blur: 16px)
3. Uses `.glow` class (box-shadow with `#8B5CF6`) — no other component uses this class
4. Active tab glow: `drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]` — uses `#8B5CF6` instead of `#6001d1`

**Fix:**
- Replace `#8B5CF6` with `#6001d1` (or `var(--accent)`)
- Replace `.glass` with `.glass-panel` for consistency
- Remove `.glow` dependency or redefine it to use `#6001d1`
- Update drop-shadow to use `rgba(96,1,209,0.6)`

---

### P1-2: 🚩 ChatHeader Uses Different Color Scheme Than Rest of App

**File:** `src/components/ChatPanel/ChatHeader.tsx`

**Issues:**
- Bot icon: `text-[#d2bbff]` (light purple) — no other header/icon uses this shade
- Badge: `text-[#d2bbff]`, `border-[rgba(210,187,255,0.3)]`, `bg-[rgba(96,1,209,0.1)]`
- The `#d2bbff` color is used extensively in chat components but nowhere in the navigation

**Fix:** The ChatHeader should use the same accent color as SideNav (`#6001d1`). The light purple (`#d2bbff`) can remain as a secondary text/badge color but should be defined as a CSS variable.

---

### P1-3: 🚩 Three Different Glass Effect Classes Competing

| Class | Background | Blur | Border | Used By |
|-------|-----------|------|--------|---------|
| `.glass-panel` | `rgba(20, 19, 19, 0.7)` | 16px | `rgba(255,255,255,0.08)` | Landing page, ATSScoreWidget, SuggestionPanel, JobSearchPanel |
| `.glass` | `rgba(10, 17, 30, .58)` | 22px saturate(135%) | `rgba(255,255,255,.10)` | MobileTabBar only |
| `.glass-card` | `rgba(40, 47, 65, 0.5)` + purple radial gradient | 16px | `rgba(255,255,255,0.15)` | MobileNav, PricingCard, ATSScoreCard |

**Impact:** Three different glass effects with different backgrounds, blurs, and border styles. Components look visually inconsistent side by side.

**Fix:** Consolidate to ONE glass class. Recommend `.glass-panel` as the standard (most widely used). Either eliminate `.glass` and `.glass-card` or make them variants of `.glass-panel`.

---

### P1-4: 🚩 MobileNav Uses Cyan Accent — Completely Different From Purple Theme

**File:** `src/components/MobileNav.tsx` (line 38)

```tsx
isActive
  ? 'bg-white/10 text-cyan-400'
  : 'text-gray-400 active:bg-white/5'
```

**Issue:** The landing page bottom nav uses `text-cyan-400` as its active color. The entire rest of the app uses purple/indigo. This is a completely different design language.

**Fix:** Replace `text-cyan-400` with `text-[#6001d1]` or `text-[#d2bbff]` to match the purple theme.

---

### P1-5: 🚩 BackgroundFX Uses `#8B5CF6` and `#06B6D4` — Not Part of Any Component Palette

**File:** `src/components/BackgroundFX.tsx`

```tsx
<div className="absolute -top-40 -left-40 h-[60vmax] w-[60vmax] rounded-full bg-[#8B5CF6]/30 blur-[120px]" />
<div className="absolute -bottom-40 -right-40 h-[55vmax] w-[55vmax] rounded-full bg-[#06B6D4]/30 blur-[120px]" />
```

**Issues:**
- `#8B5CF6` (purple-500) — doesn't match the primary `#6001d1`
- `#06B6D4` (cyan) — appears only here and in `.gradient-border` CSS class, not used anywhere else in the component system

**Fix:** Replace `#8B5CF6` with `#6001d1` and `#06B6D4` with `#4F46E5` to match the established purple-indigo gradient.

---

## P2 — MEDIUM (Should Fix)

### P2-1: 🚩 `#7a1ce8` Hover Color Used Inconsistently

Only 2 components use `hover:bg-[#7a1ce8]`:
- `ProFeatureGate.tsx` (line 36)
- `PricingCard.tsx` (line 108)

All other `#6001d1` buttons use `hover:bg-[#6001d1]/80` or `hover:bg-[#6001d1]/90`. The hover state should be consistent.

**Fix:** Define a `--accent-hover` CSS variable or use a consistent hover pattern (e.g., `hover:brightness-110`).

---

### P2-2: 🚩 `.gradient-border` Class Uses `#06B6D4` + `#8B5CF6` — Not Used Anywhere

**File:** `src/app/globals.css` (lines 247-259)

```css
.gradient-border::before {
  background: linear-gradient(135deg, #06B6D4AA, #8B5CF6AA);
}
```

This class is defined but **zero components use it** (`gradientBorderCount: 0` from live DOM scan). Either remove it or update it to use the standard `#6001d1` → `#4F46E5` gradient and use it somewhere.

---

### P2-3: 🚩 `#8a4ecf` CSS Variables Unused

```css
--chart-1: #8a4ecf;
--sidebar-primary: #8a4ecf;
```

These are a 5th purple shade that doesn't match any component. Either remove them or align with the chosen palette.

---

## P3 — LOW (Nice to Fix)

### P3-1: 🚩 `.shimmer-bg` Gradient Uses `#6001d1` + `#4F46E5` — Works But Should Be CSS Variable

The shimmer animation is the one place where the purple-indigo gradient is used correctly. This should be extracted to a CSS variable so all components can reference it.

### P3-2: 🚩 SubscriptionBadge Uses `#8B5CF6` Border

**File:** `src/components/Billing/SubscriptionBadge.tsx` (line 19)

```tsx
isPro
  ? 'bg-[#6001d1]/30 text-[#d2bbff] border border-[#8B5CF6]/50 ...'
```

The border uses `#8B5CF6` while the background uses `#6001d1`. Should be consistent.

---

## Fix Plan — By Role

### 🎨 cv-designer

1. **Create a SINGLE color palette document** at `documentation/stitch-color-palette.md` with:
   - Primary: `#6001d1` (deep purple) — buttons, active states, accents
   - Gradient: `#4F46E5` (indigo) — gradients, shimmer, ATS glow
   - Light: `#d2bbff` (light purple) — secondary text, badges, hover states
   - Background: `#0b0f19` (dark) — page background
   - Surface: `#1c1b1b` — cards, panels
   - **Eliminate:** `#8B5CF6`, `#8a4ecf`, `#06B6D4`, `#7a1ce8`

2. **Provide screenshots** of each fixed component showing the unified palette.

### 🛠️ cv-developer

1. **Fix SideNav.tsx** (P0-2): Hide hamburger when panel is open
2. **Fix MobileTabBar.tsx** (P1-1): Replace `#8B5CF6` → `#6001d1`, replace `.glass` → `.glass-panel`
3. **Fix ChatHeader.tsx** (P1-2): Align with SideNav accent colors
4. **Fix MobileNav.tsx** (P1-4): Replace `text-cyan-400` → `text-[#6001d1]`
5. **Fix BackgroundFX.tsx** (P1-5): Replace `#8B5CF6` → `#6001d1`, `#06B6D4` → `#4F46E5`
6. **Consolidate glass classes** (P1-3): Eliminate `.glass` and `.glass-card`, use only `.glass-panel`
7. **Fix SubscriptionBadge.tsx** (P3-2): Replace `#8B5CF6` → `#6001d1`
8. **Define CSS variables** for the unified palette in `globals.css`

### ✅ cv-qa

1. **Verify ALL components use the same color palette** — no `#8B5CF6`, `#06B6D4`, or `#8a4ecf` in component code
2. **Test on mobile viewport** (< 768px):
   - Open side panel → hamburger must be invisible
   - Close side panel → hamburger must reappear
   - MobileTabBar active color must match SideNav
3. **Test on desktop viewport** (≥ 768px):
   - SideNav always visible
   - No hamburger button
   - All glass effects look consistent
4. **Take screenshots** of every screen (landing, workspace, pricing, mobile nav open/closed)
5. **Verify no regressions** — buttons still work, navigation still functions

---

## Color Usage Heatmap (Current State)

```
Component           #6001d1  #4F46E5  #8B5CF6  #d2bbff  #06B6D4
─────────────────────────────────────────────────────────────
SideNav             ✅✅✅    ✅       ❌       ❌       ❌
MobileTabBar        ❌       ❌       ✅✅     ❌       ❌
ChatHeader          ✅       ❌       ❌       ✅✅     ❌
Landing Page        ❌       ❌       ❌       ✅✅✅   ❌
PricingCard         ✅✅     ✅       ✅       ✅       ❌
BackgroundFX        ❌       ❌       ✅       ❌       ✅
ATSScoreWidget      ❌       ✅       ❌       ✅       ❌
Chat Components     ✅       ❌       ❌       ✅✅✅   ❌
JobSearch           ✅       ❌       ❌       ✅       ❌
MobileNav           ❌       ❌       ❌       ❌       ❌(cyan)
```

**Key:** ✅ = used, ❌ = not used. Multiple ✅ = heavy usage.

---

## Verification Checklist (For QA Sign-Off)

- [ ] All `#8B5CF6` references replaced with `#6001d1` or `var(--accent)`
- [ ] All `#06B6D4` references replaced with `#4F46E5` or removed
- [ ] All `#8a4ecf` references removed or aligned
- [ ] `.glass` class eliminated — all components use `.glass-panel`
- [ ] `.glass-card` class eliminated or merged into `.glass-panel`
- [ ] `.glow` class updated to use `#6001d1` or eliminated
- [ ] Hamburger button hidden when side panel is open (mobile)
- [ ] MobileTabBar active color matches SideNav active color
- [ ] MobileNav uses purple accent, not cyan
- [ ] ChatHeader uses same accent as SideNav
- [ ] BackgroundFX uses purple-indigo gradient, not purple-cyan
- [ ] All hover states use consistent pattern
- [ ] `npm run build` passes without errors
- [ ] Screenshots taken of all screens on mobile and desktop
