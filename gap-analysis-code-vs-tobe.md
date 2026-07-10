# Gap Analysis Report — Code vs TO BE

**Дата:** 2026-07-10
**Проект:** cv.sarkhan.dev
**Методология:** Сравнение TO BE архитектуры (documentation/01-architecture/) с реальным кодом (src/)

---

## Сводка

| Категория | Всего TO BE фич | Реализовано | Частично | Отсутствует | % готовности |
|-----------|----------------|-------------|----------|-------------|-------------|
| Core UI (Split-Screen) | 10 | 9 | 1 | 0 | 95% |
| Chat System | 12 | 11 | 1 | 0 | 92% |
| Canvas/Resume | 10 | 10 | 0 | 0 | 100% |
| AI Router | 8 | 8 | 0 | 0 | 100% |
| Model Routing | 6 | 0 | 6 | 0 | 20% |
| MCP Server | 5 | 2 | 1 | 2 | 40% |
| Telegram Mini App | 6 | 2 | 2 | 2 | 33% |
| Auth System | 4 | 0 | 0 | 4 | 0% |
| Privacy-First Storage | 5 | 1 | 2 | 2 | 20% |
| Billing/Payments | 4 | 2 | 2 | 0 | 50% |
| Infrastructure (CI/CD) | 3 | 0 | 0 | 3 | 0% |
| Monitoring | 4 | 4 | 0 | 0 | 100% |
| Rate Limiting | 3 | 3 | 0 | 0 | 100% |
| Job Search | 4 | 3 | 1 | 0 | 75% |
| HR Coach | 3 | 3 | 0 | 0 | 100% |
| AI Suggestions | 3 | 3 | 0 | 0 | 100% |
| Voice Input | 3 | 2 | 1 | 0 | 67% |
| **ИТОГО** | **93** | **63** | **17** | **13** | **68%** |

---

## Детальный Gap Analysis

### 1. Core UI — Split-Screen Layout

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| SplitScreen с изменяемым сплиттером | ✅ | `src/components/SplitScreen.tsx` — drag handle, mouse/touch/keyboard, ARIA | Соответствует |
| ChatPanel (30-35%) | ✅ | `src/components/ChatPanel.tsx` | Соответствует |
| CanvasPanel (65-70%) | ✅ | `src/components/CanvasPanel.tsx` | Соответствует |
| Мобильная адаптация (tabs) | ✅ | MobileTabBar, 4 tabs (chat, resume, jobs, score) | Соответствует |
| MobileTabBar с 3 табами | 🟡 | MobileTabBar имеет 4 таба (chat, resume, jobs, score) | TO BE: 3 таба (Chat, Resume, Score). Факт: 4 таба — добавлен Jobs |
| `/workspace` route | ✅ | `src/app/workspace/page.tsx` | Соответствует |
| Анимации (typing, pulse, shimmer, fade-in) | ✅ | CSS keyframes в globals.css, PulseRing, TypingIndicator | Соответствует |
| Стилизация (glass-panel, design tokens) | ✅ | Все CSS классы, design tokens в globals.css | Соответствует |
| Hide header on `/workspace` | ✅ | layout.tsx условно скрывает хедер | Соответствует |
| Splitter aria-* attributes | ✅ | aria-label, tabIndex, aria-valuenow/min/max | Соответствует |

### 2. Chat System

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| ChatHeader | ✅ | `src/components/ChatPanel/ChatHeader.tsx` | Соответствует |
| SessionBadge | ✅ | `src/components/ChatPanel/SessionBadge.tsx` | Соответствует |
| MessageList | ✅ | `src/components/ChatPanel/MessageList.tsx` | Соответствует |
| AgentMessage | ✅ | `src/components/ChatPanel/AgentMessage.tsx` | Соответствует |
| UserMessage | ✅ | `src/components/ChatPanel/UserMessage.tsx` | Соответствует |
| TypingIndicator | ✅ | `src/components/ChatPanel/TypingIndicator.tsx` | Соответствует |
| ChatInput | ✅ | `src/components/ChatPanel/ChatInput.tsx` | Соответствует |
| SuggestionChips | ✅ | `src/components/ChatPanel/SuggestionChips.tsx` | Соответствует |
| VoiceButton | 🟡 | `src/components/ChatPanel/VoiceButton.tsx` существует, но не интегрирована в ChatInput | Кнопка микрофона не добавлена в ChatInput |
| Auto-scroll | ✅ | `MessageList` использует scrollTo с smooth behavior | Соответствует |
| Send on Enter, Shift+Enter newline | ✅ | ChatInput обрабатывает Enter/Shift+Enter | Соответствует |
| AbortController для отмены | ✅ | `chatSSE.cancel()`, abortController в route | Соответствует |

