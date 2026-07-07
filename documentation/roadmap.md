# Roadmap: TO BE Implementation Plan

> **Дата:** 2026-07-07
> **Проект:** cv.sarkhan.dev
> **Статус:** Все 6 фаз завершены. План оставшихся фич из TO BE архитектуры.
> **Основание:** gap-analysis.md + аудит кодовой базы

---

## Сводная таблица

| # | Блок | Часы | Приоритет | Зависимости | Статус |
|---|------|------|-----------|-------------|--------|
| 1 | Auth System | 24-32 | **P1** | — | ❌ |
| 2 | Privacy-First Storage | 20-28 | **P1** | Auth System | ❌ |
| 3 | Monetization (реальная оплата) | 28-36 | **P1** | Auth System, Storage | ❌ |
| 4 | UI/UX Fixes | 20-28 | **P2** | — | ⚠️ |
| 5 | ATS Scoring Engine (server-side) | 8-12 | **P2** | AI Router | ⚠️ |
| 6 | HR Coach — доработка | 6-10 | **P2** | Auth (Pro check) | ⚠️ |
| 7 | Telegram Mini App — доработка | 8-12 | **P2** | Auth System | ⚠️ |
| 8 | MCP Server — security & prod-ready | 10-16 | **P3** | Auth System, Storage | ⚠️ |
| 9 | CI/CD — донастройка | 4-6 | **P3** | — | ⚠️ |
| 10 | Monitoring — подключение | 4-8 | **P3** | — | ⚠️ |
| 11 | WCAG Accessibility | 8-12 | **P3** | — | ❌ |
| | **ИТОГО** | **140-200** | | | |

---

## 1. Auth System

**Зависимости:** нет
**Оценка:** 24-32 часа
**Приоритет:** P1
**Критический путь:** да

### Задачи

1. Установить next-auth (next-auth@beta для Next.js 16) + bcryptjs
2. Создать `src/lib/auth.ts` — конфигурация NextAuth с провайдерами:
   - CredentialsProvider (email + password)
   - GoogleProvider (OAuth)
   - TelegramProvider (кастомный, HMAC-SHA256 initData validation)
3. Создать `src/app/api/auth/[...nextauth]/route.ts` — NextAuth API route
4. Создать `src/middleware.ts` — проверка сессии для защищённых маршрутов:
   - `/workspace` — требует аутентификации
   - `/pricing` — доступен всем
   - `/api/*` — проверка JWT
5. Создать `src/app/signin/page.tsx` — страница логина (email + OAuth кнопки)
6. Создать `src/app/signup/page.tsx` — страница регистрации
7. Создать `src/components/Auth/SignInButton.tsx` — кнопка в Header
8. Создать `src/components/Auth/SessionProvider.tsx` — клиентский провайдер
9. Реализовать роли: Guest / Free / Pro (через JWT claim + subscription check)
10. Telegram OAuth: HMAC-SHA256 initData validation в `src/lib/auth/telegram.ts`
11. JWT сессионные токены с кастомным encode/decode (next-auth callbacks)
12. Middleware для API: `withAuth(handler, { role: 'pro' })` — HOF для route.ts
13. Тесты: auth flow, middleware, role checks

### Файлы

**Создать:**
- `src/lib/auth.ts`
- `src/lib/auth/telegram.ts`
- `src/middleware.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/signin/page.tsx`
- `src/app/signup/page.tsx`
- `src/components/Auth/SignInButton.tsx`
- `src/components/Auth/SessionProvider.tsx`
- `src/components/Auth/ProtectedRoute.tsx`
- `src/lib/auth/__tests__/auth.test.ts`

**Изменить:**
- `src/app/layout.tsx` — добавить SessionProvider
- `src/components/Header.tsx` — добавить SignInButton
- `package.json` — добавить next-auth, bcryptjs, @types/bcryptjs
- `.env.local` — добавить NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET, TELEGRAM_BOT_TOKEN

---

## 2. Privacy-First Storage

**Зависимости:** Auth System (нужен userId для PostgreSQL)
**Оценка:** 20-28 часов
**Приоритет:** P1
**Критический путь:** да

### Задачи

