// src/components/__tests__/PricingToggle.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PricingToggle from '@/components/Billing/PricingToggle';

describe('PricingToggle', () => {
  it('should render Monthly and Yearly buttons', () => {
    render(<PricingToggle />);
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Yearly')).toBeInTheDocument();
  });

  it('should render Save 20% badge on Yearly', () => {
    render(<PricingToggle />);
    expect(screen.getByText('Save 20%')).toBeInTheDocument();
  });

  it('should default to monthly', () => {
    render(<PricingToggle />);
    const monthly = screen.getByText('Monthly');
    const yearly = screen.getByText('Yearly');
    expect(monthly).toHaveAttribute('aria-checked', 'true');
    expect(yearly).toHaveAttribute('aria-checked', 'false');
  });

  it('should use provided value', () => {
    render(<PricingToggle value="yearly" />);
    const monthly = screen.getByText('Monthly');
    const yearly = screen.getByText('Yearly');
    expect(monthly).toHaveAttribute('aria-checked', 'false');
    expect(yearly).toHaveAttribute('aria-checked', 'true');
  });

  it('should call onChange when clicking Yearly', () => {
    const onChange = vi.fn();
    render(<PricingToggle onChange={onChange} />);
    fireEvent.click(screen.getByText('Yearly'));
    expect(onChange).toHaveBeenCalledWith('yearly');
  });

  it('should call onChange when clicking Monthly after Yearly', () => {
    const onChange = vi.fn();
    render(<PricingToggle value="yearly" onChange={onChange} />);
    fireEvent.click(screen.getByText('Monthly'));
    expect(onChange).toHaveBeenCalledWith('monthly');
  });

  it('should have correct aria-label on the group', () => {
    render(<PricingToggle />);
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('aria-label', 'Billing cycle');
  });

  it('should have radio role on buttons', () => {
    render(<PricingToggle />);
    const buttons = screen.getAllByRole('radio');
    expect(buttons).toHaveLength(2);
  });
});
