## Фаза 5 — Разработчик: MCP Server

### Контекст
Проект: /root/cv.sarkhan.dev
Архитектура: /root/cv.sarkhan.dev/documentation/phase-5-integration-architecture.md (прочитай перед началом)

### Существующий код
- Types: src/types/ (resume.ts, ats.ts, chat.ts, job-search.ts)
- Stores: src/stores/ (useResumeStore, useATSStore, useChatStore, useJobSearchStore)
- AI Router: src/lib/ai/router.ts
- Jobs: src/lib/jobs/mock-data.ts, search-service.ts

### Твоя задача: MCP Server

Создай файлы:

1. **src/mcp-server/types.ts** — MCP-specific типы
2. **src/mcp-server/config.ts** — конфигурация сервера
3. **src/mcp-server/resources/resume.ts** — resume://current resource
4. **src/mcp-server/resources/ats.ts** — ats://score resource
5. **src/mcp-server/resources/chat.ts** — chat://history resource
6. **src/mcp-server/tools/get-resume.ts** — get_resume tool
7. **src/mcp-server/tools/get-ats-score.ts** — get_ats_score tool
8. **src/mcp-server/tools/search-jobs.ts** — search_jobs tool
9. **src/mcp-server/tools/analyze-resume.ts** — analyze_resume_section tool
10. **src/mcp-server/server.ts** — MCPServer class
11. **src/mcp-server/index.ts** — entry point (stdio transport)
12. **data/resume.json** — shared data file (sample resume data)

### MCP Protocol

MCP uses JSON-RPC 2.0 over stdio.

**Request format:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "resources/read",
  "params": { "uri": "resume://current" }
}
```

**Response format:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": { "contents": [{ "uri": "resume://current", "text": "..." }] }
}
```

**Capabilities announcement:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "capabilities": {
      "resources": {},
      "tools": {}
    },
    "serverInfo": { "name": "cv-mcp-server", "version": "1.0.0" }
  }
}
```

### Детали реализации

**MCPServer class**:
- initialize() — обрабатывает initialize request, возвращает capabilities
- handleRequest(message) — роутинг по method
- Поддерживаемые методы:
  - initialize
  - resources/list
  - resources/read
  - tools/list
  - tools/call
- JSON-RPC 2.0 error handling (ParseError, InvalidRequest, MethodNotFound, InternalError)

**Resources**:
- resume://current — полные данные резюме из data/resume.json
- ats://score — ATS score из data/resume.json
- chat://history — история чата (заглушка)

**Tools**:
- get_resume(params: { section?: string }) — возвращает резюме или конкретную секцию
- get_ats_score() — возвращает ATS score
- search_jobs(params: { query: string, location?: string }) — поиск вакансий (использует mock-data)
- analyze_resume_section(params: { section: string }) — анализ секции (заглушка)

**index.ts**:
- Читает stdin построчно
- Парсит JSON-RPC сообщения
- Передаёт в MCPServer.handleRequest()
- Пишет ответы в stdout
- process.on('SIGTERM') для graceful shutdown

**data/resume.json**:
- Пример данных резюме (имя, должность, контакты, summary, опыт, образование, навыки, ATS score)
- Формат совместим с src/types/resume.ts

**package.json scripts**:
- Добавить "mcp-server": "tsx src/mcp-server/index.ts"

### Важно
- Не ломать существующий код
- MCP Server — standalone процесс, не зависит от Next.js
- Использовать только Node.js built-in модули (readline, process)
- Не использовать @modelcontextprotocol/sdk — реализовать протокол вручную (чистый JSON-RPC 2.0)
- После реализации запусти npm run build и исправь ошибки