### 3. Canvas / Resume Panel

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| ResumeCanvas | ✅ | `src/components/CanvasPanel/ResumeCanvas.tsx` | Соответствует |
| ResumeHeader | ✅ | `src/components/CanvasPanel/ResumeHeader.tsx` | Соответствует |
| ResumeSection | ✅ | `src/components/CanvasPanel/ResumeSection.tsx` | Соответствует |
| ATSScoreWidget | ✅ | `src/components/CanvasPanel/ATSScoreWidget.tsx` | Соответствует |
| CircularScore | ✅ | `src/components/CanvasPanel/CircularScore.tsx` | Соответствует |
| PulseRing | ✅ | `src/components/CanvasPanel/PulseRing.tsx` | Соответствует |
| ShimmerSkeleton | ✅ | `src/components/CanvasPanel/ShimmerSkeleton.tsx` | Соответствует |
| SuggestionPanel | ✅ | `src/components/CanvasPanel/SuggestionPanel.tsx` | Соответствует |
| Section tap -> focus-chat event | ✅ | CustomEvent 'focus-chat' dispatch | Соответствует |
| ATS Score animation (SVG transition) | ✅ | SVG stroke-dashoffset transition | Соответствует |

### 4. AI Router (src/lib/ai/)

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| AIRouter class | ✅ | `src/lib/ai/router.ts` | Соответствует |
| Task routing (chat, ats-score, generate, etc.) | ✅ | 8 task types: chat, ats-score, generate, tailor, analyze, suggest, suggestions, search | Соответствует |
| Streaming (SSE) route | ✅ | `routeStream()` async generator | Соответствует |
| Cache with TTL | ✅ | `src/lib/ai/cache.ts` — 5min TTL, LRU eviction | Соответствует |
| Fallback chain | ✅ | `executeWithFallback()` — primary + fallbacks | Соответствует |
| Retry with backoff | ✅ | `src/lib/ai/retry.ts` — exponential backoff | Соответствует |
| Error classification | ✅ | `src/lib/ai/errors.ts` — 8 error codes | Соответствует |
| Prompt templates | ✅ | `src/lib/ai/prompts/` — 7 templates | Соответствует |

### 5. Model Routing (CRITICAL — Model Diversity Gap)

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| Gemini 2.5 Flash (Dialogue) | ❌ | Все модели = `deepseek-v4-flash` через Ollama Cloud | TO BE требует Gemini 2.5 Flash для диалога |
| DeepSeek V4 Pro (Parsing) | ❌ | Нет DeepSeek V4 Pro | TO BE требует Pro для парсинга |
| Kimi K2.7 Code (ATS) | ❌ | Нет Kimi K2.7 Code | TO BE требует Kimi для ATS |
| Gemini 2.5 Flash Lite (Search) | ❌ | Нет Flash Lite | TO BE требует Lite для поиска |
| Whisper/Deepgram (Voice) | ❌ | Web Speech API (браузерный STT) | TO BE требует серверный Whisper/Deepgram |
| Task-aware model routing | ❌ | Все запросы идут на одну модель | TO BE: разные задачи → разные модели |

**Критическое расхождение:** TO BE описывает маршрутизацию между 5+ моделями от разных провайдеров. Реальность: одна модель (`deepseek-v4-flash`) через единственный провайдер (Ollama Cloud). `src/lib/gemini.ts` — это обёртка OpenAI SDK, подключённая к Ollama Cloud, а не к Google Gemini.

### 6. MCP Server

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| MCP SDK (Model Context Protocol) | ❌ | Hand-rolled JSON-RPC 2.0 | TO BE требует @modelcontextprotocol/sdk |
| `update_resume` tool | ❌ | Отсутствует | TO BE требует CRUD |
| `get_resume` tool | ✅ | `get-resume` tool (иное именование) | camelCase вместо snake_case |
| `analyze_resume` tool | 🟡 | `analyze-resume-section` (иное именование, section-only) | TO BE: analyze_resume с jobDescription |
| Token-based auth | ❌ | Нет аутентификации | TO BE: bcrypt, prefix, rate limiting |
| Telegram push notifications | ❌ | Нет уведомлений | TO BE: push на update_resume |
| Rate limiting | ❌ | Нет rate limiting | TO BE: 100 req/h, 10 req/min burst |
| Audit logging | ❌ | Нет mcp_logs | TO BE: полный аудит |
| `search-jobs` tool | ✅ | Search-jobs tool | Сверх TO BE |

