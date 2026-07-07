# Redesign Plan: AI-First + Stitch

**Дата:** 2026-07-07
**Архитектор:** CV Orchestrator (Hard Manager)
**Основание:** page-audit-report.md + Stitch reference (`designs/stitch-confidence-final.html`)
**Цель:** Удаление form-based наследия, Stitch-изация всех страниц, AI-first UX

---

## Блок 1: Удаление form-based наследия (P1)

**Зависимости:** Нет
**Оценка:** 2 часа
**Файлы:**

### Удалить:
- `src/app/create/page.tsx` — страница создания
- `src/app/update/page.tsx` — страница обновления
- `src/app/import/page.tsx` — страница импорта
- `src/components/CreateResumeForm.tsx` — форма создания (если существует)
- `src/components/UpdateResumeForm.tsx` — форма обновления (если существует)
- `src/components/FillSampleDataButton.tsx` — кнопка заполнения (если существует)
- `src/components/AutoSaveIndicator.tsx` — индикатор автосохранения (если существует)
- `src/components/AchievementsSuggestions.tsx` — подсказки достижений (если существует)
- `src/components/ValidationMessage.tsx` — сообщение валидации (если существует)
- `src/components/AssessmentResultDisplay.tsx` — отображение оценки (если существует)
- `src/components/SkeletonPreview.tsx` — скелетон превью (если существует)
- `src/hooks/useAIStatus.ts` — хук статуса AI (если существует)

### Изменить:
- `next.config.ts` — добавить `async redirects()` для `/create`, `/update`, `/import` → `/workspace`
- `src/components/MobileNav.tsx` — убрать ссылки на `/create` и `/update`, заменить на `/workspace`
- `src/components/Header.tsx` — убрать ссылку на `/create` (если есть)

### Подзадачи:
1.1 Удалить страницы `/create`, `/update`, `/import`
1.2 Удалить компоненты form-based наследия
1.3 Настроить редиректы в next.config.ts
1.4 Обновить MobileNav (убрать Create/Update, добавить Workspace)
1.5 Проверить, что нигде нет import'ов удалённых компонентов

---

## Блок 2: Stitch SideNav (глобальная навигация) (P1)

**Зависимости:** Блок 1 (удаление form-based наследия)
**Оценка:** 3 часа
**Файлы:**

### Создать:
- `src/components/SideNav.tsx` — глобальная боковая панель (Stitch-стиль)
  - Фиксированная слева (w-64, hidden md:flex)
  - Лого "Career AI" + "Expert Mode" badge
  - Кнопка "New Resume" (shimmer-bg)
  - Разделы: Dashboard (/), Resumes (/workspace), Jobs (/workspace?tab=jobs), Insights (/workspace?tab=insights)
  - Material Symbols иконки
  - Активный пункт выделен #6001d1

### Изменить:
- `src/components/ClientLayoutWrapper.tsx` — добавить SideNav для всех страниц, кроме /telegram
- `src/app/layout.tsx` — добавить Material Symbols CDN (уже есть), проверить шрифты
- `src/app/globals.css` — добавить shimmer-bg анимацию (если нет)

### Подзадачи:
2.1 Создать SideNav компонент по Stitch reference
2.2 Интегрировать в ClientLayoutWrapper
2.3 Настроить активное состояние по pathname
2.4 Проверить на всех страницах (Home, Workspace, Pricing)

---

## Блок 3: Stitch-изация Home (P1)

**Зависимости:** Блок 2 (SideNav)
**Оценка:** 2 часа
**Файлы:**

### Изменить:
- `src/app/page.tsx` — полный редизайн:
  - Убрать 3 карточки (Create/Update/Coming Soon)
  - Убрать Card-компонент
  - Hero: оставить заголовок "Build a resume that beats the bots"
  - CTA "Open Workspace" → /workspace (shimmer-bg кнопка)
  - Feature grid: оставить, но в Stitch-стиле
  - Footer: оставить

### Подзадачи:
3.1 Убрать Card-компонент и 3 карточки
3.2 Обновить Hero с CTA "Open Workspace"
3.3 Обновить Feature grid под Stitch-цвета
3.4 Сохранить Footer

---

## Блок 4: Stitch-изация Workspace (P1)

**Зависимости:** Блок 2 (SideNav)
**Оценка:** 4 часа
**Файлы:**

### Изменить:
- `src/app/workspace/page.tsx`:
  - Убрать верхний заголовок "Workspace" (SideNav заменяет)
  - Убрать SubscriptionBadge (перенести в SideNav)
  - JobsToggle → оставить, но в Stitch-стиле
  - SplitScreen → оставить

