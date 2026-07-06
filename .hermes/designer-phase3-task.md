# Designer Task: Verify AI Response Rendering in ChatPanel

## Context
Project: /root/cv.sarkhan.dev/ — Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4

## What's Already Done
- Phase 3 AI Router is fully implemented (28 files)
- `npx tsc --noEmit` — zero errors
- `npm test` — 115/115 tests pass
- `npm run build` — compiles successfully
- ChatPanel is wired to ChatSSEService for streaming AI responses
- `react-markdown` 10.1.0 is already installed in package.json

## The Problem
`src/components/ChatPanel/AgentMessage.tsx` renders `{message.content}` as plain text. AI responses contain markdown formatting (bold, lists, code blocks) that won't render properly.

## Task
1. **Update AgentMessage.tsx** to use `react-markdown` for rendering AI responses:
   - Import `ReactMarkdown` from `react-markdown`
   - Replace `{message.content}` with `<ReactMarkdown>{message.content}</ReactMarkdown>`
   - Style code blocks with a dark background and monospace font
   - Style links to open in new tab
   - Style lists properly
   - Add proper prose-like styling for the markdown content

2. **Verify the rendering** by checking:
   - Bold text renders as bold
   - Code blocks have dark background and monospace font
   - Lists are properly indented
   - Links open in new tab
   - Streaming works — partial markdown during streaming should not break

3. **Run `npx tsc --noEmit`** — must pass with zero errors
4. **Run `npm test`** — all tests must pass
5. **Run `npm run build`** — must pass with zero errors

## Design Guidelines
- Code blocks: bg-[#1a1a2e] with rounded corners, monospace font
- Inline code: bg-[#2b2a2a] with px-1 rounded
- Links: text-[#d2bbff] underline
- Lists: proper spacing and indentation
- Keep the existing glassmorphism and dark theme styling
- The chat-glow class on the message bubble should be preserved

## Critical
- Do NOT modify any other files
- Do NOT break existing UI (Phase 2 components)
- Only update AgentMessage.tsx
