// src/components/__tests__/SuggestionCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SuggestionCard from '../CanvasPanel/SuggestionCard';
import type { Suggestion } from '@/types/suggestions';

function createSuggestion(overrides?: Partial<Suggestion>): Suggestion {
  return {
    id: 'sug-1',
    type: 'missing_keywords',
    severity: 'high',
    title: 'Add more keywords',
    description: 'Your summary is missing key terms like "leadership" and "strategy"',
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

describe('SuggestionCard', () => {
  it('should render title and description', () => {
    const suggestion = createSuggestion();
    render(
      <SuggestionCard suggestion={suggestion} onApply={vi.fn()} onDismiss={vi.fn()} />
    );
    expect(screen.getByText('Add more keywords')).toBeInTheDocument();
    expect(
      screen.getByText('Your summary is missing key terms like "leadership" and "strategy"')
    ).toBeInTheDocument();
  });

  it('should render severity badge', () => {
    const suggestion = createSuggestion({ severity: 'high' });
    render(
      <SuggestionCard suggestion={suggestion} onApply={vi.fn()} onDismiss={vi.fn()} />
    );
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('should render ATS impact badge when present', () => {
    const suggestion = createSuggestion({ atsImpact: 7 });
    render(
      <SuggestionCard suggestion={suggestion} onApply={vi.fn()} onDismiss={vi.fn()} />
    );
    expect(screen.getByText('+7 ATS')).toBeInTheDocument();
  });

  it('should not render ATS impact badge when absent', () => {
    const suggestion = createSuggestion({ atsImpact: undefined });
    render(
      <SuggestionCard suggestion={suggestion} onApply={vi.fn()} onDismiss={vi.fn()} />
    );
    expect(screen.queryByText(/ATS/)).not.toBeInTheDocument();
  });

  it('should call onApply when Apply button is clicked', () => {
    const onApply = vi.fn();
    const suggestion = createSuggestion();
    render(
      <SuggestionCard suggestion={suggestion} onApply={onApply} onDismiss={vi.fn()} />
    );
    fireEvent.click(screen.getByText('Apply'));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('should call onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    const suggestion = createSuggestion();
    render(
      <SuggestionCard suggestion={suggestion} onApply={vi.fn()} onDismiss={onDismiss} />
    );
    fireEvent.click(screen.getByLabelText('Dismiss suggestion'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should render with medium severity', () => {
    const suggestion = createSuggestion({ severity: 'medium' });
    render(
      <SuggestionCard suggestion={suggestion} onApply={vi.fn()} onDismiss={vi.fn()} />
    );
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('should render with low severity', () => {
    const suggestion = createSuggestion({ severity: 'low' });
    render(
      <SuggestionCard suggestion={suggestion} onApply={vi.fn()} onDismiss={vi.fn()} />
    );
    expect(screen.getByText('Low')).toBeInTheDocument();
  });
});
