// src/lib/db/__tests__/prisma.test.ts
// RED: Tests for Prisma client singleton — implementation does not exist yet
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @prisma/client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    resume: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  })),
}));

describe('PrismaClient singleton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear module cache to reset singleton
    vi.resetModules();
  });

  describe('singleton pattern', () => {
    it('should export a single prisma instance', async () => {
      const { prisma } = await import('../prisma');
      expect(prisma).toBeDefined();
    });

    it('should return the same instance on repeated imports', async () => {
      const { prisma: prisma1 } = await import('../prisma');
      const { prisma: prisma2 } = await import('../prisma');
      expect(prisma1).toBe(prisma2);
    });

    it('should create PrismaClient with correct options', async () => {
      const { PrismaClient } = await import('@prisma/client');
      await import('../prisma');
      expect(PrismaClient).toHaveBeenCalled();
    });
  });

  describe('database operations', () => {
    it('should find user by id', async () => {
      const { prisma } = await import('../prisma');
      const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test' };
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

      const result = await prisma.user.findUnique({ where: { id: 'user-1' } });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const { prisma } = await import('../prisma');
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await prisma.user.findUnique({ where: { id: 'nonexistent' } });
      expect(result).toBeNull();
    });

    it('should create a new user', async () => {
      const { prisma } = await import('../prisma');
      const newUser = {
        id: 'new-user',
        email: 'new@example.com',
        name: 'New User',
        passwordHash: '$2b$10$hash',
      };
      (prisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValue(newUser);

      const result = await prisma.user.create({
        data: {
          email: 'new@example.com',
          name: 'New User',
          passwordHash: '$2b$10$hash',
        },
      });
      expect(result).toEqual(newUser);
    });

    it('should update user data', async () => {
      const { prisma } = await import('../prisma');
      const updatedUser = { id: 'user-1', email: 'updated@example.com', name: 'Updated' };
      (prisma.user.update as ReturnType<typeof vi.fn>).mockResolvedValue(updatedUser);

      const result = await prisma.user.update({
        where: { id: 'user-1' },
        data: { email: 'updated@example.com' },
      });
      expect(result.email).toBe('updated@example.com');
    });

    it('should find resume by user id', async () => {
      const { prisma } = await import('../prisma');
      const mockResume = { id: 'resume-1', userId: 'user-1', fullName: 'Test User' };
      (prisma.resume.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockResume);

      const result = await prisma.resume.findUnique({ where: { userId: 'user-1' } });
      expect(result).toEqual(mockResume);
    });

    it('should find subscription by user id', async () => {
      const { prisma } = await import('../prisma');
      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        plan: 'pro',
        status: 'active',
      };
      (prisma.subscription.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockSubscription);

      const result = await prisma.subscription.findUnique({ where: { userId: 'user-1' } });
      expect(result).toEqual(mockSubscription);
    });
  });

  describe('error handling', () => {
    it('should throw on database connection error', async () => {
      const { prisma } = await import('../prisma');
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(prisma.user.findUnique({ where: { id: 'user-1' } })).rejects.toThrow(
        'Connection refused'
      );
    });

    it('should throw on unique constraint violation', async () => {
      const { prisma } = await import('../prisma');
      (prisma.user.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`email`)')
      );

      await expect(
        prisma.user.create({
          data: {
            email: 'existing@example.com',
            name: 'Test',
            passwordHash: 'hash',
          },
        })
      ).rejects.toThrow('Unique constraint');
    });
  });

  describe('environment-specific configuration', () => {
    it('should enable logging in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      vi.resetModules();

      const { PrismaClient } = await import('@prisma/client');
      await import('../prisma');

      expect(PrismaClient).toHaveBeenCalledWith(
        expect.objectContaining({
          log: expect.arrayContaining(['query']),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should disable logging in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      vi.resetModules();

      const { PrismaClient } = await import('@prisma/client');
      await import('../prisma');

      expect(PrismaClient).toHaveBeenCalledWith(
        expect.not.objectContaining({
          log: expect.arrayContaining(['query']),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });
});