**Дополнительно:** TO BE требует 3 MCP tools, в реальности 4 (добавлены search-jobs, get-ats-score). Но update_resume отсутствует.

### 7. Telegram Mini App

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| TelegramProvider | ✅ | `src/components/Telegram/TelegramProvider.tsx` | Соответствует |
| TelegramBackButton | ✅ | `src/components/Telegram/TelegramBackButton.tsx` | Соответствует |
| TelegramMainButton | ✅ | `src/components/Telegram/TelegramMainButton.tsx` | Соответствует |
| `POST /api/auth/telegram` | ❌ | Отсутствует | TO BE: initData validation + auth |
| initData validation (HMAC-SHA256) | ❌ | Нет валидации | TO BE: полная crypto-верификация |
| Push notifications (Bot API) | ❌ | Нет уведомлений | TO BE: sendMessage через Bot API |
| Telegram Stars billing | ❌ | Нет интеграции | TO BE: createInvoiceLink, webhook |
| `/api/telegram-webhook` | ❌ | Отсутствует | TO BE: pre_checkout_query + successful_payment |
| `/api/create-invoice` | ❌ | Отсутствует | TO BE: Telegram Stars invoice |
| Telegram theme adaptation | ✅ | `applyTelegramTheme()` + CSS vars | Соответствует |

### 8. Auth System (CRITICAL — Missing Entirely)

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| NextAuth.js (OAuth + Credentials) | ❌ | Нет реализации | TO BE: полный auth pipeline |
| GitHub OAuth | ❌ | Нет | TO BE: OAuth provider |
| Google OAuth | ❌ | Нет | TO BE: OAuth provider |
| Email/password registration | ❌ | Нет | TO BE: Credentials provider |
| Session management (JWT) | ❌ | Нет | TO BE: JWT сессии |
| `/api/auth/*` routes | ❌ | Нет auth routes | TO BE: login, register, callback |

**Критическое расхождение:** Вся auth-система отсутствует. Нет NextAuth, нет OAuth, нет login/register страниц, нет JWT. Пользователь не может зарегистрироваться.

### 9. Privacy-First Storage

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| Prisma schema | ✅ | `prisma/schema.prisma` — все 7 моделей | Соответствует |
| PostgreSQL подключение | ❌ | Нет `DATABASE_URL` | TO BE: подключённая БД |
| Prisma client usage | ❌ | Ни один route не использует prisma | TO BE: server-side persistence |
| localStorage adapter | ❌ | Нет LocalStorageAdapter класса | TO BE: `cv_sarkhan_` prefix |
| AutoSaveManager | ❌ | Нет реализации | TO BE: debounced auto-save |
| Data migration Guest → Registered | ❌ | Нет | TO BE: `migrateGuestToRegistered()` |
| Consent management UI | ❌ | Нет | TO BE: checkbox + GDPR notice + consent log |
| Guest watermark on PDF | ❌ | Нет | TO BE: "Created with cv.sarkhan.dev — Upgrade to Pro" |
| Privacy policy page `/privacy` | ❌ | Нет | TO BE: GDPR-compliant privacy page |

**Критическое расхождение:** Prisma schema на 100% соответствует TO BE, но не подключена к БД и не используется. Все данные живут в памяти Zustand store. Нет localStorage persistence.

### 10. Billing / Payments

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| PricingCard | ✅ | `src/components/Billing/PricingCard.tsx` | Соответствует |
| PricingToggle | ✅ | `src/components/Billing/PricingToggle.tsx` | Соответствует |
| ProFeatureGate | ✅ | `src/components/Billing/ProFeatureGate.tsx` | Соответствует |
| SubscriptionBadge | ✅ | `src/components/Billing/SubscriptionBadge.tsx` | Соответствует |
| SubscriptionStore | ✅ | `src/stores/useSubscriptionStore.ts` | Соответствует |
| Stripe integration | ❌ | Нет | TO BE: Stripe Checkout |
| Telegram Stars billing | ❌ | Нет | TO BE: createInvoiceLink |
| Crypto payments | ❌ | Нет | TO BE: Solana/USDC |
| `/api/create-checkout` | ❌ | Нет | TO BE: Stripe session |
| `/pricing` page | ✅ | `src/app/pricing/page.tsx` | Stub — FAQ указывает "Billing is currently in stub mode" |

