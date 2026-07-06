// src/components/__tests__/SubscriptionBadge.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SubscriptionBadge from '@/components/Billing/SubscriptionBadge';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

describe('SubscriptionBadge', () => {
  beforeEach(() => {
    useSubscriptionStore.setState({
      tier: 'free',
      status: 'free',
      error: null,
    });
  });

  it('should render Free badge by default', () => {
    render(<SubscriptionBadge />);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('should render Pro badge when tier is pro', () => {
    useSubscriptionStore.getState().setTier('pro');
    render(<SubscriptionBadge />);
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('should link to /pricing', () => {
    render(<SubscriptionBadge />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/pricing');
  });

  it('should have correct title for Free', () => {
    render(<SubscriptionBadge />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('title', 'Upgrade to Pro');
  });

  it('should have correct title for Pro', () => {
    useSubscriptionStore.getState().setTier('pro');
    render(<SubscriptionBadge />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('title', 'Pro plan active');
  });
});
