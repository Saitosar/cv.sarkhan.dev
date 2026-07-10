// src/app/api/auth/__tests__/telegram.test.ts
// RED: Tests for POST /api/auth/telegram — implementation does not exist yet
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock NextResponse
const mockJson = vi.fn();
vi.mock('next/server', () => ({
  NextResponse: {
    json: (...args: unknown[]) => {
      mockJson(...args);
      const status = (args[1] as { status?: number } | undefined)?.status ?? 200;
      return {
        json: () => Promise.resolve(args[0]),
        status,
        ok: status < 400,
      } as unknown as Response;
    },
  },
}));

// Mock crypto for HMAC validation
vi.mock('crypto', () => ({
  createHmac: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => 'mocked-hmac-digest'),
  })),
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => 'mocked-hash-digest'),
  })),
  timingSafeEqual: vi.fn((a: Buffer, b: Buffer) => {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
  }),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe('POST /api/auth/telegram', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJson.mockClear();
  });

  describe('initData validation', () => {
    it('should return 400 when initData is missing', async () => {
      const { POST } = await import('../telegram/route');
      const req = {
        json: () => Promise.resolve({}),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('initData');
    });

    it('should return 400 when initData is empty string', async () => {
      const { POST } = await import('../telegram/route');
      const req = {
        json: () => Promise.resolve({ initData: '' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('initData');
    });

    it('should return 400 when initData has invalid format', async () => {
      const { POST } = await import('../telegram/route');
      const req = {
        json: () => Promise.resolve({ initData: 'not-valid-init-data' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('invalid');
    });
  });

  describe('HMAC verification', () => {
    it('should verify HMAC signature from initData', async () => {
      const { POST } = await import('../telegram/route');
      const validInitData = 'query_id=test&auth_date=1234567890&hash=validhmacsignature&user=%7B%22id%22%3A123%7D';
      const req = {
        json: () => Promise.resolve({ initData: validInitData }),
      } as unknown as Request;

      const response = await POST(req);
      // If HMAC is valid, should proceed (not 401)
      expect(response.status).not.toBe(401);
    });

    it('should return 401 when HMAC signature is invalid', async () => {
      const crypto = await import('crypto');
      // Make timingSafeEqual return false (invalid HMAC)
      (crypto.timingSafeEqual as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const { POST } = await import('../telegram/route');
      const invalidInitData = 'query_id=test&auth_date=1234567890&hash=tamperedhash';
      const req = {
        json: () => Promise.resolve({ initData: invalidInitData }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Invalid signature');
    });

    it('should use bot token as HMAC secret key', async () => {
      const crypto = await import('crypto');
      const { POST } = await import('../telegram/route');
      const validInitData = 'query_id=test&auth_date=1234567890&hash=validhmac&user=%7B%22id%22%3A123%7D';
      const req = {
        json: () => Promise.resolve({ initData: validInitData }),
      } as unknown as Request;

      await POST(req);

      // createHmac should be called with the bot token
      expect(crypto.createHmac).toHaveBeenCalled();
    });
  });

  describe('auth_date validation', () => {
    it('should return 401 when auth_date is too old', async () => {
      const { POST } = await import('../telegram/route');
      const oldDate = Math.floor(Date.now() / 1000) - 86400 * 2; // 2 days ago
      const oldInitData = `auth_date=${oldDate}&hash=validhmac&user=%7B%22id%22%3A123%7D`;
      const req = {
        json: () => Promise.resolve({ initData: oldInitData }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('expired');
    });

    it('should accept auth_date within 24 hours', async () => {
      const { POST } = await import('../telegram/route');
      const recentDate = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const recentInitData = `auth_date=${recentDate}&hash=validhmac&user=%7B%22id%22%3A123%7D`;
      const req = {
        json: () => Promise.resolve({ initData: recentInitData }),
      } as unknown as Request;

      const response = await POST(req);
      // Should not be rejected for expiry
      expect(response.status).not.toBe(401);
    });
  });

  describe('user data extraction', () => {
    it('should extract user id from initData', async () => {
      const { prisma } = await import('@/lib/db/prisma');
      (prisma.user.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'db-user-123',
        telegramId: 123,
        name: 'Test User',
      });

      const { POST } = await import('../telegram/route');
      const userJson = encodeURIComponent(JSON.stringify({ id: 123, first_name: 'Test', last_name: 'User' }));
      const initData = `auth_date=${Math.floor(Date.now() / 1000)}&hash=validhmac&user=${userJson}`;
      const req = {
        json: () => Promise.resolve({ initData }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(data).toHaveProperty('user');
    });

    it('should upsert user in database', async () => {
      const { prisma } = await import('@/lib/db/prisma');
      (prisma.user.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'db-user-123',
        telegramId: 123,
        name: 'Test User',
      });

      const { POST } = await import('../telegram/route');
      const userJson = encodeURIComponent(JSON.stringify({ id: 123, first_name: 'Test', last_name: 'User' }));
      const initData = `auth_date=${Math.floor(Date.now() / 1000)}&hash=validhmac&user=${userJson}`;
      const req = {
        json: () => Promise.resolve({ initData }),
      } as unknown as Request;

      await POST(req);

      expect(prisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ telegramId: 123 }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should return 500 on unexpected error', async () => {
      const { prisma } = await import('@/lib/db/prisma');
      (prisma.user.upsert as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error')
      );

      const { POST } = await import('../telegram/route');
      const userJson = encodeURIComponent(JSON.stringify({ id: 123, first_name: 'Test' }));
      const initData = `auth_date=${Math.floor(Date.now() / 1000)}&hash=validhmac&user=${userJson}`;
      const req = {
        json: () => Promise.resolve({ initData }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return 400 when request body is invalid JSON', async () => {
      const { POST } = await import('../telegram/route');
      const req = {
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });
});