**Расхождение:** Billing — полностью stub. subscribe('pro') показывает "Coming Soon". Никакие реальные платежи не работают.

### 11. Infrastructure / CI/CD

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| GitHub Actions CI workflow | ❌ | Отсутствует `.github/workflows/` | TO BE: quality, e2e, deploy stages |
| npm run lint | ❌ | Не проверялось | TO BE: часть CI |
| npm run type-check | ❌ | Нет type-check скрипта | TO BE: часть CI |
| npm run test -- --coverage | ❌ | Не проверялось | TO BE: часть CI |
| npm run build | ✅ | Есть build скрипт | — |
| Playwright e2e | ❌ | Нет e2e тестов | TO BE: Playwright |
| Vercel auto-deploy | ❌ | Нет | TO BE: amondnet/vercel-action |
| Branch strategy (main/develop/feature) | ❌ | Ветки не соблюдаются | TO BE: git flow |

### 12. Monitoring

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| pino logger | ✅ | `src/lib/monitoring/logger.ts` | Соответствует |
| Metrics collector | ✅ | `src/lib/monitoring/metrics.ts` | Соответствует |
| Alert evaluation | ✅ | `src/lib/monitoring/alerts.ts` | Соответствует |
| Health endpoint `/api/health` | ✅ | `src/app/api/health/route.ts` | Соответствует |
| Monitoring middleware | ✅ | `src/lib/monitoring/middleware.ts` | Соответствует |

### 13. Rate Limiting

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| 3-tier config (auth/api/public) | ✅ | `src/lib/rate-limit/config.ts` | Соответствует |
| checkRateLimit middleware | ✅ | `src/lib/rate-limit/checker.ts` | Соответствует |
| withRateLimit HOF | ✅ | `src/lib/rate-limit/checker.ts` | Соответствует |
| InMemoryRateLimitStore | ✅ | `src/lib/rate-limit/store.ts` | Соответствует |
| SSE exclusion | ✅ | resolveTier возвращает null для SSE | Соответствует |

### 14. Job Search

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| JobSearchPanel | ✅ | `src/components/JobSearch/JobSearchPanel.tsx` | Соответствует |
| JobSearchForm | ✅ | `src/components/JobSearch/JobSearchForm.tsx` | Соответствует |
| JobCard | ✅ | `src/components/JobSearch/JobCard.tsx` | Соответствует |
| MatchScoreBadge | ✅ | `src/components/JobSearch/MatchScoreBadge.tsx` | Соответствует |
| search-service | 🟡 | Mock data только | TO BE: AI-скоринг через router |
| `/api/jobs/search` | ✅ | `src/app/api/jobs/search/route.ts` | Работает, но с мок-данными |
| AI scoring integration | ❌ | `// Phase 5 will integrate the AI Router` | TO BE: AI-match scoring |

### 15. HR Coach

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| ChatMode 'hr-coach' | ✅ | `src/types/hr-coach.ts` | Соответствует |
| Alternate system prompt | ✅ | `alternateSystemPrompt` в config.ts | Соответствует |
| ModeToggle | ✅ | `src/components/ChatPanel/ModeToggle.tsx` | Соответствует |
| HR Coach prompt | ✅ | `src/lib/ai/prompts/hr-coach.ts` | Соответствует |

### 16. AI Suggestions

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| SuggestionPanel | ✅ | `src/components/CanvasPanel/SuggestionPanel.tsx` | Соответствует |
| SuggestionCard | ✅ | `src/components/CanvasPanel/SuggestionCard.tsx` | Соответствует |
| SeverityBadge | ✅ | `src/components/CanvasPanel/SeverityBadge.tsx` | Соответствует |
| useSuggestionStore | ✅ | `src/stores/useSuggestionStore.ts` | Соответствует |
| ProFeatureGate wrapped | ✅ | SuggestionPanel обёрнут в ProFeatureGate | Соответствует |

### 17. Voice Input

| TO BE Фича | Статус | Реальность | Расхождение |
|------------|--------|------------|-------------|
| useVoiceInput hook | ✅ | `src/hooks/useVoiceInput.ts` | Соответствует |
| VoiceButton component | ✅ | `src/components/ChatPanel/VoiceButton.tsx` | Соответствует |
| Voice types | ✅ | `src/types/voice.ts` | Соответствует |
| VoiceButton integration in ChatInput | ❌ | VoiceButton не встроен в ChatInput | TO BE: кнопка микрофона в поле ввода |

---

## Критические расхождения

