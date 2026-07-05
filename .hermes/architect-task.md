# Architect Task: Write SPEC for Core UI (Phase 2)

## Context
Project: /root/cv.sarkhan.dev/ — Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4 + Zustand

## Design Reference
Read /root/cv.sarkhan.dev/designs/stitch-confidence-final.html — HTML prototype with:
- Split-Screen: Chat (40%) + Canvas (60%)
- ChatPanel: Aether Coach AI, messages, input, typing dots
- CanvasPanel: resume with ATS Score widget (84%, pulsing ring)
- Glassmorphism, dark theme, purple-indigo accents
- SideNav on left

## Existing Architecture
- Stores: useChatStore, useATSStore, useResumeStore in /root/cv.sarkhan.dev/src/stores/
- Types: chat.ts, ats.ts, canvas.ts, resume.ts in /root/cv.sarkhan.dev/src/types/
- Components: ScoreCircle.tsx, ATSScoreCard.tsx, ui/Tabs.tsx exist
- Layout: layout.tsx with BackgroundFX, Header, MobileNav
- Pages: / (landing), /create, /update, /import

## What to SPECify
Write SPEC document to /root/cv.sarkhan.dev/documentation/02-core-ui-spec.md

### 1. Split-Screen Layout (src/components/SplitScreen.tsx)
- Resizable splitter between Chat (40%) and Canvas (60%)
- Desktop: horizontal split
- Mobile: tabs (Chat / Resume / Score)
- Splitter: draggable, visual indicator (purple line)
- Transition animation on resize

### 2. ChatPanel (src/components/ChatPanel.tsx)
- Header: "Aether Coach" with green Online indicator
- Messages: AI avatar (purple circle with icon), message bubbles
- Input: with Send button, placeholder "Tell Aether what to improve..."
- Buttons under AI message: "Apply" / "Details"
- Typing dots animation (3 dots with pulse)
- Session badge: "Session Started - Focus: Senior DevOps"
- Auto-scroll to latest message

### 3. CanvasPanel (src/components/CanvasPanel.tsx)
- Resume: name, title, contacts, summary, experience
- ATS Score widget (floating, absolute top-right)
- CircularProgressbar with gradient (indigo to violet)
- Pulsing ring (pulse-ring animation)
- Score: 84% with "ATS Match" label
- Shimmer animation on loading

### 4. Mobile Adaptation
- Tabs: Chat | Resume | Score
- TabBar at bottom (like MobileNav)
- Smooth fade/slide on switch

### 5. Animations
- typing-dots: 3 dots with scale animation
- pulse-ring: expanding ring around ATS Score
- shimmer: gradient loading for skeleton
- fade-in for messages
- slide for mobile tabs

### 6. Styling
- Glassmorphism: rgba(20, 19, 19, 0.7) + backdrop-blur(16px)
- Purple accents: #6001d1, #4F46E5, #d2bbff
- Dark theme: bg #141313, text #e5e2e1
- Aura glow: box-shadow with purple glow
- Rounded-2xl for panels

## SPEC Format
- Markdown with sections: Overview, Components, Props/Interfaces, States, Styling, Mobile, Animations, Data Flow
- TypeScript interfaces for all props
- Tailwind CSS classes for styling
- Implementation order (which files to create in which order)

Write SPEC to /root/cv.sarkhan.dev/documentation/02-core-ui-spec.md
