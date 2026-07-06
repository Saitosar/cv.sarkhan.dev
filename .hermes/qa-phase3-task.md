# QA Task: Fix TypeScript Errors & Verify Build (Phase 3)

## Context
Project: /root/cv.sarkhan.dev/ — Next.js 16 + React 19 + TypeScript 5

## What was implemented
Developer created 28 files for Phase 3 AI Router. All files exist. But `npx tsc --noEmit` has errors.

## Remaining TypeScript Errors to Fix

### 1. src/app/api/update/route.ts (3 errors)
- Line 29: `Type 'LinkedInContext' is not assignable to type 'Record<string, unknown>'`
- Line 30: `Argument of type 'Record<string, unknown> | null' is not assignable to parameter of type 'LinkedInContext'`
- Line 31: `Argument of type 'Record<string, unknown> | null' is not assignable to parameter of type '{}'`

**Fix**: The update route was migrated to delegate to AIRouter. The linkedInContext variable type changed. Cast it properly:
```typescript
const linkedInContext = null as LinkedInContext | null;
```
Or use `as unknown as LinkedInContext` where needed.

### 2. src/stores/__tests__/useATSStore.test.ts (3 errors)
- Lines 83, 97: `Conversion of type 'string' to type 'ATSSuggestion' may be a mistake`
- Line 109: `Conversion of type 'string[]' to type 'ATSSuggestion[]' may be a mistake`

**Fix**: These are pre-existing test errors. Cast through `unknown`:
```typescript
const suggestion = { ... } as unknown as ATSSuggestion;
```

### 3. src/stores/__tests__/useResumeStore.test.ts (5 errors)
- Lines 115, 135, 144, 316, 320: `Argument of type 'string | undefined' is not assignable to parameter of type 'string'`
- Line 281: `Conversion of type 'ResumeState' to type 'Record<string, unknown>' may be a mistake`

**Fix**: These are pre-existing test errors. Add `!` (non-null assertion) or cast through `unknown`.

## Task
1. Fix ALL TypeScript errors listed above
2. Run `npx tsc --noEmit` — must pass with ZERO errors
3. Run `npm test` (vitest run) — all tests must pass
4. Run `npm run build` — must pass with ZERO errors

## Critical
- Do NOT modify any new Phase 3 files (src/lib/ai/*, src/app/api/sse/chat/*, src/app/api/ai/route/*, src/services/chat-sse.ts)
- Do NOT modify existing components (ChatPanel, CanvasPanel, SplitScreen, etc.)
- Only fix the specific errors listed above
- Pre-existing test files need minimal fixes (cast through unknown, add non-null assertions)
