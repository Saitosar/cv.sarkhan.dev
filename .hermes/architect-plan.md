# Architect Plan — Исправление P0 и P1 расхождений

**Проект:** cv.sarkhan.dev
**Дата:** 2026-07-10
**Основание:** Gap Analysis (gap-analysis-code-vs-tobe.md) + TO BE Architecture (01-to-be-overview.md)
**Всего задач:** 18
**Суммарно Story Points:** 89

---

## Сводка по приоритетам

| Приоритет | Задач | SP | Описание |
|-----------|-------|----|----------|
| **P0** | 9 | 46 | Auth System, Model Diversity, Prisma/БД |
| **P1** | 9 | 43 | MCP Server, Telegram Mini App, Billing |

---

## P0 — Критические расхождения

---

### ARC-001: Установка NextAuth.js и базовых зависимостей

**Описание:** Установить `next-auth` (v5 beta для Next.js 16), `bcryptjs`, `@types/bcryptjs`. Создать `.env` с переменными для OAuth (GITHUB_ID, GITHUB_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL).

**Файлы для изменения/создания:**
- `package.json` — добавить зависимости
- `.env` — создать с переменными окружения
- `.env.example` — создать шаблон

**Story Points:** 2
**Зависимости:** Нет
**Приоритет:** P0

---

### ARC-002: Auth-конфигурация NextAuth.js (OAuth + Credentials)

**Описание:** Создать `src/lib/auth/auth-options.ts` с провайдерами GitHub, Google и Credentials (email/password). Настроить JWT-сессии с кастомным encode/decode для расширенных данных пользователя. Credentials provider должен использовать bcryptjs для хеширования/проверки паролей. Определить типы `Session` и `JWT` с полями `id`, `tier`, `provider`.

**Файлы для изменения/создания:**
- `src/lib/auth/auth-options.ts` — создать
- `src/lib/auth/index.ts` — создать (реэкспорт)
- `src/types/next-auth.d.ts` — создать (расширение типов)

**Story Points:** 5
**Зависимости:** ARC-001
**Приоритет:** P0

---

### ARC-003: API-роуты NextAuth.js

**Описание:** Создать `src/app/api/auth/[...nextauth]/route.ts` — catch-all route для NextAuth.js. Создать `src/app/api/auth/register/route.ts` — POST-эндпоинт для регистрации новых пользователей (валидация zod, хеширование bcrypt, создание записи в БД через Prisma).

**Файлы для изменения/создания:**
- `src/app/api/auth/[...nextauth]/route.ts` — создать
- `src/app/api/auth/register/route.ts` — создать

**Story Points:** 3
**Зависимости:** ARC-002, ARC-007 (Prisma client)
**Приоритет:** P0

---

### ARC-004: Login/Register страницы

**Описание:** Создать страницы `/login` и `/register` с формами (email, password, подтверждение пароля для регистрации). Использовать `react-hook-form` + `zod` для валидации. Кнопки OAuth (GitHub, Google) через `signIn()` из next-auth/react. После успешного входа — редирект на `/workspace`. UI в стиле glass-panel, соответствующий дизайн-системе проекта.

**Файлы для изменения/создания:**
- `src/app/login/page.tsx` — создать
- `src/app/register/page.tsx` — создать
- `src/components/Auth/LoginForm.tsx` — создать
- `src/components/Auth/RegisterForm.tsx` — создать
- `src/components/Auth/OAuthButtons.tsx` — создать
- `src/components/Auth/AuthLayout.tsx` — создать

**Story Points:** 5
**Зависимости:** ARC-003
**Приоритет:** P0

---

### ARC-005: Auth middleware для защиты роутов

**Описание:** Создать `src/middleware.ts` (Next.js middleware) для проверки JWT-сессии на защищённых роутах (`/workspace`, `/pricing`, `/api/protected/*`). Перенаправлять неавторизованных пользователей на `/login`. Настроить matcher для исключения публичных роутов (`/api/auth/*`, `/_next/*`, статика).

**Файлы для изменения/создания:**
- `src/middleware.ts` — создать

**Story Points:** 3
**Зависимости:** ARC-002
**Приоритет:** P0

---

### ARC-006: Model Diversity — установка SDK и провайдеров

**Описание:** Установить SDK для новых моделей: `@google/generative-ai` (уже есть, обновить), `@deepseek/ai` (DeepSeek V4 Pro), `kimi-ai` (Kimi K2.7 Code). Создать фабрику провайдеров `src/lib/ai/providers/` с единым интерфейсом `AIProvider`. Каждый провайдер реализует `chat()` и `chatStream()`.