1. Создать `src/lib/storage/IStorage.ts` — интерфейс (set/get/remove/has/clear/keys/info)
2. Создать `src/lib/storage/LocalStorageAdapter.ts` — с TTL, versioning, LRU eviction
3. Создать `src/lib/storage/IndexedDBAdapter.ts` — fallback для >5MB
4. Создать `src/lib/storage/AutoSaveManager.ts` — debounce, retry, storage selection
5. Создать `src/lib/storage/PostgresAdapter.ts` — для registered users через Prisma
6. Создать `src/lib/storage/migrateGuestToRegistered.ts` — миграция данных гостя
7. Создать `src/app/api/consent/route.ts` — POST (append-only log)
8. Создать `src/app/api/export-data/route.ts` — GET (GDPR Art. 20)
9. Создать `src/app/api/delete-account/route.ts` — DELETE (GDPR Art. 17)
10. Создать `src/components/ConsentDialog.tsx` — GDPR consent UI
11. Создать `src/hooks/useConsent.ts` — consent state management
12. Создать `src/lib/storage/consent.ts` — consent проверки (policy version tracking)
13. Prisma migrate — применить схему к PostgreSQL
14. Создать `src/lib/prisma.ts` — PrismaClient singleton
15. Тесты: storage adapters, consent flow, migration

### Файлы

**Создать:**
- `src/lib/storage/IStorage.ts`
- `src/lib/storage/LocalStorageAdapter.ts`
- `src/lib/storage/IndexedDBAdapter.ts`
- `src/lib/storage/AutoSaveManager.ts`
- `src/lib/storage/PostgresAdapter.ts`
- `src/lib/storage/migrateGuestToRegistered.ts`
- `src/lib/storage/consent.ts`
- `src/lib/prisma.ts`
- `src/app/api/consent/route.ts`
- `src/app/api/export-data/route.ts`
- `src/app/api/delete-account/route.ts`
- `src/components/ConsentDialog.tsx`
- `src/hooks/useConsent.ts`
- `src/lib/storage/__tests__/storage.test.ts`

**Изменить:**
- `src/hooks/useAutoSave.ts` — переписать через AutoSaveManager
- `src/components/ClientLayoutWrapper.tsx` — добавить ConsentDialog
- `src/app/layout.tsx` — добавить ConsentDialog
- `package.json` — добавить @prisma/client, prisma (dev)
- `.env.local` — добавить DATABASE_URL

---

## 3. Monetization (реальная оплата)

**Зависимости:** Auth System, Storage (Prisma)
**Оценка:** 28-36 часов
**Приоритет:** P1
**Критический путь:** да

### Задачи

1. Установить @stripe/stripe-js, stripe (backend SDK)
2. Создать `src/lib/billing/stripe.ts` — Stripe client + webhook handler
3. Создать `src/app/api/create-checkout-session/route.ts` — Stripe Checkout
4. Создать `src/app/api/webhooks/stripe/route.ts` — Stripe webhook (successful_payment)
5. Создать `src/lib/billing/telegram-stars.ts` — Telegram Stars billing
6. Создать `src/app/api/create-invoice/route.ts` — Telegram createInvoiceLink
7. Создать `src/app/api/webhooks/telegram/route.ts` — pre_checkout_query + successful_payment
8. Создать `src/lib/billing/subscription-check.ts` — checkProAccess() middleware
9. Создать `src/lib/billing/crypto.ts` — Solana Pay (USDC) альтернатива
10. Создать `src/app/api/billing/status/route.ts` — GET subscription status
11. Обновить `src/stores/useSubscriptionStore.ts` — реальная проверка подписки
12. Обновить `src/components/Billing/PricingCard.tsx` — реальный subscribe
13. Обновить `src/app/pricing/page.tsx` — реальные цены, Stripe/Stars кнопки
14. Создать `src/components/Billing/SubscriptionManager.tsx` — управление подпиской
15. Создать `src/app/api/pro/tokens/route.ts` — CRUD для Pro токенов (MCP)
16. Тесты: checkout flow, webhook handling, subscription check

### Файлы

**Создать:**
- `src/lib/billing/stripe.ts`
- `src/lib/billing/telegram-stars.ts`
- `src/lib/billing/subscription-check.ts`
- `src/lib/billing/crypto.ts`
- `src/app/api/create-checkout-session/route.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/api/create-invoice/route.ts`
- `src/app/api/webhooks/telegram/route.ts`
- `src/app/api/billing/status/route.ts`
- `src/app/api/pro/tokens/route.ts`
- `src/components/Billing/SubscriptionManager.tsx`
- `src/lib/billing/__tests__/billing.test.ts`

