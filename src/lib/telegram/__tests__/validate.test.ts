import { describe, it, expect, vi } from 'vitest';
import { validateTelegramInitData } from '@/lib/telegram/validate';

describe('Telegram initData validation', () => {
  const BOT_TOKEN = 'test_bot_token';
  
  beforeEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = BOT_TOKEN;
  });

  it('should return null for empty initData', () => {
    expect(validateTelegramInitData('')).toBeNull();
  });

  it('should return null for initData without hash', () => {
    expect(validateTelegramInitData('user=123&auth_date=12345678')).toBeNull();
  });

  it('should return null for expired initData (older than 24h)', () => {
    const oldDate = Math.floor(Date.now() / 1000) - 90000;
    const raw = `auth_date=${oldDate}&hash=somehash`;
    expect(validateTelegramInitData(raw)).toBeNull();
  });

  it('should return null for invalid hash', () => {
    const raw = `auth_date=${Math.floor(Date.now() / 1000)}&hash=invalid_hash`;
    expect(validateTelegramInitData(raw)).toBeNull();
  });
});
