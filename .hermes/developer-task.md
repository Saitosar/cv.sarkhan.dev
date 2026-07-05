# Developer Task: Implement Core UI (Phase 2)

## Context
Project: /root/cv.sarkhan.dev/ — Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4 + Zustand

## SPEC
Read /root/cv.sarkhan.dev/documentation/02-core-ui-spec.md — this is the full SPEC with all interfaces, Tailwind classes, and implementation order.

## Design Reference
Read /root/cv.sarkhan.dev/designs/stitch-confidence-final.html — HTML prototype with exact styling.

## What to Implement

Follow the implementation order from the SPEC (Phase 2.1 through 2.5):

### Phase 2.1 — Foundation
1. Create src/types/split-screen.ts — SplitScreenProps, SplitterProps, MobileTab types
2. Extend src/types/chat.ts — add hasActions, isStreaming to ChatMessage
3. Extend src/types/canvas.ts — add CanvasPanelProps, ATSScoreWidgetProps, ResumeCanvasProps
4. Add animation keyframes to src/app/globals.css: typing, pulse-ring, message-fade-in, tab-fade-in, tab-slide-in, ats-score-arc, shimmer
5. Create src/components/SplitScreen.tsx — resizable splitter with drag handle + mobile detection

### Phase 2.2 — ChatPanel
6. Create src/components/ChatPanel.tsx — main container
7. Create src/components/ChatPanel/ChatHeader.tsx — agent avatar, name, online indicator
8. Create src/components/ChatPanel/SessionBadge.tsx — session info badge
9. Create src/components/ChatPanel/MessageList.tsx — scrollable with auto-scroll
10. Create src/components/ChatPanel/AgentMessage.tsx — AI message bubble with avatar
11. Create src/components/ChatPanel/UserMessage.tsx — user message bubble
12. Create src/components/ChatPanel/TypingIndicator.tsx — three animated dots
13. Create src/components/ChatPanel/SuggestionChips.tsx — Apply / Details buttons
14. Create src/components/ChatPanel/ChatInput.tsx — text input + send button

### Phase 2.3 — CanvasPanel
15. Create src/components/CanvasPanel.tsx — main container
16. Create src/components/CanvasPanel/ResumeCanvas.tsx — resume renderer
17. Create src/components/CanvasPanel/ResumeHeader.tsx — name, title, contacts
18. Create src/components/CanvasPanel/ResumeSection.tsx — clickable section block
19. Create src/components/CanvasPanel/ATSScoreWidget.tsx — floating score widget
20. Create src/components/CanvasPanel/CircularScore.tsx — SVG circular progress with gradient
21. Create src/components/CanvasPanel/PulseRing.tsx — animated pulsing ring
22. Create src/components/CanvasPanel/ShimmerSkeleton.tsx — loading skeleton

### Phase 2.4 — Mobile & Integration
23. Create src/components/MobileTabBar.tsx — bottom tab bar for mobile
24. Create src/app/workspace/page.tsx — new route rendering SplitScreen
25. Modify src/app/layout.tsx — conditionally hide Header/MobileNav on /workspace

### Phase 2.5 — Polish
26. Verify all CSS keyframes, transitions, timing
27. Responsive: 320px, 768px, 1024px, 1440px
28. Touch: splitter drag, tab switching
29. A11y: ARIA labels on splitter, keyboard nav for tabs
30. Edge cases: empty resume, long messages, rapid sends

## Critical Rules
- Use the EXACT Tailwind classes from the design HTML (stitch-confidence-final.html)
- Glassmorphism: rgba(20, 19, 19, 0.7) + backdrop-blur(16px)
- Purple accents: #6001d1, #4F46E5, #d2bbff
- Dark theme: bg #141313, text #e5e2e1
- All components must be "use client"
- Use granular Zustand selectors for performance
- No new npm packages — everything is already in package.json
- Wire stores: useChatStore, useATSStore, useResumeStore
- SplitScreen must work on desktop (resizable) and mobile (tabs)
- ATS Score widget must have pulsing ring animation
- Chat must auto-scroll to latest message
- Mobile tabs: Chat | Resume | Score with fade/slide transitions
