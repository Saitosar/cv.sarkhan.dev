'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

export default function SubscriptionBadge() {
  const tier = useSubscriptionStore((s) => s.tier);
  const isPro = tier === 'pro';

  return (
    <Link
      href="/pricing"
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
        'transition-all duration-200 hover:scale-105',
        isPro
          ? 'bg-[#6001d1]/30 text-[#d2bbff] border border-[#6001d1]/50 shadow-[0_0_12px_rgba(96,1,209,0.25)]'
          : 'bg-white/10 text-[#c4c7c7] border border-white/10 hover:bg-white/15'
      )}
      title={isPro ? 'Pro plan active' : 'Upgrade to Pro'}
    >
      <span className={cn('w-2 h-2 rounded-full', isPro ? 'bg-[#d2bbff]' : 'bg-[#8e8e8e]')} />
      {isPro ? 'Pro' : 'Free'}
    </Link>
  );
}
