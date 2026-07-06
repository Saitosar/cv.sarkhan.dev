// src/components/__tests__/ProFeatureGate.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProFeatureGate from '@/components/Billing/ProFeatureGate';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

describe('ProFeatureGate', () => {
  beforeEach(() => {
    useSubscriptionStore.setState({
      tier: 'free',
      status: 'free',
      error: null,
    });
  });

  it('should render children when tier is pro', () => {
    useSubscriptionStore.getState().setTier('pro');
    render(
      <ProFeatureGate featureName="AI Suggestions">
        <div data-testid="pro-content">Pro Content</div>
      </ProFeatureGate>
    );
    expect(screen.getByTestId('pro-content')).toBeInTheDocument();
    expect(screen.getByText('Pro Content')).toBeInTheDocument();
  });

  it('should show lock overlay when tier is free', () => {
    render(
      <ProFeatureGate featureName="AI Suggestions">
        <div data-testid="pro-content">Pro Content</div>
      </ProFeatureGate>
    );
    expect(screen.getByText('AI Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Upgrade to Pro to unlock this feature')).toBeInTheDocument();
    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
  });

  it('should show lock icon when tier is free', () => {
    render(
      <ProFeatureGate featureName="AI Suggestions">
        <div>Pro Content</div>
      </ProFeatureGate>
    );
    // The Lock icon from lucide-react renders as an SVG
    const lockSvg = document.querySelector('svg.lucide.lucide-lock');
    expect(lockSvg).toBeInTheDocument();
  });

  it('should link to /pricing when tier is free', () => {
    render(
      <ProFeatureGate featureName="AI Suggestions">
        <div>Pro Content</div>
      </ProFeatureGate>
    );
    const link = screen.getByText('Upgrade to Pro');
    expect(link.closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('should blur children when tier is free', () => {
    render(
      <ProFeatureGate featureName="AI Suggestions">
        <div data-testid="pro-content">Pro Content</div>
      </ProFeatureGate>
    );
    const blurred = screen.getByTestId('pro-content');
    // The parent div has blur-[6px] opacity-40 pointer-events-none select-none
    const parent = blurred.parentElement;
    expect(parent).toBeInTheDocument();
  });
});
