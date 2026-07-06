'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { SubscriptionPlan } from '@/types/billing';

export interface PricingCardProps {
  plan: SubscriptionPlan;
  isCurrent: boolean;
  onSubscribe: () => void;
}

export default function PricingCard({
  plan,
  isCurrent,
  onSubscribe,
}: PricingCardProps) {
  const isPro = plan.tier === 'pro';

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl p-6 md:p-8',
        'glass-card transition-all duration-300',
        'border',
        isPro
          ? 'border-[#8B5CF6]/40 shadow-[0_0_40px_rgba(139,92,246,0.2)]'
          : 'border-white/10'
      )}
    >
      {isPro && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-[#6001d1] text-white shadow-lg">
          Most Popular
        </span>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#e5e2e1]">{plan.name}</h3>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">${plan.price}</span>
          <span className="text-sm text-[#c4c7c7]">/month</span>
        </div>
        <p className="mt-2 text-sm text-[#8e8e8e]">
          {isPro ? 'Unlock AI superpowers for your job search' : 'Perfect for getting started'}
        </p>
      </div>

      <ul className="flex-1 space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-[#c4c7c7]">
            <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[#6001d1]/20 flex items-center justify-center border border-[#d2bbff]/30">
              <Check size={12} className="text-[#d2bbff]" />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSubscribe}
        disabled={isCurrent}
        className={cn(
          'w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200',
          isCurrent
            ? 'bg-white/10 text-[#8e8e8e] cursor-default border border-white/10'
            : isPro
            ? 'bg-[#6001d1] text-white hover:bg-[#7a1ce8] shadow-[0_0_20px_rgba(96,1,209,0.4)] hover:shadow-[0_0_30px_rgba(96,1,209,0.6)]'
            : 'bg-white/5 text-[#e5e2e1] border border-white/20 hover:bg-white/10'
        )}
      >
        {isCurrent ? 'Current Plan' : plan.cta}
      </button>
    </div>
  );
}
