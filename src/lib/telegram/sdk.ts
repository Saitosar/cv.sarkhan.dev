// src/lib/telegram/sdk.ts
// Thin, type-safe wrapper around window.Telegram.WebApp.

import type { TelegramWebApp } from '@/types/telegram';

/**
 * Safely access the Telegram WebApp SDK.
 * Returns null if not in Telegram WebView or during SSR.
 */
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return (
    (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram
      ?.WebApp ?? null
  );
}

/**
 * Check if the app is running inside Telegram WebView.
 */
export function isInTelegram(): boolean {
  const tg = getTelegramWebApp();
  return !!tg?.initData;
}
