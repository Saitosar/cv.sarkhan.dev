import { prisma } from '@/lib/db/prisma';

export async function checkProAccess(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, starsSubUntil: true },
  });

  if (!user) return false;

  if (user.role === 'pro' && user.starsSubUntil && user.starsSubUntil > new Date()) {
    return true;
  }

  if (user.role === 'pro' && user.starsSubUntil && user.starsSubUntil <= new Date()) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'free', starsSubUntil: null },
    });
    return false;
  }

  return false;
}
