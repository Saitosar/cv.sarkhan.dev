// src/components/__tests__/SeverityBadge.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SeverityBadge from '../CanvasPanel/SeverityBadge';

describe('SeverityBadge', () => {
  it('should render high severity', () => {
    render(<SeverityBadge severity="high" />);
    const badge = screen.getByText('High');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('red');
  });

  it('should render medium severity', () => {
    render(<SeverityBadge severity="medium" />);
    const badge = screen.getByText('Medium');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('amber');
  });

  it('should render low severity', () => {
    render(<SeverityBadge severity="low" />);
    const badge = screen.getByText('Low');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('blue');
  });
});