**Изменить:**
- `src/stores/useSubscriptionStore.ts` — реальная проверка подписки
- `src/components/Billing/PricingCard.tsx` — реальный subscribe
- `src/components/Billing/ProFeatureGate.tsx` — реальная проверка
- `src/app/pricing/page.tsx` — реальные цены
- `src/types/billing.ts` — расширить типы
- `package.json` — добавить @stripe/stripe-js, stripe
- `.env.local` — добавить STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, SOLANA_RPC_URL

---

## 4. UI/UX Fixes

**Зависимости:** нет (можно делать параллельно с Auth/Storage)
**Оценка:** 20-28 часов
**Приоритет:** P2

### Задачи

1. **Error pages:**
   - Создать `src/app/error.tsx` — глобальный error boundary
   - Создать `src/app/not-found.tsx` — кастомная 404
   - Создать `src/app/500/page.tsx` — кастомная 500
   - Создать `src/components/ErrorFallback.tsx` — переиспользуемый компонент ошибки

2. **Landing page — доработка:**
   - Hero секция с анимацией (Framer Motion или CSS)
   - Features grid с иконками (уже есть, но можно улучшить)
   - CTA блок с testimonial / stats
   - FAQ accordion
   - Footer с ссылками на политики

3. **SplitScreen — Drag Handle:**
   - Улучшить визуальный drag handle (уже есть, но тонкий)
   - Добавить tooltip "Drag to resize"
   - Добавить анимацию при наведении

4. **Mobile TabBar:**
   - Улучшить переключение Chat/Canvas (уже работает)
   - Добавить свайп-жесты для переключения табов
   - Анимация перехода между табами

5. **ProFeatureGate:**
   - Исправить корректную работу (сейчас всегда показывает "Upgrade to Pro")
   - Добавить проверку реального статуса подписки
   - Улучшить UI заблокированной фичи

6. **Pricing page:**
   - Реальные цены ($9.99/мес или 300 ⭐)
   - FAQ секция
   - Comparison table Free vs Pro
   - Stripe Checkout кнопка

7. **HR Coach UI:**
   - Разблокировать ModeToggle (сейчас locked)
   - Добавить onboarding tooltip для HR Coach
   - Улучшить визуальное отличие режимов

8. **Toast/Snackbar система:**
   - Создать `src/components/Toast.tsx`
   - Zustand store для тостов
   - Подключить к subscription store

### Файлы

