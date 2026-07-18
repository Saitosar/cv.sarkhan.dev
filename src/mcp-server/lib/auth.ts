import * as bcrypt from 'bcrypt';
import { TokenValidationResult, RateLimitResult } from '../types';
import { getLogger } from '@/lib/monitoring/logger';

const log = getLogger();

// Mock DB for implementation. In real world, this would be a PostgreSQL client.
const MOCK_DB = {
  pro_tokens: [] as any[],
  users: [
    { id: 'user-123', plan: 'pro' }
  ],
  mcp_logs: [] as any[]
};

// Initialize mock token synchronously to avoid top-level await in old TS targets
async function initMockToken() {
  const hash = await bcrypt.hash('cv_pro_test_token', 12);
  MOCK_DB.pro_tokens.push({
    id: 'token-1',
    user_id: 'user-123',
    token_hash: hash,
    prefix: 'cv_pro_test',
    is_revoked: false,
    expires_at: null,
    last_used_at: new Date(),
  });
}
initMockToken().catch(console.error);

export async function validateToken(rawToken: string): Promise<TokenValidationResult> {
  const prefix = rawToken.substring(0, 16);
  const record = MOCK_DB.pro_tokens.find(t => t.prefix === prefix);

  if (!record) return { valid: false, error: 'unauthorized' };
  if (record.is_revoked) return { valid: false, error: 'revoked' };
  if (record.expires_at && new Date() > record.expires_at) return { valid: false, error: 'expired' };

  const match = await bcrypt.compare(rawToken, record.token_hash);
  if (!match) return { valid: false, error: 'unauthorized' };

  const rateResult = await checkRateLimit(record.user_id);
  if (!rateResult.allowed) {
    return { valid: false, error: 'rate_limited', retryAfter: rateResult.retryAfter };
  }

  record.last_used_at = new Date();
  return { valid: true, user: MOCK_DB.users.find(u => u.id === record.user_id) };
}

async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - 3600_000; 
  const minuteStart = now - 60_000;

  const hourlyCount = MOCK_DB.mcp_logs.filter(log => log.user_id === userId && log.created_at > windowStart).length;
  const minuteCount = MOCK_DB.mcp_logs.filter(log => log.user_id === userId && log.created_at > minuteStart).length;

  if (hourlyCount >= 100) {
    return { allowed: false, remaining: 0, retryAfter: 3600 }; 
  }

  if (minuteCount >= 10) {
    return { allowed: false, remaining: 0, retryAfter: 60 };
  }

  return { allowed: true, remaining: 100 - hourlyCount, retryAfter: 0 };
}

export async function logMcpCall(userId: string, tokenPrefix: string, toolName: string, status: string, durationMs: number) {
  MOCK_DB.mcp_logs.push({
    id: Math.random().toString(36).substr(2, 9),
    user_id: userId,
    token_prefix: tokenPrefix,
    tool_name: toolName,
    status,
    duration_ms: durationMs,
    created_at: new Date(),
  });
}

export async function updateResumeInDB(userId: string, sections: any, context?: string): Promise<any> {
  return { 
    basics: { name: 'Sarkhan', email: 'test@example.com' },
    updated_at: new Date().toISOString() 
  };
}

export async function getResumeFromDB(userId: string): Promise<any> {
  return { 
    basics: { name: 'Sarkhan', email: 'test@example.com' },
    updated_at: new Date().toISOString() 
  };
}

export async function analyzeResumeFit(userId: string, jobDescription: string): Promise<any> {
  return { 
    overall_score: 85, 
    breakdown: { skills_match: { score: 80 } }, 
    gaps: ['Missing Kubernetes'], 
    recommendations: ['Add K8s'] 
  };
}

export async function sendTelegramNotification(userId: string, event: string, payload: any) {
  log.info({ userId, event, payload }, '[Telegram Notification]');
}
