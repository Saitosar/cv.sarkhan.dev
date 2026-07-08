# UX Fix Plan — cv.sarkhan.dev

**Source:** UI/UX Audit Report (`/root/cv.sarkhan.dev/ui-ux-audit-report.md`)
**Date:** 2026-07-08
**Status:** Draft — ready for implementation
**Overall Score:** 5.5/10 → Target: 8.5/10

---

## P0 — Critical (Fix NOW)

---

### UX-001 | HR Coach переключение вызывает бесконечную загрузку / зависание

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Severity** | App-freezing — пользователь не может вернуться к Aether без перезагрузки |
| **Files** | `src/components/ChatPanel/ModeToggle.tsx`, `src/components/ChatPanel/ChatHeader.tsx`, `src/components/ChatPanel.tsx`, `src/stores/useChatStore.ts`, `src/components/Billing/ProFeatureGate.tsx` |
| **Description** | ModeToggle отображает обе вкладки (Aether / HR Coach) для всех пользователей. HR Coach — Pro-only функция, но tab активен и кликабелен для free-пользователей. При клике: (1) mode в store переключается на `'hr-coach'`, (2) ChatHeader показывает HR Coach UI, (3) ProFeatureGate блокирует контент блюром. Но mode уже изменён — при отправке сообщения AI Router пытается использовать `alternateSystemPrompt` для HR Coach. Если API не отвечает или ключ невалиден, возникает HTTP 500 / timeout, и приложение зависает в состоянии `isStreaming=true` без возможности откатить mode обратно. |
| **Root Cause** | ModeToggle не проверяет `subscription.tier`. Нет guard-логики, предотвращающей переключение mode для free tier. Нет fallback при ошибке AI для восстановления mode. |
| **Fix** | 1. **Disable HR Coach tab для free tier**: в ModeToggle добавить проверку `useSubscriptionStore((s) => s.tier)`. Если `tier !== 'pro'`, кнопка HR Coach должна быть `disabled` с lock-иконкой и tooltip "Upgrade to Pro". 2. **Не менять mode при блокировке**: в ChatHeader.handleModeChange проверять tier перед вызовом onModeToggle. 3. **Добавить error boundary**: при ошибке AI в HR Coach mode, автоматически переключать mode обратно на 'aether' и показывать toast "HR Coach unavailable. Switched to Aether." 4. **Убрать дублирующийся ProFeatureGate** вокруг ModeToggle (оставить только вокруг SuggestionPanel). |
| **Acceptance Criteria** | 1. Free user видит HR Coach tab disabled с lock-иконкой и tooltip. 2. Клик на disabled tab не меняет mode. 3. Pro user может свободно переключаться. 4. При ошибке AI в HR Coach mode автоматический fallback на Aether. 5. Нет бесконечной загрузки при любом сценарии. |

---

### UX-002 | AI Backend — Aether не отвечает (HTTP 500 / timeout)

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Severity** | App-breaking — основная функция (чат с AI) полностью не работает |
| **Files** | `src/app/api/ai/route/route.ts`, `src/app/api/sse/chat/route.ts`, `src/lib/ai/router.ts`, `src/lib/ai/config.ts`, `src/lib/gemini.ts`, `src/services/chat-sse.ts`, `.env.local` |
| **Description** | Любое сообщение в чате возвращает HTTP 500. `getGemini()` создаёт OpenAI client с `baseURL: 'https://ollama.com/v1'` и моделью `deepseek-v4-flash`. Если `OLLAMA_CLOUD_API_KEY` отсутствует, невалиден, или модель недоступна — `router.route()` / `router.routeStream()` падает с ошибкой, catch блок возвращает 500. ChatSSEService получает ошибку, очищает input (пользователь теряет сообщение), показывает неинформативное "⚠️ Error". Нет Retry-кнопки. |
| **Root Cause** | 1. `OLLAMA_CLOUD_API_KEY` может отсутствовать в production-окружении. 2. Модель `deepseek-v4-flash` может быть недоступна через Ollama Cloud. 3. Нет fallback-провайдера (например, OpenAI / Anthropic). 4. Нет graceful degradation — при ошибке AI приложение должно показывать понятное сообщение, а не 500. |
| **Fix** | 1. **Проверить и настроить API ключ**: убедиться, что `OLLAMA_CLOUD_API_KEY` установлен в Vercel environment variables. 2. **Добавить fallback-провайдер**: в `config.ts` добавить второй провайдер (например, OpenAI GPT-4o-mini) как fallback, если Ollama Cloud недоступен. 3. **Улучшить error handling в ChatPanel**: при ошибке не очищать input, сохранять `retryInput` (уже есть в store). Добавить кнопку "Retry" на error-сообщении. 4. **Добавить health check**: на странице workspace показывать статус AI backend (online/offline). 5. **Улучшить сообщение об ошибке**: "AI service is temporarily unavailable. Your message has been saved — tap Retry to try again." |
| **Acceptance Criteria** | 1. Отправка сообщения не вызывает 500 при валидном API ключе. 2. При отсутствии ключа — понятное сообщение, input не очищается. 3. Есть кнопка Retry на error-сообщениях. 4. Health check показывает статус AI. 5. Fallback-провайдер работает если основной недоступен. |

