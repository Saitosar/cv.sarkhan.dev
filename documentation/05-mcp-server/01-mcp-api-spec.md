# MCP Server — API Specification

> **Проект:** cv.sarkhan.dev  
> **Назначение:** MCP Server для внешних AI-ассистентов (Claude Desktop, ChatGPT, Gemini)  
> **Язык:** TypeScript  
> **Фреймворк:** Model Context Protocol (MCP) SDK

---

## 1. Обзор

MCP Server предоставляет 3 инструмента (`tools`) для чтения и обновления резюме через внешние AI-интерфейсы. Сервер аутентифицирует запросы по токену, валидирует данные и отправляет push-уведомления в Telegram при изменениях.

### Поддерживаемые клиенты

| Клиент          | Поддержка MCP | Примечание                     |
|-----------------|---------------|--------------------------------|
| Claude Desktop  | ✅            | Нативная интеграция            |
| ChatGPT (GPTs)  | ✅            | Через Actions / MCP gateway    |
| Gemini          | ✅            | Через MCP proxy               |

---

## 2. Tools

### 2.1 `update_resume`

Обновляет одно или несколько полей резюме.

**Input Schema (JSON Schema):**

```json
{
  "name": "update_resume",
  "description": "Update resume sections. Returns updated resume on success.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "token": {
        "type": "string",
        "description": "Pro API token for authentication"
      },
      "sections": {
        "type": "object",
        "description": "Resume sections to update. Only provided fields are changed.",
        "properties": {
          "basics": {
            "type": "object",
            "description": "Personal info: name, email, phone, location, url, summary",
            "properties": {
              "name":    { "type": "string" },
              "email":   { "type": "string", "format": "email" },
              "phone":   { "type": "string" },
              "location": { "type": "string" },
              "url":     { "type": "string", "format": "uri" },
              "summary": { "type": "string" }
            }
          },
          "skills": {
            "type": "array",
            "description": "List of skills with category and keywords",
            "items": {
              "type": "object",
              "properties": {
                "name":     { "type": "string" },
                "level":    { "type": "string", "enum": ["beginner", "intermediate", "advanced", "expert"] },
                "keywords": { "type": "array", "items": { "type": "string" } }
              },
              "required": ["name"]
            }
          },
          "experience": {
            "type": "array",
            "description": "Work experience entries",
            "items": {
              "type": "object",
              "properties": {
                "company":    { "type": "string" },
                "position":   { "type": "string" },
                "startDate":  { "type": "string", "pattern": "^\\d{4}-\\d{2}$" },
                "endDate":    { "type": "string", "pattern": "^\\d{4}-\\d{2}$" },
                "current":    { "type": "boolean" },
                "summary":    { "type": "string" },
                "highlights": { "type": "array", "items": { "type": "string" } }
              },
              "required": ["company", "position"]
            }
          },
          "education": {
            "type": "array",
            "description": "Education entries",
            "items": {
              "type": "object",
              "properties": {
                "institution": { "type": "string" },
                "degree":      { "type": "string" },
                "field":       { "type": "string" },
                "startDate":   { "type": "string", "pattern": "^\\d{4}-\\d{2}$" },
                "endDate":     { "type": "string", "pattern": "^\\d{4}-\\d{2}$" },
                "gpa":         { "type": "string" }
              },
              "required": ["institution", "degree"]
            }
          },
          "projects": {
            "type": "array",
            "description": "Project entries",
            "items": {
              "type": "object",
              "properties": {
                "name":        { "type": "string" },
                "description": { "type": "string" },
                "url":         { "type": "string", "format": "uri" },
                "technologies": { "type": "array", "items": { "type": "string" } },
                "highlights":  { "type": "array", "items": { "type": "string" } }
              },
              "required": ["name"]
            }
          },
          "certificates": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name":   { "type": "string" },
                "issuer": { "type": "string" },
                "date":   { "type": "string", "pattern": "^\\d{4}-\\d{2}$" },
                "url":    { "type": "string", "format": "uri" }
              },
              "required": ["name", "issuer"]
            }
          },
          "languages": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "language": { "type": "string" },
                "fluency":  { "type": "string", "enum": ["native", "fluent", "advanced", "intermediate", "basic"] }
              },
              "required": ["language"]
            }
          }
        },
        "additionalProperties": false
      },
      "context": {
        "type": "string",
        "description": "Optional context or reason for the update (e.g., 'Applied to Google — tailored skills section')"
      }
    },
    "required": ["token", "sections"]
  }
}
```

**Success Response:**

```json
{
  "success": true,
  "resume": { /* полный объект резюме после обновления */ },
  "updated_at": "2025-07-03T12:00:00Z"
}
```

