## Фаза 5 — QA: Тесты для Telegram Mini App, MCP Server, Billing

### Контекст
Проект: /root/cv.sarkhan.dev
Архитектура: /root/cv.sarkhan.dev/documentation/phase-5-integration-architecture.md

### Новые файлы для тестирования

#### Telegram Mini App
- src/types/telegram.ts
- src/hooks/useTelegram.ts
- src/lib/telegram/theme.ts
- src/lib/telegram/sdk.ts
- src/components/Telegram/TelegramProvider.tsx
- src/components/Telegram/TelegramBackButton.tsx
- src/components/Telegram/TelegramMainButton.tsx
- src/app/telegram/page.tsx
- src/app/telegram/layout.tsx

#### MCP Server
- src/mcp-server/types.ts
- src/mcp-server/config.ts
- src/mcp-server/server.ts
- src/mcp-server/index.ts
- src/mcp-server/resources/resume.ts
- src/mcp-server/resources/ats.ts
- src/mcp-server/resources/chat.ts
- src/mcp-server/tools/get-resume.ts
- src/mcp-server/tools/get-ats-score.ts
- src/mcp-server/tools/search-jobs.ts
- src/mcp-server/tools/analyze-resume.ts
- data/resume.json

#### Billing
- src/types/billing.ts
- src/stores/useSubscriptionStore.ts
- src/components/Billing/PricingCard.tsx
- src/components/Billing/PricingToggle.tsx
- src/components/Billing/SubscriptionBadge.tsx
- src/components/Billing/ProFeatureGate.tsx
- src/app/pricing/page.tsx

### Что написать

#### 1. Unit-тесты для stores (src/stores/__tests__/):
- useSubscriptionStore.test.ts — начальное состояние free, subscribe('pro') не меняет статус (Coming Soon), setTier, clearError

#### 2. Unit-тесты для MCP Server (src/mcp-server/__tests__/):
- server.test.ts — initialize, resources/list, resources/read (resume://current, ats://score, chat://history), tools/list, tools/call (get_resume, get_ats_score, search_jobs, analyze_resume_section), ошибки (невалидный JSON, неизвестный метод, неизвестный resource URI, неизвестный tool name)
- index.test.ts — парсинг stdin, валидация JSON-RPC, ошибки парсинга

#### 3. Unit-тесты для Telegram (src/hooks/__tests__/):
- useTelegram.test.ts — мок window.Telegram.WebApp, isInTelegram true/false, webApp методы, hapticFeedback

#### 4. Unit-тесты для lib (src/lib/telegram/__tests__/):
- theme.test.ts — applyTelegramTheme, маппинг цветов, fallback на dark

#### 5. Component-тесты (src/components/__tests__/):
- TelegramProvider.test.tsx — рендер с Telegram контекстом, fallback без Telegram
- TelegramBackButton.test.tsx — visible/onClick
- TelegramMainButton.test.tsx — visible/text/onClick
- PricingCard.test.tsx — Free/Pro рендер, кнопка Subscribe
- PricingToggle.test.tsx — Monthly/Yearly переключение
- SubscriptionBadge.test.tsx — Free/Pro бейдж
- ProFeatureGate.test.tsx — free показывает lock, pro показывает children

### Формат
- Используй Vitest (как в существующих тестах)
- Тесты в __tests__ рядом с тестируемым файлом
- Для компонентов используй @testing-library/react
- Моки для Telegram: globalThis.window.Telegram.WebApp = { ... }
- Моки для MCP: читай data/resume.json напрямую

### Важно
- Не ломать существующие тесты (167 тестов из Фазы 4)
- После написания запусти npm run test и убедись что все тесты проходят
- Если тесты падают — исправь
