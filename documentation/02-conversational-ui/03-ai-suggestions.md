# 03 — AI Suggestions

> **Цель:** Real-time AI-подсказки для улучшения резюме с категоризацией по severity и action-кнопками.

---

## 1. Типы подсказок

| Тип | Описание | Пример | Severity |
|---|---|---|---|
| **summary_improvement** | Улучшение саммари | "Добавьте ключевые достижения в summary" | high |
| **metrics_missing** | Не хватает цифр/метрик | "Укажите % улучшения или количество проектов" | high |
| **keyword_optimization** | Добавить ключевые слова | "Добавьте 'Kubernetes' в секцию Skills" | medium |
| **skill_gap** | Не хватает навыка для цели | "Для этой вакансии требуется Terraform" | high |
| **action_verbs** | Заменить пассивные глаголы | "Замените 'был ответственным' на 'руководил'" | low |
| **ats_score** | Общий ATS совет | "Добавьте секцию Certifications для +5 к ATS" | medium |

---

## 2. Функция generateSuggestions()

```typescript
// lib/ai/suggestions.ts

interface Suggestion {
  id: string;
  type: SuggestionType;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  section: string;           // target section in resume
  action: SuggestionAction;
  source: 'ai' | 'rule';    // AI-generated or rule-based
  atsImpact?: number;        // estimated ATS points
}

type SuggestionType =
  | 'summary_improvement'
  | 'metrics_missing'
  | 'keyword_optimization'
  | 'skill_gap'
  | 'action_verbs'
  | 'ats_score';

interface SuggestionAction {
  type: 'apply' | 'replace' | 'insert' | 'delete';
  targetText?: string;       // text to modify
  replacementText?: string;  // new text (for apply/replace)
  position?: {               // for insert
    section: string;
    index: number;
  };
}

/**
 * Генерирует подсказки на основе текущего резюме и опциональной вакансии.
 * Работает в real-time: вызывается при каждом изменении Canvas.
 */
export async function generateSuggestions(
  resume: ResumeState,
  jobDescription?: string
): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = [];

  // === Rule-based проверки (мгновенно, без AI) ===
  suggestions.push(...checkMetricsMissing(resume));
  suggestions.push(...checkActionVerbs(resume));
  suggestions.push(...checkKeywordGaps(resume, jobDescription));

  // === AI-проверки (с LLM) ===
  if (shouldCallAI(resume)) {
    const aiSuggestions = await generateAISuggestions(resume, jobDescription);
    suggestions.push(...aiSuggestions);
  }

  // === Сортировка по severity ===
  const severityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return suggestions;
}
```

---

## 3. Rule-based проверки

### 3.1 Metrics Missing

```typescript
function checkMetricsMissing(resume: ResumeState): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const metricPattern = /\d+%|\d+x|\d+ projects|\d+ users|\$\d+/i;

  for (const exp of resume.experience) {
    if (exp.description && !metricPattern.test(exp.description)) {
      suggestions.push({
        id: `metrics-${exp.id}`,
        type: 'metrics_missing',
        severity: 'high',
        title: 'Добавьте метрики',
        description: `Опыт "${exp.title}" не содержит цифр. Укажите % улучшения, количество пользователей или проектов.`,
        section: `experience.${exp.id}`,
        action: {
          type: 'apply',
          targetText: exp.description,
          replacementText: exp.description + '\n• Достиг [X]% улучшения [показатель]',
        },
        source: 'rule',
        atsImpact: 5,
      });
    }
  }

  return suggestions;
}
```

### 3.2 Action Verbs

```typescript
function checkActionVerbs(resume: ResumeState): Suggestion[] {
  const passivePatterns = [
    { pattern: /был ответственен/i, replacement: 'Руководил' },
    { pattern: /был частью/i, replacement: 'Участвовал' },
    { pattern: /занимался/i, replacement: 'Разработал' },
    { pattern: /работал с/i, replacement: 'Использовал' },
    { pattern: /помогал/i, replacement: 'Обеспечил' },
  ];

  const suggestions: Suggestion[] = [];

  for (const exp of resume.experience) {
    for (const { pattern, replacement } of passivePatterns) {
      if (pattern.test(exp.description)) {
        suggestions.push({
          id: `verb-${exp.id}-${pattern.source}`,
          type: 'action_verbs',
          severity: 'low',
          title: 'Замените пассивный глагол',
          description: `"${pattern.source.replace(/\/i?/g, '')}" → "${replacement}"`,
          section: `experience.${exp.id}`,
          action: {
            type: 'replace',
            targetText: exp.description.match(pattern)?.[0] || '',
            replacementText: replacement,
          },
          source: 'rule',
          atsImpact: 1,
        });
      }
    }
  }

  return suggestions;
}
```

### 3.3 Keyword Gaps (сравнение с вакансией)

```typescript
function checkKeywordGaps(
  resume: ResumeState,
  jobDescription?: string
): Suggestion[] {
  if (!jobDescription) return [];

  const resumeSkills = new Set(
    resume.skills.map(s => s.name.toLowerCase())
  );

  // Извлекаем ключевые слова из вакансии
  const jobKeywords = extractKeywords(jobDescription);
  const missingKeywords = jobKeywords.filter(
    kw => !resumeSkills.has(kw.toLowerCase())
  );

  return missingKeywords.slice(0, 5).map((kw, i) => ({
    id: `keyword-${i}`,
    type: 'keyword_optimization',
    severity: 'medium',
    title: `Добавьте "${kw}"`,
    description: `Этот навык требуется в вакансии, но отсутствует в вашем резюме.`,
    section: 'skills',
    action: {
      type: 'insert',
      position: { section: 'skills', index: resume.skills.length },
    },
    source: 'rule',
    atsImpact: 3,
  }));
}
```