**Файлы для изменения/создания:**
- `package.json` — добавить зависимости
- `src/lib/ai/providers/types.ts` — создать (единый интерфейс AIProvider)
- `src/lib/ai/providers/ollama-cloud.ts` — создать (текущий провайдер)
- `src/lib/ai/providers/gemini.ts` — создать (Gemini 2.5 Flash / Flash Lite)
- `src/lib/ai/providers/deepseek.ts` — создать (DeepSeek V4 Pro)
- `src/lib/ai/providers/kimi.ts` — создать (Kimi K2.7 Code)
- `src/lib/ai/providers/index.ts` — создать (реестр провайдеров)

**Story Points:** 5
**Зависимости:** Нет
**Приоритет:** P0

---

### ARC-007: Model Diversity — обновление config.ts и router.ts

**Описание:** Обновить `MODEL_CONFIGS` в `config.ts`: каждой задаче назначить свою модель согласно TO BE. Dialogue → Gemini 2.5 Flash, Parsing → DeepSeek V4 Pro, ATS → Kimi K2.7 Code, Search → Gemini 2.5 Flash Lite. Обновить `router.ts`: заменить прямые вызовы `getGemini()` на вызовы через провайдер-фабрику. `executeWithFallback()` должен пробовать альтернативные провайдеры при отказе основного.

**Файлы для изменения/создания:**
- `src/lib/ai/config.ts` — изменить MODEL_CONFIGS
- `src/lib/ai/router.ts` — изменить executeWithFallback, routeStream
- `src/lib/gemini.ts` — удалить или переименовать (больше не используется напрямую)

**Story Points:** 8
**Зависимости:** ARC-006
**Приоритет:** P0

---

### ARC-008: Prisma — настройка БД и генерация клиента

**Описание:** Настроить `DATABASE_URL` в `.env` (PostgreSQL). Установить `@prisma/client`. Запустить `prisma generate` и `prisma db push`. Создать Prisma client singleton `src/lib/prisma.ts` с корректной обработкой hot-reload в dev-режиме (глобальный кеш).

**Файлы для изменения/создания:**
- `.env` — добавить DATABASE_URL
- `package.json` — добавить @prisma/client, prisma (dev)
- `src/lib/prisma.ts` — создать (singleton)

**Story Points:** 3
**Зависимости:** Нет
**Приоритет:** P0

---

### ARC-009: Prisma — внедрение в API routes

**Описание:** Внедрить Prisma client в существующие и новые API-роуты. Создать базовые CRUD-сервисы: `src/lib/services/user-service.ts`, `src/lib/services/resume-service.ts`, `src/lib/services/chat-service.ts`. Интегрировать в API-роуты: сохранение чатов, резюме, ATS-скоров. Для гостевых пользователей данные продолжают жить в localStorage (Zustand persist), для зарегистрированных — в БД.

**Файлы для изменения/создания:**
- `src/lib/services/user-service.ts` — создать
- `src/lib/services/resume-service.ts` — создать
- `src/lib/services/chat-service.ts` — создать
- `src/lib/services/ats-service.ts` — создать
- `src/app/api/chat/route.ts` — изменить (сохранение в БД)
- `src/app/api/resume/route.ts` — создать (CRUD резюме)
- `src/app/api/ats/route.ts` — создать (сохранение ATS)

**Story Points:** 8
**Зависимости:** ARC-008
**Приоритет:** P0

---

### ARC-010: Auth + Prisma — интеграция User модели

**Описание:** Интегрировать NextAuth.js с Prisma через `PrismaAdapter` (next-auth v5). При регистрации/OAuth создавать запись User в БД. При Credentials login — проверять email/password через Prisma. JWT-сессия должна содержать `userId` для всех последующих запросов к API.

**Файлы для изменения/создания:**
- `src/lib/auth/auth-options.ts` — изменить (добавить PrismaAdapter)
- `src/lib/auth/index.ts` — изменить

**Story Points:** 5
**Зависимости:** ARC-002, ARC-009
**Приоритет:** P0

---

## P1 — Высокий приоритет

---

### ARC-011: MCP Server — миграция на @modelcontextprotocol/sdk

**Описание:** Установить `@modelcontextprotocol/sdk`. Переписать `src/mcp-server/` с использованием официального SDK вместо hand-rolled JSON-RPC. Сохранить существующие ресурсы (resume, ats, chat) и инструменты (get_resume, get_ats_score, search_jobs, analyze_resume_section). Добавить недостающий `update_resume` tool.

