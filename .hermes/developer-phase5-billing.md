## Фаза 5 — Разработчик: Billing (Subscription Stub)

### Контекст
Проект: /root/cv.sarkhan.dev
Архитектура: /root/cv.sarkhan.dev/documentation/phase-5-integration-architecture.md (прочитай перед началом)

### Существующий код (не ломать!)
- Workspace: src/app/workspace/page.tsx
- Header: src/app/layout.tsx (или компонент Header)
- Types: src/types/ (все существующие)
- Stores: src/stores/ (все существующие)
- Components: все существующие

### Твоя задача: Billing (Subscription Stub)

Создай файлы:

1. **src/types/billing.ts** — типы подписки
2. **src/stores/useSubscriptionStore.ts** — Zustand store
3. **src/components/Billing/PricingCard.tsx** — карточка плана
4. **src/components/Billing/PricingToggle.tsx** — Monthly/Yearly toggle (заглушка)
5. **src/components/Billing/SubscriptionBadge.tsx** — бейдж в хедере
6. **src/components/Billing/ProFeatureGate.tsx** — обёртка для премиум-фич
7. **src/app/pricing/page.tsx** — страница подписки

### Детали реализации

**billing.ts**:
```typescript
export type SubscriptionTier = 'free' | 'pro';
export type SubscriptionStatus = 'free' | 'pro' | 'loading' | 'error';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number; // USD per month
  features: string[];
  highlighted: boolean;
  cta: string;
}

export interface SubscriptionState {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  error: string | null;
  subscribe: (tier: SubscriptionTier) => void;
  setTier: (tier: SubscriptionTier) => void;
  clearError: () => void;
}
```

**useSubscriptionStore**:
- Zustand store с persist (localStorage)
- Начальное состояние: tier='free', status='free'
- subscribe(tier): если tier='pro' → показывает toast "Coming Soon", status='free'
- setTier(tier): принудительно установить tier (для тестов)

**PricingCard**:
- Пропсы: plan: SubscriptionPlan, isCurrent: boolean, onSubscribe: () => void
- Показывает: название, цену, список фич, кнопку Subscribe/Current Plan
- Pro карточка: highlighted (border glow), $3/month
- Free карточка: $0, базовые фичи
- Стиль: glassmorphism, тёмная тема

**PricingToggle**:
- Monthly / Yearly переключатель
- Yearly показывает "Save 20%" badge
- Заглушка — не меняет цену реально

**SubscriptionBadge**:
- Показывает текущий план в хедере
- Free: серый бейдж "Free"
- Pro: фиолетовый бейдж "Pro"
- Клик → /pricing

**ProFeatureGate**:
- Обёртка: { children, featureName }
- Если tier='pro': показывает children
- Если tier='free': показывает blur-оверлей + lock иконку + "Upgrade to Pro"
- Клик → /pricing

**pricing/page.tsx**:
- Заголовок: "Choose Your Plan"
- Две карточки: Free и Pro
- Monthly/Yearly toggle
- FAQ секция (заглушка)
- Стиль: соответствует общему дизайну (тёмная тема, glassmorphism)
- Responsive: карточки stacked на мобилке, side-by-side на десктопе

### Интеграция

1. **SubscriptionBadge** — добавить в workspace/page.tsx (в хедер workspace)
2. **ProFeatureGate** — обернуть в workspace/page.tsx:
   - AI Suggestions (SuggestionPanel)
   - HR Coach (ModeToggle)
   - Job Search (JobSearchPanel)
3. **Pricing page** — новая страница /pricing

### Важно
- Не ломать существующий код
- Billing — заглушка с UI, реальная оплата позже
- subscribe('pro') показывает toast "Coming Soon"
- После реализации запусти npm run build и исправь ошибки
