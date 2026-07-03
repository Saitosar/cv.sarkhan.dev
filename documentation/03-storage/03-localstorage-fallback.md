# LocalStorage Fallback — cv.sarkhan.dev

> Клиентское хранилище для офлайн-режима и кэширования данных резюме.

---

## 1. IStorage Interface

```typescript
// storage/interface.ts

export interface StorageItem<T = unknown> {
  key: string;
  value: T;
  timestamp: number;       // Date.now()
  ttl?: number;            // время жизни в мс (опционально)
  version?: number;        // версия схемы для миграций
}

export interface IStorage {
  /** Сохранить значение */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /** Прочитать значение */
  get<T>(key: string): Promise<T | null>;

  /** Удалить значение */
  remove(key: string): Promise<void>;

  /** Проверить существование ключа */
  has(key: string): Promise<boolean>;

  /** Очистить всё хранилище */
  clear(): Promise<void>;

  /** Получить все ключи */
  keys(): Promise<string[]>;

  /** Получить метаданные о хранилище */
  info(): Promise<StorageInfo>;
}

export interface StorageInfo {
  engine: 'localStorage' | 'indexedDB' | 'memory';
  usedBytes: number;
  availableBytes: number | null;
  itemCount: number;
}
```

---

## 2. LocalStorageAdapter

Адаптер для `localStorage` с поддержкой TTL, версионирования и сжатия.

```typescript
// storage/local-storage-adapter.ts

import { IStorage, StorageItem, StorageInfo } from './interface';

const STORAGE_PREFIX = 'cv_sarkhan_';

export class LocalStorageAdapter implements IStorage {
  private prefix: string;

  constructor(prefix: string = STORAGE_PREFIX) {
    this.prefix = prefix;
  }

  private prefixed(key: string): string {
    return `${this.prefix}${key}`;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const item: StorageItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl,
      version: 1,
    };

    try {
      localStorage.setItem(this.prefixed(key), JSON.stringify(item));
    } catch (e) {
      if (this.isQuotaExceededError(e)) {
        await this.evictLRU();
        // Повторная попытка
        localStorage.setItem(this.prefixed(key), JSON.stringify(item));
      } else {
        throw e;
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = localStorage.getItem(this.prefixed(key));
    if (!raw) return null;

    try {
      const item: StorageItem<T> = JSON.parse(raw);

      // Проверка TTL
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(this.prefixed(key));
        return null;
      }

      return item.value;
    } catch {
      // Битые данные — удаляем
      localStorage.removeItem(this.prefixed(key));
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.prefixed(key));
  }

  async has(key: string): Promise<boolean> {
    return localStorage.getItem(this.prefixed(key)) !== null;
  }

  async clear(): Promise<void> {
    const keys = await this.keys();
    keys.forEach(k => localStorage.removeItem(this.prefixed(k)));
  }

  async keys(): Promise<string[]> {
    const result: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        result.push(key.slice(this.prefix.length));
      }
    }
    return result;
  }

  async info(): Promise<StorageInfo> {
    let usedBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        const val = localStorage.getItem(key);
        usedBytes += (key.length + (val?.length ?? 0)) * 2; // UTF-16
      }
    }

    return {
      engine: 'localStorage',
      usedBytes,
      availableBytes: 5 * 1024 * 1024, // ~5MB типичный лимит
      itemCount: (await this.keys()).length,
    };
  }

  // ---- Внутренние методы ----

  private isQuotaExceededError(e: unknown): boolean {
    return (
      e instanceof DOMException &&
      (e.name === 'QuotaExceededError' ||
       e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    );
  }

  /** LRU-эвакция при переполнении */
  private async evictLRU(): Promise<void> {
    const items: Array<{ key: string; timestamp: number }> = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        try {
          const parsed: StorageItem = JSON.parse(localStorage.getItem(key)!);
          items.push({ key, timestamp: parsed.timestamp ?? 0 });
        } catch {
          localStorage.removeItem(key!);
        }
      }
    }

    // Сортируем по возрастанию timestamp (самые старые первые)
    items.sort((a, b) => a.timestamp - b.timestamp);

    // Удаляем 20% самых старых записей
    const toRemove = Math.max(1, Math.ceil(items.length * 0.2));
    items.slice(0, toRemove).forEach(item => {
      localStorage.removeItem(item.key);
    });
  }
}
```

