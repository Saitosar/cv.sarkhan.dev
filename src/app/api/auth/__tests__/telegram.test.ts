import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../telegram/route';
import { NextResponse } from 'next/server';
import { validateTelegramInitData } from '@/lib/telegram/validate';
import { prisma } from '@/lib/db/prisma';
import { signSessionToken } from '@/lib/auth/jwt';

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      status: init?.status ?? 200,
      json: async () => data,
    })),
  },
}));

vi.mock('@/lib/telegram/validate', () => ({
  validateTelegramInitData: vi.fn(),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth/jwt', () => ({
  signSessionToken: vi.fn(),
}));

describe('POST /api/auth/telegram', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 when initData is missing', async () => {
    const req = {
      json: async () => ({}),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('initData required');
  });

  it('should return 401 when initData is invalid', async () => {
    (validateTelegramInitData as any).mockReturnValue({
      valid: false,
      reason: 'invalid_signature',
    });

    const req = {
      json: async () => ({ initData: 'invalid-data' }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain('Invalid signature');
  });

  it('should return 401 when initData is expired', async () => {
    (validateTelegramInitData as any).mockReturnValue({
      valid: false,
      reason: 'expired',
    });

    const req = {
      json: async () => ({ initData: 'expired-data' }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain('initData expired');
  });

  it('should successfully authenticate and create/update user', async () => {
    (validateTelegramInitData as any).mockReturnValue({
      valid: true,
      data: { user: JSON.stringify({ id: 123, first_name: 'Test' }) },
    });

    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({
      id: 'user-1',
      telegramId: '123',
      name: 'Test',
      role: 'guest',
    });
    (signSessionToken as any).mockResolvedValue('mock-token');

    const req = {
      json: async () => ({ initData: 'valid-data' }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.token).toBe('mock-token');
    expect(data.user.telegramId).toBe('123');
  });

  it('should return 400 when request body is invalid JSON', async () => {
    const req = {
      json: async () => { throw new SyntaxError('Unexpected token'); },
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid JSON body');
  });

  it('should return 500 on unexpected error', async () => {
    (validateTelegramInitData as any).mockImplementation(() => {
      throw new Error('Unexpected Boom');
    });

    const req = {
      json: async () => ({ initData: 'valid-data' }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Internal server error');
  });
});
