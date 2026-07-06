'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

export interface ProFeatureGateProps {
  children: React.ReactNode;
  featureName: string;
}

export default function ProFeatureGate({
  children,
  featureName,
}: ProFeatureGateProps) {
  const tier = useSubscriptionStore((s) => s.tier);

  if (tier === 'pro') {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 p-6 rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-[#6001d1]/20 flex items-center justify-center border border-[#d2bbff]/30">
          <Lock size={20} className="text-[#d2bbff]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[#e5e2e1]">{featureName}</p>
          <p className="text-xs text-[#c4c7c7] mt-1">Upgrade to Pro to unlock this feature</p>
        </div>
        <Link
          href="/pricing"
          className="mt-2 px-5 py-2 rounded-xl text-sm font-semibold bg-[#6001d1] text-white hover:bg-[#7a1ce8] transition-colors shadow-[0_0_20px_rgba(96,1,209,0.4)]"
        >
          Upgrade to Pro
        </Link>
      </div>
      <div className="blur-[6px] opacity-40 pointer-events-none select-none">{children}</div>
    </div>
  );
}