**Файлы для изменения/создания:**
- `package.json` — добавить @modelcontextprotocol/sdk
- `src/mcp-server/index.ts` — переписать (использовать SDK)
- `src/mcp-server/server.ts` — переписать (использовать SDK)
- `src/mcp-server/config.ts` — обновить
- `src/mcp-server/types.ts` — удалить (заменено SDK)
- `src/mcp-server/tools/update-resume.ts` — создать
- `src/mcp-server/tools/get-resume.ts` — обновить (snake_case)
- `src/mcp-server/tools/analyze-resume.ts` — обновить (snake_case, jobDescription)

**Story Points:** 8
**Зависимости:** Нет
**Приоритет:** P1

---

### ARC-012: MCP Server — token auth (bcrypt + prefix)

**Описание:** Реализовать аутентификацию для MCP-сервера. Токены с префиксом `mcp_` (например, `mcp_cv_xxxx`). Хеширование через bcrypt. Хранение хешей в таблице `mcp_tokens` (Prisma). Middleware для проверки токена на каждый запрос. API-эндпоинт для генерации новых токенов (только для Pro-пользователей).

**Файлы для изменения/создания:**
- `src/mcp-server/auth.ts` — создать
- `src/mcp-server/middleware.ts` — создать
- `src/app/api/mcp/tokens/route.ts` — создать (генерация токенов)
- `src/lib/services/mcp-token-service.ts` — создать

**Story Points:** 5
**Зависимости:** ARC-011, ARC-009
**Приоритет:** P1

---

### ARC-013: MCP Server — rate limiting, audit logging, Telegram push

**Описание:** Добавить rate limiting для MCP-сервера (100 req/h, 10 req/min burst) — переиспользовать существующий `src/lib/rate-limit/`. Реализовать audit logging в таблицу `mcp_logs` (новая модель Prisma). Telegram push-уведомления при вызове `update_resume` через Bot API.

**Файлы для изменения/создания:**
- `prisma/schema.prisma` — добавить модель McpLog
- `src/mcp-server/audit.ts` — создать
- `src/mcp-server/notifications.ts` — создать (Telegram push)
- `src/mcp-server/server.ts` — интегрировать rate limit + audit + push

**Story Points:** 5
**Зависимости:** ARC-012
**Приоритет:** P1

---

### ARC-014: Telegram Mini App — initData validation + auth endpoint

**Описание:** Реализовать HMAC-SHA256 валидацию `initData` от Telegram WebApp. Создать `POST /api/auth/telegram` — принимает initData, валидирует подпись через bot token, создаёт/находит пользователя в БД, возвращает JWT-сессию (через NextAuth.js). Создать утилиту `src/lib/telegram/validate.ts`.

**Файлы для изменения/создания:**
- `src/lib/telegram/validate.ts` — создать (HMAC-SHA256)
- `src/app/api/auth/telegram/route.ts` — создать
- `src/lib/telegram/index.ts` — создать (реэкспорт)

**Story Points:** 5
**Зависимости:** ARC-009 (Prisma для поиска/создания User)
**Приоритет:** P1

---

### ARC-015: Telegram Mini App — JWT сессии и TelegramProvider

**Описание:** Интегрировать Telegram-аутентификацию с NextAuth.js. После валидации initData и создания JWT-сессии, обновить `TelegramProvider` для использования авторизованного состояния. Добавить `useTelegramAuth` hook для проверки статуса.

**Файлы для изменения/создания:**
- `src/lib/auth/auth-options.ts` — добавить Telegram provider
- `src/components/Telegram/TelegramProvider.tsx` — обновить (auth state)
- `src/hooks/useTelegramAuth.ts` — создать

**Story Points:** 3
**Зависимости:** ARC-014
**Приоритет:** P1

---

### ARC-016: Telegram Stars billing — createInvoiceLink + webhook

**Описание:** Реализовать Telegram Stars биллинг. Создать `POST /api/create-invoice` — вызывает `createInvoiceLink` через Bot API. Создать `POST /api/telegram-webhook` — обрабатывает `pre_checkout_query` и `successful_payment`, обновляет подписку в БД. Создать сервис `src/lib/telegram/billing.ts`.

**Файлы для изменения/создания:**
- `src/lib/telegram/billing.ts` — создать
- `src/app/api/create-invoice/route.ts` — создать
- `src/app/api/telegram-webhook/route.ts` — создать
- `prisma/schema.prisma` — проверить Subscription модель (должна поддерживать telegram_stars)

**Story Points:** 8
**Зависимости:** ARC-014, ARC-009
**Приоритет:** P1

---

### ARC-017: Billing — Stripe Checkout

**Описание:** Установить `stripe` SDK. Создать `POST /api/create-checkout` — создаёт Stripe Checkout Session с ценами $2.99/мес или $29.99/год. Создать `POST /api/stripe-webhook` — обрабатывает `checkout.session.completed`, обновляет подписку в БД. Создать сервис `src/lib/billing/stripe.ts`. Обновить `useSubscriptionStore` для вызова реального API вместо "Coming Soon".

