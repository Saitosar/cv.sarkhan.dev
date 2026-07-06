# Developer Task: Implement AI Router & Streaming (Phase 3)

## Context
Project: /root/cv.sarkhan.dev/ — Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4 + Zustand

## SPEC
Read /root/cv.sarkhan.dev/documentation/03-ai-router-spec.md — this is the full SPEC (1887 lines) with all interfaces, data flow, and implementation order.

## Existing Code
- **Stores**: useChatStore (messages, streaming, input), useResumeStore (undo/redo, applySuggestion), useATSStore (score, suggestions)
- **Types**: chat.ts (ChatMessage, ChatSession), canvas.ts (ResumeBlock, SyncEvent), ats.ts (ATSScore)
- **Components**: SplitScreen, ChatPanel (ChatInput, MessageList, TypingIndicator, etc.), CanvasPanel (with sub-components)
- **Existing lib**: gemini.ts (GoogleGenerativeAI wrapper), ats-scorer.ts (client-side rule-based)
- **Existing service**: canvas-sse.ts (SSE client for Canvas Sync Protocol)
- **Existing API routes**: /api/generate, /api/update, /api/assess — all use Gemini directly
- **Package**: @google/generative-ai 0.24.1, react-markdown 10.1.0, nanoid, zustand

## What to Implement

Follow the implementation order from the SPEC (Phase 3.1 through 3.7):

### Phase 3.1 — Foundation (5 files)
1. `src/lib/ai/config.ts` — Model configurations per task type (temperature, topP, maxOutputTokens, system prompts, fallbacks)
2. `src/lib/ai/cache.ts` — In-memory cache with TTL (5 min), FIFO eviction, cache key from hash of resume data + task type
3. `src/lib/ai/errors.ts` — Error types: AIRouterError with codes (MODEL_ERROR, TIMEOUT, RATE_LIMITED, INVALID_RESPONSE, CACHE_MISS)
4. `src/lib/ai/retry.ts` — Exponential backoff retry (3 attempts, 1s/2s/4s)
5. `src/lib/ai/rate-limiter.ts` — Simple rate limiter (track requests per minute, warn on threshold)

### Phase 3.2 — Prompt Templates (7 files)
6. `src/lib/ai/prompts/chat.ts` — Chat system prompt for "Aether" AI Career Coach
7. `src/lib/ai/prompts/ats-score.ts` — ATS scoring prompt (returns structured JSON score)
8. `src/lib/ai/prompts/generate.ts` — Resume generation prompt
9. `src/lib/ai/prompts/tailor.ts` — Resume tailoring to job description
10. `src/lib/ai/prompts/analyze.ts` — Deep resume analysis with recommendations
11. `src/lib/ai/prompts/suggest.ts` — Quick improvement suggestions
12. `src/lib/ai/prompts/index.ts` — Prompt builder dispatcher (maps task type to builder function)

### Phase 3.3 — Router Core (2 files)
13. `src/lib/ai/router.ts` — AIRouter class:
    - `route(taskType, params)` — non-streaming: check cache → build prompt → call Gemini → parse → cache → return
    - `routeStream(taskType, params)` — async generator: build prompt → call Gemini stream → yield tokens
    - Fallback chain: primary → fallback → error
    - Logging: request/response stats
14. `src/lib/ai/streaming.ts` — SSE helpers:
    - `writeSSEStream(writer, controller)` — write SSE events to response stream
    - `parseSSEStream(reader)` — client-side parser for SSE events
    - Event types: 'token' (string), 'done' (final result), 'error' (error message)

### Phase 3.4 — API Endpoints (2 files)
15. `src/app/api/sse/chat/route.ts` — SSE streaming endpoint:
    - POST handler
    - Accept { message, sessionId, resumeData, jobDescription? }
    - Create AbortController with 30s timeout
    - Call AIRouter.routeStream('chat', ...)
    - Write SSE events: token, done, error
    - Handle client disconnect
16. `src/app/api/ai/route/route.ts` — JSON batch endpoint:
    - POST handler
    - Accept { taskType, params }
    - Call AIRouter.route(taskType, params)
    - Return JSON response

### Phase 3.5 — Client Integration (3 files)
17. `src/services/chat-sse.ts` — Client-side ChatSSEService:
    - `send(message, resumeData, jobDescription?)` — POST to /api/sse/chat, parse SSE stream
    - Updates useChatStore in real-time:
      - On first token: addMessage('assistant', ''), setIsStreaming(true)
      - On each token: updateLastMessage(accumulated)
      - On done: setIsStreaming(false), add hasActions to message
      - On error: addMessage('assistant', error message), setIsStreaming(false)
    - `cancel()` — abort current request
    - Handle reconnection on network error
18. Update `src/components/ChatPanel.tsx` — Integrate ChatSSEService:
    - ChatInput.onSend → ChatSSEService.send()
    - Wire cancel button (if streaming)
    - Ensure TypingIndicator shows during streaming
19. Update `src/components/CanvasPanel.tsx` — Integrate AIRouter for ATS scoring:
    - On resume data change (debounced 2s), call /api/ai/route with taskType='ats-score'
    - Update useATSStore with result

### Phase 3.6 — Legacy Migration (3 files)
20. Update `src/app/api/generate/route.ts` — Delegate to AIRouter instead of direct Gemini call
21. Update `src/app/api/update/route.ts` — Delegate to AIRouter instead of direct Gemini call
22. Update `src/app/api/assess/route.ts` — Delegate to AIRouter instead of direct Gemini call

### Phase 3.7 — Testing (4 files)
23. `src/lib/ai/__tests__/router.test.ts` — Unit tests for AIRouter
24. `src/lib/ai/__tests__/cache.test.ts` — Unit tests for AICache
25. `src/lib/ai/__tests__/prompts.test.ts` — Unit tests for prompt builders
26. `src/services/__tests__/chat-sse.test.ts` — Unit tests for ChatSSEService

## Critical Rules
- **No new npm packages** — everything is already in package.json
- **All prompts must be in English** (international market)
- **Do NOT break existing UI** (Phase 2 components: SplitScreen, ChatPanel, CanvasPanel, MobileTabBar)
- **Do NOT modify existing types** unless absolutely necessary — extend them
- **Do NOT modify existing stores** unless absolutely necessary — use their existing actions
- **SSE streaming must work** — ChatPanel must show tokens as they arrive
- **react-markdown** is already installed — use it for rendering AI responses in ChatPanel
- **canvas-sse.ts** must remain unchanged
- **All new files must be TypeScript** with proper types
- **Use granular Zustand selectors** for performance
- **Handle edge cases**: empty resume, network errors, timeout, cancellation
- **After implementation, run `npx tsc --noEmit` and fix all errors**
- **After implementation, run `npm run build` — must pass**
- **After implementation, run `npm test` — all tests must pass**
