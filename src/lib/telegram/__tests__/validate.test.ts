import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateTelegramInitData } from '@/lib/telegram/validate';

describe('Telegram initData validation', () => {
  const BOT_TOKEN = 'test_bot_token';
  
  beforeEach(() => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', BOT_TOKEN);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return invalid for empty initData', () => {
    const result = validateTelegramInitData('');
    expect(result.valid).toBe(false);
  });

  it('should return invalid for initData without hash', () => {
    const result = validateTelegramInitData('user=123&auth_date=12345678');
    expect(result.valid).toBe(false);
    if (result.valid === false) {
      expect(result.reason).toBe('missing_hash');
    }
  });

  it('should return invalid for expired initData (older than 24h)', () => {
    const oldDate = Math.floor(Date.now() / 1000) - 90000;
    const raw = `auth_date=${oldDate}&hash=somehash`;
    const result = validateTelegramInitData(raw);
    expect(result.valid).toBe(false);
    if (result.valid === false) {
      expect(result.reason).toBe('expired');
    }
  });

  it('should return invalid for invalid hash', () => {
    const raw = `auth_date=${Math.floor(Date.now() / 1000)}&hash=invalid_hash`;
    const result = validateTelegramInitData(raw);
    expect(result.valid).toBe(false);
    if (result.valid === false) {
      expect(result.reason).toBe('invalid_signature');
    }
  });
});
