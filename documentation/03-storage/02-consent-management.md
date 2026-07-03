# Consent Management — cv.sarkhan.dev

> Управление согласиями пользователей в соответствии с GDPR.

---

## 1. Flowchart регистрации

```mermaid
flowchart TD
    A[Пользователь регистрируется\nчерез Telegram] --> B{Первый вход?}
    B -->|Да| C[Показать Consent Dialog]
    B -->|Нет| D[Проверить актуальность\nconsent_log]

    C --> E[Запрос согласий:\n• Terms of Service\n• Privacy Policy\n• Data Processing\n• Marketing (opt-in)\n• Analytics\n• Third-party sharing]

    E --> F{Пользователь выбирает}
    F -->|Accept All| G[granted = true\nдля всех типов]
    F -->|Customize| H[Индивидуальный выбор\nдля каждого типа]
    F -->|Reject All| I[granted = true\nтолько для ToS + Privacy]

    G --> J[POST /api/consent\n→ consent_log запись]
    H --> J
    I --> J

    J --> K[Создать пользователя\nв БД]
    K --> L[Перенаправить в\nличный кабинет]

    D --> M{Есть изменения\nв политике?}
    M -->|Да| N[Показать обновлённый\nConsent Dialog]
    M -->|Нет| O[Продолжить работу]

    N --> E
```

---

## 2. API Routes

### 2.1 `POST /api/consent` — Запись согласия

```typescript
// types/consent.ts
export type ConsentType =
  | 'terms_of_service'
  | 'privacy_policy'
  | 'data_processing'
  | 'marketing'
  | 'analytics'
  | 'third_party_sharing';

export interface ConsentRequest {
  consents: Array<{
    type: ConsentType;
    granted: boolean;
  }>;
  metadata?: Record<string, unknown>;
}

export interface ConsentResponse {
  success: boolean;
  recorded: number;
  timestamp: string;
}
```

```typescript
// routes/consent.ts
import { Router, Request, Response } from 'express';
import { db } from '../db';
import { ConsentRequest, ConsentResponse } from '../types/consent';

const router = Router();

router.post('/api/consent', async (req: Request, res: Response) => {
  const userId = req.user!.id; // из middleware аутентификации
  const body: ConsentRequest = req.body;
  const ip = req.ip || req.socket.remoteAddress;

  if (!body.consents || body.consents.length === 0) {
    return res.status(400).json({ error: 'consents array is required' });
  }

  const validTypes: ConsentType[] = [
    'terms_of_service', 'privacy_policy', 'data_processing',
    'marketing', 'analytics', 'third_party_sharing',
  ];

  for (const c of body.consents) {
    if (!validTypes.includes(c.type)) {
      return res.status(400).json({ error: `Invalid consent type: ${c.type}` });
    }
  }

  // Append-only: каждая запись — новая строка
  const values = body.consents.map(c => ({
    user_id: userId,
    consent_type: c.type,
    granted: c.granted,
    ip_address: ip,
    user_agent: req.headers['user-agent'] || null,
    metadata: JSON.stringify(body.metadata || {}),
  }));

  await db.insertInto('consent_log')
    .values(values)
    .execute();

  const response: ConsentResponse = {
    success: true,
    recorded: values.length,
    timestamp: new Date().toISOString(),
  };

  res.status(201).json(response);
});

export default router;
```

---

### 2.2 `GET /api/export-data` — Экспорт данных (GDPR Art. 20)

```typescript
// routes/export.ts
import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

router.get('/api/export-data', async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const [user, subscriptions, consents, resumes, tokens] = await Promise.all([
    db.selectFrom('users')
      .where('id', '=', userId)
      .selectAll()
      .executeTakeFirst(),

    db.selectFrom('subscriptions')
      .where('user_id', '=', userId)
      .selectAll()
      .execute(),

    db.selectFrom('consent_log')
      .where('user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .selectAll()
      .execute(),

    db.selectFrom('resumes')
      .where('user_id', '=', userId)
      .selectAll()
      .execute(),

    db.selectFrom('mcp_tokens')
      .where('user_id', '=', userId)
      .select(['id', 'description', 'scopes', 'is_active', 'created_at'])
      .execute(),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    user: {
      id: user?.id,
      telegram_id: user?.telegram_id,
      email: user?.email,
      auth_provider: user?.auth_provider,
      display_name: user?.display_name,
      created_at: user?.created_at,
    },
    subscriptions,
    consent_history: consents,
    resumes: resumes.map(r => ({
      id: r.id,
      title: r.title,
      version: r.version,
      data: r.data,
      ats_score: r.ats_score,
      created_at: r.created_at,
    })),
    mcp_tokens: tokens,
  };

  // JSON-файл для скачивания
  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="user-data-${userId}.json"`,
  );
  res.json(exportData);
});

