# Phase 1 Foundation — Verification Report

**Дата:** 2026-07-05
**Проверяющий:** Hermes Agent (Ecosystem Auditor)
**Статус:** ISSUES FOUND

---

## 1. Согласованность типов

### CRITICAL: Несовместимость новых типов с существующей кодовой базой

План предлагает `ResumeData` в `src/types/resume.ts` со структурой:
```
name, title, email, phone, linkedin (flat)
skills: Skill[] (id, name, category, level)
certifications: Certification[] (id, name, issuer, date, url)
education: Education[] (startYear, endYear, gpa)
```

Однако существующий код использует ДВЕ другие структуры:

**ResumeFormData** (из `src/lib/validators.ts`):
```
fullName, jobTitle
contact: { email, phone, linkedin }
skills: { value: string }[]
certifications: { value: string }[]
education: { years: string }
achievements: { value: string }[]
trainings: { value: string }[]
```

**ResumeData** (из `src/lib/placeholder-data.ts`):
```
fullName, jobTitle
contact: { email, phone, linkedin }
skills: string[]
certifications: string[]
education: { years: string }
achievements: string[]
trainings: string[]
```

**Затронутые файлы (14+):**
- `src/components/CreateResumeForm.tsx` — использует `ResumeFormData` с `fullName`, `contact.email`, `skills[].value`
- `src/components/UpdateResumeForm.tsx` — своя схема, не затронута напрямую
- `src/components/LivePreview.tsx` — маппинг из `ResumeFormData` → `ResumeData` (placeholder)
- `src/components/ATSScoreCard.tsx` — использует `ResumeFormData`
- `src/components/DownloadPdfButton.tsx` — использует `ResumeFormData`
- `src/components/FillSampleDataButton.tsx` — использует `ResumeFormData`
- `src/components/templates/ClassicTemplate.tsx` — использует `ResumeData` из placeholder-data
- `src/components/pdf/ResumePDF.tsx` — использует `ResumeFormData` + `formatExperienceDate`
- `src/app/create/page.tsx` — использует `ResumeFormData`
- `src/app/update/page.tsx` — использует `ResumeFormData`
- `src/app/api/assess/route.ts` — использует `resumeSchema` из validators
- `src/app/api/generate/route.ts` — использует `resumeSchema` из validators

План упоминает обновление импортов только в 3 файлах (`placeholder-data.ts`, `ats-scorer.ts`, `validators.ts`), но типы структурно различны — простое обновление импортов невозможно без переписывания всех компонентов.

### CRITICAL: ATS типы несовместимы

План: `ATSScore.sections: ATSSectionScore[]` + `suggestions: ATSSuggestion[]`
Существующий: `ATSScore.breakdown: { keywords, formatting, completeness, readability }` + `suggestions: string[]`

`ATSScoreCard.tsx` итерирует `Object.entries(score.breakdown)` — сломается при замене на `sections`.

### MINOR: Отсутствуют поля achievements/trainings

План's `ResumeData` не содержит `achievements` и `trainings`, которые используются в `CreateResumeForm`, `LivePreview`, `ClassicTemplate` и др.

### MINOR: `_pushHistory` объявлен в интерфейсе как public

Метод с префиксом `_` (convention for private) объявлен в `ResumeState` интерфейсе. TypeScript не запретит внешний вызов.

---

## 2. Совместимость с существующим кодом

### CRITICAL: Store не сможет общаться с компонентами

`useResumeStore` оперирует новым типом `ResumeData` (name/title/skills: Skill[]), но `CreateResumeForm` генерирует `ResumeFormData` (fullName/jobTitle/skills: {value:string}[]). Без слоя трансформации store и форма не смогут обмениваться данными.

### MINOR: `useAutoSave.ts` используется в `CreateResumeForm`

План предлагает удалить `useAutoSave.ts` и заменить на Zustand persist. Однако `CreateResumeForm.tsx` строка 8 импортирует `useAutoSave` и строка 110 вызывает `useAutoSave(formData, ...)`. Удаление хука сломает форму, пока она не переписана на store.

### MINOR: `AutoSaveIndicator` используется в `CreateResumeForm`

