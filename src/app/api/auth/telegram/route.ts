import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramInitData } from '@/lib/telegram/validate';
import { prisma } from '@/lib/db/prisma';
import { signSessionToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { initData } = body;

    if (!initData || typeof initData !== 'string') {
      return NextResponse.json({ error: 'initData required' }, { status: 400 });
    }

    const validation = validateTelegramInitData(initData);
    if (!validation.valid) {
      const status = validation.reason === 'missing_hash' ? 400 : 401;
      const message = validation.reason === 'expired' ? 'initData expired' : 
                     validation.reason === 'invalid_signature' ? 'Invalid signature' : 
                     'Invalid initData';
      return NextResponse.json({ error: message }, { status });
    }

    const tgUser = validation.data.user ? JSON.parse(validation.data.user) : null;
    if (!tgUser?.id) {
      return NextResponse.json({ error: 'User not found in initData' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { telegramId: String(tgUser.id) },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: String(tgUser.id),
          name: tgUser.first_name ? `${tgUser.first_name} ${tgUser.last_name || ''}`.trim() : `tg_${tgUser.id}`,
          image: tgUser.photo_url ?? null,
          role: 'guest',
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    const token = await signSessionToken({
      userId: user.id,
      telegramId: user.telegramId!,
      role: user.role,
    });

    return NextResponse.json({ 
      token, 
      user: {
        id: user.id,
        telegramId: user.telegramId,
        name: user.name,
        image: user.image,
        role: user.role
      } 
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    console.error('[Telegram Auth Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
