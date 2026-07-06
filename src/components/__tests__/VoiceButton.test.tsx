// src/components/__tests__/VoiceButton.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VoiceButton from '../ChatPanel/VoiceButton';

describe('VoiceButton', () => {
  it('should render in idle state with mic icon', () => {
    render(<VoiceButton state="idle" onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.getAttribute('title')).toBe('Voice input');
  });

  it('should render in listening state with pulse class', () => {
    render(<VoiceButton state="listening" onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('title')).toBe('Listening... click to stop');
    expect(button.className).toContain('voice-pulse');
  });

  it('should render in processing state with spinner', () => {
    render(<VoiceButton state="processing" onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('title')).toBe('Processing...');
  });

  it('should render in error state with mic off icon', () => {
    render(<VoiceButton state="error" onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('title')).toBe('Voice input failed. Try again.');
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<VoiceButton state="idle" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<VoiceButton state="idle" onClick={vi.fn()} disabled={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should not be disabled by default', () => {
    render(<VoiceButton state="idle" onClick={vi.fn()} />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('should have aria-label matching tooltip', () => {
    render(<VoiceButton state="listening" onClick={vi.fn()} />);
    expect(screen.getByLabelText('Listening... click to stop')).toBeInTheDocument();
  });
});
