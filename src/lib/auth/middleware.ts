import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function requireAuth(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return null;
  }
  return {
    id: (session.user as any).id,
    email: session.user.email,
    name: session.user.name,
  };
}
