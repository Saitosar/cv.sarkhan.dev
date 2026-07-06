## Фаза 5 — Fix: Designer issues (3 critical)

### Контекст
Проект: /root/cv.sarkhan.dev
Архитектура: /root/cv.sarkhan.dev/documentation/phase-5-integration-architecture.md

### Критические проблемы (исправить сейчас)

#### 1. /telegram получает Header/MobileNav/BackgroundFX из ClientLayoutWrapper
**Где**: src/components/ClientLayoutWrapper.tsx
**Проблема**: Telegram layout (src/app/telegram/layout.tsx) не изолирован — ClientLayoutWrapper добавляет Header, MobileNav, BackgroundFX на все страницы.
**Решение**: 
- В ClientLayoutWrapper проверять pathname: если /telegram — не рендерить Header, MobileNav, BackgroundFX
- Или: в telegram/layout.tsx переопределить layout полностью (без ClientLayoutWrapper)

#### 2. SuggestionPanel не обёрнут в ProFeatureGate
**Где**: src/components/CanvasPanel.tsx
**Проблема**: AI Suggestions — Pro фича, но доступна для free пользователей
**Решение**: Обернуть <SuggestionPanel> в <ProFeatureGate featureName="AI Suggestions">

#### 3. ModeToggle (HR Coach) не обёрнут в ProFeatureGate
**Где**: src/components/ChatPanel/ChatHeader.tsx
**Проблема**: HR Coach — Pro фича, но переключатель доступен всем
**Решение**: Обернуть <ModeToggle> в <ProFeatureGate featureName="HR Coach">

### Процесс
1. Прочитай файлы, которые нужно изменить
2. Внеси правки
3. Запусти npm run build и npm run test
4. Исправляй ошибки пока build и test не пройдут
