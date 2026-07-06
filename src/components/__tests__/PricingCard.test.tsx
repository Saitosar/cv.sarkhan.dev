// src/components/__tests__/PricingCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PricingCard from '@/components/Billing/PricingCard';
import type { SubscriptionPlan } from '@/types/billing';

function createFreePlan(overrides?: Partial<SubscriptionPlan>): SubscriptionPlan {
  return {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: 0,
    features: ['Basic resume builder', 'ATS score check', '1 export per month'],
    highlighted: false,
    cta: 'Get Started',
    ...overrides,
  };
}

function createProPlan(overrides?: Partial<SubscriptionPlan>): SubscriptionPlan {
  return {
    id: 'pro',
    name: 'Pro',
    tier: 'pro',
    price: 19,
    features: ['Unlimited exports', 'AI-powered suggestions', 'Priority support', 'Custom templates'],
    highlighted: true,
    cta: 'Subscribe to Pro',
    ...overrides,
  };
}

describe('PricingCard', () => {
  it('should render Free plan name and price', () => {
    const plan = createFreePlan();
    render(<PricingCard plan={plan} isCurrent={false} onSubscribe={vi.fn()} />);
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('/month')).toBeInTheDocument();
  });

  it('should render Pro plan name and price', () => {
    const plan = createProPlan();
    render(<PricingCard plan={plan} isCurrent={false} onSubscribe={vi.fn()} />);
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('$19')).toBeInTheDocument();
    expect(screen.getByText('/month')).toBeInTheDocument();
  });

  it('should render Most Popular badge for Pro plan', () => {
    const plan = createProPlan();
    render(<PricingCard plan={plan} isCurrent={false} onSubscribe={vi.fn()} />);
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('should not render Most Popular badge for Free plan', () => {
    const plan = createFreePlan();
    render(<PricingCard plan={plan} isCurrent={false} onSubscribe={vi.fn()} />);
    expect(screen.queryByText('Most Popular')).not.toBeInTheDocument();
  });

  it('should render all features', () => {
    const plan = createFreePlan({ features: ['Feature A', 'Feature B', 'Feature C'] });
    render(<PricingCard plan={plan} isCurrent={false} onSubscribe={vi.fn()} />);
    expect(screen.getByText('Feature A')).toBeInTheDocument();
    expect(screen.getByText('Feature B')).toBeInTheDocument();
    expect(screen.getByText('Feature C')).toBeInTheDocument();
  });

  it('should render CTA button with plan.cta text', () => {
    const plan = createFreePlan({ cta: 'Get Started Free' });
    render(<PricingCard plan={plan} isCurrent={false} onSubscribe={vi.fn()} />);
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
  });

  it('should show "Current Plan" when isCurrent is true', () => {
    const plan = createFreePlan();
    render(<PricingCard plan={plan} isCurrent={true} onSubscribe={vi.fn()} />);
    expect(screen.getByText('Current Plan')).toBeInTheDocument();
    expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
  });

  it('should call onSubscribe when button is clicked', () => {
    const onSubscribe = vi.fn();
    const plan = createFreePlan();
    render(<PricingCard plan={plan} isCurrent={false} onSubscribe={onSubscribe} />);
    fireEvent.click(screen.getByText('Get Started'));
    expect(onSubscribe).toHaveBeenCalledTimes(1);
  });

  it('should disable button when isCurrent is true', () => {
    const onSubscribe = vi.fn();
    const plan = createFreePlan();
    render(<PricingCard plan={plan} isCurrent={true} onSubscribe={onSubscribe} />);
    const button = screen.getByText('Current Plan');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onSubscribe).not.toHaveBeenCalled();
  });
});