**Error Response:**

```json
{
  "error": "unauthorized",
  "upgrade_url": "https://cv.sarkhan.dev/pro"
}
```

---

### 2.2 `get_resume`

Возвращает полное резюме в формате JSON Resume.

**Input Schema (JSON Schema):**

```json
{
  "name": "get_resume",
  "description": "Retrieve the full resume as a JSON Resume object.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "token": {
        "type": "string",
        "description": "Pro API token for authentication"
      }
    },
    "required": ["token"]
  }
}
```

**Success Response:**

```json
{
  "success": true,
  "resume": { /* JSON Resume object */ },
  "meta": {
    "version": "1.0.0",
    "last_updated": "2025-07-03T12:00:00Z",
    "locale": "ru-RU"
  }
}
```

**Error Response:**

```json
{
  "error": "unauthorized",
  "upgrade_url": "https://cv.sarkhan.dev/pro"
}
```

---

### 2.3 `analyze_resume`

Анализирует резюме относительно конкретной вакансии и возвращает совместимость, gaps и рекомендации.

**Input Schema (JSON Schema):**

```json
{
  "name": "analyze_resume",
  "description": "Analyze resume fit against a job description. Returns match score, gaps, and recommendations.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "token": {
        "type": "string",
        "description": "Pro API token for authentication"
      },
      "jobDescription": {
        "type": "string",
        "description": "Full job description text to analyze against"
      }
    },
    "required": ["token", "jobDescription"]
  }
}
```

**Success Response:**

```json
{
  "success": true,
  "analysis": {
    "overall_score": 78,
    "breakdown": {
      "skills_match":       { "score": 82, "matched": ["TypeScript", "React", "Node.js"], "missing": ["Kubernetes", "GraphQL"] },
      "experience_match":   { "score": 75, "years_required": 5, "years_demonstrated": 4 },
      "education_match":    { "score": 100, "required": "Bachelor's", "has": "Master's" },
      "language_match":     { "score": 90, "note": "English fluent, Russian native" }
    },
    "gaps": [
      "No Kubernetes experience — required for Senior DevOps role",
      "GraphQL listed as 'nice to have' — consider adding side project"
    ],
    "recommendations": [
      "Add 'Docker Compose' to skills section",
      "Highlight team leadership experience in latest role"
    ],
    "suggested_headline": "Full-Stack Engineer | TypeScript, React, Node.js | 4+ years"
  }
}
```

**Error Response:**

```json
{
  "error": "unauthorized",
  "upgrade_url": "https://cv.sarkhan.dev/pro"
}
```

---

## 3. TypeScript Implementation

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// --- Types ---

interface UpdateResumeInput {
  token: string;
  sections: Record<string, unknown>;
  context?: string;
}

interface GetResumeInput {
  token: string;
}

interface AnalyzeResumeInput {
  token: string;
  jobDescription: string;
}

// --- Server Setup ---

const server = new Server(
  { name: 'cv-sarkhan-dev-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// --- Tool Handlers ---

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'update_resume',
      description: 'Update resume sections. Returns updated resume on success.',
      inputSchema: {
        type: 'object',
        properties: {
          token:    { type: 'string', description: 'Pro API token for authentication' },
          sections: {
            type: 'object',
            description: 'Resume sections to update. Only provided fields are changed.',
            properties: {
              basics:       { type: 'object' },
              skills:       { type: 'array', items: { type: 'object' } },
              experience:   { type: 'array', items: { type: 'object' } },
              education:    { type: 'array', items: { type: 'object' } },
              projects:     { type: 'array', items: { type: 'object' } },
              certificates: { type: 'array', items: { type: 'object' } },
              languages:    { type: 'array', items: { type: 'object' } },
            },
            additionalProperties: false,
          },
          context: { type: 'string', description: 'Optional context for the update' },
        },
        required: ['token', 'sections'],
      },
    },
    {
      name: 'get_resume',
      description: 'Retrieve the full resume as a JSON Resume object.',
      inputSchema: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'Pro API token for authentication' },
        },
        required: ['token'],
      },
    },
    {
      name: 'analyze_resume',
      description: 'Analyze resume fit against a job description. Returns match score, gaps, and recommendations.',
      inputSchema: {
        type: 'object',
        properties: {
          token:          { type: 'string', description: 'Pro API token for authentication' },
          jobDescription: { type: 'string', description: 'Full job description text' },
        },
        required: ['token', 'jobDescription'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'update_resume': {
        const { token, sections, context } = args as unknown as UpdateResumeInput;
        const user = await validateToken(token);
        if (!user) return unauthorizedError();

        const resume = await updateResumeInDB(user.id, sections, context);
        await sendTelegramNotification(user.id, 'resume_updated', { context });

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, resume, updated_at: new Date().toISOString() }) }],
        };
      }

      case 'get_resume': {
        const { token } = args as unknown as GetResumeInput;
        const user = await validateToken(token);
        if (!user) return unauthorizedError();

        const resume = await getResumeFromDB(user.id);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              resume,
              meta: { version: '1.0.0', last_updated: resume.updated_at, locale: 'ru-RU' },
            }),
          }],
        };
      }

      case 'analyze_resume': {
        const { token, jobDescription } = args as unknown as AnalyzeResumeInput;
        const user = await validateToken(token);
        if (!user) return unauthorizedError();

        const analysis = await analyzeResumeFit(user.id, jobDescription);

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, analysis }) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return {
      isError: true,
      content: [{ type: 'text', text: JSON.stringify({ error: 'internal_error', message: (err as Error).message }) }],
    };
  }
});

