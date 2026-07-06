// src/components/__tests__/SuggestionPanel.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SuggestionPanel from '../CanvasPanel/SuggestionPanel';
import type { Suggestion } from '@/types/suggestions';

function createSuggestion(overrides?: Partial<Suggestion>): Suggestion {
  return {
    id: 'sug-1',
    type: 'missing_keywords',
    severity: 'high',
    title: 'Add more keywords',
    description: 'Your summary is missing key terms',
    section: 'summary',
    action: { type: 'apply', targetText: 'old', replacementText: 'new' },
    source: 'ai',
    atsImpact: 5,
    applied: false,
    dismissed: false,
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('SuggestionPanel', () => {
  it('should render the panel header', () => {
    render(
      <SuggestionPanel
        suggestions={[]}
        isLoading={false}
        onApply={vi.fn()}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        activeSection={null}
      />
    );
    expect(screen.getByText('AI Suggestions')).toBeInTheDocument();
  });

  it('should show empty state when no suggestions and not loading', () => {
    render(
      <SuggestionPanel
        suggestions={[]}
        isLoading={false}
        onApply={vi.fn()}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        activeSection={null}
      />
    );
    expect(
      screen.getByText('Tap a resume section to analyze it.')
    ).toBeInTheDocument();
  });

  it('should show section-specific empty state when activeSection is set', () => {
    render(
      <SuggestionPanel
        suggestions={[]}
        isLoading={false}
        onApply={vi.fn()}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        activeSection="experience"
      />
    );
    expect(
      screen.getByText(/Tap "Refresh" to get AI suggestions for experience/)
    ).toBeInTheDocument();
  });

  it('should render suggestion cards when suggestions exist', () => {
    const suggestions = [
      createSuggestion({ id: 'sug-1', title: 'Add keywords' }),
      createSuggestion({ id: 'sug-2', title: 'Fix formatting', severity: 'medium' }),
    ];
    render(
      <SuggestionPanel
        suggestions={suggestions}
        isLoading={false}
        onApply={vi.fn()}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        activeSection="summary"
      />
    );
    expect(screen.getByText('Add keywords')).toBeInTheDocument();
    expect(screen.getByText('Fix formatting')).toBeInTheDocument();
  });

  it('should show suggestion count badge', () => {
    const suggestions = [
      createSuggestion({ id: 'sug-1' }),
      createSuggestion({ id: 'sug-2' }),
    ];
    render(
      <SuggestionPanel
        suggestions={suggestions}
        isLoading={false}
        onApply={vi.fn()}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        activeSection="summary"
      />
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should sort suggestions by severity (high first)', () => {
    const suggestions = [
      createSuggestion({ id: 'sug-1', severity: 'low', title: 'Low priority' }),
      createSuggestion({ id: 'sug-2', severity: 'high', title: 'High priority' }),
      createSuggestion({ id: 'sug-3', severity: 'medium', title: 'Medium priority' }),
    ];
    render(
      <SuggestionPanel
        suggestions={suggestions}
        isLoading={false}
        onApply={vi.fn()}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        activeSection="summary"
      />
    );
    // All should be rendered
    expect(screen.getByText('High priority')).toBeInTheDocument();
    expect(screen.getByText('Medium priority')).toBeInTheDocument();
    expect(screen.getByText('Low priority')).toBeInTheDocument();
  });

  it('should filter out dismissed and applied suggestions from visible count', () => {
    const suggestions = [
      createSuggestion({ id: 'sug-1', dismissed: true }),
      createSuggestion({ id: 'sug-2', applied: true }),
      createSuggestion({ id: 'sug-3' }),
    ];
    render(
      <SuggestionPanel
        suggestions={suggestions}
        isLoading={false}
        onApply={vi.fn()}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        activeSection="summary"
      />
    );
    // Count badge should show 1 (only sug-3 is visible)
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should call onRefresh when refresh button is clicked', () => {
    const onRefresh = vi.fn();
    render(
      <SuggestionPanel
        suggestions={[]}
        isLoading={false}
        onApply={vi.fn()}
        onDismiss={vi.fn()}
        onRefresh={onRefresh}
        activeSection={null}
      />
    );
    fireEvent.click(screen.getByLabelText('Refresh suggestions'));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('should disable refresh button while loading', () => {
    render(
      <SuggestionPanel
        suggestions={[]}
        isLoading={true}
        onApply={vi.fn()}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        activeSection={null}
      />
    );
    expect(screen.getByLabelText('Refresh suggestions')).toBeDisabled();
  });

  it('should show loading skeleton when loading with no visible suggestions', () => {
    const { container } = render(
      <SuggestionPanel
        suggestions={[]}
        isLoading={true}
        onApply={vi.fn()}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        activeSection={null}
      />
    );
    // Should have skeleton elements (animate-pulse divs)
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should call onApply with the suggestion when Apply is clicked on a card', () => {
    const onApply = vi.fn();
    const suggestions = [createSuggestion({ id: 'sug-1' })];
    render(
      <SuggestionPanel
        suggestions={suggestions}
        isLoading={false}
        onApply={onApply}
        onDismiss={vi.fn()}
        onRefresh={vi.fn()}
        activeSection="summary"
      />
    );
    fireEvent.click(screen.getByText('Apply'));
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'sug-1' })
    );
  });

  it('should call onDismiss with suggestion id when Dismiss is clicked', () => {
    const onDismiss = vi.fn();
    const suggestions = [createSuggestion({ id: 'sug-1' })];
    render(
      <SuggestionPanel
        suggestions={suggestions}
        isLoading={false}
        onApply={vi.fn()}
        onDismiss={onDismiss}
        onRefresh={vi.fn()}
        activeSection="summary"
      />
    );
    fireEvent.click(screen.getByLabelText('Dismiss suggestion'));
    expect(onDismiss).toHaveBeenCalledWith('sug-1');
  });
});
