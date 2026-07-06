// src/components/__tests__/MatchScoreBadge.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MatchScoreBadge from '../JobSearch/MatchScoreBadge';

describe('MatchScoreBadge', () => {
  it('should render the score number', () => {
    render(<MatchScoreBadge score={85} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('should render excellent match for score >= 80', () => {
    render(<MatchScoreBadge score={92} />);
    const badge = screen.getByTitle('Excellent match');
    expect(badge).toBeInTheDocument();
  });

  it('should render good match for score 60-79', () => {
    render(<MatchScoreBadge score={65} />);
    const badge = screen.getByTitle('Good match');
    expect(badge).toBeInTheDocument();
  });

  it('should render fair match for score 40-59', () => {
    render(<MatchScoreBadge score={50} />);
    const badge = screen.getByTitle('Fair match');
    expect(badge).toBeInTheDocument();
  });

  it('should render low match for score < 40', () => {
    render(<MatchScoreBadge score={25} />);
    const badge = screen.getByTitle('Low match');
    expect(badge).toBeInTheDocument();
  });

  it('should clamp score to 0-100 range', () => {
    render(<MatchScoreBadge score={-10} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should clamp score above 100', () => {
    render(<MatchScoreBadge score={150} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should render with sm size', () => {
    const { container } = render(<MatchScoreBadge score={75} size="sm" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('w-12');
  });

  it('should render with md size by default', () => {
    const { container } = render(<MatchScoreBadge score={75} />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('w-16');
  });

  it('should render score 0 correctly', () => {
    render(<MatchScoreBadge score={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    const badge = screen.getByTitle('Low match');
    expect(badge).toBeInTheDocument();
  });

  it('should render score 100 correctly', () => {
    render(<MatchScoreBadge score={100} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    const badge = screen.getByTitle('Excellent match');
    expect(badge).toBeInTheDocument();
  });
});