// --- Helpers ---

function unauthorizedError() {
  return {
    isError: true,
    content: [{
      type: 'text',
      text: JSON.stringify({
        error: 'unauthorized',
        upgrade_url: 'https://cv.sarkhan.dev/pro',
      }),
    }],
  };
}

// --- Placeholder DB / Service functions ---
// These would be implemented against your actual data layer.

async function validateToken(token: string): Promise<{ id: string } | null> {
  // 1. bcrypt.compare(token_hash, stored_hash)
  // 2. Check rate limit
  // 3. Update last_used_at
  // 4. Return user or null
  return null;
}

async function updateResumeInDB(userId: string, sections: Record<string, unknown>, context?: string) {
  // Update resume document in DB
  return {};
}

async function getResumeFromDB(userId: string) {
  // Fetch full resume from DB
  return { updated_at: new Date().toISOString() };
}

async function analyzeResumeFit(userId: string, jobDescription: string) {
  // Call LLM or rules engine to analyze fit
  return { overall_score: 0, breakdown: {}, gaps: [], recommendations: [] };
}

async function sendTelegramNotification(userId: string, event: string, payload: Record<string, unknown>) {
  // Push notification via Telegram Bot API
}

// --- Start ---

const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## 4. Telegram Push-уведомления

При каждом успешном вызове `update_resume` через MCP сервер отправляет push-уведомление владельцу в Telegram.

**Формат уведомления:**

```
📝 Resume Updated via MCP
━━━━━━━━━━━━━━━━━━━
Tool: update_resume
Sections: skills, experience
Context: Applied to Google
Time: 2025-07-03 12:00 UTC
━━━━━━━━━━━━━━━━━━━
View: https://cv.sarkhan.dev/resume
```

**Реализация (Telegram Bot API):**

```typescript
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID  = process.env.TELEGRAM_CHAT_ID!;

async function sendTelegramNotification(
  userId: string,
  event: string,
  payload: { context?: string; sections?: string[] }
) {
  const text = [
    `📝 Resume Updated via MCP`,
    `━━━━━━━━━━━━━━━━━━━`,
    `Tool: ${event}`,
    payload.sections?.length ? `Sections: ${payload.sections.join(', ')}` : null,
    payload.context ? `Context: ${payload.context}` : null,
    `Time: ${new Date().toUTCString()}`,
    `━━━━━━━━━━━━━━━━━━━`,
    `View: https://cv.sarkhan.dev/resume`,
  ]
    .filter(Boolean)
    .join('\n');

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' }),
  });
}
```

---

## 5. Запуск

```bash
# Установка зависимостей
npm install @modelcontextprotocol/sdk

# Запуск (stdio transport — для Claude Desktop)
node dist/mcp-server.js

# Запуск с HTTP transport (для ChatGPT / Gemini)
node dist/mcp-server-http.js --port 3100
```

### Claude Desktop Config

```json
{
  "mcpServers": {
    "cv-sarkhan-dev": {
      "command": "node",
      "args": ["/path/to/dist/mcp-server.js"]
    }
  }
}
```

---

## 6. Обработка ошибок

| HTTP Status | Error Code       | Description                        |
|-------------|------------------|------------------------------------|
| 401         | `unauthorized`   | Token missing, expired, or invalid |
| 429         | `rate_limited`   | Too many requests (см. security)   |
| 400         | `validation_error` | Некорректные входные данные      |
| 500         | `internal_error` | Внутренняя ошибка сервера          |

Все ошибки возвращают JSON с полями `error` и (где применимо) `upgrade_url` для направления пользователя к плану Pro.
