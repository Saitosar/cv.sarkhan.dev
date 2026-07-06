# Architect Task: Design AI Router Architecture (Phase 3)

## Context
Project: /root/cv.sarkhan.dev/ — Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4 + Zustand

## Existing Codebase (Phase 2 Complete)
- **Stores**: useChatStore (messages, streaming, input), useResumeStore (undo/redo, applySuggestion), useATSStore (score, suggestions)
- **Types**: chat.ts (ChatMessage, ChatSession), canvas.ts (ResumeBlock, SyncEvent), ats.ts (ATSScore)
- **Components**: SplitScreen, ChatPanel (with sub-components), CanvasPanel (with sub-components), MobileTabBar
- **Existing API routes**: /api/generate, /api/update, /api/assess — all use Gemini directly (no router)
- **Existing lib**: gemini.ts (GoogleGenerativeAI wrapper), ats-scorer.ts (client-side rule-based)
- **Existing service**: canvas-sse.ts (SSE client for Canvas Sync Protocol)
- **Package**: @google/generative-ai 0.24.1, react-markdown 10.1.0

## Task: Design the AI Router Architecture

Write a SPEC document at /root/cv.sarkhan.dev/documentation/03-ai-router-spec.md

The SPEC must cover:

### 1. AI Router Architecture
- **AIRouter class** — central routing logic
  - Task types: 'chat' | 'ats-score' | 'generate' | 'tailor' | 'analyze' | 'suggest'
  - Route to appropriate model/prompt based on task type
  - Support streaming (SSE) and non-streaming modes
  - Error handling with fallback chain
  - Rate limiting awareness
  - Request/response logging

### 2. LLM Integration
- **Primary**: Gemini 2.5 Flash via @google/generative-ai SDK
- **Streaming**: Use model.generateContentStream() for SSE
- **Non-streaming**: Use model.generateContent() for batch operations
- **Configuration**: Model name, temperature, top_p, max_output_tokens per task type
- **API Key**: From GEMINI_API_KEY env var (already set up)

### 3. Prompt Engineering
- **System prompts** for each task type:
  - `chat` — Conversational AI Career Coach ("Aether")
  - `ats-score` — ATS scoring engine (returns structured score)
  - `generate` — Resume content generation
  - `tailor` — Resume tailoring to job description
  - `analyze` — Deep resume analysis with recommendations
  - `suggest` — Quick improvement suggestions
- **Prompt templates** with variables (resume data, job description, user message)
- **Context window management** — how much history to include
- **Output parsing** — JSON extraction, markdown handling

### 4. SSE Streaming Service
- **Server-side**: /api/sse/chat endpoint
  - Accept POST with { message, sessionId, resumeData, jobDescription? }
  - Stream AI response tokens via SSE
  - Events: 'token' (each word), 'done' (complete), 'error' (failure)
  - Support AbortController for cancellation
- **Client-side**: ChatSSEService class
  - Connect to /api/sse/chat
  - Parse SSE events
  - Update useChatStore in real-time (addMessage, updateLastMessage, setIsStreaming)
  - Handle reconnection on error

### 5. Caching Strategy
- **In-memory cache** for repeated ATS scores (same resume data)
- **TTL-based** — cache expires after 5 minutes
- **Cache key** — hash of resume data + task type
- **Skip cache** for chat (conversational context is unique)

### 6. File Structure
```
src/
  lib/
    ai/
      router.ts          — AIRouter class (main entry point)
      config.ts           — Model configs per task type
      prompts/
        chat.ts           — Chat system prompt + template
        ats-score.ts      — ATS scoring prompt
        generate.ts       — Resume generation prompt
        tailor.ts         — Resume tailoring prompt
        analyze.ts        — Deep analysis prompt
        suggest.ts        — Quick suggestions prompt
      cache.ts            — In-memory cache with TTL
      streaming.ts        — SSE streaming helpers
  app/
    api/
      sse/
        chat/
          route.ts        — SSE endpoint for chat streaming
  services/
    chat-sse.ts           — Client-side SSE service (update existing canvas-sse.ts pattern)
```

### 7. Data Flow
```
User types message in ChatPanel
  → useChatStore.setInputValue()
  → User presses Send
  → ChatSSEService.send(message, resumeData)
  → POST /api/sse/chat
  → AIRouter.route('chat', { message, resumeData, history })
  → Gemini generateContentStream()
  → SSE stream: token events
  → ChatSSEService receives tokens
  → useChatStore.updateLastMessage() (streaming)
  → When done: useChatStore.setIsStreaming(false)
  → CanvasPanel may update via SyncEvent
```

### 8. Error Handling
- **Network errors**: Retry with exponential backoff (3 attempts)
- **API errors**: Return structured error via SSE 'error' event
- **Rate limiting**: 429 handling, queue requests
- **Timeout**: 30s per request, abort on timeout
- **Fallback**: If Gemini fails, return cached result or graceful error message

### 9. Integration Points
- **ChatPanel** — already has ChatInput, MessageList, TypingIndicator
- **useChatStore** — already has addMessage, updateLastMessage, setIsStreaming
- **CanvasPanel** — will receive updates via SyncEvent from AI responses
- **useResumeStore** — applySuggestion() for AI-generated content
- **useATSStore** — setScore() for ATS analysis results

## Format
- Markdown with sections: Overview, Architecture, Components, Data Flow, API Contracts, Error Handling, Integration Points
- TypeScript interfaces for all classes and methods
- Implementation order (which files to create in which order)

Write the SPEC to /root/cv.sarkhan.dev/documentation/03-ai-router-spec.md
