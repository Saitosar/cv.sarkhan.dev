import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

const PLANS = {
  pro_monthly: {
    days: 30,
  },
} as const;

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    if (!update) {
      return NextResponse.json({ error: 'No update provided' }, { status: 400 });
    }

    if (update.pre_checkout_query) {
      const query = update.pre_checkout_query;
      const ok = query.total_amount === 300 && query.currency === 'XTR';

      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pre_checkout_query_id: query.id,
            ok,
            error_message: ok ? undefined : 'Invalid payment data',
          }),
        },
      );

      return NextResponse.json({ ok: true });
    }

    if (update.message?.successful_payment) {
      const msg = update.message;
      const payment = msg.successful_payment;
      const [userId, plan] = payment.invoice_payload.split(':');

      const config = PLANS[plan as keyof typeof PLANS];
      if (!config) {
        return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });
      }

      const expirationDate = new Date(Date.now() + config.days * 86400_000);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: {
            role: 'pro',
            starsSubUntil: expirationDate,
          },
        }),
        prisma.payment.create({
          data: {
            userId: userId,
            provider: 'telegram_stars',
            providerTxId: payment.telegram_payment_charge_id,
            amount: payment.total_amount,
            currency: payment.currency,
            plan: plan,
            status: 'completed',
          },
        }),
      ]);

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[telegram-webhook]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
