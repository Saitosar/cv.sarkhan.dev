# Audit Fix Plan — cv.sarkhan.dev

## P0 — Critical (Fix NOW)

### 1. 5 failing tests — root cause analysis

| Test | Failure | Root Cause | Fix |
|------|---------|------------|-----|
| `PricingCard.test.tsx:38` | Expected `$0` not found | Test creates plan with `price: 0`, but component reads `plan.priceMonthly` | Update test to use `priceMonthly: 0` |
| `PricingCard.test.tsx:46` | Expected `$19` not found | Test creates plan with `price: 19`, but component reads `plan.priceMonthly` (actual: 2.99) | Update test to use `priceMonthly: 2.99` |
| `PricingCard.test.tsx:53` | Expected `Most Popular` not found | Same root cause — test fails before reaching this assertion | Fixed by above |
| `chat-sse.test.ts:52` | Expected 2 messages, got 3 | `clearSession()` resets to `defaultSession` which has 1 welcome message. After `send()` adds user + assistant, total = 3 | Expect 3 messages OR make clearSession truly clear |
| `useChatStore.mode.test.ts:48` | Expected 'Tell Aether what to improve...' but got 'Send a LinkedIn link...' | `setMode('aether')` sets placeholder to 'Send a LinkedIn link...' but test expects old value | Update test expectation to match current store |

### 2. Material Symbols not loading
- **Root cause:** CDN link in `layout.tsx:74` loads from Google Fonts. The CSS references `fonts.gstatic.com` for actual font files. If that domain is blocked or font files fail to load, all `material-symbols-outlined` spans render as empty.
- **Fix:** Replace all `material-symbols-outlined` with Lucide icons (already in project deps). 7 files affected: SplitScreen.tsx, SuggestionPanel.tsx, ATSScoreCard.tsx, ModeToggle.tsx, ChatInput.tsx, AgentMessage.tsx, ChatHeader.tsx.

### 3. No hamburger menu — mobile navigation broken
- **Root cause:** `MobileNav.tsx` and `MobileTabBar.tsx` don't exist in `src/`. The `pb-20 md:pb-0` on `<body>` is a leftover from a removed mobile nav. No mobile navigation exists.
- **Fix:** Add a hamburger menu button that toggles a slide-out navigation panel on mobile (<768px). Include links: Workspace, Pricing, Telegram.

### 4. `/api/ai/suggest` — UI button references non-existent endpoint
- **Root cause:** `CanvasPanel.tsx` calls an endpoint for AI suggestions but no `/api/ai/suggest` route exists. The SuggestionPanel has a "Refresh" button that triggers this.
- **Fix:** Create the API route at `src/app/api/ai/suggest/route.ts` that returns AI-powered suggestions for resume sections.

## P1 — Medium

### 5. JS exception on all pages
- **Root cause:** Unknown — needs browser console investigation. Likely related to Material Symbols failing (unrendered icons cause React hydration issues) or missing API endpoints.
- **Fix:** After fixing P0 items (Material Symbols + missing endpoint), re-test. If persists, add error boundary and investigate.

### 6. No tests on CanvasPanel and PDF templates
- **Fix:** Add unit tests for CanvasPanel component and PDF template generation.

### 7. No integration tests (chat-sse + store)
- **Fix:** Add integration test that tests ChatSSEService with actual store state transitions.

## P2 — Improvements

### 8. No E2E tests (Playwright)
- **Fix:** Add Playwright config and basic E2E tests for critical paths (landing → workspace, pricing page).

### 9. No tests on API routes
- **Fix:** Add tests for `/api/generate`, `/api/update`, `/api/assess`, `/api/sse/chat`.

### 10. FAQ on /pricing doesn't expand
- **Root cause:** FAQ items are rendered as static `<div>` with always-visible answer. No accordion/expand behavior.
- **Fix:** Add accordion component with expand/collapse for FAQ items.

## Execution Order
1. P0-1: Fix 5 failing tests
2. P0-2: Replace Material Symbols with Lucide icons
3. P0-3: Add hamburger menu for mobile
4. P0-4: Create `/api/ai/suggest` endpoint
5. P1-5: Investigate and fix JS exceptions
6. P1-6: Add CanvasPanel + PDF template tests
7. P1-7: Add integration tests
8. P2-8: Add Playwright E2E tests
9. P2-9: Add API route tests
10. P2-10: Make FAQ accordion on /pricing
