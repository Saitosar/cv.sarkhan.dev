# Page Audit Report — AI-First Redesign under Stitch

**Дата:** 2026-07-07
**Аудитор:** CV Orchestrator (Hard Manager)
**Цель:** Полный аудит всех страниц cv.sarkhan.dev на соответствие Stitch дизайну и AI-first подходу. Выявление form-based наследия для выпиливания.

---

## Executive Summary

Из 7 страниц приложения:
- **2 страницы** (Workspace, Telegram) — частично соответствуют AI-first подходу, но не соответствуют Stitch
- **1 страница** (Pricing) — нейтральная, не AI-first, не form-based
- **3 страницы** (Create, Update, Import) — **чистое form-based наследие**, подлежат удалению
- **1 страница** (Home) — landing page, требует редизайна под Stitch

---

## Page Audit Matrix

| Страница | Статус | Проблемы | Stitch соотв. | AI-first? |
|----------|--------|----------|---------------|-----------|
| `/` (Home) | 🟡 | Hero + 3 карточки-ссылки (Create, Update, Coming Soon). Нет AI-интерфейса. Нет SideNav. Нет ATS Score. Нет чата. | ❌ Нет | ❌ Нет |
| `/workspace` | 🟡 | SplitScreen (Chat + Canvas) — хорошая основа. Нет SideNav из Stitch. Нет ATS Score виджета (оверлей). Нет "Aether Coach" брендинга. Нет SessionBadge. ChatPanel есть, но без Stitch-стилизации. | ❌ Нет | ✅ Да |
| `/pricing` | 🟢 | PricingCard + PricingToggle. Glass-карточки. Чистый дизайн. Нет form-based элементов. | ⚠️ Частично | ❌ Н/П |
| `/telegram` | 🟡 | TelegramProvider + ChatPanel. WebView адаптация. Нет Stitch-стилизации. Нет ATS Score. | ❌ Нет | ✅ Да |
| `/create` | 🔴 | **Чистое form-based наследие.** react-hook-form, 9 field arrays (experience, projects, education, skills, languages, achievements, trainings, certifications). Zod валидация. AutoSave. 323 строки формы. | ❌ Нет | ❌ Нет |
| `/update` | 🔴 | **Чистое form-based наследие.** Textarea для вставки резюме, file upload, LinkedIn URL, target job description. 321 строка формы. | ❌ Нет | ❌ Нет |
| `/import` | 🔴 | **Чистое form-based наследие.** LinkedIn URL input + file upload. Заглушка (setResumeData не работает). 114 строк. | ❌ Нет | ❌ Нет |

---

## 🔴 Что выпилить (form-based наследие)

### 1. `/create` — Полностью удалить
- **Файлы:** `src/app/create/page.tsx`, `src/components/CreateResumeForm.tsx`
- **Проблема:** 323 строки классической HTML-формы с 9 секциями (Experience, Projects, Education, Skills, Languages, Achievements, Trainings, Certifications). react-hook-form + Zod + useFieldArray. AutoSave в localStorage. Кнопки "Generate Resume" и "Assess Resume".
- **AI-first альтернатива:** Всё это делается через ChatPanel в Workspace. Пользователь пишет "Create a resume for a Senior DevOps Engineer", AI генерирует, Canvas отображает.
- **Зависимости:** CreateResumeForm, LivePreview, TemplateSelector, ColorPalette, ThemeToggle, ATSScoreCard, AssessmentResultDisplay, DownloadPdfButton, SkeletonPreview, FillSampleDataButton, AchievementsSuggestions, AutoSaveIndicator, ValidationMessage, Tabs, useAIStatus
- **Действие:** 🗑️ Удалить страницу и компонент. Перенаправить `/create` → `/workspace`.