---

### UX-003 | SideNav — нет кнопки закрытия, нет overlay

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Severity** | High — навигация не работает на мобильных устройствах |
| **Files** | `src/components/SideNav.tsx`, `src/components/MobileNav.tsx`, `src/app/layout.tsx` |
| **Description** | SideNav — `fixed left-0 top-0 z-50 hidden ... md:flex`. На десктопе (≥768px) всегда видна. На мобильных (<768px) полностью скрыта (`hidden`). Нет hamburger-кнопки для открытия, нет close-кнопки, нет overlay-затемнения. MobileNav внизу экрана дублирует только 3 ссылки (Home, Workspace, Pricing), но не содержит Dashboard, Resumes, Jobs, Insights из SideNav. |
| **Root Cause** | SideNav не имеет responsive toggle-механизма. MobileNav — отдельный компонент с урезанным набором ссылок. Нет единой навигационной системы. |
| **Fix** | 1. **Добавить hamburger menu button** в Header (или fixed top-left) для мобильных. 2. **Добавить overlay backdrop** (`bg-black/50 backdrop-blur-sm`) при открытом SideNav на мобильных. 3. **Добавить close button** (X icon) внутри SideNav для мобильных. 4. **Синхронизировать nav items**: MobileNav должен показывать те же пункты, что и SideNav (Dashboard, Resumes, Jobs, Insights). 5. **Анимация**: slide-in слева для SideNav на мобильных. |
| **Acceptance Criteria** | 1. На мобильных (<768px) SideNav скрыта, видна hamburger-кнопка. 2. Клик на hamburger открывает SideNav с анимацией slide-in. 3. Overlay затемняет фон. 4. Close button (X) закрывает SideNav. 5. Клик на overlay закрывает SideNav. 6. На десктопе SideNav всегда видна, без изменений. |

---

### UX-004 | Pricing page — бесконечный ре-рендер

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Severity** | High — страница может "зависнуть" из-за циклических ре-рендеров |
| **Files** | `src/app/pricing/page.tsx`, `src/components/Billing/PricingToggle.tsx`, `src/components/Billing/PricingCard.tsx`, `src/stores/useSubscriptionStore.ts` |
| **Description** | PricingPage использует `useSubscriptionStore((s) => s.subscribe)`. При клике "Subscribe" вызывается `subscribe(plan.tier)`, который для 'pro' вызывает `showToast('Coming Soon')` и `set({ status: 'free' })`. Это может вызвать ре-рендер → повторный вызов subscribe. PricingToggle имеет внутренний `useState` для cycle + `useEffect` синхронизации с пропом `value` — если проп value меняется каждый рендер, возникает цикл. |
| **Root Cause** | 1. `subscribe()` в store меняет `status` на `'loading'`, потом сразу на `'free'` — лишний ре-рендер. 2. PricingToggle.useEffect синхронизирует state с пропом — если проп нестабилен, цикл. 3. Нет `React.memo` на PricingCard. |
| **Fix** | 1. **Убрать `set({ status: 'loading' })`** из subscribe для 'pro' — сразу показывать toast и возвращать. 2. **Убрать useEffect из PricingToggle** — использовать prop `value` как source of truth, внутренний state только для uncontrolled mode. 3. **Добавить `React.memo`** на PricingCard. 4. **Добавить loading state** на кнопку Subscribe (показывать spinner при обработке). 5. **Стабилизировать пропсы**: обернуть `handleSubscribe` в `useCallback`. |
| **Acceptance Criteria** | 1. Клик Subscribe не вызывает циклических ре-рендеров. 2. PricingToggle работает без useEffect-цикла. 3. Кнопка Subscribe показывает loading state. 4. React DevTools profiler не показывает бесконечных ре-рендеров. |