---

## 3. IndexedDB для больших данных (>5MB)

Когда данные резюме превышают лимит localStorage (~5MB), используем IndexedDB.

```typescript
// storage/indexed-db-adapter.ts

import { IStorage, StorageItem, StorageInfo } from './interface';

const DB_NAME = 'CvSarkhanDB';
const DB_VERSION = 1;
const STORE_NAME = 'storage';

export class IndexedDBAdapter implements IStorage {
  private db: IDBDatabase | null = null;
  private dbReady: Promise<IDBDatabase>;

  constructor() {
    this.dbReady = this.openDB();
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('ttl', 'ttl', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    this.db = await this.dbReady;
    return this.db;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const db = await this.getDB();
    const item: StorageItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl,
      version: 1,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const item: StorageItem<T> | undefined = request.result;
        if (!item) return resolve(null);

        // Проверка TTL
        if (item.ttl && Date.now() - item.timestamp > item.ttl) {
          // Асинхронно удаляем просроченное
          this.remove(key).catch(() => {});
          return resolve(null);
        }

        resolve(item.value);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async remove(key: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async has(key: string): Promise<boolean> {
    const val = await this.get(key);
    return val !== null;
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async keys(): Promise<string[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async info(): Promise<StorageInfo> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const countReq = store.count();

      countReq.onsuccess = () => {
        resolve({
          engine: 'indexedDB',
          usedBytes: 0, // IndexedDB не даёт точный размер
          availableBytes: null, // Лимит определяется браузером (обычно >50MB)
          itemCount: countReq.result,
        });
      };
      countReq.onerror = () => reject(countReq.error);
    });
  }
}
```

---

## 4. AutoSaveManager

Автоматическое сохранение изменений резюме с дебаунсом и выбором хранилища.