### 2. `/update` — Полностью удалить
- **Файлы:** `src/app/update/page.tsx`, `src/components/UpdateResumeForm.tsx`
- **Проблема:** 321 строка формы с textarea для вставки резюме, file upload (PDF/DOCX/TXT), LinkedIn URL, target job description. Кнопка "Tailor Resume to Job".
- **AI-first альтернатива:** Пользователь в Workspace пишет "Update my resume for this job: [paste JD]", AI делает tailoring, Canvas обновляется.
- **Зависимости:** UpdateResumeForm, LivePreview, TemplateSelector, ColorPalette, ThemeToggle, ATSScoreCard, DownloadPdfButton, SkeletonPreview, Tabs, useAIStatus
- **Действие:** 🗑️ Удалить страницу и компонент. Перенаправить `/update` → `/workspace`.

### 3. `/import` — Полностью удалить
- **Файлы:** `src/app/import/page.tsx`
- **Проблема:** 114 строк формы с LinkedIn URL input + file upload. Заглушка — setResumeData не работает (только показывает URL).
- **AI-first альтернатива:** Пользователь в Workspace пишет "Import my LinkedIn profile: [URL]", AI парсит и заполняет Canvas.
- **Зависимости:** LivePreview, TemplateSelector, ColorPalette, ThemeToggle
- **Действие:** 🗑️ Удалить страницу. Перенаправить `/import` → `/workspace`.

### 4. Сопутствующие компоненты (проверить на необходимость)
- `FillSampleDataButton` — только для CreateResumeForm → удалить
- `AutoSaveIndicator` — только для CreateResumeForm → удалить
- `AchievementsSuggestions` — только для CreateResumeForm → удалить
- `ValidationMessage` — используется в CreateResumeForm и UpdateResumeForm → удалить
- `AssessmentResultDisplay` — только для CreatePage → удалить
- `SkeletonPreview` — используется в Create, Update → удалить
- `useAIStatus` — используется в Create, Update → удалить
- `CreateResumeForm` → удалить
- `UpdateResumeForm` → удалить

---

## 🟡 Что оставить, но переделать под Stitch

### 5. `/` (Home) — Редизайн под Stitch
**Текущее:** Hero + 3 карточки (Create, Update, Coming Soon) + Feature grid + Footer
**Stitch TO BE:**
- SideNav (слева, фиксированный): Dashboard, Resumes, Jobs, Insights
- Hero: "Build a resume that beats the bots" → оставить, но обновить визуал
- Убрать карточки Create/Update/Coming Soon
- Добавить CTA "Open Workspace" (ведёт в `/workspace`)
- Добавить ATS Score preview (анимированный)
- Feature grid → оставить, но в Stitch-стиле
- Footer → оставить

### 6. `/workspace` — Stitch-изация
**Текущее:** SplitScreen (ChatPanel + CanvasPanel), JobsToggle, SubscriptionBadge
**Stitch TO BE:**
- ✅ SideNav (слева, как в Stitch HTML)
- ✅ ChatPanel → переименовать в "Aether Coach" (как в Stitch)
- ✅ CanvasPanel → добавить ATS Score оверлей (как в Stitch: круговой индикатор 84% с pulse-ring анимацией)
- ✅ SessionBadge → "Session Started • Focus: Senior DevOps"
- ✅ ChatHeader → иконка AI + статус Online (зелёный индикатор)
- ✅ ChatInput → Stitch-стиль (placeholder "Tell Aether what to improve...")
- ✅ MessageList → Stitch-стиль (chat-glow, rounded-2xl, rounded-tl-none)
- ✅ MobileTabBar → уже есть, проверить соответствие Stitch

