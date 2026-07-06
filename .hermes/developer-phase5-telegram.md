## Фаза 5 — Разработчик: Telegram Mini App

### Контекст
Проект: /root/cv.sarkhan.dev
Архитектура: /root/cv.sarkhan.dev/documentation/phase-5-integration-architecture.md (прочитай перед началом)

### Существующий код (не ломать!)
- ChatPanel: src/components/ChatPanel/ (ChatInput, ChatHeader, MessageList, SuggestionChips, VoiceButton, ModeToggle, AgentMessage)
- Workspace: src/app/workspace/page.tsx
- Types: src/types/ (chat.ts, resume.ts, canvas.ts, ats.ts, suggestions.ts, job-search.ts, voice.ts, split-screen.ts, hr-coach.ts)
- Layout: src/app/layout.tsx (с Header, BackgroundFX, MobileNav)
- Stores: src/stores/ (useChatStore, useResumeStore, useATSStore, useSuggestionStore, useJobSearchStore)

### Твоя задача: Telegram Mini App

Создай файлы:

1. **src/types/telegram.ts** — типы Telegram WebApp
2. **src/hooks/useTelegram.ts** — хук для Telegram WebApp API
3. **src/lib/telegram/theme.ts** — маппинг tg-theme-* → CSS custom properties
4. **src/components/Telegram/TelegramProvider.tsx** — контекст-провайдер
5. **src/components/Telegram/TelegramBackButton.tsx** — кнопка назад
6. **src/components/Telegram/TelegramMainButton.tsx** — главная кнопка
7. **src/app/telegram/layout.tsx** — Telegram-specific layout (без Header, без MobileNav)
8. **src/app/telegram/page.tsx** — Telegram Mini App entry point

### Детали реализации

**TelegramProvider**:
- Проверяет window.Telegram.WebApp.initData
- Если в Telegram: вызывает WebApp.ready(), WebApp.expand()
- Применяет тему через CSS custom properties
- Если не в Telegram: показывает fallback "Open in Telegram"
- Предоставляет контекст: { isInTelegram, webApp, theme }

**useTelegram**:
- Возвращает { isInTelegram, webApp, backButton, mainButton, theme, hapticFeedback }
- hapticFeedback: impactOccurred, notificationOccurred, selectionChanged

**theme.ts**:
- Маппинг: tg-theme-bg-color → --tg-bg, tg-theme-text-color → --tg-text, etc.
- applyTelegramTheme(webApp) — устанавливает CSS vars

**TelegramBackButton**:
- Показывает/скрывает кнопку назад
- onClick callback
- Автоматически скрывается при unmount

**TelegramMainButton**:
- Показывает/скрывает главную кнопку
- Текст, цвет, onClick
- Автоматически скрывается при unmount

**telegram/page.tsx**:
- Использует TelegramProvider
- Если в Telegram: показывает упрощённый ChatPanel (только чат, без Canvas)
- Если не в Telegram: показывает fallback с ссылкой

**telegram/layout.tsx**:
- Без Header, без MobileNav, без BackgroundFX
- Только TelegramProvider + ChatPanel
- Full height, без скролла

### Важно
- Не ломать существующий код
- Telegram Mini App — базовая страница, глубокая интеграция в следующих фазах
- Использовать window.Telegram.WebApp напрямую (без внешних SDK)
- После реализации запусти npm run build и исправь ошибки