**Создать:**
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/500/page.tsx`
- `src/components/ErrorFallback.tsx`
- `src/components/Toast.tsx`
- `src/stores/useToastStore.ts`
- `src/components/Landing/HeroSection.tsx`
- `src/components/Landing/FeaturesGrid.tsx`
- `src/components/Landing/CTABlock.tsx`
- `src/components/Landing/FAQ.tsx`

**Изменить:**
- `src/app/page.tsx` — улучшить landing
- `src/components/SplitScreen.tsx` — улучшить drag handle
- `src/components/MobileTabBar.tsx` — свайп-жесты
- `src/components/Billing/ProFeatureGate.tsx` — реальная проверка
- `src/components/ChatPanel/ModeToggle.tsx` — разблокировать HR Coach
- `src/app/pricing/page.tsx` — реальные цены
- `src/app/layout.tsx` — добавить Toast

---

## 5. ATS Scoring Engine (server-side)

**Зависимости:** AI Router (уже есть)
**Оценка:** 8-12 часов
**Приоритет:** P2

### Задачи

1. Создать `src/app/api/ats-score/route.ts` — POST endpoint с AI-powered scoring
2. Создать `src/lib/ats/server-scorer.ts` — server-side scoring через AIRouter
3. Создать `src/components/CanvasPanel/ATSHeatmap.tsx` — цветовая карта (зелёный/жёлтый/красный)
4. Создать `src/components/CanvasPanel/SectionScore.tsx` — per-section score
5. Обновить `src/components/ATSScoreCard.tsx` — использовать server-side scoring
6. Создать `src/hooks/useATSScore.ts` — хук для server-side scoring
7. Canvas heatmap overlay — кликабельные блоки с подсветкой проблем
8. Тесты: scoring endpoint, heatmap rendering

### Файлы

**Создать:**
- `src/app/api/ats-score/route.ts`
- `src/lib/ats/server-scorer.ts`
- `src/components/CanvasPanel/ATSHeatmap.tsx`
- `src/components/CanvasPanel/SectionScore.tsx`
- `src/hooks/useATSScore.ts`
- `src/lib/ats/__tests__/server-scorer.test.ts`

**Изменить:**
- `src/components/ATSScoreCard.tsx` — server-side scoring
- `src/components/CanvasPanel/ResumeCanvas.tsx` — heatmap overlay
- `src/components/CanvasPanel.tsx` — heatmap integration

---

## 6. HR Coach — доработка

**Зависимости:** Auth System (Pro check), AI Router (уже есть)
**Оценка:** 6-10 часов
**Приоритет:** P2

### Задачи

1. Создать `src/components/HRCoach/InterviewSimulator.tsx` — интервью симулятор
2. Создать `src/components/HRCoach/AnswerEvaluator.tsx` — оценка ответов
3. Создать `src/components/HRCoach/CoachSelector.tsx` — выбор режима (4 режима)
4. Создать `src/app/api/hr-coach/route.ts` — API для HR Coach
5. Создать `src/lib/ai/prompts/hr-coach-interview.ts` — промпты для 4 режимов
6. Обновить `src/components/ChatPanel/ModeToggle.tsx` — разблокировать + 4 режима
7. Создать `src/hooks/useHRCoach.ts` — хук для HR Coach
8. Тесты: interview flow, answer evaluation

### Файлы

**Создать:**
- `src/components/HRCoach/InterviewSimulator.tsx`
- `src/components/HRCoach/AnswerEvaluator.tsx`
- `src/components/HRCoach/CoachSelector.tsx`
- `src/app/api/hr-coach/route.ts`
- `src/lib/ai/prompts/hr-coach-interview.ts`
- `src/hooks/useHRCoach.ts`
- `src/components/HRCoach/__tests__/hr-coach.test.tsx`

**Изменить:**
- `src/components/ChatPanel/ModeToggle.tsx` — 4 режима
- `src/types/hr-coach.ts` — расширить ChatModeConfig
- `src/types/chat.ts` — добавить новые режимы

---

## 7. Telegram Mini App — доработка

**Зависимости:** Auth System
**Оценка:** 8-12 часов
**Приоритет:** P2

### Задачи

1. Создать `src/app/api/auth/telegram/route.ts` — HMAC-SHA256 initData validation
2. Создать `src/lib/auth/telegram.ts` — Telegram auth utilities
3. Создать `src/lib/telegram/init-data.ts` — парсинг и валидация initData
4. Обновить `src/app/telegram/page.tsx` — полноценный workspace в Mini App
5. Создать `src/components/Telegram/TelegramAuth.tsx` — Telegram auth flow
6. Создать `src/lib/telegram/notifications.ts` — push-уведомления
7. Telegram Stars billing integration (см. блок 3)
8. Тесты: initData validation, auth flow

### Файлы

**Создать:**
- `src/app/api/auth/telegram/route.ts`
- `src/lib/auth/telegram.ts`
- `src/lib/telegram/init-data.ts`
- `src/lib/telegram/notifications.ts`
- `src/components/Telegram/TelegramAuth.tsx`
- `src/lib/telegram/__tests__/init-data.test.ts`

**Изменить:**
- `src/app/telegram/page.tsx` — полноценный workspace
- `src/components/Telegram/TelegramProvider.tsx` — auth flow
- `src/types/telegram.ts` — расширить типы

---

## 8. MCP Server — security & prod-ready

**Зависимости:** Auth System, Storage (Prisma)
**Оценка:** 10-16 часов
**Приоритет:** P3

### Задачи

1. Создать `src/mcp-server/auth.ts` — Pro token validation (bcrypt.compare)
2. Создать `src/mcp-server/rate-limit.ts` — rate limiting для MCP (100 req/h, 10 req/min burst)
3. Создать `src/mcp-server/audit.ts` — audit logging в mcp_logs таблицу
4. Создать `src/mcp-server/security.ts` — Helmet, HSTS, CSP headers
5. Обновить `src/mcp-server/server.ts` — добавить auth middleware
6. Создать `src/app/api/pro/tokens/route.ts` — CRUD для Pro токенов
7. Создать `src/lib/mcp/token-generator.ts` — crypto.randomUUID + bcrypt
8. Создать `src/mcp-server/__tests__/auth.test.ts` — тесты безопасности
9. Документация: README для MCP Server

### Файлы

**Создать:**
- `src/mcp-server/auth.ts`
- `src/mcp-server/rate-limit.ts`
- `src/mcp-server/audit.ts`
- `src/mcp-server/security.ts`
- `src/lib/mcp/token-generator.ts`
- `src/mcp-server/__tests__/auth.test.ts`
- `src/mcp-server/README.md`

**Изменить:**
- `src/mcp-server/server.ts` — auth middleware
- `src/mcp-server/index.ts` — security headers
- `prisma/schema.prisma` — добавить mcp_logs, payments таблицы (если нет)
- `src/types/monitoring.ts` — расширить

---

## 9. CI/CD — донастройка

**Зависимости:** нет
**Оценка:** 4-6 часов
**Приоритет:** P3

### Задачи

1. Обновить `.github/workflows/ci.yml` — полный пайплайн:
   - lint + type-check + test + build
   - e2e (Playwright)
   - deploy to Vercel (amondnet/vercel-action)
2. Создать `.github/workflows/deploy.yml` — deploy workflow
3. Настроить branch protection rules (main/develop/feature/fix)
4. Создать `src/e2e/` — базовые e2e тесты (Playwright)
5. Настроить Vercel Preview Deployments для PR

### Файлы

**Создать:**
- `.github/workflows/deploy.yml`
- `src/e2e/auth.spec.ts`
- `src/e2e/workspace.spec.ts`
- `src/e2e/pricing.spec.ts`

**Изменить:**
- `.github/workflows/ci.yml` — полный пайплайн

---

## 10. Monitoring — подключение

**Зависимости:** нет
**Оценка:** 4-8 часов
**Приоритет:** P3

### Задачи

1. Установить @sentry/nextjs
2. Создать `sentry.client.config.ts` — Sentry client config
3. Создать `sentry.server.config.ts` — Sentry server config
4. Создать `src/lib/sentry.ts` — Sentry utilities
5. Подключить Vercel Analytics (web vitals)
6. Создать `src/lib/monitoring/ai-monitoring.ts` — AI model monitoring (latency, fallback usage)
7. Создать `src/app/api/monitoring/alerts/route.ts` — alerts endpoint
8. Настроить алерты: error rate >5%, AI latency >10s, fallback exhausted

### Файлы

**Создать:**
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `src/lib/sentry.ts`
- `src/lib/monitoring/ai-monitoring.ts`
- `src/app/api/monitoring/alerts/route.ts`
- `src/lib/monitoring/__tests__/ai-monitoring.test.ts`

**Изменить:**
- `src/app/layout.tsx` — добавить Sentry
- `next.config.ts` — Sentry webpack plugin
- `package.json` — добавить @sentry/nextjs
- `.env.local` — добавить SENTRY_DSN, VERCEL_ANALYTICS_ID

---

## 11. WCAG Accessibility

**Зависимости:** нет (можно делать параллельно)
**Оценка:** 8-12 часов
**Приоритет:** P3

### Задачи

1. Аудит текущих компонентов на WCAG 2.1 AA (axe-core / Lighthouse)
2. Добавить aria-* атрибуты во все интерактивные компоненты
3. Добавить keyboard navigation (Tab, Enter, Escape, Arrow keys)
4. Исправить color contrast (текст на тёмном фоне)
5. Добавить focus-visible стили для всех интерактивных элементов
6. Добавить skip-to-content link
7. Добавить aria-live regions для динамического контента (SSE streaming, ATS Score)
8. Добавить role="alert" для ошибок и уведомлений
9. Добавить aria-label для иконок без текста (Material Symbols, Lucide)
10. Добавить aria-expanded/aria-controls для аккордеонов, табов, дропдаунов
11. Добавить aria-current для активных навигационных элементов
12. Добавить aria-hidden для декоративных иконок
13. Добавить aria-describedby/aria-required/aria-invalid для полей ввода
14. Добавить aria-valuenow/aria-valuemin/aria-valuemax для прогресс-баров и ScoreCircle
15. Добавить aria-orientation/aria-grabbed для SplitScreen drag handle
16. Добавить aria-selected/aria-pressed для табов и кнопок-переключателей
17. Добавить aria-modal для модальных окон
18. Добавить aria-busy для состояний загрузки
19. Добавить aria-sort для сортируемых списков
20. Добавить aria-haspopup для меню
21. Добавить aria-posinset/aria-setsize для списков
22. Добавить aria-roledescription для кастомных компонентов
23. Добавить aria-autocomplete для полей поиска
24. Добавить aria-multiline для многострочных полей
25. Добавить aria-readonly для read-only полей
26. Добавить aria-errormessage для сообщений об ошибках
27. Добавить aria-disabled для отключённых элементов
28. Добавить aria-relevant для динамических списков
29. Добавить aria-atomic для обновлений контента
30. Добавить aria-dropeffect для зон перетаскивания
31. Добавить role="progressbar"/"status"/"log"/"timer" для соответствующих элементов
32. Добавить role="tablist"/"tab"/"tabpanel" для табов
33. Добавить role="region" с aria-label для основных секций
34. Добавить role="navigation" с aria-label для навигации
35. Добавить role="search" для поиска
36. Добавить role="form" для форм
37. Добавить role="heading" с aria-level для заголовков
38. Добавить role="list"/"listitem" для списков
39. Добавить role="separator" для сплиттера
40. Добавить role="toolbar" для панелей инструментов
41. Добавить role="complementary" для сайдбаров
42. Добавить role="contentinfo" для футера
43. Добавить role="banner" для хедера
44. Добавить role="main" для основного контента
45. Добавить role="application" для workspace
46. Добавить role="document" для Canvas
47. Добавить role="img" с aria-label для иконок
48. Добавить role="button" для кликабельных элементов не-кнопок
49. Добавить role="link" для кликабельных элементов не-ссылок
50. Добавить role="textbox" для полей ввода
51. Добавить role="combobox" для комбобоксов
52. Добавить role="listbox" для списков выбора
53. Добавить role="option" для опций
54. Добавить role="menubar"/"menu"/"menuitem" для меню
55. Добавить role="tree"/"treeitem" для деревьев
56. Добавить role="grid"/"gridcell" для сеток
57. Добавить role="row"/"rowgroup" для строк
58. Добавить role="columnheader"/"rowheader" для заголовков
59. Добавить role="table" для таблиц
60. Добавить role="cell" для ячеек
61. Добавить role="math" для математических выражений
62. Добавить role="note" для заметок
63. Добавить role="definition" для определений
64. Добавить role="term" для терминов
65. Добавить role="tooltip" для подсказок
66. Добавить role="dialog" для диалогов
67. Добавить role="alertdialog" для диалогов с предупреждениями
68. Добавить role="presentation" для декоративных элементов
69. Добавить role="none" для элементов без семантики
70. Добавить role="switch" для переключателей
71. Добавить role="meter" для измерителей
72. Добавить role="scrollbar" для скроллбаров
73. Добавить role="slider" для слайдеров
74. Добавить role="spinbutton" для числовых полей
75. Добавить role="status" для статусных сообщений
76. Добавить role="timer" для таймеров
77. Добавить role="marquee" для бегущих строк
78. Добавить role="feed" для лент контента
79. Добавить role="figure" для иллюстраций
80. Добавить role="caption" для подписей
81. Добавить role="group" для групп элементов
82. Добавить role="radiogroup" для групп радио-кнопок
83. Добавить role="radio" для радио-кнопок
84. Добавить role="checkbox" для чекбоксов
85. Добавить role="switch" для свитчей
86. Добавить role="progressbar" для прогресс-баров
87. Добавить role="scrollbar" для скроллбаров
88. Добавить role="slider" для слайдеров
89. Добавить role="spinbutton" для спин-кнопок
90. Добавить role="status" для статусных сообщений
91. Добавить role="timer" для таймеров
92. Добавить role="marquee" для бегущих строк
93. Добавить role="feed" для лент контента
94. Добавить role="figure" для иллюстраций
95. Добавить role="caption" для подписей
96. Добавить role="group" для групп элементов
97. Добавить role="radiogroup" для групп радио-кнопок
98. Добавить role="radio" для радио-кнопок
99. Добавить role="checkbox" для чекбоксов
100. Добавить role="switch" для свитчей
101. Прогнать Lighthouse Accessibility audit — target score 90+
102. Тесты: axe-core на ключевых страницах

### Файлы

**Создать:**
- `src/components/Accessibility/SkipToContent.tsx`
- `src/components/Accessibility/FocusRing.tsx`
- `src/hooks/useKeyboardNav.ts`
- `src/lib/accessibility/audit.ts`

**Изменить:**
- Все компоненты — добавить aria-атрибуты (см. задачи выше)
- `src/app/layout.tsx` — добавить SkipToContent
- `src/app/globals.css` — focus-visible стили

---

## Критический путь (Critical Path)

```
Phase A (P1 — Foundation)
  Auth System ──► Privacy-First Storage ──► Monetization
       │                  │                       │
       ▼                  ▼                       ▼