---

## P1 — Medium Priority

---

### UX-005 | ATS Score — пустой, нет скелетона при загрузке

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Severity** | Medium — пользователь видит 0% score до загрузки данных |
| **Files** | `src/components/ATSScoreCard.tsx`, `src/components/CanvasPanel/ATSScoreWidget.tsx`, `src/components/CanvasPanel/CircularScore.tsx`, `src/components/CanvasPanel/ShimmerSkeleton.tsx`, `src/stores/useATSStore.ts` |
| **Description** | ATSScoreCard показывает score=0 когда resumeData пустой. ATSScoreWidget всегда отображает число (0%) даже когда анализ не запущен. PulseRing не рендерится (CSS класс `pulse-ring` существует в globals.css, но компонент проверяет `visible` prop — `isAnalyzing ?? true` делает его `true` всегда, но элемент не виден в DOM из-за `absolute inset-0` без размеров). Нет skeleton-состояния между "нет данных" и "результат загружен". |
| **Root Cause** | 1. ATSScoreCard не различает состояния: "нет данных" vs "загрузка" vs "результат". 2. ATSScoreWidget передаёт `isAnalyzing ?? true` — PulseRing всегда visible, но CSS не применяется (возможно из-за missing `rounded-full` на контейнере). 3. Нет skeleton-компонента для ATS Score. |
| **Fix** | 1. **Добавить 3 состояния в ATSScoreWidget**: `'empty'` (нет данных), `'loading'` (анализ идёт), `'loaded'` (есть результат). 2. **Для 'empty'**: показывать "—" вместо "0%", текст "Add resume data to see your ATS score". 3. **Для 'loading'**: показывать ShimmerSkeleton (уже есть в `ShimmerSkeleton.tsx`). 4. **Починить PulseRing**: убедиться, что контейнер имеет `rounded-full` и `overflow-hidden`, проверить что CSS класс `pulse-ring` применяется. 5. **Добавить анимированный skeleton** для ATS Score виджета (круглый skeleton с shimmer). |
| **Acceptance Criteria** | 1. При пустом resume: виджет показывает "—" и подсказку. 2. При загрузке: анимированный skeleton. 3. При загруженном score: нормальное отображение. 4. PulseRing анимируется при isAnalyzing=true. 5. Нет 0% до появления данных. |

---

### UX-006 | VoiceButton — не работает, скрыть или добавить tooltip

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Severity** | Medium — кнопка присутствует, но функциональность не реализована |
| **Files** | `src/components/ChatPanel/VoiceButton.tsx`, `src/components/ChatPanel/ChatInput.tsx`, `src/hooks/useVoiceInput.ts` |
| **Description** | VoiceButton рендерится условно: `{isSupported && <VoiceButton .../>}`. Если браузер поддерживает MediaRecorder, кнопка видна. Но `useVoiceInput` hook не подключён к реальному API распознавания речи — voice input не работает. Пользователь видит кнопку, нажимает, но ничего не происходит (или ошибка). |
| **Root Cause** | Voice input функциональность не реализована end-to-end. Hook `useVoiceInput` существует, но не подключён к серверному API распознавания речи. |
| **Fix** | **Option A (рекомендуется)**: Скрыть VoiceButton полностью до реализации voice input. Убрать `{isSupported && ...}` из ChatInput. **Option B**: Оставить кнопку, но добавить tooltip "Coming soon" и сделать её disabled. Выбрать Option A, т.к. disabled кнопка создаёт лишний UI шум. |
| **Acceptance Criteria** | 1. VoiceButton не отображается в ChatInput. 2. Send button использует Lucide `Send` иконку (не Material Symbols). 3. Нет пустого пространства от скрытой кнопки. |