План предлагает удалить компонент, но он импортируется и рендерится в `CreateResumeForm.tsx` (строка 9, строка 132).

---

## 3. Prisma Schema

### MINOR: `@@unique([userId, version])` на Resume — потенциальный конфликт

```prisma
model Resume {
  version Int @default(1)
  @@unique([userId, version])
}
```

Если пользователь создаёт несколько резюме, все они будут с `version=1`, что нарушит unique constraint. Версия должна либо авто-инкрементироваться в рамках userId, либо unique должен быть по `[userId, id]`.

### MINOR: `ResumeVersion.userId` избыточен

Поле `userId` в `ResumeVersion` дублирует данные, доступные через `resume.userId`. Не критично, но избыточно.

### INFO: JSON-поля без схемы валидации

`ChatSession.messages`, `ATSScore.sections`, `ATSScore.suggestions` — все `Json`. На уровне БД нет гарантии структуры. Приемлемо для Phase 1.

### INFO: Индексы корректны

Все индексы из таблицы в секции 3.3 присутствуют в схеме. ✓

---

## 4. Dependencies

### OK: Все необходимые пакеты указаны

| Пакет | Статус |
|-------|--------|
| `zustand@^5` | Не установлен, указан в плане ✓ |
| `nanoid@^5` | Не установлен, указан в плане ✓ |
| `prisma@^6` (dev) | Не установлен, указан в плане ✓ |
| `@prisma/client@^6` | Не установлен, указан в плане ✓ |
| `pg` | Не установлен, указан в плане ✓ |

### OK: Конфликтов версий нет

- `zod@^4.1.11` поддерживает `zod/v4` import path ✓
- `next@^16.1.6`, `react@^19.2.4` — совместимы ✓
- `@hookform/resolvers@^5.2.2` — совместим с zod v4 ✓

### OK: tsconfig paths настроены

`@/*` → `./src/*` присутствует в tsconfig.json ✓

---

## 5. File Structure

### OK: Конфликтов с существующими файлами нет

Все новые файлы из плана не существуют в текущей структуре:
- `src/types/resume.ts` — не существует ✓
- `src/types/chat.ts` — не существует ✓
- `src/types/ats.ts` — не существует ✓
- `src/types/canvas.ts` — не существует ✓
- `src/types/index.ts` — не существует ✓
- `src/stores/useResumeStore.ts` — не существует ✓
- `src/stores/useChatStore.ts` — не существует ✓
- `src/stores/useATSStore.ts` — не существует ✓
- `src/stores/index.ts` — не существует ✓
- `src/lib/schemas/resume.ts` — не существует ✓
- `src/services/canvas-sse.ts` — не существует ✓
- `prisma/schema.prisma` — не существует ✓

---

## Итог

| Категория | CRITICAL | MINOR | INFO |
|-----------|----------|-------|------|
| Типы | 3 | 2 | 0 |
| Совместимость | 1 | 2 | 0 |
| Prisma | 0 | 2 | 3 |
| Dependencies | 0 | 0 | 3 |
| File structure | 0 | 0 | 1 |
| **Всего** | **4** | **6** | **7** |

### CRITICAL issues (блокируют выполнение плана):

1. **Типы ResumeData несовместимы** — новые типы (name/title/skills: Skill[]) не совпадают с существующими (fullName/jobTitle/skills: {value:string}[]). 14+ файлов используют старые типы.

2. **ATS типы несовместимы** — `ATSScore.breakdown` vs `ATSScore.sections`.

3. **Store не сможет общаться с компонентами** — useResumeStore оперирует новыми типами, CreateResumeForm генерирует старые.

4. **Пропущены поля achievements/trainings** — используются в шаблонах и формах.

### Рекомендация:
План требует существенной доработки секции миграции типов. Необходимо либо:
- (A) Адаптировать новые типы под существующую структуру (сохранить `fullName`/`jobTitle`/`contact`/`skills: {value:string}[]`)
- (B) Добавить слой трансформации (adapter) между store и компонентами
- (C) Расширить план миграции на все 14+ затронутых файлов
