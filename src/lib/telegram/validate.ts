import crypto from 'node:crypto';

export type TelegramValidationResult = {
  valid: true;
  data: TelegramInitData;
} | {
  valid: false;
  reason: 'missing_hash' | 'invalid_signature' | 'expired' | 'missing_token';
};

export interface TelegramInitData {
  auth_date: number;
  hash: string;
  query_id?: string;
  user?: string; // JSON string from Telegram
  [key: string]: string | number | undefined;
}

/**
 * Validates Telegram Mini App initData using HMAC-SHA256.
 */
export function validateTelegramInitData(raw: string): TelegramValidationResult {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!BOT_TOKEN) {
    return { valid: false, reason: 'missing_token' };
  }

  if (!raw) return { valid: false, reason: 'missing_hash' };

  const params = new URLSearchParams(raw);
  const hash = params.get('hash');
  if (!hash) return { valid: false, reason: 'missing_hash' };

  params.delete('hash');

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(BOT_TOKEN)
    .digest();

  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (computedHash !== hash) return { valid: false, reason: 'invalid_signature' };

  const authDate = Number(params.get('auth_date') ?? 0);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) return { valid: false, reason: 'expired' };

  const result: TelegramInitData = { auth_date: authDate, hash };
  for (const [k, v] of params.entries()) {
    result[k] = v;
  }
  
  return { valid: true, data: result };
}