---

### UX-007 | Онбординг для новых пользователей

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Severity** | Medium — новые пользователи не понимают, как использовать приложение |
| **Files** | `src/app/workspace/page.tsx`, `src/components/ChatPanel/MessageList.tsx`, `src/components/CanvasPanel/ResumeCanvas.tsx`, `src/app/page.tsx` |
| **Description** | При первом входе в workspace пользователь видит пустой чат с приветствием "Hello! I'm Aether..." и пустой Canvas. Нет guided tour, нет подсказок, нет объяснения как работает приложение. Landing page имеет hero и feature grid, но не объясняет workflow. |
| **Root Cause** | Онбординг не реализован. Нет механизма определения "новый пользователь". |
| **Fix** | 1. **Добавить определение нового пользователя**: проверять `localStorage` или `firstVisit` timestamp. 2. **Добавить welcome overlay** при первом визите: 3-шаговый guided tour (шаг 1: "Chat with Aether to build your resume", шаг 2: "View and edit your resume on the right", шаг 3: "Get AI suggestions for each section"). 3. **Добавить suggestion chips** к первому сообщению Aether: "Build my resume from scratch", "Improve my existing resume", "What can you do?". 4. **Добавить контекстные подсказки** в пустые состояния (уже частично есть в MessageList и ATSScoreCard). |
| **Acceptance Criteria** | 1. Новый пользователь видит welcome overlay при первом входе. 2. Guided tour показывает 3 шага с кнопками Next/Back/Skip. 3. После завершения tour, пользователь не видит его снова. 4. Первое сообщение Aether содержит suggestion chips. 5. Пустые состояния имеют полезные подсказки. |

---

## P2 — Lower Priority

---

### UX-008 | Material Symbols не загружены (иконки отображаются как текст)

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Severity** | Medium — визуальный баг, иконки выглядят как текст ("smart_toy", "send", "badge") |
| **Files** | `src/app/layout.tsx`, `src/components/ChatPanel/ChatInput.tsx`, `src/components/SideNav.tsx`, `src/components/SplitScreen.tsx`, `src/components/ChatPanel/ModeToggle.tsx`, `src/components/ChatPanel/ChatHeader.tsx`, `src/components/CanvasPanel/SuggestionPanel.tsx` |
| **Description** | Множество компонентов используют `<span className="material-symbols-outlined">icon_name</span>`. В layout.tsx уже есть `<link>` для Material Symbols, но браузерный чек показал `materialSymbols: false`. Возможно проблема с URL, CORS, или кэшированием. Иконки рендерятся как plain text. |
| **Root Cause** | 1. URL в layout.tsx может быть неверным или заблокирован. 2. Google Fonts может быть недоступен в регионе. 3. Нет fallback-шрифта. |
| **Fix** | 1. **Проверить URL**: текущий URL `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200` — проверить что он корректен и доступен. 2. **Добавить fallback**: если Google Fonts недоступен, использовать Lucide иконки как fallback. 3. **Мигрировать на Lucide**: заменить все `material-symbols-outlined` на соответствующие Lucide иконки (рекомендуется — Lucide уже используется в проекте и работает). 4. **Self-host**: скачать и захостить Material Symbols локально. |
| **Acceptance Criteria** | 1. Все иконки отображаются корректно (не как текст). 2. Send button показывает иконку отправки. 3. ModeToggle показывает smart_toy и badge иконки. 4. SideNav показывает dashboard, description, work, insights иконки. |

---

