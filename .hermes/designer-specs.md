# UI/UX Спецификации — cv.sarkhan.dev

**Проект:** AI Resume Intelligence (cv.sarkhan.dev)
**Дата:** 2026-07-10
**Версия:** 1.0
**Стек:** Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4 + Zustand
**Дизайн-система:** Stitch (glass-panel, тёмная тема, #6001d1 accent)

---

## Сводка цветовой схемы (Design Tokens)

| Токен | Значение | Использование |
|-------|----------|---------------|
| `--background` | `#0b0f19` | Основной фон |
| `--accent` | `#6001d1` | Primary CTA, активные элементы |
| `--accent-light` | `#8B5CF6` | Glow, hover, border highlight |
| `--accent-text` | `#d2bbff` | Текст на accent, иконки |
| `--foreground` | `#fafafa` | Основной текст |
| `--text-secondary` | `#e5e2e1` | Заголовки |
| `--text-muted` | `#c4c7c7` | Вторичный текст |
| `--text-tertiary` | `#8e8e8e` | Подписи, hint |
| `--card-bg` | `rgba(20,19,19,0.7)` | Glass-panel фон |
| `--border` | `rgba(255,255,255,0.08)` | Границы |
| `--success` | `#4ae176` | Успех, save badge |
| `--destructive` | `#ef5350` | Ошибки |
| `--glass-blur` | `blur(16px)` | Backdrop blur |

---

## 1. Auth Login Page

### 1.1 Обзор

Страницы `/login`, `/register`, `/forgot-password` — точки входа в систему. Реализуют OAuth (GitHub, Google) и email/password аутентификацию. Все страницы используют единый `AuthLayout` с центрированным glass-panel карточкой.

### 1.2 Компоненты

#### AuthLayout (общий для всех auth-страниц)
```
┌─────────────────────────────────────┐
│                                     │
│          ┌─────────────────┐         │
│          │   Glass Card    │         │
│          │  ┌───────────┐  │         │
│          │  │   Logo     │  │         │
│          │  │  "AI Resume│  │         │
│          │  │Intelligence"│  │         │
│          │  └───────────┘  │         │
│          │                 │         │
│          │   [Content]     │         │
│          │                 │         │
│          │  ┌───────────┐  │         │
│          │  │  Footer   │  │         │
│          │  └───────────┘  │         │
│          └─────────────────┘         │
│                                     │
└─────────────────────────────────────┘
```

**Свойства:**
- Центрирование: `flex items-center justify-center min-h-screen`
- Фон: `#0b0f19` (через `BackgroundFX`)
- Карточка: `glass-panel` класс (`rgba(20,19,19,0.7)` + `backdrop-filter: blur(16px)`)
- Размеры: `w-full max-w-md p-8 rounded-2xl`
- Анимация: fade-in при монтировании (`animate-message-in`)
- Без SideNav, без MobileNav (отдельный layout)

#### OAuthButtons
```
┌─────────────────────────────┐
│  ┌───────────────────────┐  │
│  │  <GithubIcon> Continue │  │
│  │  with GitHub           │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  <GoogleIcon> Continue │  │
│  │  with Google           │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

**Свойства:**
- Кнопки: `w-full py-3 px-4 rounded-xl glass-panel border border-white/10`
- Иконка слева, текст по центру
- Hover: `bg-white/10 border-white/20`
- Active: `scale-[0.98]`
- Loading state: spinner вместо иконки, disabled
- Error state: красная обводка `border-destructive/50`
- Разделитель между OAuth и формой: `"or continue with"` с линиями по бокам

#### LoginForm
```
┌─────────────────────────────┐
│  Email                      │
│  ┌───────────────────────┐  │
│  │  user@example.com     │  │
│  └───────────────────────┘  │
│                             │
│  Password                   │
│  ┌───────────────────────┐  │
│  │  ••••••••••••••••  👁 │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │     Sign In           │  │
│  └───────────────────────┘  │
│                             │
│  Forgot password?           │
│                             │
│  Don't have an account?     │
│  Register                   │
└─────────────────────────────┘
```

**Поля:**
- Email: `Input type="email"`, placeholder "you@example.com"
- Password: `Input type="password"`, toggle visibility icon (👁/🙈)
- Валидация: react-hook-form + zod
  - Email: валидный email, required
  - Password: min 8 символов, required

**Кнопка Submit:**
- `w-full py-3 px-4 rounded-xl font-semibold`
- Default: `bg-[#6001d1] text-white shadow-[0_0_20px_rgba(96,1,209,0.4)]`
- Hover: `bg-[#7a1ce8] shadow-[0_0_30px_rgba(96,1,209,0.6)]`
- Loading: spinner + "Signing in…", disabled
- Error: тряска (shake animation), красная обводка

**Ссылки:**
- "Forgot password?" → `/forgot-password` — `text-sm text-[#d2bbff] hover:text-white`
- "Don't have an account? Register" → `/register` — `text-sm text-[#c4c7c7]`

#### RegisterForm
```
┌─────────────────────────────┐
│  Full Name                  │
│  ┌───────────────────────┐  │
│  │  John Doe             │  │
│  └───────────────────────┘  │
│                             │
│  Email                      │
│  ┌───────────────────────┐  │
│  │  john@example.com     │  │
│  └───────────────────────┘  │
│                             │
│  Password                   │
│  ┌───────────────────────┐  │
│  │  ••••••••••••••••  👁 │  │
│  └───────────────────────┘  │
│                             │
│  Confirm Password           │
│  ┌───────────────────────┐  │
│  │  ••••••••••••••••  👁 │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  Create Account       │  │
│  └───────────────────────┘  │
│                             │
│  Already have an account?   │
│  Sign In                    │
└─────────────────────────────┘
```

**Дополнительные поля:**
- Full Name: `Input type="text"`, placeholder "John Doe"
- Confirm Password: проверка совпадения с Password
- Password strength indicator: прогресс-бар под полем (weak/medium/strong)

**Валидация:**
- Name: min 2 символа, required
- Email: валидный email, required
- Password: min 8 символов, uppercase + number, required
- Confirm: must match password

#### ForgotPasswordForm
```
┌─────────────────────────────┐
│  Enter your email address   │
│  and we'll send you a link  │
│  to reset your password.    │
│                             │
│  Email                      │
│  ┌───────────────────────┐  │
│  │  user@example.com     │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  Send Reset Link      │  │
│  └───────────────────────┘  │
│                             │
│  ← Back to Sign In          │
└─────────────────────────────┘
```

**Success state (после отправки):**
```
┌─────────────────────────────┐
│         ✅                   │
│  Check your email            │
│  We've sent a reset link to  │
│  user@example.com            │
│                             │
│  ┌───────────────────────┐  │
│  │  Resend (30s)         │  │
│  └───────────────────────┘  │
│                             │
│  ← Back to Sign In          │
└─────────────────────────────┘
```

### 1.3 States

#### Login — Loading
- OAuth кнопки: spinner вместо иконки, `pointer-events-none`, `opacity-70`
- Form submit: кнопка "Signing in…" с spinner, поля disabled
- Skeleton: glass-panel карточка с shimmer-анимацией

#### Login — Error
- OAuth error: красная обводка кнопки, текст ошибки под кнопкой
- Form error: `FormMessage` под полем (красный текст)
- Server error: тост/alert вверху карточки: `bg-destructive/10 border border-destructive/30 text-destructive`
- Invalid credentials: "Invalid email or password" над формой

#### Login — Success
- Redirect на `/workspace` через 500ms
- Показывать "Welcome back, {name}!" toast
- Анимация: карточка fade-out + scale-down

#### Register — Loading
- Кнопка "Creating Account…" с spinner
- Password strength: анимированный прогресс-бар

#### Register — Error
- Email already exists: "An account with this email already exists. Sign in instead."
- Validation errors: под каждым полем
- Server error: тост вверху

#### Register — Success
- "Account created! Redirecting…" — 1.5s задержка
- Auto-redirect на `/workspace`
- Toast: "Welcome to AI Resume Intelligence! 🎉"

#### ForgotPassword — Loading
- Кнопка "Sending…" с spinner

#### ForgotPassword — Success
- Иконка ✅, текст "Check your email"
- Resend button с таймером 30s (disabled во время таймера)

#### ForgotPassword — Error
- Email not found: "No account found with this email"
- Server error: тост

#### Logged-In State (User уже авторизован)
- При заходе на `/login` — редирект на `/workspace`
- Показывать "You're already signed in" toast
- Кнопка "Go to Workspace" вместо формы

### 1.4 Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 640px) | Карточка `w-full`, padding `p-6`, без отступов от краёв |
| Tablet (640-1024px) | Карточка `max-w-md`, центрирована |
| Desktop (> 1024px) | Карточка `max-w-md`, центрирована, BackgroundFX виден |

**Mobile особенности:**
- `min-height: 44px` для всех кнопок и полей (touch targets)
- `overscroll-behavior: contain` (prevent pull-to-refresh)
- Клавиатура не должна перекрывать поля (viewport height адаптация)
- Safe area insets: `pt-safe`, `pb-safe`

### 1.5 Анимации

- Карточка: fade-in + translateY(20px) → 0, 0.4s ease-out
- OAuth кнопки: stagger animation (50ms delay между каждой)
- Form fields: последовательное появление
- Error shake: `@keyframes shake` (translateX(-5px, 5px, -5px, 0))
- Success: scale(1) → scale(0.95) → scale(1) pulse
- Password visibility toggle: icon swap с fade

### 1.6 Vision Review — Auth Login Page

**Проверка визуального дизайна:**

| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| Glass-panel стиль | ✅ | Соответствует `glass-panel` классу в globals.css |
| Тёмная тема | ✅ | `#0b0f19` фон, белый текст |
| Purple accent (#6001d1) | ✅ | Используется в CTA, glow, hover |
| OAuth кнопки | ✅ | Glass-стиль, иконки слева |
| Форма email/password | ✅ | Input компонент с border-input |
| Разделитель "or" | ✅ | Линии + текст по центру |
| Состояния loading/error | ✅ | Spinner, красные сообщения, disabled |
| Адаптация под Telegram | ⚠️ | Auth не для Telegram — отдельная тема |
| Mobile-first | ✅ | Touch targets 44px, safe areas |
| Соответствие Stitch | ✅ | Цвета, шрифты, glass-morphism |

**Рекомендации:**
1. Добавить `autoComplete` атрибуты для всех полей (email, current-password, new-password)
2. Password toggle — использовать `lucide-react` `Eye`/`EyeOff` иконки
3. Добавить `aria-label` для OAuth кнопок
4. Password strength indicator — использовать градиент от `#ef5350` (weak) → `#fbbf24` (medium) → `#4ae176` (strong)

---

## 2. Telegram Mini App

### 2.1 Обзор

Страница `/telegram` — точка входа для Telegram Mini App, открывается внутри Telegram WebView. Адаптируется под тему Telegram (через `tg-theme-*` CSS variables). Показывает упрощённую версию workspace: ATS Score мини-виджет + ChatPanel.

### 2.2 Компоненты

#### TelegramLayout
```
┌─────────────────────┐
│  Telegram WebView   │
│  (full height)      │
│                     │
│  ┌───────────────┐  │
│  │ ATS Mini-     │  │
│  │ Widget        │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │  ChatPanel    │  │
│  │  (flex-1)     │  │
│  │               │  │
│  └───────────────┘  │
│                     │
│  [Telegram Main     │
│   Button: "Open     │
│   Full Workspace"]  │
└─────────────────────┘
```

**Свойства:**
- `h-screen w-screen overflow-hidden` — full viewport, без скролла
- Без Header, без SideNav, без MobileNav, без BackgroundFX
- Фон: `var(--tg-bg, #0b0f19)`
- Текст: `var(--tg-text, #e5e2e1)`
- Telegram BackButton: нативный, управляется через `Telegram.WebApp.BackButton`
- Telegram MainButton: нативный, управляется через `Telegram.WebApp.MainButton`

#### TelegramProvider
- Контекст: `{ isInTelegram, webApp, user, theme, colorScheme, isExpanded }`
- Детектит `window.Telegram.WebApp.initData`
- Вызывает `ready()`, `expand()` при монтировании
- Подписывается на `themeChanged`, `viewportChanged` события
- Применяет тему через `applyTelegramTheme()`

#### TelegramBackButton
- Управляет нативной кнопкой Back в Telegram
- `visible: boolean` — показать/скрыть
- `onClick/onBack` — callback
- Рендерит `null` (управляет Telegram UI)

#### TelegramMainButton
- Управляет нативной Main Button в Telegram
- `text: string` — "Open Full Workspace"
- `color: string` — цвет кнопки
- `onClick` — открывает `/workspace` в браузере
- Рендерит `null` (управляет Telegram UI)

#### ATS Score Mini-Widget
```
┌─────────────────────────────────────┐
│  ┌──────┐                           │
│  │ 80%  │  ATS Match                │
│  │  ⭕  │  Target: Senior DevOps    │
│  └──────┘  Engineer                 │
│                      ┌──────────┐   │
│                      │ Improve  │   │
│                      └──────────┘   │
└─────────────────────────────────────┘
```

**Свойства:**
- `glass-panel rounded-xl p-3`
- Circular progress: SVG с `strokeDasharray` анимацией
- Градиент: `#4F46E5` → `#d2bbff`
- "Improve" кнопка: `text-[10px] px-2.5 py-1 rounded-lg bg-[#6001d1]/20 text-[#d2bbff]`
- Адаптация под Telegram theme: `var(--tg-bg)`, `var(--tg-text)`, `var(--tg-hint)`

#### Fallback (вне Telegram)
```
┌─────────────────────┐
│                     │
│       📱            │
│                     │
│  Open in Telegram   │
│                     │
│  This page is       │
│  designed to work   │
│  inside Telegram.   │
│                     │
│  ┌───────────────┐  │
│  │ Open Full      │  │
│  │ Workspace      │  │
│  └───────────────┘  │
│                     │
└─────────────────────┘
```

### 2.3 States

#### Loading (инициализация Telegram SDK)
- Показывать спиннер/скелетон
- `TelegramProvider` проверяет `window.Telegram.WebApp`
- Если через 2s нет ответа — показать fallback "Open in Telegram"

#### In Telegram — Normal
- ATS Widget с данными
- ChatPanel с историей
- MainButton "Open Full Workspace"
- BackButton скрыт (на главном экране)

#### In Telegram — No Resume
- ATS Widget: "Create your first resume" вместо score
- ChatPanel: приветственное сообщение от Aether
- MainButton: "Create Resume"

#### In Telegram — Error
- Ошибка инициализации: fallback "Open in Telegram"
- Ошибка загрузки данных: тост "Failed to load data"
- Ошибка сети: "Connection lost. Check your connection."

#### Outside Telegram
- Fallback экран с эмодзи 📱
- Текст "Open in Telegram"
- Кнопка "Open Full Workspace" → `/workspace`

#### Theme Change
- Telegram может сменить тему (light/dark) в рантайме
- `themeChanged` event → `applyTelegramTheme()` → CSS vars обновляются
- Плавный переход: `transition: background-color 0.3s, color 0.3s`

### 2.4 Responsive Design

| Параметр | Значение |
|----------|----------|
| Viewport | `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no` |
| Viewport fit | `cover` (под notched устройства) |
| Высота | `100vh` / `100dvh` (dynamic viewport height) |
| Safe areas | `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)` |
| Telegram Bottom Bar | `padding-bottom: env(safe-area-inset-bottom, 0)` |

**Telegram Mini App специфика:**
- Telegram WebView обычно 400-600px в высоту (зависит от клавиатуры)
- `isExpanded` — проверять через Telegram SDK
- При открытии клавиатуры: `viewportStableHeight` уменьшается
- MainButton всегда виден внизу (Telegram нативный)
- BackButton в左上 (Telegram нативный)

### 2.5 Telegram Theme Mapping

| CSS Variable | Telegram Key | Fallback |
|-------------|--------------|----------|
| `--tg-bg` | `bg_color` | `#0b0f19` |
| `--tg-text` | `text_color` | `#e5e2e1` |
| `--tg-hint` | `hint_color` | `#c4c7c7` |
| `--tg-link` | `link_color` | `#d2bbff` |
| `--tg-button` | `button_color` | `#6001d1` |
| `--tg-button-text` | `button_text_color` | `#ffffff` |
| `--tg-secondary-bg` | `secondary_bg_color` | `#141313` |

### 2.6 Vision Review — Telegram Mini App

**Проверка визуального дизайна:**

| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| Telegram WebView адаптация | ✅ | Full height, без скролла, native buttons |
| Theme adaptation | ✅ | `tg-theme-*` → CSS vars, `applyTelegramTheme()` |
| ATS Widget | ✅ | Glass-panel, circular progress, purple gradient |
| ChatPanel reuse | ✅ | Переиспользует существующий ChatPanel |
| BackButton/MainButton | ✅ | Нативные Telegram кнопки |
| Fallback вне Telegram | ✅ | Чистый fallback с CTA |
| Mobile-first | ✅ | Touch targets, safe areas, keyboard avoidance |
| Stitch-стиль | ✅ | Glass-morphism, purple accent, dark theme |

**Рекомендации:**
1. Добавить `hapticFeedback` для кнопок (impactOccurred('light'))
2. MainButton цвет — использовать `var(--tg-button, #6001d1)`
3. При открытии клавиатуры — скрывать ATS Widget для экономии места
4. Добавить `start_param` поддержку (deep linking из бота)
5. Рассмотреть `openInvoice` для Telegram Stars оплаты

---

## 3. Billing / Pricing

### 3.1 Обзор

Страница `/pricing` — выбор тарифного плана. Два плана: Free (бесплатно) и Pro ($2.99/мес или $29.99/год). Поддержка Monthly/Yearly toggle, Stripe Checkout, Telegram Stars. Состояния подписки: not-subscribed, subscribed, expired, payment-success, payment-error.

### 3.2 Компоненты

#### PricingPage Layout
```
┌─────────────────────────────────────────────┐
│  SideNav (from ClientLayoutWrapper)         │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  Choose Your Plan                     │  │
│  │  Unlock AI-powered resume tools...    │  │
│  │                                       │  │
│  │      [Monthly] [Yearly Save 20%]      │  │
│  │                                       │  │
│  │  ┌──────────┐  ┌──────────────────┐  │  │
│  │  │  Free     │  │  Pro ★           │  │  │
│  │  │  $0/month │  │  $2.99/month     │  │  │
│  │  │  ...      │  │  ...             │  │  │
│  │  │ [Current] │  │  [Subscribe]     │  │  │
│  │  └──────────┘  └──────────────────┘  │  │
│  │                                       │  │
│  │  ┌───────────────────────────────┐   │  │
│  │  │  FAQ                          │   │  │
│  │  │  ┌─────────────────────────┐  │   │  │
│  │  │  │ Q: Can I change plans?  │  │   │  │
│  │  │  │ A: Yes...               │  │   │  │
│  │  │  └─────────────────────────┘  │   │  │
│  │  └───────────────────────────────┘   │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

#### PricingToggle
```
┌──────────────────────────────┐
│  ┌──────────┐ ┌────────────┐  │
│  │ Monthly  │ │ Yearly    │  │
│  │          │ │ Save 20%  │  │
│  └──────────┘ └────────────┘  │
└──────────────────────────────┘
```

**Свойства:**
- `inline-flex items-center rounded-full border border-white/10 bg-[#141313]/70 p-1`
- Активный: `bg-[#6001d1] text-white shadow-[0_0_12px_rgba(96,1,209,0.4)]`
- Неактивный: `text-[#c4c7c7] hover:text-[#e5e2e1]`
- Yearly badge: `px-2 py-0.5 rounded-full text-[10px] bg-[#4ae176]/20 text-[#4ae176] border border-[#4ae176]/30`
- Анимация: smooth slide transition при переключении

#### PricingCard (Free)
```
┌─────────────────────────────┐
│                             │
│  Free                       │
│                             │
│  $0  /month                 │
│  per month                  │
│                             │
│  Perfect for getting        │
│  started                    │
│                             │
│  ✅ Build & edit 1 resume   │
│  ✅ ATS score overview      │
│  ✅ Basic AI chat assistant │
│  ✅ Export as PDF           │
│                             │
│  ┌───────────────────────┐  │
│  │    Current Plan       │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

**Свойства:**
- `glass-card` класс: `bg-[rgba(40,47,65,0.5)]` + `backdrop-filter: blur(16px)`
- Border: `border-white/10`
- Hover: `translateY(-8px)`, усиление свечения
- Кнопка (isCurrent): `bg-white/10 text-[#8e8e8e] cursor-default border border-white/10`
- Features: `text-sm text-[#c4c7c7]` с checkmark в `#6001d1/20` круге

#### PricingCard (Pro)
```
┌─────────────────────────────┐
│  ★ Most Popular             │
│                             │
│  Pro                        │
│                             │
│  $2.99  /month              │
│  per month                  │
│                             │
│  Unlock AI superpowers      │
│  for your job search        │
│                             │
│  ✅ Everything in Free      │
│  ✅ AI Suggestions          │
│  ✅ HR Coach career mode    │
│  ✅ Job Search + scoring    │
│  ✅ Priority AI processing  │
│                             │
│  ┌───────────────────────┐  │
│  │  ┌──────┐             │  │
│  │  │ 80%  │ AI-Powered  │  │
│  │  │  ⭕  │ ATS Scoring  │  │
│  │  └──────┘             │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │    Subscribe           │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

**Свойства:**
- Border: `border-[#8B5CF6]/40 shadow-[0_0_40px_rgba(139,92,246,0.2)]`
- "Most Popular" badge: `absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#6001d1]`
- Yearly "Save 20%" badge: `absolute -top-3 right-4 md:right-8 bg-[#4ae176]/20 text-[#4ae176]`
- ATS Preview: `p-4 rounded-xl bg-[#6001d1]/10 border border-[#d2bbff]/20`
- Кнопка Subscribe: `bg-[#6001d1] text-white shadow-[0_0_20px_rgba(96,1,209,0.4)]`
- Hover Subscribe: `bg-[#7a1ce8] shadow-[0_0_30px_rgba(96,1,209,0.6)]`

#### SubscriptionBadge
```
┌──────────────────┐
│  ● Pro            │
│  ● Free           │
└──────────────────┘
```

**Свойства:**
- `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold`
- Pro: `bg-[#6001d1]/30 text-[#d2bbff] border border-[#8B5CF6]/50 shadow-[0_0_12px_rgba(96,1,209,0.25)]`
- Free: `bg-white/10 text-[#c4c7c7] border border-white/10`
- Dot: `w-2 h-2 rounded-full` (Pro: `bg-[#d2bbff]`, Free: `bg-[#8e8e8e]`)
- Click → `/pricing`
- Hover: `scale-105`

#### ProFeatureGate
```
┌─────────────────────────────┐
│  ┌───────────────────────┐  │
│  │  🔒                   │  │
│  │                       │  │
│  │  AI Job Search        │  │
│  │  Upgrade to Pro to    │  │
│  │  unlock this feature  │  │
│  │                       │  │
│  │  ┌───────────────┐    │  │
│  │  │ Upgrade to    │    │  │
│  │  │ Pro           │    │  │
│  │  └───────────────┘    │  │
│  └───────────────────────┘  │
│                             │
│  [blurred content behind]  │
└─────────────────────────────┘
```

**Свойства:**
- Free user: `absolute inset-0 z-10` overlay с lock иконкой
- Lock icon: `w-12 h-12 rounded-full bg-[#6001d1]/20 border border-[#d2bbff]/30`
- Children: `blur-[6px] opacity-40 pointer-events-none`
- CTA: Link to `/pricing` с `bg-[#6001d1] text-white shadow-[0_0_20px_rgba(96,1,209,0.4)]`
- Pro user: просто рендерит children

### 3.3 States

#### Not Subscribed (Free tier)
- PricingCard Free: кнопка "Current Plan" (disabled)
- PricingCard Pro: кнопка "Subscribe" (активна)
- SubscriptionBadge: "Free" (серый)
- ProFeatureGate: показывает lock overlay

#### Subscribed (Pro tier)
- PricingCard Free: кнопка "Get Started" (активна — downgrade)
- PricingCard Pro: кнопка "Current Plan" (disabled)
- SubscriptionBadge: "Pro" (фиолетовый, с glow)
- ProFeatureGate: показывает children (разблокировано)
- Toast: "Welcome to Pro! 🎉" при первой активации

#### Subscription Expired
- PricingCard Pro: кнопка "Renew" (пульсирующая)
- SubscriptionBadge: "Pro" (но с восклицательным знаком, оранжевый)
- ProFeatureGate: показывает lock overlay
- Toast: "Your Pro subscription has expired. Renew to keep access."
- Banner на workspace: `bg-amber-500/10 border border-amber-500/30 text-amber-400`

#### Payment — Loading (Stripe Checkout)
- PricingCard Pro: кнопка "Redirecting to Stripe…" с spinner
- Overlay на всю страницу: полупрозрачный `bg-black/50`
- Spinner: `animate-spin` с purple glow

#### Payment — Success
- Modal/Popup: ✅ "Payment Successful!"
- "Welcome to Pro! Your subscription is now active."
- Кнопка "Go to Workspace" → `/workspace`
- Confetti animation (опционально)
- Auto-redirect через 3s

#### Payment — Error
- Modal/Popup: ❌ "Payment Failed"
- "Your payment could not be processed. Please try again."
- Кнопки: "Try Again" (retry) + "Contact Support"
- Error details: скрыты под "Show details" accordion
- SubscriptionBadge: остаётся Free

#### Telegram Stars — Loading
- PricingCard Pro: кнопка "Pay with ⭐ Stars" (альтернатива Stripe)
- Открывает `webApp.openInvoice()` для Telegram Stars
- Spinner на кнопке во время создания invoice

#### Telegram Stars — Success
- Telegram showPopup: "Payment successful! Welcome to Pro! 🎉"
- HapticFeedback: `notificationOccurred('success')`
- Auto-update subscription store

#### Telegram Stars — Error
- Telegram showPopup: "Payment cancelled or failed"
- HapticFeedback: `notificationOccurred('error')`
- Кнопка возвращается в "Subscribe"

### 3.4 Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 640px) | Карточки stacked (одна под другой), `p-4` |
| Tablet (640-1024px) | Карточки stacked, `max-w-md` каждая, центрированы |
| Desktop (> 1024px) | Grid `grid-cols-2`, карточки side-by-side, `gap-8` |

**Mobile особенности:**
- FAQ: accordion вместо открытых панелей
- Toggle: центрирован, full-width на очень маленьких экранах
- Pro badge "Most Popular": адаптирован под stacked layout
- ATS Preview: скрыт на мобилке (экономия места)

### 3.5 Анимации

- Карточки: fade-in + translateY, stagger 100ms
- Toggle: smooth slide (CSS transition)
- Subscribe click: ripple effect на кнопке
- Payment modal: backdrop blur + scale-in
- Success: checkmark draw animation (SVG stroke-dashoffset)
- Error: shake animation на modal
- Badge: pulse при смене статуса

### 3.6 Payment Flow Diagrams

#### Stripe Checkout Flow
```
[User clicks Subscribe]
        │
        ▼
[Loading state: "Redirecting to Stripe…"]
        │
        ▼
[POST /api/create-checkout]
        │
        ▼
[Stripe Checkout Session created]
        │
        ▼
[Redirect to Stripe Checkout page]
        │
        ├── Success ──► [Stripe webhook: checkout.session.completed]
        │                    │
        │                    ▼
        │               [Update subscription in DB]
        │                    │
        │                    ▼
        │               [Redirect to /pricing?success=true]
        │                    │
        │                    ▼
        │               [Show success modal]
        │
        └── Cancel ──► [Redirect to /pricing?cancelled=true]
                             │
                             ▼
                        [Show "Payment cancelled" toast]
```

#### Telegram Stars Flow
```
[User clicks "Pay with ⭐ Stars"]
        │
        ▼
[POST /api/create-invoice]
        │
        ▼
[Telegram Bot API: createInvoiceLink]
        │
        ▼
[webApp.openInvoice(invoiceLink)]
        │
        ├── "paid" ──► [Telegram webhook: successful_payment]
        │                    │
        │                    ▼
        │               [Update subscription in DB]
        │                    │
        │                    ▼
        │               [ShowPopup: "Welcome to Pro! 🎉"]
        │
        ├── "cancelled" ──► [ShowPopup: "Payment cancelled"]
        │
        └── "failed" ──► [ShowPopup: "Payment failed. Try again."]
```

### 3.7 Vision Review — Billing/Pricing

**Проверка визуального дизайна:**

| Критерий | Статус | Комментарий |
|----------|--------|-------------|
| Glass-card стиль | ✅ | `glass-card` класс с backdrop-filter и radial gradient |
| Pro highlight | ✅ | Purple border glow, "Most Popular" badge |
| Monthly/Yearly toggle | ✅ | Pill-стиль, active state с purple glow |
| ATS Preview | ✅ | Circular score, purple gradient, glass-panel |
| FAQ секция | ✅ | Glass-panel accordion |
| Responsive | ✅ | Stacked на mobile, grid на desktop |
| SubscriptionBadge | ✅ | Free (серый), Pro (фиолетовый с glow) |
| ProFeatureGate | ✅ | Blur overlay + lock + CTA |
| Payment states | ✅ | Loading, success, error модалки |
| Telegram Stars | ✅ | `openInvoice` интеграция |

**Рекомендации:**
1. Добавить Guest tier (без аккаунта) — показывать CTA "Sign Up" вместо карточек
2. Yearly "Save 20%" — пересчитать: $2.99×12 = $35.88, yearly $29.99 = 16.4% savings (не 20%)
3. Добавить `priceId` в `SubscriptionPlan` для Stripe Price IDs
4. Payment success modal — добавить confetti (библиотека `canvas-confetti`)
5. ProFeatureGate — добавить fade-in анимацию при появлении overlay
6. FAQ — сделать accordion с анимацией раскрытия (react-collapsible или hand-rolled)

---

## 4. Интеграция с существующими компонентами

### 4.1 ClientLayoutWrapper

```typescript
// Уже реализовано: проверка pathname.startsWith('/telegram')
// Telegram: без SideNav, без MobileNav, без BackgroundFX
// Auth (/login, /register, /forgot-password): без SideNav, без MobileNav
// Pricing: с SideNav, без MobileNav
```

**Рекомендация:** Добавить проверку на auth пути:
```typescript
const isTelegram = pathname.startsWith('/telegram');
const isAuth = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password');
if (isTelegram || isAuth) return <>{children}</>;
```

### 4.2 Workspace Integration

```typescript
// SubscriptionBadge — в SideNav (уже)
// ProFeatureGate — вокруг JobSearchPanel (уже)
// ProFeatureGate — вокруг SuggestionPanel (нужно добавить)
// ProFeatureGate — вокруг ModeToggle (нужно добавить)
```

### 4.3 Telegram Integration

```typescript
// TelegramProvider — оборачивает /telegram/page.tsx
// TelegramBackButton — управляет нативной кнопкой
// TelegramMainButton — "Open Full Workspace"
// ATS Widget — мини-версия ATSScoreWidget
// ChatPanel — переиспользован из workspace
```

---

## 5. Заключение

### Сводка компонентов для реализации

| Фича | Компоненты | Статус |
|------|-----------|--------|
| Auth | AuthLayout, OAuthButtons, LoginForm, RegisterForm, ForgotPasswordForm | Нужно создать |
| Auth | Auth API routes (NextAuth.js) | Нужно создать |
| Telegram | TelegramProvider, TelegramBackButton, TelegramMainButton | ✅ Созданы |
| Telegram | /telegram/page.tsx, /telegram/layout.tsx | ✅ Созданы |
| Telegram | theme.ts, types/telegram.ts | ✅ Созданы |
| Billing | PricingCard, PricingToggle, SubscriptionBadge, ProFeatureGate | ✅ Созданы |
| Billing | /pricing/page.tsx, types/billing.ts, useSubscriptionStore | ✅ Созданы |
| Billing | Stripe Checkout API, Telegram Stars API | Нужно создать |

### Ключевые принципы дизайна

1. **Glass-morphism**: Все карточки и панели используют `glass-panel` / `glass-card` классы
2. **Purple accent**: #6001d1 (primary), #8B5CF6 (glow), #d2bbff (text on accent)
3. **Тёмная тема**: #0b0f19 фон, белый/светло-серый текст
4. **Stitch consistency**: Единые анимации, тени, border-radius
5. **Mobile-first**: Touch targets 44px, safe areas, keyboard avoidance
6. **Accessibility**: ARIA labels, focus-visible, reduced-motion support
7. **States**: Каждый компонент имеет loading, empty, error, success состояния
