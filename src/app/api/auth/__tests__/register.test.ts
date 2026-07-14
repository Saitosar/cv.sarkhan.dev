// src/app/api/auth/__tests__/register.test.ts
// RED: Tests for POST /api/auth/register — implementation does not exist yet
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

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
}));

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJson.mockClear();
  });

  describe('validation', () => {
    it('should return 400 when email is missing', async () => {
      const { POST } = await import('../register/route');
      const req = {
        json: () => Promise.resolve({ password: 'Password123!', name: 'Test' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('email');
    });

    it('should return 400 when password is missing', async () => {
      const { POST } = await import('../register/route');
      const req = {
        json: () => Promise.resolve({ email: 'test@example.com', name: 'Test' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('password');
    });

    it('should return 400 when name is missing', async () => {
      const { POST } = await import('../register/route');
      const req = {
        json: () => Promise.resolve({ email: 'test@example.com', password: 'Password123!' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('name');
    });

    it('should return 400 when email format is invalid', async () => {
      const { POST } = await import('../register/route');
      const req = {
        json: () => Promise.resolve({ email: 'not-an-email', password: 'Password123!', name: 'Test' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('email');
    });

    it('should return 400 when password is too short', async () => {
      const { POST } = await import('../register/route');
      const req = {
        json: () => Promise.resolve({ email: 'test@example.com', password: 'Ab1!', name: 'Test' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('password');
    });

    it('should return 400 when password lacks uppercase letter', async () => {
      const { POST } = await import('../register/route');
      const req = {
        json: () => Promise.resolve({ email: 'test@example.com', password: 'password123!', name: 'Test' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('password');
    });

    it('should return 400 when password lacks number', async () => {
      const { POST } = await import('../register/route');
      const req = {
        json: () => Promise.resolve({ email: 'test@example.com', password: 'Password!!!', name: 'Test' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('password');
    });
  });

  describe('duplicate detection', () => {
    it('should return 409 when email already exists', async () => {
      const { prisma } = await import('@/lib/db/prisma');
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
      });

      const { POST } = await import('../register/route');
      const req = {
        json: () => Promise.resolve({ email: 'test@example.com', password: 'Password123!', name: 'Test' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toContain('already exists');
    });
  });

  describe('successful registration', () => {
    it('should hash password with bcrypt', async () => {
      const bcrypt = await import('bcrypt');
      (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue('$2b$10$hashedpassword');

      const { prisma } = await import('@/lib/db/prisma');
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (prisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'new-user',
        email: 'test@example.com',
        name: 'Test',
        createdAt: new Date(),
      });

      const { POST } = await import('../register/route');
      const req = {
        json: () => Promise.resolve({ email: 'test@example.com', password: 'Password123!', name: 'Test' }),
      } as unknown as Request;

      await POST(req);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', expect.any(Number));
    });

    it('should create user in database', async () => {
      const bcrypt = await import('bcrypt');
      (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue('$2b$10$hashedpassword');

      const { prisma } = await import('@/lib/db/prisma');
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (prisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'new-user',
        email: 'test@example.com',
        name: 'Test',
        createdAt: new Date(),
      });

      const { POST } = await import('../register/route');
      const req = {
        json: () => Promise.resolve({ email: 'test@example.com', password: 'Password123!', name: 'Test' }),
      } as unknown as Request;

      await POST(req);

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.com',
            name: 'Test',
            image: '$2b$10$hashedpassword',
          }),
        })
      );
    });

    it('should return 201 with user data (no passwordHash)', async () => {
      const bcrypt = await import('bcrypt');
      (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue('$2b$10$hashedpassword');

      const { prisma } = await import('@/lib/db/prisma');
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (prisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'new-user',
        email: 'test@example.com',
        name: 'Test',
        createdAt: new Date(),
      });

      const { POST } = await import('../register/route');
      const req = {
        json: () => Promise.resolve({ email: 'test@example.com', password: 'Password123!', name: 'Test' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user).toHaveProperty('id', 'new-user');
      expect(data.user).toHaveProperty('email', 'test@example.com');
      expect(data.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('error handling', () => {
    it('should return 500 on unexpected error', async () => {
      const { prisma } = await import('@/lib/db/prisma');
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database connection failed')
      );

      const { POST } = await import('../register/route');
      const req = {
        json: () => Promise.resolve({ email: 'test@example.com', password: 'Password123!', name: 'Test' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should return 400 when request body is invalid JSON', async () => {
      const { POST } = await import('../register/route');
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
