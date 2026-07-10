import crypto from 'node:crypto';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

export interface TelegramInitData {
  auth_date: number;
  hash: string;
  query_id?: string;
  user?: string; // JSON string from Telegram
  [key: string]: string | number | undefined;
}

/**
 * Validates Telegram Mini App initData using HMAC-SHA256.
 * Algorithm: HMAC-SHA256(secret=HMAC-SHA256(bot_token, "WebAppData"), data_check_string)
 */
export function validateTelegramInitData(raw: string): TelegramInitData | null {
  if (!BOT_TOKEN) {
    console.error('[Telegram Validation] TELEGRAM_BOT_TOKEN is not defined');
    return null;
  }

  const params = new URLSearchParams(raw);
  const hash = params.get('hash');
  if (!hash) return null;

  // Remove hash from the data to be checked
  params.delete('hash');

  // Sort keys alphabetically and join as key=value\n
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  // Secret key: HMAC-SHA256(bot_token, "WebAppData")
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(BOT_TOKEN)
    .digest();

  // Compute expected hash
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (computedHash !== hash) return null;

  // Check that data is not older than 24 hours
  const authDate = Number(params.get('auth_date') ?? 0);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) return null;

  const result: TelegramInitData = { auth_date: authDate, hash };
  for (const [k, v] of params.entries()) {
    result[k] = v;
  }
  return result;
}