```typescript
// storage/auto-save-manager.ts

import { IStorage } from './interface';
import { LocalStorageAdapter } from './local-storage-adapter';
import { IndexedDBAdapter } from './indexed-db-adapter';

export interface AutoSaveConfig {
  debounceMs: number;       // задержка перед сохранением (default: 1000)
  maxRetries: number;       // попыток при ошибке (default: 3)
  storageThreshold: number; // переключение на IndexedDB при превышении (default: 4.5MB)
}

const DEFAULT_CONFIG: AutoSaveConfig = {
  debounceMs: 1000,
  maxRetries: 3,
  storageThreshold: 4.5 * 1024 * 1024, // 4.5MB
};

export class AutoSaveManager {
  private storage: IStorage;
  private fallbackStorage: IStorage;
  private config: AutoSaveConfig;
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private retryCounters: Map<string, number> = new Map();

  constructor(config?: Partial<AutoSaveConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.storage = new LocalStorageAdapter();
    this.fallbackStorage = new IndexedDBAdapter();
  }

  /**
   * Запланировать автосохранение с дебаунсом.
   * Автоматически выбирает хранилище на основе размера данных.
   */
  async scheduleSave<T>(key: string, value: T): Promise<void> {
    // Отменяем предыдущий таймер для этого ключа
    const existing = this.debounceTimers.get(key);
    if (existing) clearTimeout(existing);

    return new Promise((resolve) => {
      const timer = setTimeout(async () => {
        this.debounceTimers.delete(key);
        await this.saveWithRetry(key, value);
        resolve();
      }, this.config.debounceMs);

      this.debounceTimers.set(key, timer);
    });
  }

  /**
   * Немедленное сохранение (без дебаунса).
   */
  async saveImmediate<T>(key: string, value: T): Promise<void> {
    const existing = this.debounceTimers.get(key);
    if (existing) {
      clearTimeout(existing);
      this.debounceTimers.delete(key);
    }
    await this.saveWithRetry(key, value);
  }

  /**
   * Прочитать сохранённые данные.
   */
  async load<T>(key: string): Promise<T | null> {
    // Сначала пробуем localStorage (быстрее)
    let data = await this.storage.get<T>(key);
    if (data !== null) return data;

    // Затем IndexedDB
    data = await this.fallbackStorage.get<T>(key);
    return data;
  }

  /**
   * Получить информацию о хранилище.
   */
  async getStorageInfo() {
    const primary = await this.storage.info();
    const fallback = await this.fallbackStorage.info();
    return { primary, fallback };
  }

  // ---- Внутренние методы ----

  private async saveWithRetry<T>(key: string, value: T, attempt = 0): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const sizeBytes = serialized.length * 2; // UTF-16

      // Выбор хранилища по размеру
      const target = sizeBytes > this.config.storageThreshold
        ? this.fallbackStorage
        : this.storage;

      await target.set(key, value);

      // Если сохранили в IndexedDB — чистим localStorage для этого ключа
      if (target === this.fallbackStorage) {
        await this.storage.remove(key).catch(() => {});
      }

      this.retryCounters.delete(key);
    } catch (error) {
      const retryCount = this.retryCounters.get(key) ?? 0;

      if (retryCount < this.config.maxRetries) {
        this.retryCounters.set(key, retryCount + 1);
        const delay = Math.pow(2, retryCount) * 100; // exponential backoff
        await new Promise(r => setTimeout(r, delay));
        return this.saveWithRetry(key, value, attempt + 1);
      }

      // Финальная попытка — падаем в IndexedDB
      console.warn(`[AutoSave] localStorage full, falling back to IndexedDB for key: ${key}`);
      await this.fallbackStorage.set(key, value);
      this.retryCounters.delete(key);
    }
  }
}
```

---

## 5. Пример использования

```typescript
// app/storage-init.ts

import { AutoSaveManager } from '../storage/auto-save-manager';

const autoSave = new AutoSaveManager({
  debounceMs: 800,
  maxRetries: 3,
});

// Автосохранение при редактировании резюме
export function onResumeEdit(resumeData: object) {
  autoSave.scheduleSave('draft_resume', resumeData);
}

// Восстановление черновика при загрузке
export async function restoreDraft() {
  const draft = await autoSave.load<object>('draft_resume');
  if (draft) {
    console.log('[Storage] Draft restored from local cache');
    return draft;
  }
  return null;
}

// Принудительное сохранение перед уходом со страницы
window.addEventListener('beforeunload', () => {
  // synchronous localStorage write
  // (navigator.sendBeacon для IndexedDB)
});
```

---

## 6. Limitations

| Ограничение | Описание | Влияние |
|---|---|---|
| **Потеря при очистке кэша** | `localStorage` и `IndexedDB` очищаются при `Clear site data` в DevTools или手动 | Пользователь теряет черновик |
| **Нет cross-device sync** | Данные хранятся локально в браузере | Черновик не переносится между устройствами |
| **Лимит localStorage** | ~5MB на домен (зависит от браузера) | Необходим IndexedDB для больших резюме |
| **IndexedDB асинхронен** | Все операции — промисы | Сложнее синхронизация при `beforeunload` |
| **Сторонние cookie** | Если пользователь запретил, `localStorage` может быть недоступен в iframe | Нужен fallback на `memory` |
| **Сервис-воркеры** | Без регистрации Service Worker офлайн-режим не работает | Только кэширование, не полноценный offline |

### Стратегия выбора хранилища

```
Данные < 4.5MB  → localStorage  (быстрый, синхронный)
Данные > 4.5MB  → IndexedDB     (асинхронный, без лимита)
localStorage error → IndexedDB   (fallback при переполнении)
IndexedDB error  → in-memory     (последний шанс)
```
