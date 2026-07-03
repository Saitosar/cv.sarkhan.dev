# 01 — Agent Flow: AI-first Workspace

> **Цель:** Объединить разрозненные маршруты `/create` и `/update` в единый AI-first Workspace, где пользователь взаимодействует с агентом, а агент — с AI и Canvas.

---

## 1. Общая архитектура

```
┌─────────────────────────────────────────────────────────┐
│                   AI-first Workspace                     │
│                                                          │
│  ┌──────────┐   ┌──────────┐   ┌────────────────────┐   │
│  │  User    │──▶│  Agent   │──▶│  AI (LLM)          │   │
│  │  Chat    │   │  Router  │   │  • Summarize       │   │
│  │  Input   │   │  Tone    │   │  • Suggest         │   │
│  └──────────┘   │  Adapter │   │  • Parse LinkedIn  │   │
│                 └────┬─────┘   │  • Score ATS       │   │
│                      │         └──────────┬─────────┘   │
│                      │                    │             │
│                      ▼                    ▼             │
│                 ┌──────────────────────────────────┐     │
│                 │           Canvas                  │     │
│                 │  • Live Preview                  │     │
│                 │  • Clickable Blocks              │     │
│                 │  • ATS Heatmap                   │     │
│                 │  • Score Badge                   │     │
│                 └──────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Mermaid Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant A as Agent
    participant AI as AI (LLM)
    participant C as Canvas

    Note over U,C: Сценарий 1: У пользователя уже есть резюме
    U->>A: Открываю Workspace
    A->>A: Определяю контекст (есть резюме ✅)
    A->>C: Загружаю существующее резюме в Canvas
    C-->>A: Canvas готов
    A->>U: "Ваше резюме загружено. Что хотите улучшить?"
    U->>A: "Добавь секцию про Kubernetes"
    A->>AI: generateSuggestions(currentResume, "Kubernetes")
    AI-->>A: [{suggestion, severity, action}]
    A->>C: Подсветить блок "Skills" + показать подсказки
    C-->>U: [Suggestion chips: "Apply", "Edit", "Dismiss"]
    U->>A: Apply
    A->>AI: rewriteSection("Skills", "Kubernetes")
    AI-->>A: Обновлённый текст
    A->>C: Обновить Canvas + пересчитать ATS Score
    C-->>U: ✅ Score: 82 (+5)

    Note over U,C: Сценарий 2: У пользователя НЕТ резюме
    U->>A: "Хочу создать резюме"
    A->>A: Определяю контекст (нет резюме ❌)
    A->>U: "Расскажите о себе. Я помогу составить."
    U->>A: "Я Senior DevOps, 5 лет опыта..."
    A->>AI: generateResumeFromChat(userMessage)
    AI-->>A: structuredResume {sections, skills, experience}
    A->>C: Создать Canvas с черновиком
    C-->>U: [Live preview черновика]
    A->>U: "Вот черновик. Добавим LinkedIn?"

    Note over U,C: Сценарий 3: Есть LinkedIn (импорт)
    U->>A: "Импортируй LinkedIn"
    A->>AI: parseLinkedIn(linkedinData)
    AI-->>A: structuredProfile
    A->>C: Заполнить Canvas данными LinkedIn
    C-->>U: [Score badge: 74 — неплохо, можно улучшить]

    Note over U,C: Сценарий 4: Есть вакансия (таргетинг)
    U->>A: "Вот ссылка на вакансию"
    A->>AI: analyzeJobDescription(url)
    AI-->>A: {keywords, requirements, gaps}
    A->>C: ATS Heatmap — подсветить совпадения/пробелы
    C-->>U: [Heatmap: 60% match — добавить "Terraform", "Helm"]
    A->>U: "Рекомендую добавить: Terraform, Helm, ArgoCD"
```

---

## 3. Адаптация тона агента

Агент определяет тон на основе профиля пользователя или явного выбора.