### 7. `/pricing` — Stitch-изация
**Текущее:** PricingCard + PricingToggle. Glass-карточки. FAQ.
**Stitch TO BE:**
- ✅ SideNav (слева)
- ✅ Stitch-цвета (#6001d1 accent, glass-panel)
- ✅ FAQ в Stitch-стиле
- ⚠️ Добавить ATS Score preview на pricing (показать, что Pro даёт)

### 8. `/telegram` — Stitch-изация
**Текущее:** TelegramProvider + ChatPanel. WebView адаптация.
**Stitch TO BE:**
- ✅ ChatPanel в Stitch-стиле (Aether Coach)
- ✅ Telegram-специфичные цвета (var(--tg-*))
- ⚠️ Добавить ATS Score мини-виджет (адаптированный под WebView)
- ⚠️ Добавить Quick Actions (Import LinkedIn, Tailor for Job)

---

## 🟢 Что добавить (AI-first)

### Новые AI-first фичи (из Stitch дизайна)

1. **SideNav (глобальная навигация)**
   - Фиксированная панель слева (w-64)
   - Разделы: Dashboard, Resumes, Jobs, Insights
   - Кнопка "New Resume" (shimmer-bg)
   - Аватар AI + "Expert Mode" badge
   - **Где:** `/`, `/workspace`, `/pricing`

2. **ATS Score Widget (оверлей на Canvas)**
   - Круговой индикатор (SVG circle с градиентом)
   - pulse-ring анимация
   - Текущий score (например, 84%)
   - **Где:** `/workspace` (CanvasPanel)

3. **Aether Coach брендинг**
   - ChatHeader: иконка AI (smart_toy) + "Aether Coach" + Online статус
   - SessionBadge: "Session Started • Focus: [target role]"
   - **Где:** `/workspace`, `/telegram`

4. **Quick Action Buttons**
   - [Import LinkedIn] [Tailor for Job] [Improve ATS]
   - **Где:** ChatPanel (над input)

5. **Suggestion Chips**
   - [Apply] [Edit] [Dismiss] на AI-предложениях
   - **Где:** CanvasPanel (SuggestionPanel)

---

## 📊 Сводка

| Категория | Количество | Действие |
|-----------|-----------|----------|
| 🔴 Удалить (form-based) | 3 страницы + 10+ компонентов | `/create`, `/update`, `/import` |
| 🟡 Редизайн под Stitch | 4 страницы | `/`, `/workspace`, `/pricing`, `/telegram` |
| 🟢 Добавить (AI-first) | 5 фич | SideNav, ATS Widget, Aether Coach, Quick Actions, Suggestion Chips |

### Критический путь редизайна

1. **Фаза 1 — Удаление form-based наследия:**
   - Удалить `/create`, `/update`, `/import` страницы
   - Удалить CreateResumeForm, UpdateResumeForm
   - Настроить редиректы на `/workspace`
   - Удалить зависимые компоненты (FillSampleDataButton, AutoSaveIndicator, AchievementsSuggestions, ValidationMessage, AssessmentResultDisplay, SkeletonPreview, useAIStatus)

2. **Фаза 2 — Stitch SideNav:**
   - Создать глобальный SideNav компонент
   - Интегрировать в ClientLayoutWrapper
   - Stitch-стилизация (w-64, glass-panel, shimmer-bg кнопка)

3. **Фаза 3 — Stitch-изация Workspace:**
   - ATS Score Widget (SVG circle + pulse-ring)
   - Aether Coach брендинг (ChatHeader, SessionBadge)
   - Stitch-стили для ChatPanel и CanvasPanel

4. **Фаза 4 — Stitch-изация остальных страниц:**
   - Home: убрать карточки, добавить CTA в Workspace
   - Pricing: SideNav + Stitch-цвета
   - Telegram: ATS Widget + Quick Actions

---

## Примечания

- **Stitch reference:** `/root/cv.sarkhan.dev/designs/stitch-confidence-final.html`
- **Design tokens:** #6001d1 (primary), #4F46E5 (accent), #141313 (bg), glass-panel (backdrop-blur)
- **Fonts:** Inter (body), Sora (display) — в Stitch HTML, но в проекте Inter + Geist
- **Icons:** Material Symbols (в Stitch) vs Lucide (в проекте) — нужно унифицировать