### UX-009 | SplitScreen drag handle невидимый

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Severity** | Low-Medium — функциональность работает, но пользователь не знает о ней |
| **Files** | `src/components/SplitScreen.tsx` |
| **Description** | Splitter — 1.5px ширина с `bg-white/10`. На тёмном фоне почти невидим. Есть `drag_indicator` иконка (Material Symbol), но она не загружена (см. UX-008). Нет hover-эффекта, нет курсора `col-resize` вне зоны сплиттера. |
| **Root Cause** | Слишком тонкий сплиттер, Material Symbols не загружены, нет визуального якоря. |
| **Fix** | 1. **Увеличить ширину сплиттера** до 8px (с 1.5px). 2. **Добавить 3-dot grip** визуальный индикатор (три точки). 3. **Усилить hover-эффект**: яркий purple при наведении. 4. **Добавить Lucide `GripVertical`** иконку вместо `drag_indicator`. 5. **Увеличить hover lane** до 16px для удобства. |
| **Acceptance Criteria** | 1. Сплиттер видим на тёмном фоне. 2. При наведении — яркий purple эффект. 3. Иконка grip видна. 4. Курсор меняется на col-resize при наведении. |

---

### UX-010 | SuggestionPanel locked но всё ещё fetches

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Severity** | Medium — лишние API вызовы для locked-пользователей |
| **Files** | `src/components/CanvasPanel.tsx`, `src/components/CanvasPanel/SuggestionPanel.tsx`, `src/components/Billing/ProFeatureGate.tsx` |
| **Description** | В CanvasPanel.tsx, `useEffect` для fetch suggestions запускается при изменении `activeSection`, независимо от tier подписки. ProFeatureGate оборачивает SuggestionPanel, но эффект уже запущен. Это лишние API вызовы для free-пользователей. |
| **Root Cause** | useEffect не проверяет subscription tier перед fetch. |
| **Fix** | 1. **Добавить проверку tier** в useEffect перед fetch: `if (tier !== 'pro') return;`. 2. **Unmount SuggestionPanel** (а не `opacity-0 pointer-events-none`) когда нет activeSection — использовать conditional rendering. 3. **Добавить guard** в `handleSectionTap` для free tier. |
| **Acceptance Criteria** | 1. Free user не делает API вызовы для suggestions. 2. SuggestionPanel unmount-ится когда нет activeSection. 3. Pro user работает без изменений. |

---

### UX-011 | Duplicate ProFeatureGate

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Severity** | Low — два одинаковых "Upgrade to Pro" на экране |
| **Files** | `src/components/ChatPanel.tsx`, `src/components/CanvasPanel.tsx`, `src/components/Billing/ProFeatureGate.tsx` |
| **Description** | ProFeatureGate используется дважды: (1) вокруг ModeToggle в ChatPanel (через ChatHeader), (2) вокруг SuggestionPanel в CanvasPanel. Это создаёт два одинаковых "Upgrade to Pro" блока на одном экране. |
| **Root Cause** | ProFeatureGate добавлен в двух местах без координации. |
| **Fix** | 1. **Убрать ProFeatureGate из ChatHeader/ModeToggle** — вместо этого сделать HR Coach tab disabled с lock-иконкой (см. UX-001). 2. **Оставить один ProFeatureGate** вокруг SuggestionPanel. 3. **Добавить единый upgrade banner** в workspace для free tier (один раз, внизу или сбоку). |
| **Acceptance Criteria** | 1. Только один "Upgrade to Pro" блок на экране. 2. HR Coach tab disabled с lock-иконкой. 3. SuggestionPanel показывает ProFeatureGate. |

---