**Файлы для изменения/создания:**
- `package.json` — добавить stripe
- `src/lib/billing/stripe.ts` — создать
- `src/lib/billing/index.ts` — создать
- `src/app/api/create-checkout/route.ts` — создать
- `src/app/api/stripe-webhook/route.ts` — создать
- `src/stores/useSubscriptionStore.ts` — обновить (реальный subscribe)
- `src/types/billing.ts` — обновить (добавить SubscriptionProvider)

**Story Points:** 8
**Зависимости:** ARC-009 (Prisma для Subscription)
**Приоритет:** P1

---

### ARC-018: Billing — API проверки подписки и реальные цены

**Описание:** Создать `GET /api/subscription` — возвращает текущий статус подписки пользователя (tier, expiresAt, autoRenew). Обновить `ProFeatureGate` для проверки через API, а не только через Zustand store. Убрать stub-тексты из `/pricing` страницы. Добавить middleware для проверки Pro-доступа к MCP и премиум-функциям.

**Файлы для изменения/создания:**
- `src/app/api/subscription/route.ts` — создать
- `src/components/Billing/ProFeatureGate.tsx` — обновить (API-проверка)
- `src/app/pricing/page.tsx` — обновить (убрать stub, добавить реальные FAQ)
- `src/middleware.ts` — обновить (проверка Pro для MCP-роутов)

**Story Points:** 5
**Зависимости:** ARC-017
**Приоритет:** P1

---

## График зависимостей

```
ARC-001 (NextAuth deps)
  └─ ARC-002 (Auth config)
       ├─ ARC-003 (Auth API routes) ──┐
       ├─ ARC-005 (Middleware)        │
       └─ ARC-010 (Auth + Prisma) ────┤
                                      │
ARC-008 (Prisma setup)                │
  └─ ARC-009 (Prisma services) ───────┤
       ├─ ARC-010 (Auth + Prisma) ────┤
       ├─ ARC-014 (Telegram auth) ────┤
       ├─ ARC-016 (Telegram Stars)    │
       └─ ARC-017 (Stripe) ───────────┤
                                      │
ARC-006 (AI SDKs)                     │
  └─ ARC-007 (AI config + router)     │
                                      │
ARC-011 (MCP SDK)                     │
  └─ ARC-012 (MCP auth) ──────────────┤
       └─ ARC-013 (MCP rate/audit)    │
                                      │
ARC-014 (Telegram initData) ──────────┤
  ├─ ARC-015 (Telegram JWT)           │
  └─ ARC-016 (Telegram Stars) ────────┤
                                      │
ARC-017 (Stripe) ─────────────────────┤
  └─ ARC-018 (Subscription API) ──────┘
```

## Рекомендуемый порядок выполнения

### Фаза 1 — Фундамент (P0, ~16 SP)
1. **ARC-001** (2 SP) — зависимости NextAuth
2. **ARC-008** (3 SP) — Prisma setup
3. **ARC-006** (5 SP) — AI SDKs
4. **ARC-002** (5 SP) — Auth config
5. **ARC-003** (3 SP) — Auth API routes

### Фаза 2 — Ядро (P0, ~21 SP)
6. **ARC-009** (8 SP) — Prisma services
7. **ARC-010** (5 SP) — Auth + Prisma
8. **ARC-004** (5 SP) — Login/Register страницы
9. **ARC-005** (3 SP) — Auth middleware
10. **ARC-007** (8 SP) — Model Diversity router

### Фаза 3 — MCP Server (P1, ~18 SP)
11. **ARC-011** (8 SP) — MCP SDK migration
12. **ARC-012** (5 SP) — MCP token auth
13. **ARC-013** (5 SP) — MCP rate/audit/push

### Фаза 4 — Telegram (P1, ~16 SP)
14. **ARC-014** (5 SP) — Telegram initData + auth
15. **ARC-015** (3 SP) — Telegram JWT
16. **ARC-016** (8 SP) — Telegram Stars billing

### Фаза 5 — Billing (P1, ~13 SP)
17. **ARC-017** (8 SP) — Stripe Checkout
18. **ARC-018** (5 SP) — Subscription API + real prices

---

## Легенда

| Метрика | Значение |
|---------|----------|
| **SP** | Story Points (1-13, Fibonacci-like) |
| **P0** | Блокирующее расхождение — без него продукт не работает |
| **P1** | Высокий приоритет — без него нет монетизации и внешних интеграций |
| **Зависимость** | Задача не может быть начата до завершения указанной |
