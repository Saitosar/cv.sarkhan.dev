// src/components/__tests__/ModeToggle.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ModeToggle from '../ChatPanel/ModeToggle';

describe('ModeToggle', () => {
  it('should render both mode buttons', () => {
    render(<ModeToggle mode="aether" onChange={vi.fn()} />);
    expect(screen.getByText('Aether')).toBeInTheDocument();
    expect(screen.getByText('HR Coach')).toBeInTheDocument();
  });

  it('should mark the active mode as pressed', () => {
    render(<ModeToggle mode="aether" onChange={vi.fn()} />);
    const aetherBtn = screen.getByText('Aether').closest('button');
    const hrCoachBtn = screen.getByText('HR Coach').closest('button');
    expect(aetherBtn).toHaveAttribute('aria-selected', 'true');
    expect(hrCoachBtn).toHaveAttribute('aria-selected', 'false');
  });

  it('should mark HR Coach as pressed when mode is hr-coach', () => {
    render(<ModeToggle mode="hr-coach" onChange={vi.fn()} />);
    const aetherBtn = screen.getByText('Aether').closest('button');
    const hrCoachBtn = screen.getByText('HR Coach').closest('button');
    expect(aetherBtn).toHaveAttribute('aria-selected', 'false');
    expect(hrCoachBtn).toHaveAttribute('aria-selected', 'true');
  });

  it('should call onChange with the new mode when aether is clicked', () => {
    const onChange = vi.fn();
    render(<ModeToggle mode="hr-coach" onChange={onChange} />);
    fireEvent.click(screen.getByText('Aether'));
    expect(onChange).toHaveBeenCalledWith('aether');
  });

  it('should call onChange with hr-coach when HR Coach is clicked', () => {
    const onChange = vi.fn();
    render(<ModeToggle mode="aether" onChange={onChange} />);
    fireEvent.click(screen.getByText('HR Coach'));
    expect(onChange).toHaveBeenCalledWith('hr-coach');
  });

  it('should have title attributes with descriptions', () => {
    render(<ModeToggle mode="aether" onChange={vi.fn()} />);
    const aetherBtn = screen.getByText('Aether').closest('button');
    const hrCoachBtn = screen.getByText('HR Coach').closest('button');
    expect(aetherBtn).toHaveAttribute('title');
    expect(hrCoachBtn).toHaveAttribute('title');
  });
});