### UX-012 | Error handling — нет Retry, input очищается

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Severity** | Medium — пользователь теряет введённое сообщение при ошибке |
| **Files** | `src/components/ChatPanel.tsx`, `src/services/chat-sse.ts`, `src/components/ChatPanel/AgentMessage.tsx`, `src/stores/useChatStore.ts` |
| **Description** | При ошибке отправки сообщения: (1) input очищается (`setInputValue('')` вызывается до try), (2) сообщение пользователя уже добавлено в чат, (3) error message не имеет кнопки Retry. Пользователь должен заново вводить сообщение. |
| **Root Cause** | `setInputValue('')` вызывается до отправки, а не после успеха. Нет Retry-действия на error message. |
| **Fix** | 1. **Не очищать input до успешной отправки**: перенести `setInputValue('')` после успешного stream. 2. **Добавить Retry-кнопку** на error message (использовать `retryInput` из ChatMessage). 3. **Добавить "Dismiss" кнопку** на error message. 4. **Восстанавливать input** при клике Retry. |
| **Acceptance Criteria** | 1. При ошибке input не очищается. 2. Error message имеет кнопку Retry. 3. Клик Retry восстанавливает сообщение в input. 4. Клик Dismiss убирает error message. |

---

### UX-013 | Accessibility — color contrast

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Severity** | Medium — WCAG AA compliance |
| **Files** | `src/app/globals.css`, `src/components/ATSScoreCard.tsx`, `src/components/ChatPanel/ModeToggle.tsx`, `src/components/SideNav.tsx` |
| **Description** | Цвет `#c4c7c7` (muted text) на тёмном фоне `#1c1b1b` может не проходить WCAG AA (min contrast ratio 4.5:1). Красный `#ef4444` и жёлтый `#eab308` на тёмном стеклянном фоне также могут быть проблемными. |
| **Root Cause** | Цвета выбраны визуально, без проверки contrast ratio. |
| **Fix** | 1. **Проверить contrast ratio** всех текстовых цветов на тёмном фоне. 2. **Увеличить яркость muted text** с `#c4c7c7` до `#d4d7d7` или светлее. 3. **Добавить text shadow** для цветного текста на стеклянном фоне. 4. **Проверить focus-visible styles** на всех интерактивных элементах. |
| **Acceptance Criteria** | 1. Все текстовые цвета проходят WCAG AA (4.5:1 для normal text, 3:1 для large text). 2. Focus-visible кольца видны на всех кнопках. 3. Color contrast не снижает читаемость. |

---

### UX-014 | Performance — CanvasPanel debounce и лишние рендеры

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Severity** | Low-Medium — лишние вычисления при пустом resume |
| **Files** | `src/components/CanvasPanel.tsx` |
| **Description** | CanvasPanel имеет два useEffect: (1) fetch suggestions при изменении activeSection, (2) debounced ATS scoring при изменении resume. Оба эффекта: запускаются даже когда resume пустой (effect 2 проверяет `if (!resume.fullName && !resume.jobTitle) return` но timeout уже установлен). Suggestion fetch не проверяет subscription tier. |
| **Root Cause** | Эффекты не имеют ранних guard-условий. Timeout устанавливается до проверки. |
| **Fix** | 1. **Добавить ранний return** в ATS effect до setTimeout: `if (!resume.fullName && !resume.jobTitle) return;`. 2. **Добавить проверку tier** в suggestion effect. 3. **Мемоизировать** `getSectionContent` вызов. 4. **Уменьшить debounce** с 2000ms до 1000ms для более быстрого отклика. |
| **Acceptance Criteria** | 1. При пустом resume не устанавливается timeout для ATS. 2. Free user не делает suggestion API calls. 3. Нет лишних ре-рендеров при пустом состоянии. |

---

### UX-015 | Landing page — bare, нет value proposition

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Severity** | Medium — слабая конверсия для нового трафика |
| **Files** | `src/app/page.tsx` |
| **Description** | Landing page имеет hero "Your resume, built by conversation" и 3 feature cards. Нет: social proof (testimonials), pricing teaser, CTA variety, demo video/screenshot, stats ("10k+ resumes built"), email capture. |
| **Root Cause** | Страница не оптимизирована для конверсии. |
| **Fix** | 1. **Добавить pricing teaser** секцию с ссылкой на /pricing. 2. **Добавить testimonial placeholder** (можно заглушку "Coming soon"). 3. **Добавить stats counter** ("X resumes optimized", "Y ATS scores improved"). 4. **Добавить second CTA** "See pricing" рядом с "Start with AI". 5. **Добавить screenshot/demo** секцию. |
| **Acceptance Criteria** | 1. Landing page имеет pricing teaser. 2. Есть social proof секция. 3. Два CTA на hero. 4. Страница не выглядит "under construction". |

