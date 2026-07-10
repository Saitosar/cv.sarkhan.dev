import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const PROVIDER_TOKEN = process.env.TELEGRAM_STARS_PROVIDER_TOKEN!;

const PLANS = {
  pro_monthly: {
    title: 'CV Pro — 1 month',
    description: 'Full access: AI analysis, unlimited views, search priority',
    price: 300, // Telegram Stars
    currency: 'XTR',
    days: 30,
  },
} as const;

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();
    const config = PLANS[plan as keyof typeof PLANS];
    if (!config) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const payload = `${user.id}:${plan}:${Date.now()}`;

    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: config.title,
          description: config.description,
          payload,
          currency: config.currency,
          prices: [{ label: config.title, amount: config.price }],
          provider_token: PROVIDER_TOKEN,
        }),
      },
    );

    const data = await res.json();
    if (!data.ok) {
      console.error('[createInvoiceLink]', data);
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }

    return NextResponse.json({ invoiceLink: data.result });
  } catch (error) {
    console.error('[create-invoice]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