---

## 4. AI-проверки

```typescript
async function generateAISuggestions(
  resume: ResumeState,
  jobDescription?: string
): Promise<Suggestion[]> {
  const prompt = buildSuggestionPrompt(resume, jobDescription);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',  // быстрая модель для real-time
    messages: [
      {
        role: 'system',
        content: `Ты — AI-ревьюер резюме. Анализируй резюме и возвращай JSON-массив подсказок.
        
Каждая подсказка должна содержать:
- type: один из: summary_improvement, metrics_missing, keyword_optimization, skill_gap, action_verbs, ats_score
- severity: high | medium | low
- title: краткий заголовок (до 60 символов)
- description: пояснение (до 200 символов)
- section: секция резюме
- action: { type: "apply" | "replace" | "insert" | "delete", targetText?, replacementText? }
- atsImpact: число (0-10)

Формат ответа: строгий JSON-массив. Максимум 5 подсказок за раз.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || '[]';
  return JSON.parse(content);
}

function buildSuggestionPrompt(
  resume: ResumeState,
  jobDescription?: string
): string {
  return `
Текущее резюме:
${JSON.stringify(resume, null, 2)}

${jobDescription ? `Целевая вакансия:\n${jobDescription}` : 'Целевая вакансия не указана.'}

Проанализируй резюме и предложи улучшения. Фокус:
1. Улучшение summary (если слабое)
2. Пропущенные метрики
3. Ключевые слова (если есть вакансия)
4. Навыки, которые стоит добавить
5. Общие ATS-рекомендации
`;
}
```

---

## 5. Real-time анализ

### 5.1 Debounced вызов

```typescript
// hooks/useSuggestions.ts
import { useState, useEffect, useRef } from 'react';

const DEBOUNCE_MS = 1000;

export function useSuggestions(resume: ResumeState, jobUrl?: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await generateSuggestions(resume, jobUrl);
        setSuggestions(result);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resume, jobUrl]);

  return { suggestions, loading };
}
```

### 5.2 Инкрементальный анализ

Чтобы избежать дорогих AI-вызовов при каждом нажатии:

```typescript
function shouldCallAI(resume: ResumeState): boolean {
  // AI вызываем только если:
  // 1. Резюме непустое
  // 2. Прошло >30 секунд с последнего AI-вызова
  // 3. Изменилась существенная часть (не просто форматирование)
  
  const MIN_INTERVAL_MS = 30_000;
  const lastCall = getLastAICallTime();
  
  return (
    resume.experience.length > 0 &&
    Date.now() - lastCall > MIN_INTERVAL_MS &&
    hasSignificantChange(resume)
  );
}
```

---

## 6. UI компонент

```tsx
// components/SuggestionPanel.tsx
interface SuggestionPanelProps {
  suggestions: Suggestion[];
  loading: boolean;
  onApply: (suggestion: Suggestion) => void;
  onDismiss: (suggestionId: string) => void;
}

function SuggestionPanel({ suggestions, loading, onApply, onDismiss }: SuggestionPanelProps) {
  if (loading) {
    return <div className="suggestion-panel-loading">Анализируем...</div>;
  }

  return (
    <div className="suggestion-panel">
      <h3 className="suggestion-panel-title">
        AI-рекомендации ({suggestions.length})
      </h3>
      
      {suggestions.map(s => (
        <div
          key={s.id}
          className={`suggestion-card suggestion-${s.severity}`}
        >
          <div className="suggestion-header">
            <SeverityBadge severity={s.severity} />
            <span className="suggestion-title">{s.title}</span>
            {s.atsImpact && (
              <span className="ats-impact">+{s.atsImpact} ATS</span>
            )}
          </div>
          
          <p className="suggestion-description">{s.description}</p>
          
          <div className="suggestion-actions">
            <button
              className="btn-apply"
              onClick={() => onApply(s)}
            >
              Apply
            </button>
            <button
              className="btn-dismiss"
              onClick={() => onDismiss(s.id)}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 7. Severity Badge

```tsx
function SeverityBadge({ severity }: { severity: 'high' | 'medium' | 'low' }) {
  const config = {
    high:   { color: '#ef4444', label: 'High' },
    medium: { color: '#f59e0b', label: 'Medium' },
    low:    { color: '#3b82f6', label: 'Low' },
  };

  const { color, label } = config[severity];

  return (
    <span
      className="severity-badge"
      style={{
        backgroundColor: color + '20',
        color,
        border: `1px solid ${color}`,
      }}
    >
      {label}
    </span>
  );
}
```

---

## 8. Пример работы

```
┌─────────────────────────────────────────────┐
│  AI-рекомендации (4)                         │
│                                             │
│  🔴 High  Добавьте метрики              +5  │
│  Опыт "DevOps Engineer" не содержит цифр.    │
│  [Apply] [✕]                                 │
│                                             │
│  🟡 Medium  Добавьте "Terraform"         +3  │
│  Этот навык требуется в вакансии.            │
│  [Apply] [✕]                                 │
│                                             │
│  🟡 Medium  Улучшите summary             +4  │
│  Добавьте ключевые достижения в саммари.     │
│  [Apply] [✕]                                 │
│                                             │
│  🔵 Low  "занимался" → "разработал"     +1  │
│  Замените пассивный глагол на action verb.   │
│  [Apply] [✕]                                 │
└─────────────────────────────────────────────┘
```

---

## 9. Метрики эффективности

| Метрика | Цель | Как измеряем |
|---|---|---|
| Apply Rate | >40% | clicks / impressions |
| ATS Improvement | +10 avg | до/после применения |
| Time to First Suggestion | <2s | от изменения до появления |
| AI Call Cost | <$0.01/сессию | мониторинг OpenAI API |
| False Positive Rate | <10% | manual review sample |