---

## NEW BUGS — User Report (Mobile Testing)

---

### UX-016 | Chat overflow — окно чата прикрывает панель ввода и нижнее меню

| Field | Value |
|-------|-------|
| **Priority** | **P0 — CRITICAL** |
| **Severity** | App-breaking на мобильных — после одного ответа Aether невозможно писать, поле ввода скрыто |
| **Files** | `src/components/ChatPanel.tsx`, `src/components/ChatPanel/ChatInput.tsx`, `src/components/MobileNav.tsx`, `src/app/workspace/page.tsx` |
| **Description** | Когда Aether отвечает, окно чата наползает на панель ввода сообщения и нижнее меню. После одной переписки поле ввода полностью скрыто. Пользователь не может отправить новое сообщение. |
| **Root Cause** | Вероятно, контейнер чата не учитывает высоту ChatInput и MobileNav при расчёте `overflow` / `max-height`. На мобильных fixed-элементы (ChatInput, MobileNav) перекрываются контентом чата из-за неправильного `padding-bottom` или `scroll-container` height. |
| **Fix** | 1. **Добавить `padding-bottom`** на контейнер сообщений, равный суммарной высоте ChatInput + MobileNav (или использовать `safe-area-inset-bottom`). 2. **Убедиться, что scroll container** имеет `flex-1` и `overflow-y-auto` с правильным `max-h`. 3. **Проверить z-index** ChatInput и MobileNav — они должны быть выше контента чата. 4. **Использовать `position: sticky`** для ChatInput внизу экрана. 5. **Добавить CSS `scroll-padding-bottom`** для автоматического скролла к последнему сообщению без перекрытия. 6. **Протестировать на реальных мобильных размерах** (375px, 390px, 414px). |
| **Acceptance Criteria** | 1. После ответа Aether поле ввода видимо и доступно. 2. ChatInput не перекрывается контентом чата. 3. MobileNav не перекрывается контентом чата. 4. Скролл к последнему сообщению не скрывает поле ввода. 5. Работает на всех мобильных размерах экрана. |

---

### UX-017 | ChatInput — нет кнопки attachment

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Severity** | Medium — пользователь не может прикрепить файл (резюме, изображение) |
| **Files** | `src/components/ChatPanel/ChatInput.tsx` |
| **Description** | В ChatInput отсутствует кнопка прикрепления файлов. Пользователь не может загрузить резюме (PDF/DOCX) или изображение для анализа AI. |
| **Root Cause** | Attachment functionality не была реализована. |
| **Fix** | 1. **Добавить attachment button** (скрепка 📎 или Lucide `Paperclip`) слева от поля ввода. 2. **Добавить file input** (`<input type="file" accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg" hidden />`). 3. **Добавить обработчик** — при выборе файла показывать превью/название файла над полем ввода. 4. **Добавить кнопку отправки файла** — прикрепить файл к сообщению и отправить AI. 5. **Добавить drag-and-drop** зону (опционально, P2). |
| **Acceptance Criteria** | 1. Кнопка attachment видна в ChatInput. 2. Клик открывает file picker. 3. После выбора файла показывается превью/название. 4. Файл отправляется вместе с сообщением. 5. Поддерживаются PDF, DOCX, TXT, PNG, JPG. |

---