export default router;
```

---

### 2.3 `DELETE /api/delete-account` — Право на забвение (GDPR Art. 17)

```typescript
// routes/delete-account.ts
import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

router.delete('/api/delete-account', async (req: Request, res: Response) => {
  const userId = req.user!.id;

  // 1. Анонимизируем пользователя (soft-delete)
  await db.updateTable('users')
    .set({
      telegram_id: null,
      email: null,
      google_id: null,
      apple_id: null,
      display_name: 'Deleted User',
      avatar_url: null,
      deleted_at: new Date(),
    })
    .where('id', '=', userId)
    .execute();

  // 2. Деактивируем подписки
  await db.updateTable('subscriptions')
    .set({ auto_renew: false, canceled_at: new Date() })
    .where('user_id', '=', userId)
    .where('canceled_at', 'is', null)
    .execute();

  // 3. Деактивируем MCP-токены
  await db.updateTable('mcp_tokens')
    .set({ is_active: false })
    .where('user_id', '=', userId)
    .execute();

  // 4. Скрываем резюме (но не удаляем — сохраняем историю)
  await db.updateTable('resumes')
    .set({ is_published: false })
    .where('user_id', '=', userId)
    .execute();

  // 5. Consent_log НЕ ТРОГАЕМ — он immutable по закону

  // 6. Инвалидируем сессию
  req.session?.destroy(() => {});

  res.status(200).json({
    success: true,
    message: 'Account deleted. Consent log retained per GDPR Art. 5(1)(e).',
  });
});

export default router;
```

---

## 3. GDPR Compliance

### 3.1 Consent Log — Immutable (Append-Only)

```typescript
// middleware/consent-guard.ts
// Запрет на UPDATE/DELETE consent_log на уровне приложения

export async function getCurrentConsent(
  userId: number,
  type: ConsentType,
): Promise<boolean> {
  const row = await db.selectFrom('consent_log')
    .where('user_id', '=', userId)
    .where('consent_type', '=', type)
    .orderBy('created_at', 'desc')
    .select('granted')
    .executeTakeFirst();

  return row?.granted ?? false;
}

export async function hasValidConsents(userId: number): Promise<boolean> {
  const required: ConsentType[] = ['terms_of_service', 'privacy_policy'];
  for (const type of required) {
    if (!(await getCurrentConsent(userId, type))) {
      return false;
    }
  }
  return true;
}
```

### 3.2 Right to Erasure (Art. 17)

- **Soft-delete** пользователя: данные анонимизируются, но связи сохраняются.
- **Consent log** не удаляется — GDPR требует доказательства согласия.
- **Резюме** скрываются, но не удаляются (возможность восстановления в течение 30 дней).
- **Подписки** отменяются, платёжные данные не хранятся (передаются провайдеру).

### 3.3 Data Portability (Art. 20)

- `GET /api/export-data` возвращает machine-readable JSON.
- Формат включает все категории данных пользователя.
- Скачивание доступно в личном кабинете.

### 3.4 Consent Freshness

```typescript
// Проверка: не изменилась ли политика с момента последнего согласия
export async function isConsentOutdated(
  userId: number,
  policyVersion: string,
): Promise<boolean> {
  const lastConsent = await db.selectFrom('consent_log')
    .where('user_id', '=', userId)
    .where('consent_type', '=', 'privacy_policy')
    .orderBy('created_at', 'desc')
    .select('created_at')
    .executeTakeFirst();

  if (!lastConsent) return true;

  // Если политика обновлена после последнего согласия — показать диалог
  const policyUpdatedAt = await getPolicyVersionDate(policyVersion);
  return policyUpdatedAt > lastConsent.created_at;
}
```

---

## 4. Типы consent_type

| Тип | Обязательный | Описание |
|---|---|---|
| `terms_of_service` | ✅ Да | Пользовательское соглашение |
| `privacy_policy` | ✅ Да | Политика обработки данных |
| `data_processing` | ✅ Да | Обработка данных резюме |
| `marketing` | ❌ Нет | Маркетинговые уведомления |
| `analytics` | ❌ Нет | Аналитика использования |
| `third_party_sharing` | ❌ Нет | Передача данных третьим лицам |