Phase B (P2 — Features)
  UI/UX Fixes ◄── ATS Scoring Engine ◄── HR Coach
       │
       ▼
  Telegram Mini App
       │
       ▼
Phase C (P3 — Polish)
  MCP Server ──► CI/CD ──► Monitoring ──► WCAG
```

**Блокирующие зависимости:**
- Auth System блокирует: Storage, Monetization, Telegram Mini App, MCP Server
- Storage блокирует: Monetization, MCP Server
- Monetization блокирует: ProFeatureGate, HR Coach (Pro check)
- AI Router (уже есть) — ничего не блокирует, используется параллельно

## Рекомендуемый порядок реализации

### Спринт 1 (P1 — 72-96 часов)
1. **Auth System** (24-32ч) — без этого ничего не работает
2. **Privacy-First Storage** (20-28ч) — параллельно с Auth, после Auth — PostgreSQL
3. **UI/UX Fixes: error pages + Toast** (4-6ч) — можно параллельно

### Спринт 2 (P1-P2 — 60-80 часов)
4. **Monetization** (28-36ч) — после Auth + Storage
5. **ATS Scoring Engine** (8-12ч) — после AI Router (уже готов)
6. **HR Coach** (6-10ч) — после Auth (Pro check)
7. **UI/UX Fixes: landing, pricing, drag handle** (16-22ч) — параллельно

### Спринт 3 (P2-P3 — 30-46 часов)
8. **Telegram Mini App** (8-12ч) — после Auth
9. **MCP Server** (10-16ч) — после Auth + Storage
10. **CI/CD** (4-6ч) — можно в любой момент
11. **Monitoring** (4-8ч) — можно в любой момент
12. **WCAG** (8-12ч) — можно в любой момент

## Риски и митигации

| Риск | Вероятность | Влияние | Митигация |
|------|------------|---------|-----------|
| next-auth@beta несовместим с Next.js 16 | Средняя | Высокое | Использовать iron-session как fallback |
| Telegram Mini App требует публикации бота | Высокая | Среднее | Web-first, TG Mini App — после публикации |
| Stripe требует юридического лица | Высокая | Высокое | Начать с Telegram Stars (только бот) |
| GDPR compliance сложный | Средняя | Среднее | Шаблоны consent, консультация юриста |
| PostgreSQL недоступен на деплое | Средняя | Высокое | Neon Serverless PostgreSQL (free tier) |
| Solana Pay требует RPC + кошелёк | Средняя | Низкое | Отложить, начать со Stripe + Stars |
| MCP Server — новая технология | Средняя | Среднее | Использовать готовый @modelcontextprotocol/sdk |
| Voice processing требует API ключи | Низкая | Низкое | Web Speech API (бесплатно, в браузере) |
| WCAG audit может выявить много проблем | Высокая | Среднее | Итеративно, начиная с критических страниц |

## Что уже готово (можно не трогать)

1. **AI Router** — полноценный multi-model router с fallback chain, кэшированием, streaming
2. **Prompt templates** — 8 типов промптов (chat, ats-score, generate, tailor, analyze, suggest, suggestions, search)
3. **Rate Limiting** — sliding window, tier-based, middleware
4. **Monitoring** — pino logger, metrics, alerts, middleware
5. **MCP Server** — базовая структура (server, tools, resources)
6. **Telegram Mini App** — базовая интеграция (provider, back/main button)
7. **SplitScreen** — рабочий resize, mobile tabs, keyboard navigation
8. **ChatPanel** — полноценный чат с streaming, voice, suggestions, mode toggle
9. **CanvasPanel** — ResumeCanvas, ATS Score widget, suggestion panel
10. **Billing UI** — PricingCard, PricingToggle, ProFeatureGate, SubscriptionBadge
11. **Job Search** — search service, mock data, UI components
12. **CI/CD** — базовый GitHub Actions workflow
13. **Prisma schema** — 7 моделей (User, Subscription, ConsentLog, Resume, ResumeVersion, ChatSession, ATSScore, McpToken)
14. **Zustand stores** — 6 stores (resume, chat, ats, suggestions, job-search, subscription)
15. **Types** — 15 type definition files
16. **Tests** — 20+ test files (stores, components, services, lib)