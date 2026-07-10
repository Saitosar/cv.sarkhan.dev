import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { checkProAccess } from '@/lib/auth/subscription';

export async function middleware(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const isPro = await checkProAccess(user.id);
  if (!isPro) {
    return NextResponse.json(
      { error: 'Pro subscription required' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}
