'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import PricingCard from '@/components/Billing/PricingCard';
import PricingToggle from '@/components/Billing/PricingToggle';
import type { SubscriptionPlan } from '@/types/billing';

const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: 0,
    highlighted: false,
    cta: 'Get Started',
    features: [
      'Build & edit 1 resume',
      'ATS score overview',
      'Basic AI chat assistant',
      'Export as PDF',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tier: 'pro',
    price: 3,
    highlighted: true,
    cta: 'Subscribe',
    features: [
      'Everything in Free',
      'AI Suggestions for every section',
      'HR Coach career mode',
      'Job Search with match scoring',
      'Priority AI processing',
    ],
  },
];

const FAQS = [
  {
    question: 'Can I change plans later?',
    answer: 'Yes — you can upgrade or downgrade at any time from your workspace.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Billing is currently in stub mode. Real payments and trials are coming soon.',
  },
  {
    question: 'What payment methods will be supported?',
    answer: 'We plan to support Stripe, Telegram Stars, and selected crypto wallets.',
  },
  {
    question: 'Do you store my payment info?',
    answer: 'No. This page is a UI preview — payment processing is not yet enabled.',
  },
];

export default function PricingPage() {
  const tier = useSubscriptionStore((s) => s.tier);
  const subscribe = useSubscriptionStore((s) => s.subscribe);

  const handleSubscribe = (plan: SubscriptionPlan) => {
    subscribe(plan.tier);
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-[#c4c7c7] text-base md:text-lg max-w-2xl mx-auto">
            Unlock AI-powered resume tools. Pick the plan that matches your career goals.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <PricingToggle />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-20">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrent={tier === plan.tier}
              onSubscribe={() => handleSubscribe(plan)}
              showATSPreview={plan.tier === 'pro'}
            />
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className={cn(
                  'rounded-2xl p-6',
                  'glass-panel border border-white/10'
                )}
              >
                <h3 className="text-base font-semibold text-[#e5e2e1] mb-2">{faq.question}</h3>
                <p className="text-sm text-[#c4c7c7] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
