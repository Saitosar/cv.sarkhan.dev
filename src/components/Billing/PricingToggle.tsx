'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type BillingCycle = 'monthly' | 'yearly';

export interface PricingToggleProps {
  value?: BillingCycle;
  onChange?: (value: BillingCycle) => void;
}

export default function PricingToggle({
  value = 'monthly',
  onChange,
}: PricingToggleProps) {
  // Use prop as source of truth; internal state only for uncontrolled mode
  const cycle = value;

  const handleChange = (next: BillingCycle) => {
    onChange?.(next);
  };

  return (
    <div
      className="inline-flex items-center rounded-full border border-white/10 bg-[#141313]/70 p-1 backdrop-blur-sm"
      role="group"
      aria-label="Billing cycle"
    >
      <button
        type="button"
        role="radio"
        aria-checked={cycle === 'monthly'}
        onClick={() => handleChange('monthly')}
        className={cn(
          'relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-200',
          cycle === 'monthly'
            ? 'text-white bg-[#6001d1] shadow-[0_0_12px_rgba(96,1,209,0.4)]'
            : 'text-[#c4c7c7] hover:text-[#e5e2e1]'
        )}
      >
        Monthly
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={cycle === 'yearly'}
        onClick={() => handleChange('yearly')}
        className={cn(
          'relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2',
          cycle === 'yearly'
            ? 'text-white bg-[#6001d1] shadow-[0_0_12px_rgba(96,1,209,0.4)]'
            : 'text-[#c4c7c7] hover:text-[#e5e2e1]'
        )}
      >
        Yearly
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#4ae176]/20 text-[#4ae176] border border-[#4ae176]/30">
          Save 20%
        </span>
      </button>
    </div>
  );
}
