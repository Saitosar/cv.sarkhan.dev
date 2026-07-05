# QA Task: Verify Phase 2 Core UI

## Context
Project: /root/cv.sarkhan.dev/ — Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4 + Zustand

## What was implemented
Developer created 24 files for Phase 2 Core UI:
- src/types/split-screen.ts (NEW)
- src/types/chat.ts (MODIFIED — added hasActions, isStreaming, component props)
- src/types/canvas.ts (MODIFIED — added CanvasPanelProps, ATSScoreWidgetProps, etc.)
- src/app/globals.css (MODIFIED — added glass-panel, chat-glow, ats-glow, keyframes)
- src/components/SplitScreen.tsx (NEW — resizable splitter with drag/touch/keyboard)
- src/components/ChatPanel.tsx + 7 sub-components in src/components/ChatPanel/
- src/components/CanvasPanel.tsx + 6 sub-components in src/components/CanvasPanel/
- src/components/MobileTabBar.tsx (NEW)
- src/app/workspace/page.tsx (NEW)
- src/app/layout.tsx (MODIFIED — conditional header hiding)

## Known issues from developer
1. layout.tsx uses headers() which may need await in Next.js 16
2. Some TypeScript errors in pre-existing test files (not related to new UI)
3. Some lint warnings on unused imports

## Task
1. Fix any TypeScript errors in the NEW files (not pre-existing ones)
2. Fix layout.tsx — use a client component wrapper with usePathname() instead of headers() for conditional header hiding
3. Run `npx tsc --noEmit` — fix all errors in new code
4. Run `npm run lint` — fix all errors in new code
5. Run `npm run build` — must pass with zero errors
6. Run `npm test` (vitest run) — all tests must pass
7. Verify SplitScreen works: check the component renders without errors
8. Verify ATS Score widget has pulse-ring animation class

## Critical
- Do NOT modify pre-existing test files unless absolutely necessary
- Do NOT modify pre-existing components (Header, MobileNav, BackgroundFX, etc.)
- Focus on making the build pass and tests pass
- The workspace page should render SplitScreen with ChatPanel and CanvasPanel
