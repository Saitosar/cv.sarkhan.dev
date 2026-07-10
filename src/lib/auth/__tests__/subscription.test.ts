import { describe, it, expect, vi } from 'vitest';
import { checkProAccess } from '@/lib/auth/subscription';
import { prisma } from '@/lib/db/prisma';

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Subscription Billing Flow', () => {
  it('should grant access if user is pro and subscription is active', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      role: 'pro',
      starsSubUntil: new Date(Date.now() + 86400000),
    });

    const hasAccess = await checkProAccess('user_1');
    expect(hasAccess).toBe(true);
  });

  it('should deny access if user is free', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      role: 'free',
      starsSubUntil: null,
    });

    const hasAccess = await checkProAccess('user_1');
    expect(hasAccess).toBe(false);
  });

  it('should deny access and downgrade user if subscription expired', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      role: 'pro',
      starsSubUntil: new Date(Date.now() - 86400000),
    });

    const hasAccess = await checkProAccess('user_1');
    expect(hasAccess).toBe(false);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: { role: 'free', starsSubUntil: null },
    });
  });
});
