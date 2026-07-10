import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifySessionToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const session = await verifySessionToken(token);

    const body = await req.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    // Update user profile or sync specific fields
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: data.name || undefined,
        image: data.image || undefined,
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        image: updatedUser.image,
        role: updatedUser.role
      }
    });
  } catch (error: any) {
    console.error('[Telegram Sync Error]', error);
    if (error.message === 'Invalid token signature' || error.message === 'Token expired') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