| Роль пользователя | Тон | Пример |
|---|---|---|
| **Senior** (Lead, Architect) | Metric-oriented, direct | "Ваш ATS Score: 78. Добавление quantifiable metrics поднимет его до 88. Предлагаю 3 варианта." |
| **Junior** (Trainee, Junior) | Supportive, guiding | "Отличный старт! Давай добавим пару ключевых навыков. Вот пример, как описать твой опыт." |
| **Non-tech** (Manager, HR) | Simple, encouraging | "Всё выглядит хорошо! Я помогу сделать резюме понятным для рекрутеров. Нажмите 'Улучшить'." |

**Механизм определения тона:**

```typescript
type AgentTone = 'senior' | 'junior' | 'non-tech';

function detectTone(userProfile: UserProfile): AgentTone {
  if (userProfile.role?.match(/senior|lead|architect|head|principal/i)) return 'senior';
  if (userProfile.role?.match(/junior|trainee|intern|student/i)) return 'junior';
  if (!userProfile.role || userProfile.role.match(/manager|hr|director/i)) return 'non-tech';
  return 'senior'; // fallback
}
```

---

## 4. Интерактивные элементы

### 4.1 Text Input
- Многострочное поле ввода в нижней части Workspace
- Placeholder адаптируется под тон: *"Опишите изменение..."* / *"Что будем улучшать?"* / *"Напишите, что хотите добавить"*
- Отправка по Enter (Shift+Enter — новая строка)

### 4.2 Microphone
- Кнопка 🎤 рядом с полем ввода
- Speech-to-text через Web Speech API или Whisper
- После распознавания текст попадает в input и отправляется

### 4.3 Quick Action Buttons
Набор предустановленных действий над полем ввода:

```
[📄 Импорт LinkedIn] [🎯 Подогнать под вакансию] [✨ Улучшить ATS] [📊 Анализ]
```

### 4.4 Suggestion Chips
После ответа AI — кликабельные чипы под сообщением агента:

```
[Apply] [Edit] [Dismiss] [Show alternatives]
```

---

## 5. Canvas компоненты

### 5.1 Live Preview
- Рендеринг резюме в реальном времени
- Обновляется при каждом Apply от пользователя
- Поддерживает zoom (80%–150%)

### 5.2 Clickable Blocks
- Каждая секция резюме (Summary, Experience, Skills, Education) — отдельный блок
- Клик по блоку открывает inline-редактор
- AI подсвечивает блоки, которые можно улучшить (голубая рамка)

### 5.3 ATS Heatmap
- Цветовая карта совпадения с целевой вакансией
- Зелёный — совпадает, жёлтый — частично, красный — отсутствует

```
┌─────────────────────────────────┐
│  Summary          ████████░░ 80% │
│  Experience       ██████░░░░ 60% │
│  Skills           ████░░░░░░ 40% │ ← красный
│  Education        ██████████ 100% │
└─────────────────────────────────┘
```

### 5.4 Score Badge
- Круглый бейдж в правом верхнем углу Canvas
- Цвет: красный (<60), жёлтый (60–79), зелёный (80+)
- Анимированное изменение при пересчёте

```
┌─────┐
│  78 │  ← ATS Score
│  ▲  │  ← анимация +2
└─────┘
```

---

## 6. State Machine

```
[Idle] ──open──▶ [Loading Resume] ──loaded──▶ [Ready]
  │                                              │
  │                                              ├──user types──▶ [Chatting] ──ai responds──▶ [Suggesting]
  │                                              │                    │                        │
  │                                              │                    └──apply──▶ [Updating] ──▶ [Ready]
  │                                              │                               │
  │                                              └──import linkedin──▶ [Importing] ──▶ [Ready]
  │                                              │
  │                                              └──analyze job──▶ [Analyzing] ──▶ [Ready]
  │
  └──no resume──▶ [Onboarding] ──chat──▶ [Generating Draft] ──▶ [Ready]
```

---

## 7. API Route

```typescript
// POST /api/workspace/init
interface InitWorkspaceRequest {
  userId: string;
  resumeId?: string;       // если есть существующее резюме
  linkedinUrl?: string;    // опционально
  jobUrl?: string;         // опционально
  tone?: AgentTone;        // auto-detect или явно
}

interface InitWorkspaceResponse {
  sessionId: string;
  canvasState: CanvasState;
  agentMessage: string;
  suggestions?: Suggestion[];
}
```