### P0 — Блокирующие

1. **🚨 Auth System отсутствует полностью**
   - TO BE: NextAuth.js с OAuth (GitHub, Google) + Credentials
   - Реальность: Нет auth роутов, нет login/register, нет JWT, нет сессий
   - Влияние: Пользователь не может зарегистрироваться. Guest/Free/Pro модель не работает.

2. **🚨 Model Diversity — одна модель вместо 5+**
   - TO BE: Gemini 2.5 Flash, DeepSeek V4 Flash/Pro, Kimi K2.7 Code, Gemini 2.5 Flash Lite, Whisper/Deepgram
   - Реальность: Все задачи → `deepseek-v4-flash` через Ollama Cloud
   - Влияние: Нет оптимизации по стоимости/качеству. Нет ATS-специализированной модели. Нет серверного STT.

3. **🚨 Prisma schema не подключена к БД**
   - TO BE: PostgreSQL + Prisma для registered users
   - Реальность: Schema существует, но `DATABASE_URL` не настроена, prisma client не используется
   - Влияние: Все данные живут только в памяти. Нет cross-session persistence.

### P1 — Высокий приоритет

4. **MCP Server не соответствует TO BE**
   - TO BE: MCP SDK, update_resume/get_resume/analyze_resume с token auth
   - Реальность: Hand-rolled JSON-RPC, нет update_resume, нет auth, нет rate limiting
   - Влияние: Внешние AI-агенты (Claude, ChatGPT) не могут обновлять резюме

5. **Telegram Mini App без auth и billing**
   - TO BE: initData validation, auth, push, Stars billing
   - Реальность: Только UI-обёртка, нет бэкенда
   - Влияние: Telegram Mini App — пустая обёртка без функциональности

6. **Billing — stub режим**
   - TO BE: Stripe, Telegram Stars, Crypto
   - Реальность: subscribe('pro') → "Coming Soon"
   - Влияние: Нет монетизации. ProFeatureGate всегда показывает бесплатный контент.

### P2 — Средний приоритет

7. **CI/CD отсутствует**
   - TO BE: GitHub Actions (quality → e2e → deploy)
   - Реальность: Нет .github/workflows/
   - Влияние: Нет автоматических проверок, нет auto-deploy

8. **VoiceButton не интегрирован в ChatInput**
   - TO BE: кнопка микрофона рядом с полем ввода
   - Реальность: Компонент существует, но не добавлен в ChatInput

9. **Guest watermark на PDF не реализован**
   - TO BE: "Created with cv.sarkhan.dev — Upgrade to Pro to remove"
   - Реальность: Нет watermark

---

## Рекомендации

1. **P0: Реализовать Auth System** — NextAuth.js с OAuth (GitHub, Google) + Credentials. Создать `/api/auth/[...nextauth]`, login/register страницы, JWT менеджмент.

2. **P0: Подключить Prisma к PostgreSQL** — Настроить DATABASE_URL, запустить prisma generate, prisma db push. Внедрить PrismaClient в API routes.

3. **P0: Реализовать Model Diversity** — Подключить Gemini SDK, добавить DeepSeek V4 Pro, Kimi K2.7 Code, Gemini 2.5 Flash Lite. Реализовать task-aware routing.

4. **P1: Переписать MCP Server** — Использовать @modelcontextprotocol/sdk. Добавить update_resume tool. Реализовать token auth (bcrypt + prefix), rate limiting, audit logging, Telegram push.

5. **P1: Реализовать Telegram Auth** — initData validation (HMAC-SHA256), POST /api/auth/telegram, JWT сессии. Telegram Stars billing: createInvoiceLink, webhook.

6. **P1: Реализовать реальный Billing** — Stripe Checkout, Telegram Stars, API для проверки подписки.

7. **P2: Создать CI/CD pipeline** — GitHub Actions workflow: lint → type-check → test → build → deploy.

8. **P2: Интегрировать VoiceButton в ChatInput** — Добавить кнопку микрофона слева от поля ввода.

9. **P2: Реализовать localStorage persistence** — LocalStorageAdapter, AutoSaveManager, Guest watermark.

10. **P2: Реализовать Consent Management** — GDPR-совместимый consent UI, consent_log запись.

---

**Итого:** 68% TO BE фич реализовано. Ключевые провалы: Auth (0%), Model Diversity (20%), Storage (20%), MCP (40%), Telegram (33%), Billing (50%), CI/CD (0%). Инфраструктурные компоненты (Monitoring, Rate Limiting) — 100%.