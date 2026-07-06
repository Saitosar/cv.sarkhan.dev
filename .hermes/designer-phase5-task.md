## Фаза 5 — Дизайн: UI Review Telegram Mini App и Billing

### Контекст
Проект: /root/cv.sarkhan.dev
Архитектура: /root/cv.sarkhan.dev/documentation/phase-5-integration-architecture.md

### Что проверить

#### 1. Telegram Mini App (/telegram)
- **TelegramProvider**: правильно определяет window.Telegram.WebApp, вызывает ready()/expand()
- **TelegramBackButton**: показывается/скрывается, onClick работает
- **TelegramMainButton**: показывается/скрывается, текст, цвет, onClick
- **telegram/page.tsx**: 
  - В Telegram: показывает ChatPanel (упрощённый, без Canvas)
  - Вне Telegram: показывает fallback "Open in Telegram" с ссылкой
- **telegram/layout.tsx**: без Header, без MobileNav, без BackgroundFX, full height
- **Тема**: tg-theme-* CSS variables правильно мапятся
- **Адаптация**: Telegram Mini App full-height, без скролла

#### 2. Billing (/pricing)
- **PricingCard**: 
  - Free: $0, базовые фичи, кнопка "Current Plan"
  - Pro: $3/month, все фичи, кнопка "Subscribe", highlighted border glow
  - Glassmorphism, тёмная тема
- **PricingToggle**: Monthly/Yearly, Yearly показывает "Save 20%"
- **SubscriptionBadge**: Free (серый), Pro (фиолетовый), клик → /pricing
- **ProFeatureGate**: free → blur + lock + "Upgrade to Pro", pro → children
- **pricing/page.tsx**: заголовок, две карточки, toggle, FAQ, responsive

#### 3. Интеграция
- **SubscriptionBadge** в workspace/page.tsx хедере
- **ProFeatureGate** вокруг JobSearchPanel
- **ProFeatureGate** вокруг SuggestionPanel (если обёрнуто)
- **ProFeatureGate** вокруг ModeToggle (если обёрнуто)

### Формат отчёта
Для каждого элемента напиши:
1. Что соответствует дизайну ✅
2. Что нужно исправить ❌ (с конкретными рекомендациями)
3. Что отсутствует ⚠️

### Важно
- Не вносить изменения в код — только анализ
- Сверяться с финальным дизайном: /root/cv.sarkhan.dev/designs/stitch-confidence-final.html
- Проверить консистентность с существующими компонентами
