# Architect Task: Design Phase 5 — Telegram Mini App, MCP Server, Billing

## Context
Project: /root/cv.sarkhan.dev/ — Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4 + Zustand

## Existing Codebase (Phase 1-4 Complete)
- **Stores**: useChatStore, useResumeStore, useATSStore, useSuggestionStore, useJobSearchStore, useVoiceStore
- **Types**: chat.ts, resume.ts, canvas.ts, ats.ts, suggestions.ts, job-search.ts, voice.ts, split-screen.ts, hr-coach.ts
- **Components**: SplitScreen, ChatPanel (ChatInput, ChatHeader, MessageList, SuggestionChips, VoiceButton, ModeToggle, AgentMessage), CanvasPanel (ResumeCanvas, ResumeSection, SuggestionPanel, SuggestionCard, SeverityBadge), JobSearch (JobSearchPanel, JobSearchForm, JobCard, MatchScoreBadge), MobileTabBar
- **AI Layer**: AIRouter (src/lib/ai/router.ts), 6 task types, SSE streaming (chat-sse.ts, canvas-sse.ts), prompts in src/lib/ai/prompts/
- **API routes**: /api/ai, /api/sse/chat, /api/sse/canvas, /api/jobs/search, /api/generate, /api/update, /api/assess
- **Pages**: / (landing), /create, /update, /import, /workspace
- **Design**: /root/cv.sarkhan.dev/designs/stitch-confidence-final.html
- **Documentation**: /root/cv.sarkhan.dev/documentation/ (02-core-ui-spec.md, 03-ai-router-spec.md, phase-4-architecture.md)

## Task: Design Architecture for 3 Integrations

Write a SPEC document at /root/cv.sarkhan.dev/documentation/phase-5-integration-architecture.md

### 1. Telegram Mini App

**Goal**: Basic page that opens in Telegram WebView. Deep integration in later phases.

**Requirements**:
- A page at /telegram that detects Telegram WebView context (window.Telegram.WebApp)
- Shows a simplified version of the workspace (just ChatPanel for now)
- Adapts to Telegram's color scheme (tg-theme-* CSS variables)
- Back button support (Telegram.WebApp.BackButton)
- Main button support (Telegram.WebApp.MainButton) for "Open in Browser"
- No deep Telegram API integration yet — just the basic WebView detection and adaptation

**Design considerations**:
- Use Telegram WebApp SDK via @twa-dev/sdk or direct window.Telegram.WebApp
- Detect Telegram context: check window.Telegram.WebApp.initData
- If not in Telegram, show a message "Open in Telegram" with a QR code or link
- Responsive: Telegram Mini Apps are typically full-height, no browser chrome
- Theme adaptation: map tg-theme-* CSS variables to Tailwind classes

**File structure**:
```
src/
  app/
    telegram/
      page.tsx              — Telegram Mini App entry point
      layout.tsx             — Telegram-specific layout (no header, no nav)
  components/
    Telegram/
      TelegramProvider.tsx   — Context provider for Telegram WebApp
      TelegramBackButton.tsx — Back button handler
      TelegramMainButton.tsx — Main button handler
  hooks/
    useTelegram.ts           — Hook for Telegram WebApp API
  lib/
    telegram/
      sdk.ts                 — Telegram SDK wrapper
      theme.ts               — Theme mapping (tg-theme-* → Tailwind)
```

### 2. MCP Server (Model Context Protocol)

**Goal**: Simple API server that exposes resume data via MCP protocol.

**Requirements**:
- MCP Server that runs as a standalone Node.js process (not inside Next.js)
- Exposes resume data as "resources" via MCP protocol
- Resources: resume data, ATS score, chat history
- Tools: get_resume, get_ats_score, search_jobs, analyze_resume
- Uses stdio transport (standard MCP transport)
- Can be started via `npm run mcp-server` or `node src/mcp-server/index.js`
- Uses the same data sources as the main app (Zustand stores → JSON files or in-memory)

**MCP Protocol basics**:
- MCP uses JSON-RPC 2.0 over stdio
- Server announces capabilities (resources, tools)
- Client requests resources or calls tools
- Server responds with structured data

**Design considerations**:
- Keep it simple — no external dependencies beyond the MCP SDK
- Use @modelcontextprotocol/sdk package
- Resources: `resume://current`, `ats://score`, `chat://history`
- Tools: `get_resume`, `get_ats_score`, `search_jobs`, `analyze_resume_section`
- Data source: read from a shared JSON file (exported from Zustand stores)
- Error handling: return structured errors per MCP spec

**File structure**:
```
src/
  mcp-server/
    index.ts              — Entry point, stdio transport setup
    server.ts             — MCP server class with capability registration
    resources/
      resume.ts           — Resume resource handler
      ats.ts              — ATS score resource handler
      chat.ts             — Chat history resource handler
    tools/
      get-resume.ts       — get_resume tool
      get-ats-score.ts    — get_ats_score tool
      search-jobs.ts      — search_jobs tool
      analyze-resume.ts   — analyze_resume_section tool
    types.ts              — MCP-specific types
    config.ts             — Server configuration
```

### 3. Billing (Subscription Stub)

**Goal**: Stub subscription system with UI. Real payment integration later.

**Requirements**:
- Page at /pricing with subscription plans
- Two plans: Free (basic) and Pro ($3/month)
- Pro features: AI Suggestions, HR Coach, Job Search, ATS Deep Analysis, Priority Support
- Subscribe button that shows a "Coming Soon" toast/modal
- Subscription status indicator in the workspace header
- No real payment processing — just UI stub
- Store subscription state in Zustand (useSubscriptionStore)

**Design considerations**:
- TG Stars integration planned for future — leave a hook point
- Stripe integration planned for future — leave a hook point
- Subscription state: free | pro | loading | error
- Pro features should be visually indicated (lock icon on premium features)
- The /pricing page should match the existing dark theme and glassmorphism

**File structure**:
```
src/
  app/
    pricing/
      page.tsx              — Pricing page
  components/
    Billing/
      PricingCard.tsx       — Individual plan card
      PricingToggle.tsx     — Monthly/Yearly toggle (stub)
      SubscriptionBadge.tsx — Badge in header showing current plan
      ProFeatureGate.tsx    — Wrapper that shows lock for non-Pro users
  stores/
    useSubscriptionStore.ts — Subscription state store
  types/
    billing.ts              — Billing types
```

### 4. Integration Points

- **Telegram Mini App** should reuse existing ChatPanel component
- **MCP Server** should be independent but share types with the main app
- **Billing** should integrate with the existing workspace header (SubscriptionBadge)
- **ProFeatureGate** should wrap premium features (AI Suggestions, HR Coach, Job Search)

### 5. Implementation Order

1. Types (billing.ts, telegram types)
2. Stores (useSubscriptionStore)
3. MCP Server (standalone, no UI dependencies)
4. Telegram Mini App (page + components)
5. Billing UI (pricing page + components)
6. Integration (ProFeatureGate in workspace)

## Format
- Markdown with sections: Overview, Architecture, Components, Data Flow, API Contracts, File Structure, Implementation Order
- TypeScript interfaces for all new types
- Keep it practical — this is Phase 5, not the final product

## Critical
- Do NOT modify existing Phase 2, 3, 4 code
- Telegram Mini App — basic page, deep integration in later phases
- Billing — stub with UI, real payment later
- MCP Server — standalone process, not inside Next.js