### UX-018 | Pricing — годовая подписка без цены

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Severity** | Medium — пользователь не может принять решение о годовой подписке |
| **Files** | `src/app/pricing/page.tsx`, `src/components/Billing/PricingCard.tsx`, `src/components/Billing/PricingToggle.tsx` |
| **Description** | На странице Pricing есть переключатель Monthly/Yearly, но годовая подписка не имеет цены. Пользователь видит пустое поле цены или "—" при выборе Yearly. |
| **Root Cause** | Yearly pricing data не заполнена в компоненте PricingCard или в данных тарифов. |
| **Fix** | 1. **Добавить годовую цену** для каждого плана (Free: $0/yr, Pro: $99/yr или аналогично с 20% скидкой от monthly). 2. **Добавить бейдж "Save 20%"** при выборе Yearly. 3. **Проверить переключение** Monthly/Yearly — цена должна обновляться корректно. 4. **Добавить "per year" / "per month"** подпись под ценой. |
| **Acceptance Criteria** | 1. При выборе Yearly отображается корректная цена. 2. Есть визуальный индикатор экономии (скидка). 3. Переключение между Monthly/Yearly работает без багов. 4. Цена форматирована корректно. |

---

### UX-019 | Landing page — нет HR Coach, онбординга, CTA регистрации

| Field | Value |
|-------|-------|
| **Priority** | P2 |
| **Severity** | Medium — слабая конверсия, пользователь не знает о HR Coach |
| **Files** | `src/app/page.tsx` |
| **Description** | На landing page отсутствует: (1) информация о HR Coach функциональности, (2) краткий онбординг (как работает сервис), (3) CTA для регистрации / Pro подписки. Пользователь не понимает полный функционал продукта. |
| **Root Cause** | Landing page не обновлялась после добавления HR Coach и других фич. |
| **Fix** | 1. **Добавить секцию "HR Coach"** — описание функционала: AI-коуч для собеседований, практика вопросов, фидбек. 2. **Добавить краткий онбординг** — 3-шаговое объяснение: "Chat with AI → Build your resume → Ace interviews". 3. **Добавить CTA для регистрации** — кнопка "Get Started Free" / "Upgrade to Pro". 4. **Добавить pricing teaser** — ссылка на /pricing с указанием цен. 5. **Добавить feature comparison** — Free vs Pro возможности. |
| **Acceptance Criteria** | 1. Landing page содержит секцию HR Coach. 2. Есть краткий онбординг (3 шага). 3. Есть CTA для регистрации. 4. Есть pricing teaser. 5. Страница не выглядит "under construction". |

---

## Implementation Order

```
Phase 1 (P0 — must ship first)
├── UX-002 AI Backend (fix 500 error)
├── UX-001 HR Coach (fix freeze)
├── UX-003 SideNav (add toggle + overlay)
├── UX-004 Pricing (fix re-render loop)
└── UX-016 Chat overflow (fix input hidden on mobile) ← NEW P0

Phase 2 (P1 — high impact)
├── UX-005 ATS Score (add skeleton)
├── UX-006 VoiceButton (hide)
├── UX-007 Onboarding (add guided tour)
├── UX-008 Material Symbols (fix icons)
└── UX-017 Attachment button (add to ChatInput) ← NEW P1

Phase 3 (P2 — polish)
├── UX-009 SplitScreen (improve handle)
├── UX-010 SuggestionPanel (fix fetch)
├── UX-011 Duplicate ProFeatureGate
├── UX-012 Error handling (add Retry)
├── UX-013 Accessibility (contrast)
├── UX-014 Performance (debounce)
├── UX-015 Landing page (improve)
├── UX-018 Yearly pricing (add price) ← NEW P2
└── UX-019 Landing page (HR Coach, onboarding, CTA) ← NEW P2
```

## Verification Checklist

After each fix:
1. `npm run build` — no TypeScript/build errors
2. `npm run lint` — no lint errors
3. Manual test in browser for the specific fix
4. Check that no regressions in related components
5. Run relevant unit tests: `npm test -- --related=<files>`

## Cross-Cutting Concerns

| Concern | Status | Notes |
|---------|--------|-------|
| Material Symbols | UX-008 | Blocking icon rendering across entire app |
| Error Handling | UX-002, UX-012 | No retry, input cleared, poor messages |
| Accessibility | UX-013 | Color contrast, focus styles |
| Performance | UX-014 | Debounce, unnecessary fetches |
| Mobile Navigation | UX-003 | SideNav hidden on mobile |
| Subscription Gating | UX-001, UX-010, UX-011 | Inconsistent gating logic |
