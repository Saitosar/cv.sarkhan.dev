# Phase 5 — Integration Architecture: Telegram Mini App, MCP Server, Billing

> **Status:** Design Document  
> **Phase:** 5 — Integrations  
> **Dependencies:** Phase 1 (stores, types) — ✅ Complete, Phase 2 (Core UI) — ✅ Complete, Phase 3 (AI Router) — ✅ Complete, Phase 4 (Suggestions, Voice, HR Coach, Job Search) — ✅ Complete  
> **Design Reference:** `designs/stitch-confidence-final.html`  
> **Last Updated:** 2026-07-06

---

## Table of Contents

1. [Overview](#1-overview)
2. [Telegram Mini App](#2-telegram-mini-app)
3. [MCP Server](#3-mcp-server)
4. [Billing (Subscription Stub)](#4-billing-subscription-stub)
5. [Integration Points](#5-integration-points)
6. [File Structure Summary](#6-file-structure-summary)
7. [Implementation Order](#7-implementation-order)

---

## 1. Overview

### 1.1 Goal

Phase 5 adds three independent integration surfaces to the existing workspace:

| Integration | Purpose | Depth | Real in Future |
|-------------|---------|-------|----------------|
| **Telegram Mini App** | Basic page that opens in Telegram WebView | Surface-level detection + theme adaptation | Deep Telegram API, auth, push |
| **MCP Server** | Standalone Node.js process exposing resume data via Model Context Protocol | Full MCP protocol with resources + tools | Auth, rate limiting, DB-backed |
| **Billing** | Subscription UI stub with Free/Pro plans | UI only, no payment processing | Stripe, TG Stars, crypto |

### 1.2 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Telegram as a page, not a rewrite** | `/telegram` reuses existing ChatPanel — no separate app bundle |
| **MCP as standalone process** | Not inside Next.js — can be run independently, connected to any MCP client |
| **Billing as Zustand store** | Matches existing state management pattern; easy to swap stub for real integration |
| **No new DB tables** | Phase 5 is stub-level; real DB integration comes in Phase 6 with auth |
| **No new API routes** | Telegram is client-side only; MCP is its own process; billing is local state |

### 1.3 What Phase 5 Does NOT Do

- ❌ Real Telegram auth (HMAC-SHA256 initData validation)
- ❌ Telegram push notifications
- ❌ MCP auth / rate limiting / audit logging
- ❌ Real payment processing (Stripe, TG Stars, crypto)
- ❌ Database persistence for subscriptions
- ❌ Modify any existing Phase 2/3/4 components or stores

---

## 2. Telegram Mini App

### 2.1 Overview

A page at `/telegram` that detects Telegram WebView context via `window.Telegram.WebApp` and renders a simplified workspace (just ChatPanel). If not in Telegram, shows a fallback message with a link to open in Telegram.

**Constraints:**
- Telegram Mini Apps are full-height, no browser chrome
- Must adapt to Telegram's color scheme (`tg-theme-*` CSS variables)
- Back button and main button support via Telegram WebApp SDK
- No deep Telegram API integration — just WebView detection and adaptation

### 2.2 TypeScript Types

**New file: `src/types/telegram.ts`**

```typescript
// ── Telegram WebApp SDK Types ──

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: string;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;

  // Methods
  ready: () => void;
  expand: () => void;
  close: () => void;

  // Back Button
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };

  // Main Button
  MainButton: {
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    text: string;
    color: string;
    textColor: string;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };

  // Haptic Feedback
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };

  // Events
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  sendData: (data: string) => void;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramThemeParams {
  bg_color: string;
  text_color: string;
  hint_color: string;
  link_color: string;
  button_color: string;
  button_text_color: string;
  secondary_bg_color: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

// ── Telegram Context ──

export interface TelegramContextValue {
  /** Whether the app is running inside Telegram WebView */
  isInTelegram: boolean;
  /** Telegram WebApp SDK instance (null if not in Telegram) */
  webApp: TelegramWebApp | null;
  /** Current user info (null if not available) */
  user: TelegramUser | null;
  /** Current theme parameters */
  theme: TelegramThemeParams | null;
  /** Color scheme: 'light' | 'dark' */
  colorScheme: 'light' | 'dark';
  /** Whether the app is expanded to full height */
  isExpanded: boolean;
}
```

### 2.3 Component Architecture

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

#### 2.3.1 TelegramProvider (`src/components/Telegram/TelegramProvider.tsx`)

A React context provider that initializes the Telegram WebApp SDK on mount.

```typescript
'use client';

import * as React from 'react';
import type { TelegramContextValue, TelegramWebApp } from '@/types/telegram';

const TelegramContext = React.createContext<TelegramContextValue>({
  isInTelegram: false,
  webApp: null,
  user: null,
  theme: null,
  colorScheme: 'dark',
  isExpanded: false,
});

export function useTelegramContext(): TelegramContextValue {
  return React.useContext(TelegramContext);
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = React.useState<TelegramContextValue>({
    isInTelegram: false,
    webApp: null,
    user: null,
    theme: null,
    colorScheme: 'dark',
    isExpanded: false,
  });

  React.useEffect(() => {
    const tg = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;

    if (tg?.initData) {
      tg.ready();
      tg.expand();

      setContext({
        isInTelegram: true,
        webApp: tg,
        user: tg.initDataUnsafe.user ?? null,
        theme: tg.themeParams,
        colorScheme: tg.colorScheme,
        isExpanded: tg.isExpanded,
      });
    }
  }, []);

  return (
    <TelegramContext.Provider value={context}>
      {children}
    </TelegramContext.Provider>
  );
}
```

#### 2.3.2 TelegramBackButton (`src/components/Telegram/TelegramBackButton.tsx`)

Registers a Telegram back button handler. Shows the back button when `visible` is true, hides when false.

```typescript
'use client';

import * as React from 'react';
import { useTelegramContext } from './TelegramProvider';

interface TelegramBackButtonProps {
  /** Whether the back button is visible */
  visible: boolean;
  /** Called when the back button is pressed */
  onBack: () => void;
}

export default function TelegramBackButton({ visible, onBack }: TelegramBackButtonProps) {
  const { webApp } = useTelegramContext();

  React.useEffect(() => {
    if (!webApp) return;

    if (visible) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(onBack);
    } else {
      webApp.BackButton.hide();
    }

    return () => {
      webApp.BackButton.offClick(onBack);
      webApp.BackButton.hide();
    };
  }, [webApp, visible, onBack]);

  return null; // Renders nothing — controls Telegram native UI
}
```

#### 2.3.3 TelegramMainButton (`src/components/Telegram/TelegramMainButton.tsx`)

Shows a "Open in Browser" main button that navigates to the full workspace.

```typescript
'use client';

import * as React from 'react';
import { useTelegramContext } from './TelegramProvider';

interface TelegramMainButtonProps {
  /** URL to open in browser */
  url: string;
  /** Button text */
  text?: string;
}

export default function TelegramMainButton({
  url,
  text = 'Open in Browser',
}: TelegramMainButtonProps) {
  const { webApp } = useTelegramContext();

  React.useEffect(() => {
    if (!webApp) return;

    webApp.MainButton.setText(text);
    webApp.MainButton.show();
    webApp.MainButton.onClick(() => {
      window.open(url, '_blank');
    });

    return () => {
      webApp.MainButton.offClick(() => {});
      webApp.MainButton.hide();
    };
  }, [webApp, url, text]);

  return null;
}
```

#### 2.3.4 useTelegram Hook (`src/hooks/useTelegram.ts`)

A convenience hook that wraps the Telegram context with additional helpers.

```typescript
'use client';

import { useCallback } from 'react';
import { useTelegramContext } from '@/components/Telegram/TelegramProvider';

export function useTelegram() {
  const ctx = useTelegramContext();

  const openLink = useCallback((url: string) => {
    if (ctx.webApp) {
      // Telegram WebView — open in external browser
      window.open(url, '_blank');
    } else {
      window.open(url, '_blank');
    }
  }, [ctx.webApp]);

  const closeApp = useCallback(() => {
    ctx.webApp?.close();
  }, [ctx.webApp]);

  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection') => {
    if (!ctx.webApp?.HapticFeedback) return;

    switch (type) {
      case 'light':
      case 'medium':
      case 'heavy':
        ctx.webApp.HapticFeedback.impactOccurred(type);
        break;
      case 'success':
      case 'error':
      case 'warning':
        ctx.webApp.HapticFeedback.notificationOccurred(type);
        break;
      case 'selection':
        ctx.webApp.HapticFeedback.selectionChanged();
        break;
    }
  }, [ctx.webApp]);

  return {
    ...ctx,
    openLink,
    closeApp,
    hapticFeedback,
  };
}
```

### 2.4 Theme Mapping

**New file: `src/lib/telegram/theme.ts`**

Maps Telegram theme parameters to CSS custom properties and Tailwind-compatible values.

```typescript
import type { TelegramThemeParams } from '@/types/telegram';

export interface MappedTheme {
  bg: string;
  text: string;
  hint: string;
  link: string;
  button: string;
  buttonText: string;
  secondaryBg: string;
}

/**
 * Map Telegram theme params to CSS custom properties.
 * Falls back to dark theme defaults if params are missing.
 */
export function mapTelegramTheme(params: TelegramThemeParams | null): MappedTheme {
  if (!params) {
    return {
      bg: '#0b0f19',
      text: '#e5e2e1',
      hint: '#c4c7c7',
      link: '#d2bbff',
      button: '#6001d1',
      buttonText: '#ffffff',
      secondaryBg: '#141313',
    };
  }

  return {
    bg: params.bg_color,
    text: params.text_color,
    hint: params.hint_color,
    link: params.link_color,
    button: params.button_color,
    buttonText: params.button_text_color,
    secondaryBg: params.secondary_bg_color,
  };
}

/**
 * Apply Telegram theme as CSS custom properties on the document root.
 */
export function applyTelegramTheme(params: TelegramThemeParams | null): void {
  const theme = mapTelegramTheme(params);
  const root = document.documentElement;

  root.style.setProperty('--tg-bg', theme.bg);
  root.style.setProperty('--tg-text', theme.text);
  root.style.setProperty('--tg-hint', theme.hint);
  root.style.setProperty('--tg-link', theme.link);
  root.style.setProperty('--tg-button', theme.button);
  root.style.setProperty('--tg-button-text', theme.buttonText);
  root.style.setProperty('--tg-secondary-bg', theme.secondaryBg);
}
```

### 2.5 Telegram SDK Wrapper

**New file: `src/lib/telegram/sdk.ts`**

```typescript
import type { TelegramWebApp } from '@/types/telegram';

/**
 * Safely access the Telegram WebApp SDK.
 * Returns null if not in Telegram WebView.
 */
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp ?? null;
}

/**
 * Check if the app is running inside Telegram WebView.
 */
export function isInTelegram(): boolean {
  const tg = getTelegramWebApp();
  return !!tg?.initData;
}
```

### 2.6 Page: `/telegram/page.tsx`

```typescript
'use client';

import * as React from 'react';
import { TelegramProvider, useTelegramContext } from '@/components/Telegram/TelegramProvider';
import TelegramBackButton from '@/components/Telegram/TelegramBackButton';
import TelegramMainButton from '@/components/Telegram/TelegramMainButton';
import ChatPanel from '@/components/ChatPanel';
import { applyTelegramTheme } from '@/lib/telegram/theme';

function TelegramContent() {
  const { isInTelegram, theme } = useTelegramContext();
  const [showBack, setShowBack] = React.useState(false);

  // Apply Telegram theme on mount
  React.useEffect(() => {
    applyTelegramTheme(theme);
  }, [theme]);

  if (!isInTelegram) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
        style={{ backgroundColor: 'var(--tg-bg, #0b0f19)', color: 'var(--tg-text, #e5e2e1)' }}
      >
        <div className="text-6xl mb-6">📱</div>
        <h1 className="text-2xl font-bold mb-3">Open in Telegram</h1>
        <p className="text-[var(--tg-hint,#c4c7c7)] mb-6 max-w-sm">
          This page is designed to work inside Telegram. Open it from a Telegram bot or
          use the link below to launch the full version in your browser.
        </p>
        <a
          href="/workspace"
          className="px-6 py-3 rounded-xl font-semibold transition-colors"
          style={{
            backgroundColor: 'var(--tg-button, #6001d1)',
            color: 'var(--tg-button-text, #ffffff)',
          }}
        >
          Open Full Workspace
        </a>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{
        backgroundColor: 'var(--tg-bg, #0b0f19)',
        color: 'var(--tg-text, #e5e2e1)',
      }}
    >
      <TelegramBackButton visible={showBack} onBack={() => setShowBack(false)} />
      <TelegramMainButton url={`${window.location.origin}/workspace`} />

      <div className="flex-1 overflow-hidden p-2">
        <ChatPanel />
      </div>
    </div>
  );
}

export default function TelegramPage() {
  return (
    <TelegramProvider>
      <TelegramContent />
    </TelegramProvider>
  );
}
```

### 2.7 Layout: `/telegram/layout.tsx`

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CV Builder — Telegram',
  description: 'Build and optimize your resume in Telegram',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function TelegramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // No header, no nav, no padding — full-height Telegram WebView
    <div className="h-screen overflow-hidden">
      {children}
    </div>
  );
}
```

### 2.8 States

| State | Visual |
|-------|--------|
| **In Telegram** | Full-height ChatPanel with Telegram theme applied, MainButton visible |
| **Not in Telegram** | Fallback screen: "Open in Telegram" with link to workspace |
| **Loading** | Brief flash while Telegram SDK initializes (should be instant) |
| **Error** | If SDK fails to load, fallback to "Not in Telegram" state |

---

## 3. MCP Server

### 3.1 Overview

A standalone Node.js process that exposes resume data via the Model Context Protocol (MCP). Uses stdio transport (JSON-RPC 2.0). Can be started via `npm run mcp-server` or `node src/mcp-server/index.js`.

**MCP Protocol basics:**
- JSON-RPC 2.0 over stdio
- Server announces capabilities (resources, tools) during initialization
- Client requests resources or calls tools
- Server responds with structured data

**Data source:** Reads from a shared JSON file at `data/resume.json` (exported from Zustand stores). In future phases, this will read from PostgreSQL.

### 3.2 TypeScript Types

**New file: `src/mcp-server/types.ts`**

```typescript
// ── MCP Protocol Types (JSON-RPC 2.0) ──

export interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// ── MCP Server Capabilities ──

export interface MCPServerCapabilities {
  resources: MCPResource[];
  tools: MCPTool[];
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// ── MCP Method Constants ──

export const MCP_METHODS = {
  INITIALIZE: 'initialize',
  GET_CAPABILITIES: 'get_capabilities',
  READ_RESOURCE: 'read_resource',
  CALL_TOOL: 'call_tool',
} as const;

// ── Resource URIs ──

export const RESOURCE_URIS = {
  RESUME: 'resume://current',
  ATS_SCORE: 'ats://score',
  CHAT_HISTORY: 'chat://history',
} as const;

// ── Tool Names ──

export const TOOL_NAMES = {
  GET_RESUME: 'get_resume',
  GET_ATS_SCORE: 'get_ats_score',
  SEARCH_JOBS: 'search_jobs',
  ANALYZE_RESUME: 'analyze_resume_section',
} as const;

// ── Tool Input/Output Types ──

export interface GetResumeInput {
  format?: 'full' | 'summary' | 'sections';
  sections?: string[];
}

export interface GetATSScoreInput {
  refresh?: boolean;
}

export interface SearchJobsInput {
  query: string;
  location?: string;
  limit?: number;
}

export interface AnalyzeResumeInput {
  section: string;
  content: string;
  jobDescription?: string;
}
```

### 3.3 Server Architecture

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

#### 3.3.1 Server Config (`src/mcp-server/config.ts`)

```typescript
export interface MCPServerConfig {
  /** Path to the shared resume data file */
  dataPath: string;
  /** Server name announced during initialization */
  serverName: string;
  /** Server version */
  serverVersion: string;
}

export const DEFAULT_CONFIG: MCPServerConfig = {
  dataPath: process.env.MCP_DATA_PATH || './data/resume.json',
  serverName: 'cv-builder-mcp',
  serverVersion: '1.0.0',
};
```

#### 3.3.2 Entry Point (`src/mcp-server/index.ts`)

```typescript
import { MCPServer } from './server';
import { DEFAULT_CONFIG } from './config';

const server = new MCPServer(DEFAULT_CONFIG);

// Read JSON-RPC 2.0 messages from stdin
process.stdin.setEncoding('utf-8');
let buffer = '';

process.stdin.on('data', (chunk: string) => {
  buffer += chunk;

  // MCP uses newline-delimited JSON
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // Keep incomplete line in buffer

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      const request = JSON.parse(trimmed);
      server.handleRequest(request).then((response) => {
        process.stdout.write(JSON.stringify(response) + '\n');
      });
    } catch (error) {
      const errorResponse = {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error',
          data: error instanceof Error ? error.message : String(error),
        },
      };
      process.stdout.write(JSON.stringify(errorResponse) + '\n');
    }
  }
});

process.stdin.on('end', () => {
  process.exit(0);
});

console.error('[MCP Server] Started — listening on stdin');
```

#### 3.3.3 Server Class (`src/mcp-server/server.ts`)

```typescript
import type { JSONRPCRequest, JSONRPCResponse, MCPServerCapabilities } from './types';
import type { MCPServerConfig } from './config';
import { MCP_METHODS, RESOURCE_URIS, TOOL_NAMES } from './types';
import { ResumeResource } from './resources/resume';
import { ATSScoreResource } from './resources/ats';
import { ChatHistoryResource } from './resources/chat';
import { GetResumeTool } from './tools/get-resume';
import { GetATSScoreTool } from './tools/get-ats-score';
import { SearchJobsTool } from './tools/search-jobs';
import { AnalyzeResumeTool } from './tools/analyze-resume';

export class MCPServer {
  private config: MCPServerConfig;
  private capabilities: MCPServerCapabilities;
  private initialized = false;

  // Resource handlers
  private resumeResource: ResumeResource;
  private atsResource: ATSScoreResource;
  private chatResource: ChatHistoryResource;

  // Tool handlers
  private getResumeTool: GetResumeTool;
  private getATSScoreTool: GetATSScoreTool;
  private searchJobsTool: SearchJobsTool;
  private analyzeResumeTool: AnalyzeResumeTool;

  constructor(config: MCPServerConfig) {
    this.config = config;

    // Initialize resource handlers
    this.resumeResource = new ResumeResource(config);
    this.atsResource = new ATSScoreResource(config);
    this.chatResource = new ChatHistoryResource(config);

    // Initialize tool handlers
    this.getResumeTool = new GetResumeTool(config);
    this.getATSScoreTool = new GetATSScoreTool(config);
    this.searchJobsTool = new SearchJobsTool(config);
    this.analyzeResumeTool = new AnalyzeResumeTool(config);

    // Define capabilities
    this.capabilities = {
      resources: [
        {
          uri: RESOURCE_URIS.RESUME,
          name: 'Current Resume',
          description: 'Full resume data in JSON format',
          mimeType: 'application/json',
        },
        {
          uri: RESOURCE_URIS.ATS_SCORE,
          name: 'ATS Score',
          description: 'Current ATS score with breakdown',
          mimeType: 'application/json',
        },
        {
          uri: RESOURCE_URIS.CHAT_HISTORY,
          name: 'Chat History',
          description: 'Recent chat messages from the workspace',
          mimeType: 'application/json',
        },
      ],
      tools: [
        {
          name: TOOL_NAMES.GET_RESUME,
          description: 'Get resume data with optional filtering by sections',
          inputSchema: {
            type: 'object',
            properties: {
              format: { type: 'string', enum: ['full', 'summary', 'sections'] },
              sections: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        {
          name: TOOL_NAMES.GET_ATS_SCORE,
          description: 'Get the current ATS score for the resume',
          inputSchema: {
            type: 'object',
            properties: {
              refresh: { type: 'boolean' },
            },
          },
        },
        {
          name: TOOL_NAMES.SEARCH_JOBS,
          description: 'Search for jobs matching the resume profile',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              location: { type: 'string' },
              limit: { type: 'number' },
            },
            required: ['query'],
          },
        },
        {
          name: TOOL_NAMES.ANALYZE_RESUME,
          description: 'Analyze a specific resume section for improvements',
          inputSchema: {
            type: 'object',
            properties: {
              section: { type: 'string' },
              content: { type: 'string' },
              jobDescription: { type: 'string' },
            },
            required: ['section', 'content'],
          },
        },
      ],
    };
  }

  async handleRequest(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    const { id, method, params } = request;

    try {
      switch (method) {
        case MCP_METHODS.INITIALIZE:
          return this.handleInitialize(id);

        case MCP_METHODS.GET_CAPABILITIES:
          return this.handleGetCapabilities(id);

        case MCP_METHODS.READ_RESOURCE:
          return this.handleReadResource(id, params);

        case MCP_METHODS.CALL_TOOL:
          return this.handleCallTool(id, params);

        default:
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Method not found: ${method}`,
            },
          };
      }
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private handleInitialize(id: string | number): JSONRPCResponse {
    this.initialized = true;
    return {
      jsonrpc: '2.0',
      id,
      result: {
        serverName: this.config.serverName,
        serverVersion: this.config.serverVersion,
        protocolVersion: '2025-03-26',
        capabilities: this.capabilities,
      },
    };
  }

  private handleGetCapabilities(id: string | number): JSONRPCResponse {
    return {
      jsonrpc: '2.0',
      id,
      result: this.capabilities,
    };
  }

  private async handleReadResource(
    id: string | number,
    params?: Record<string, unknown>
  ): Promise<JSONRPCResponse> {
    const uri = params?.uri as string;

    if (!uri) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: 'Missing required parameter: uri' },
      };
    }

    let data: unknown;

    switch (uri) {
      case RESOURCE_URIS.RESUME:
        data = await this.resumeResource.read();
        break;
      case RESOURCE_URIS.ATS_SCORE:
        data = await this.atsResource.read();
        break;
      case RESOURCE_URIS.CHAT_HISTORY:
        data = await this.chatResource.read();
        break;
      default:
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: `Unknown resource: ${uri}` },
        };
    }

    return {
      jsonrpc: '2.0',
      id,
      result: {
        uri,
        mimeType: 'application/json',
        content: data,
      },
    };
  }

  private async handleCallTool(
    id: string | number,
    params?: Record<string, unknown>
  ): Promise<JSONRPCResponse> {
    const name = params?.name as string;
    const args = params?.arguments as Record<string, unknown> ?? {};

    if (!name) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: 'Missing required parameter: name' },
      };
    }

    let result: unknown;

    switch (name) {
      case TOOL_NAMES.GET_RESUME:
        result = await this.getResumeTool.execute(args);
        break;
      case TOOL_NAMES.GET_ATS_SCORE:
        result = await this.getATSScoreTool.execute(args);
        break;
      case TOOL_NAMES.SEARCH_JOBS:
        result = await this.searchJobsTool.execute(args);
        break;
      case TOOL_NAMES.ANALYZE_RESUME:
        result = await this.analyzeResumeTool.execute(args);
        break;
      default:
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: `Unknown tool: ${name}` },
        };
    }

    return {
      jsonrpc: '2.0',
      id,
      result,
    };
  }
}
```

#### 3.3.4 Resource Handlers

**`src/mcp-server/resources/resume.ts`** — Reads resume data from the shared JSON file.

```typescript
import * as fs from 'fs';
import * as path from 'path';
import type { MCPServerConfig } from '../config';

export class ResumeResource {
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  async read(): Promise<unknown> {
    try {
      const dataPath = path.resolve(this.config.dataPath);
      if (!fs.existsSync(dataPath)) {
        return { error: 'Resume data not found', dataPath };
      }
      const raw = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(raw);
    } catch (error) {
      return {
        error: 'Failed to read resume data',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
```

**`src/mcp-server/resources/ats.ts`** — Reads ATS score from the shared JSON file.

```typescript
import * as fs from 'fs';
import * as path from 'path';
import type { MCPServerConfig } from '../config';

export class ATSScoreResource {
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  async read(): Promise<unknown> {
    try {
      const dataPath = path.resolve(path.dirname(this.config.dataPath), 'ats-score.json');
      if (!fs.existsSync(dataPath)) {
        return { error: 'ATS score not found', note: 'Run ATS analysis first' };
      }
      const raw = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(raw);
    } catch (error) {
      return {
        error: 'Failed to read ATS score',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
```

**`src/mcp-server/resources/chat.ts`** — Reads chat history from the shared JSON file.

```typescript
import * as fs from 'fs';
import * as path from 'path';
import type { MCPServerConfig } from '../config';

export class ChatHistoryResource {
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  async read(): Promise<unknown> {
    try {
      const dataPath = path.resolve(path.dirname(this.config.dataPath), 'chat-history.json');
      if (!fs.existsSync(dataPath)) {
        return { error: 'Chat history not found', messages: [] };
      }
      const raw = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(raw);
    } catch (error) {
      return {
        error: 'Failed to read chat history',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
```

#### 3.3.5 Tool Handlers

**`src/mcp-server/tools/get-resume.ts`**

```typescript
import * as fs from 'fs';
import * as path from 'path';
import type { MCPServerConfig } from '../config';
import type { GetResumeInput } from '../types';

export class GetResumeTool {
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  async execute(args: Record<string, unknown>): Promise<unknown> {
    const input = args as unknown as GetResumeInput;

    try {
      const dataPath = path.resolve(this.config.dataPath);
      if (!fs.existsSync(dataPath)) {
        return { error: 'Resume data not found' };
      }

      const raw = fs.readFileSync(dataPath, 'utf-8');
      const resume = JSON.parse(raw);

      if (input.format === 'summary') {
        return {
          fullName: resume.fullName,
          jobTitle: resume.jobTitle,
          summary: resume.summary,
          skillCount: resume.skills?.length ?? 0,
          experienceCount: resume.experience?.length ?? 0,
        };
      }

      if (input.format === 'sections' && input.sections) {
        const filtered: Record<string, unknown> = {};
        for (const section of input.sections) {
          if (resume[section] !== undefined) {
            filtered[section] = resume[section];
          }
        }
        return filtered;
      }

      return resume;
    } catch (error) {
      return {
        error: 'Failed to read resume',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
```

**`src/mcp-server/tools/get-ats-score.ts`**

```typescript
import * as fs from 'fs';
import * as path from 'path';
import type { MCPServerConfig } from '../config';
import type { GetATSScoreInput } from '../types';

export class GetATSScoreTool {
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  async execute(args: Record<string, unknown>): Promise<unknown> {
    const input = args as unknown as GetATSScoreInput;

    try {
      const dataPath = path.resolve(path.dirname(this.config.dataPath), 'ats-score.json');

      if (!fs.existsSync(dataPath)) {
        return {
          overall: 0,
          breakdown: { keywords: 0, formatting: 0, completeness: 0, readability: 0 },
          suggestions: ['Run ATS analysis to get a score'],
          matchedKeywords: [],
          missingKeywords: [],
          lastAnalyzed: null,
        };
      }

      const raw = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(raw);
    } catch (error) {
      return {
        error: 'Failed to read ATS score',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
```

**`src/mcp-server/tools/search-jobs.ts`**

```typescript
import type { MCPServerConfig } from '../config';
import type { SearchJobsInput } from '../types';

export class SearchJobsTool {
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  async execute(args: Record<string, unknown>): Promise<unknown> {
    const input = args as unknown as SearchJobsInput;

    // In Phase 5, return a stub response.
    // In future phases, this will call the job search API.
    return {
      note: 'Job search is available in the main workspace UI',
      query: input.query,
      location: input.location,
      jobs: [],
      totalCount: 0,
      searchedAt: Date.now(),
    };
  }
}
```

**`src/mcp-server/tools/analyze-resume.ts`**

```typescript
import type { MCPServerConfig } from '../config';
import type { AnalyzeResumeInput } from '../types';

export class AnalyzeResumeTool {
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  async execute(args: Record<string, unknown>): Promise<unknown> {
    const input = args as unknown as AnalyzeResumeInput;

    // In Phase 5, return a stub analysis.
    // In future phases, this will call the AI Router.
    return {
      note: 'Deep analysis is available in the main workspace UI',
      section: input.section,
      suggestions: [
        {
          type: 'content_gaps',
          severity: 'medium',
          title: 'Analysis available in workspace',
          description: 'Open the workspace to get AI-powered suggestions for this section.',
        },
      ],
    };
  }
}
```

### 3.4 Package.json Script

Add to `package.json`:

```json
{
  "scripts": {
    "mcp-server": "tsx src/mcp-server/index.ts",
    "mcp-server:build": "tsc src/mcp-server/index.ts --outDir dist/mcp-server --module commonjs"
  }
}
```

Requires `tsx` as a dev dependency (or use `ts-node`). If not present, add:

```bash
npm install -D tsx
```

### 3.5 Data File Format

The MCP server reads from a shared JSON file at `data/resume.json`. This file is written by the Zustand store's `persist` middleware (or a dedicated export function).

**`data/resume.json`** — written by the main app:

```json
{
  "fullName": "John Doe",
  "jobTitle": "Senior DevOps Engineer",
  "contact": { "email": "john@example.com", "phone": "+1234567890" },
  "summary": "...",
  "experience": [],
  "education": [],
  "skills": [],
  "certifications": [],
  "lastUpdated": 1712345678000
}
```

**`data/ats-score.json`** — written by the ATS analysis:

```json
{
  "overall": 78,
  "breakdown": { "keywords": 65, "formatting": 85, "completeness": 90, "readability": 72 },
  "suggestions": ["Add more industry keywords"],
  "matchedKeywords": ["Kubernetes", "Docker"],
  "missingKeywords": ["Terraform", "CI/CD"],
  "lastAnalyzed": 1712345678000
}
```

**`data/chat-history.json`** — written by the chat store:

```json
{
  "sessionId": "abc123",
  "messages": [],
  "lastUpdated": 1712345678000
}
```

### 3.6 States

| State | Behavior |
|-------|----------|
| **Running** | Listens on stdin, processes JSON-RPC requests, writes responses to stdout |
| **No data file** | Returns structured error responses with `{ error: '...' }` |
| **Parse error** | Returns JSON-RPC error code -32700 |
| **Unknown method** | Returns JSON-RPC error code -32601 |
| **Internal error** | Returns JSON-RPC error code -32603 |

---

## 4. Billing (Subscription Stub)

### 4.1 Overview

A subscription UI stub with Free and Pro plans. No real payment processing — just UI and local state. The `/pricing` page shows plan cards, and a `SubscriptionBadge` in the workspace header shows the current plan. `ProFeatureGate` wraps premium features with a lock icon for non-Pro users.

### 4.2 TypeScript Types

**New file: `src/types/billing.ts`**

```typescript
// ── Subscription Tiers ──

export type SubscriptionTier = 'free' | 'pro';

export type SubscriptionStatus = 'active' | 'loading' | 'error';

// ── Plan Definition ──

export interface PlanDefinition {
  id: SubscriptionTier;
  name: string;
  price: number;           // Monthly price in USD (0 for free)
  priceLabel: string;      // Display label: "Free", "$3/mo"
  description: string;
  features: PlanFeature[];
  ctaLabel: string;        // Button text
  highlighted: boolean;    // Whether this plan is visually highlighted
}

export interface PlanFeature {
  text: string;
  included: boolean;       // true = available, false = locked
  pro?: boolean;            // true = Pro-only feature
}

// ── Subscription State ──

export interface SubscriptionState {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  /** When the subscription expires (null for free tier) */
  expiresAt: number | null;
}

// ── Component Props ──

export interface PricingCardProps {
  plan: PlanDefinition;
  isCurrentPlan: boolean;
  onSubscribe: (planId: SubscriptionTier) => void;
  isProcessing?: boolean;
}

export interface SubscriptionBadgeProps {
  tier: SubscriptionTier;
  className?: string;
}

export interface ProFeatureGateProps {
  /** Feature name for the tooltip */
  featureName: string;
  /** Children to render if user is Pro */
  children: React.ReactNode;
  /** Optional fallback to show instead of the lock overlay */
  fallback?: React.ReactNode;
}

// ── Plan Definitions ──

export const PLANS: PlanDefinition[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: 'Free',
    description: 'Basic resume building with AI assistance',
    features: [
      { text: 'AI Resume Generation', included: true },
      { text: 'Basic ATS Score', included: true },
      { text: '1 Resume Template', included: true },
      { text: 'AI Suggestions', included: false, pro: true },
      { text: 'HR Coach', included: false, pro: true },
      { text: 'Job Search', included: false, pro: true },
      { text: 'ATS Deep Analysis', included: false, pro: true },
      { text: 'Priority Support', included: false, pro: true },
    ],
    ctaLabel: 'Current Plan',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 3,
    priceLabel: '$3/mo',
    description: 'Full access to all AI features and tools',
    features: [
      { text: 'AI Resume Generation', included: true },
      { text: 'Advanced ATS Score', included: true },
      { text: 'All Resume Templates', included: true },
      { text: 'AI Suggestions', included: true, pro: true },
      { text: 'HR Coach', included: true, pro: true },
      { text: 'Job Search', included: true, pro: true },
      { text: 'ATS Deep Analysis', included: true, pro: true },
      { text: 'Priority Support', included: true, pro: true },
    ],
    ctaLabel: 'Subscribe',
    highlighted: true,
  },
];
```

### 4.3 Store

**New file: `src/stores/useSubscriptionStore.ts`**

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { SubscriptionTier, SubscriptionStatus } from '@/types/billing';

interface SubscriptionState {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expiresAt: number | null;

  // Actions
  setTier: (tier: SubscriptionTier) => void;
  setStatus: (status: SubscriptionStatus) => void;
  subscribe: (tier: SubscriptionTier) => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  devtools(
    persist(
      (set) => ({
        tier: 'free',
        status: 'active',
        expiresAt: null,

        setTier: (tier) => set({ tier, status: 'active' }),

        setStatus: (status) => set({ status }),

        subscribe: (tier) => {
          // Stub: in Phase 5, this just sets the tier.
          // In future phases, this will:
          // 1. Create a Stripe/TG Stars checkout session
          // 2. Redirect to payment provider
          // 3. Handle webhook callback
          // 4. Update tier on successful payment
          set({
            tier,
            status: 'active',
            expiresAt: tier === 'free' ? null : Date.now() + 30 * 24 * 60 * 60 * 1000,
          });
        },

        reset: () =>
          set({
            tier: 'free',
            status: 'active',
            expiresAt: null,
          }),
      }),
      {
        name: 'subscription-store',
        version: 1,
        partialize: (state) => ({
          tier: state.tier,
          expiresAt: state.expiresAt,
        }),
      }
    ),
    { name: 'SubscriptionStore' }
  )
);

export type { SubscriptionState };
```

### 4.4 Component Architecture

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
      ProFeatureGate.tsx   — Wrapper that shows lock for non-Pro users
```

#### 4.4.1 Pricing Page (`src/app/pricing/page.tsx`)

```typescript
'use client';

import * as React from 'react';
import { PLANS } from '@/types/billing';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import PricingCard from '@/components/Billing/PricingCard';
import PricingToggle from '@/components/Billing/PricingToggle';

export default function PricingPage() {
  const { tier, subscribe } = useSubscriptionStore();
  const [isYearly, setIsYearly] = React.useState(false);
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const handleSubscribe = (planId: string) => {
    if (planId === 'free') {
      subscribe('free');
      return;
    }

    // Pro: show "Coming Soon" toast
    setProcessingId(planId);
    // In future: redirect to Stripe/TG Stars checkout
    setTimeout(() => {
      setProcessingId(null);
      // Show toast: "Coming Soon — Payment integration in progress"
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#e5e2e1] mb-4">
            Choose Your Plan
          </h1>
          <p className="text-[#c4c7c7] text-lg max-w-xl mx-auto">
            Get the most out of your resume with AI-powered tools.
            Upgrade to Pro for full access.
          </p>
        </div>

        {/* Toggle (stub) */}
        <PricingToggle isYearly={isYearly} onChange={setIsYearly} />

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={tier === plan.id}
              onSubscribe={handleSubscribe}
              isProcessing={processingId === plan.id}
            />
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-[#c4c7c7] text-sm mt-8">
          Payment integration coming soon. Pro features are currently free during beta.
        </p>
      </div>
    </div>
  );
}
```

#### 4.4.2 PricingCard (`src/components/Billing/PricingCard.tsx`)

```typescript
'use client';

import * as React from 'react';
import { Check, X, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PricingCardProps } from '@/types/billing';

export default function PricingCard({
  plan,
  isCurrentPlan,
  onSubscribe,
  isProcessing,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl p-6 md:p-8 transition-all duration-300',
        'border backdrop-blur-[16px]',
        plan.highlighted
          ? 'bg-[rgba(96,1,209,0.1)] border-[rgba(96,1,209,0.4)] shadow-[0_0_30px_rgba(96,1,209,0.2)]'
          : 'bg-[rgba(20,19,19,0.7)] border-[rgba(255,255,255,0.08)]'
      )}
    >
      {/* Highlight badge */}
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full
          bg-[#6001d1] text-white text-xs font-semibold">
          Most Popular
        </div>
      )}

      {/* Plan header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#e5e2e1] mb-1">{plan.name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-[#e5e2e1]">{plan.priceLabel}</span>
          {plan.price > 0 && <span className="text-[#c4c7c7] text-sm">/month</span>}
        </div>
        <p className="text-[#c4c7c7] text-sm mt-2">{plan.description}</p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            {feature.included ? (
              <Check size={16} className="text-[#4ae176] mt-0.5 flex-shrink-0" />
            ) : (
              <X size={16} className="text-[#c4c7c7]/50 mt-0.5 flex-shrink-0" />
            )}
            <span className={feature.included ? 'text-[#e5e2e1]' : 'text-[#c4c7c7]/50'}>
              {feature.text}
              {feature.pro && !feature.included && (
                <Lock size={12} className="inline ml-1 text-[#c4c7c7]/50" />
              )}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={() => onSubscribe(plan.id)}
        disabled={isCurrentPlan || isProcessing}
        className={cn(
          'w-full py-3 rounded-xl font-semibold transition-all duration-200',
          isCurrentPlan
            ? 'bg-white/5 text-[#c4c7c7] cursor-default'
            : plan.highlighted
              ? 'bg-[#6001d1] text-white hover:bg-[#6001d1]/80 active:scale-[0.98]'
              : 'bg-white/10 text-[#e5e2e1] hover:bg-white/15 active:scale-[0.98]',
          isProcessing && 'opacity-50 cursor-wait'
        )}
      >
        {isProcessing ? 'Processing...' : isCurrentPlan ? 'Current Plan' : plan.ctaLabel}
      </button>
    </div>
  );
}
```

#### 4.4.3 PricingToggle (`src/components/Billing/PricingToggle.tsx`)

```typescript
'use client';

import { cn } from '@/lib/utils';

interface PricingToggleProps {
  isYearly: boolean;
  onChange: (isYearly: boolean) => void;
}

export default function PricingToggle({ isYearly, onChange }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className={cn('text-sm', !isYearly ? 'text-[#e5e2e1]' : 'text-[#c4c7c7]')}>
        Monthly
      </span>
      <button
        onClick={() => onChange(!isYearly)}
        className={cn(
          'relative w-12 h-6 rounded-full transition-colors duration-200',
          isYearly ? 'bg-[#6001d1]' : 'bg-white/20'
        )}
        aria-label="Toggle billing period"
      >
        <div
          className={cn(
            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200',
            isYearly ? 'translate-x-7' : 'translate-x-1'
          )}
        />
      </button>
      <span className={cn('text-sm', isYearly ? 'text-[#e5e2e1]' : 'text-[#c4c7c7]')}>
        Yearly
      </span>
      {isYearly && (
        <span className="text-xs text-[#4ae176] bg-[#4ae176]/10 px-2 py-0.5 rounded-full">
          Save 20%
        </span>
      )}
    </div>
  );
}
```

#### 4.4.4 SubscriptionBadge (`src/components/Billing/SubscriptionBadge.tsx`)

```typescript
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';
import type { SubscriptionBadgeProps } from '@/types/billing';

export default function SubscriptionBadge({ tier, className }: SubscriptionBadgeProps) {
  if (tier === 'pro') {
    return (
      <Link
        href="/pricing"
        className={cn(
          'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
          'bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.3)]',
          'text-[#ffd700] hover:bg-[rgba(255,215,0,0.15)] transition-colors',
          className
        )}
      >
        <Crown size={14} />
        Pro
      </Link>
    );
  }

  return (
    <Link
      href="/pricing"
      className={cn(
        'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
        'bg-white/5 border border-white/10',
        'text-[#c4c7c7] hover:bg-white/10 transition-colors',
        className
      )}
    >
      Free
    </Link>
  );
}
```

#### 4.4.5 ProFeatureGate (`src/components/Billing/ProFeatureGate.tsx`)

```typescript
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import type { ProFeatureGateProps } from '@/types/billing';

export default function ProFeatureGate({
  featureName,
  children,
  fallback,
}: ProFeatureGateProps) {
  const tier = useSubscriptionStore((s) => s.tier);

  if (tier === 'pro') {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative group">
      {/* Blur the content */}
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>

      {/* Lock overlay */}
      <Link
        href="/pricing"
        className="absolute inset-0 flex flex-col items-center justify-center
          bg-[rgba(0,0,0,0.5)] rounded-xl
          opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
      >
        <Lock size={24} className="text-[#d2bbff] mb-2" />
        <span className="text-sm text-[#d2bbff] font-medium">
          {featureName} is a Pro feature
        </span>
        <span className="text-xs text-[#c4c7c7] mt-1">
          Click to upgrade
        </span>
      </Link>
    </div>
  );
}
```

### 4.5 States

| State | Visual |
|-------|--------|
| **Free (default)** | Badge shows "Free", Pro features are locked with blur overlay |
| **Pro** | Badge shows "Pro" with crown icon, all features unlocked |
| **Loading** | Badge shows spinner, subscribe button shows "Processing..." |
| **Error** | Badge shows "Error" in red, subscribe button re-enabled |

---

## 5. Integration Points

### 5.1 Telegram Mini App → Existing Components

| Integration | Detail |
|-------------|--------|
| **ChatPanel** | `/telegram/page.tsx` imports and renders `ChatPanel` directly |
| **useChatStore** | Telegram page uses the same Zustand store — chat state is shared |
| **useResumeStore** | Resume data is shared — no separate Telegram state |
| **Theme** | Telegram theme overrides CSS via `--tg-*` custom properties |

### 5.2 MCP Server → Main App

| Integration | Detail |
|-------------|--------|
| **Data file** | MCP reads from `data/resume.json` — written by Zustand `persist` middleware |
| **Types** | MCP server imports `ResumeStoreData` from `@/types/resume` (via tsconfig paths) |
| **Package.json** | `npm run mcp-server` script added |
| **No runtime coupling** | MCP is a separate process — no impact on Next.js bundle |

### 5.3 Billing → Workspace

| Integration | Detail |
|-------------|--------|
| **Header** | `SubscriptionBadge` added to workspace header (next to mode toggle) |
| **ProFeatureGate** | Wraps: AI Suggestions panel, HR Coach mode toggle, Job Search panel |
| **Pricing page** | New route `/pricing` — linked from badge and ProFeatureGate overlay |
| **Store** | `useSubscriptionStore` is independent — no changes to existing stores |

### 5.4 ProFeatureGate Placement

The following premium features should be wrapped with `ProFeatureGate`:

```tsx
// In CanvasPanel — AI Suggestions
<ProFeatureGate featureName="AI Suggestions">
  <SuggestionPanel ... />
</ProFeatureGate>

// In ChatPanel — HR Coach mode toggle
<ProFeatureGate featureName="HR Coach">
  <ModeToggle ... />
</ProFeatureGate>

// In Workspace — Job Search toggle
<ProFeatureGate featureName="Job Search">
  <button onClick={toggleJobs}>Search Jobs</button>
</ProFeatureGate>
```

### 5.5 SubscriptionBadge in Header

The existing `Header.tsx` should be updated to include `SubscriptionBadge`:

```tsx
// In Header.tsx — add after the logo
<div className="flex items-center gap-3">
  <SubscriptionBadge tier={tier} />
  {/* existing sign-in button */}
</div>
```

---

## 6. File Structure Summary

```
src/
  app/
    telegram/
      page.tsx              — Telegram Mini App entry point (NEW)
      layout.tsx             — Telegram-specific layout (NEW)
    pricing/
      page.tsx              — Pricing page (NEW)
  components/
    Telegram/
      TelegramProvider.tsx   — Context provider for Telegram WebApp (NEW)
      TelegramBackButton.tsx — Back button handler (NEW)
      TelegramMainButton.tsx — Main button handler (NEW)
    Billing/
      PricingCard.tsx       — Individual plan card (NEW)
      PricingToggle.tsx     — Monthly/Yearly toggle stub (NEW)
      SubscriptionBadge.tsx — Badge in header showing current plan (NEW)
      ProFeatureGate.tsx   — Wrapper that shows lock for non-Pro users (NEW)
  hooks/
    useTelegram.ts           — Hook for Telegram WebApp API (NEW)
  stores/
    useSubscriptionStore.ts — Subscription state store (NEW)
  types/
    telegram.ts              — Telegram types (NEW)
    billing.ts               — Billing types (NEW)
    index.ts                 — Updated with new exports
  lib/
    telegram/
      sdk.ts                 — Telegram SDK wrapper (NEW)
      theme.ts               — Theme mapping (tg-theme-* → Tailwind) (NEW)
  mcp-server/
    index.ts              — Entry point, stdio transport setup (NEW)
    server.ts             — MCP server class (NEW)
    types.ts              — MCP-specific types (NEW)
    config.ts             — Server configuration (NEW)
    resources/
      resume.ts           — Resume resource handler (NEW)
      ats.ts              — ATS score resource handler (NEW)
      chat.ts             — Chat history resource handler (NEW)
    tools/
      get-resume.ts       — get_resume tool (NEW)
      get-ats-score.ts    — get_ats_score tool (NEW)
      search-jobs.ts      — search_jobs tool (NEW)
      analyze-resume.ts   — analyze_resume_section tool (NEW)
data/
  resume.json              — Shared data file for MCP (NEW)
  ats-score.json           — Shared ATS data for MCP (NEW)
  chat-history.json        — Shared chat data for MCP (NEW)
```

### Updated Files

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `export * from './telegram'` and `export * from './billing'` |
| `src/stores/index.ts` | Add `export { useSubscriptionStore }` and `export type { SubscriptionState }` |
| `package.json` | Add `"mcp-server": "tsx src/mcp-server/index.ts"` script |
| `src/components/Header.tsx` | Add `SubscriptionBadge` (optional — can be done in Phase 6) |

---

## 7. Implementation Order

### Phase 5.1 — Types (no dependencies)

1. `src/types/telegram.ts` — Telegram WebApp SDK types
2. `src/types/billing.ts` — Plan definitions, subscription types
3. Update `src/types/index.ts` — export new types

### Phase 5.2 — Stores (depends on types)

4. `src/stores/useSubscriptionStore.ts` — Subscription state with persist
5. Update `src/stores/index.ts` — export new store

### Phase 5.3 — MCP Server (standalone, no UI dependencies)

6. `src/mcp-server/types.ts` — MCP protocol types
7. `src/mcp-server/config.ts` — Server configuration
8. `src/mcp-server/resources/resume.ts` — Resume resource
9. `src/mcp-server/resources/ats.ts` — ATS score resource
10. `src/mcp-server/resources/chat.ts` — Chat history resource
11. `src/mcp-server/tools/get-resume.ts` — Get resume tool
12. `src/mcp-server/tools/get-ats-score.ts` — Get ATS score tool
13. `src/mcp-server/tools/search-jobs.ts` — Search jobs tool (stub)
14. `src/mcp-server/tools/analyze-resume.ts` — Analyze resume tool (stub)
15. `src/mcp-server/server.ts` — MCP server class
16. `src/mcp-server/index.ts` — Entry point with stdio transport
17. Update `package.json` — add `mcp-server` script
18. Create `data/` directory with empty JSON files

### Phase 5.4 — Telegram Mini App (depends on types)

19. `src/lib/telegram/sdk.ts` — SDK wrapper
20. `src/lib/telegram/theme.ts` — Theme mapping
21. `src/hooks/useTelegram.ts` — Telegram hook
22. `src/components/Telegram/TelegramProvider.tsx` — Context provider
23. `src/components/Telegram/TelegramBackButton.tsx` — Back button
24. `src/components/Telegram/TelegramMainButton.tsx` — Main button
25. `src/app/telegram/layout.tsx` — Telegram layout
26. `src/app/telegram/page.tsx` — Telegram page

### Phase 5.5 — Billing UI (depends on types + store)

27. `src/components/Billing/PricingCard.tsx` — Plan card
28. `src/components/Billing/PricingToggle.tsx` — Monthly/Yearly toggle
29. `src/components/Billing/SubscriptionBadge.tsx` — Plan badge
30. `src/components/Billing/ProFeatureGate.tsx` — Feature gate wrapper
31. `src/app/pricing/page.tsx` — Pricing page

### Phase 5.6 — Integration (depends on all above)

32. Add `SubscriptionBadge` to workspace header
33. Wrap premium features with `ProFeatureGate` in CanvasPanel, ChatPanel, Workspace
34. Verify no existing Phase 2/3/4 code was modified