- `src/components/ChatPanel.tsx`:
  - ChatHeader → уже есть Aether Coach, проверить соответствие Stitch
  - SessionBadge → добавить focus из resume.targetJob?.title
  - ChatInput → placeholder "Tell Aether what to improve..."
  - Quick Action Buttons: [Import LinkedIn] [Tailor for Job] [Improve ATS] над ChatInput

- `src/components/ChatPanel/ChatHeader.tsx`:
  - Уже соответствует Stitch (smart_toy иконка, Online статус)
  - Проверить цвета (#6001d1, #d2bbff)

- `src/components/ChatPanel/SessionBadge.tsx`:
  - Добавить пропс `focus` для отображения "Session Started • Focus: Senior DevOps"

- `src/components/ChatPanel/ChatInput.tsx`:
  - Stitch-стиль: placeholder, цвета, иконка send

- `src/components/ChatPanel/AgentMessage.tsx`:
  - Stitch-стиль: chat-glow, rounded-2xl, rounded-tl-none
  - Уже частично соответствует

- `src/components/CanvasPanel.tsx`:
  - ATSScoreWidget → уже есть, проверить pulse-ring
  - SuggestionPanel → уже есть, проверить Stitch-стиль

### Подзадачи:
4.1 Stitch-стилизация ChatPanel (ChatHeader, SessionBadge, ChatInput)
4.2 Добавить Quick Action Buttons над ChatInput
4.3 Stitch-стилизация AgentMessage (chat-glow)
4.4 Stitch-стилизация CanvasPanel (ATS Widget, SuggestionPanel)
4.5 Обновить workspace/page.tsx (убрать дублирующийся заголовок)

---

## Блок 5: Stitch-изация Pricing (P2)

**Зависимости:** Блок 2 (SideNav)
**Оценка:** 1.5 часа
**Файлы:**

### Изменить:
- `src/app/pricing/page.tsx`:
  - SideNav уже есть (из ClientLayoutWrapper)
  - Stitch-цвета (#6001d1 accent, glass-panel)
  - FAQ в Stitch-стиле
  - Добавить ATS Score preview (показать, что Pro даёт)

### Подзадачи:
5.1 Обновить цвета под Stitch
5.2 Stitch-стилизация FAQ
5.3 Добавить ATS Score preview для Pro плана

---

## Блок 6: Stitch-изация Telegram (P2)

**Зависимости:** Блок 4 (Workspace ChatPanel)
**Оценка:** 1.5 часа
**Файлы:**

### Изменить:
- `src/app/telegram/page.tsx`:
  - ChatPanel в Stitch-стиле (уже через ChatPanel)
  - Telegram-специфичные цвета (var(--tg-*))
  - ATS Score мини-виджет (адаптированный под WebView)
  - Quick Actions (Import LinkedIn, Tailor for Job)

### Подзадачи:
6.1 Stitch-стилизация Telegram ChatPanel
6.2 Добавить ATS Score мини-виджет
6.3 Добавить Quick Actions

---

## Блок 7: Stitch CSS-анимации и токены (P1)

**Зависимости:** Нет
**Оценка:** 1 час
**Файлы:**

### Изменить:
- `src/app/globals.css`:
  - Добавить shimmer-bg анимацию (если нет)
  - Добавить pulse-ring анимацию (уже есть)
  - Добавить typing-dot анимацию (уже есть)
  - Убедиться, что все Stitch-классы присутствуют

### Подзадачи:
7.1 Проверить наличие всех Stitch CSS-классов
7.2 Добавить недостающие анимации

---

## Сводка

| Блок | Название | Приоритет | Оценка |
|------|----------|-----------|--------|
| 1 | Удаление form-based наследия | P1 | 2ч |
| 2 | Stitch SideNav | P1 | 3ч |
| 3 | Stitch-изация Home | P1 | 2ч |
| 4 | Stitch-изация Workspace | P1 | 4ч |
| 5 | Stitch-изация Pricing | P2 | 1.5ч |
| 6 | Stitch-изация Telegram | P2 | 1.5ч |
| 7 | Stitch CSS-анимации и токены | P1 | 1ч |
| **Всего** | | | **15ч** |

## Критический путь

```
Блок 7 (CSS) ──→ Блок 1 (удаление) ──→ Блок 2 (SideNav) ──→ Блок 3 (Home)
                                                          └──→ Блок 4 (Workspace) ──→ Блок 6 (Telegram)
                                                          └──→ Блок 5 (Pricing)
```

## Проверка качества

1. **Блок 1:** `npm run build` не должен падать с ошибками импорта
2. **Блок 2:** SideNav отображается на всех страницах, активный пункт подсвечен
3. **Блок 3:** Home не содержит ссылок на /create, /update, /import
4. **Блок 4:** Workspace ChatPanel соответствует Stitch reference
5. **Блок 5-6:** Pricing и Telegram в Stitch-стиле
6. **Визуально:** Дизайнер подтверждает соответствие Stitch
