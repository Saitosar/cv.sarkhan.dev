// src/components/__tests__/JobSearchForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JobSearchForm from '../JobSearch/JobSearchForm';

describe('JobSearchForm', () => {
  const defaultProps = {
    query: '',
    location: '',
    onQueryChange: vi.fn(),
    onLocationChange: vi.fn(),
    onSearch: vi.fn(),
    isLoading: false,
  };

  it('should render query and location inputs', () => {
    render(<JobSearchForm {...defaultProps} />);
    expect(screen.getByLabelText('Job query')).toBeInTheDocument();
    expect(screen.getByLabelText('Job location')).toBeInTheDocument();
  });

  it('should render search button', () => {
    render(<JobSearchForm {...defaultProps} />);
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('should show Searching... text when loading', () => {
    render(<JobSearchForm {...defaultProps} isLoading={true} />);
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('should disable search button when query is empty', () => {
    render(<JobSearchForm {...defaultProps} query="" />);
    expect(screen.getByText('Search').closest('button')).toBeDisabled();
  });

  it('should enable search button when query is not empty', () => {
    render(<JobSearchForm {...defaultProps} query="engineer" />);
    expect(screen.getByText('Search').closest('button')).not.toBeDisabled();
  });

  it('should disable search button when loading', () => {
    render(<JobSearchForm {...defaultProps} query="engineer" isLoading={true} />);
    expect(screen.getByText('Searching...').closest('button')).toBeDisabled();
  });

  it('should call onQueryChange when query input changes', () => {
    const onQueryChange = vi.fn();
    render(<JobSearchForm {...defaultProps} onQueryChange={onQueryChange} />);
    fireEvent.change(screen.getByLabelText('Job query'), {
      target: { value: 'react' },
    });
    expect(onQueryChange).toHaveBeenCalledWith('react');
  });

  it('should call onLocationChange when location input changes', () => {
    const onLocationChange = vi.fn();
    render(<JobSearchForm {...defaultProps} onLocationChange={onLocationChange} />);
    fireEvent.change(screen.getByLabelText('Job location'), {
      target: { value: 'remote' },
    });
    expect(onLocationChange).toHaveBeenCalledWith('remote');
  });

  it('should call onSearch with trimmed values on submit', () => {
    const onSearch = vi.fn();
    render(
      <JobSearchForm
        {...defaultProps}
        query="  engineer  "
        location="  remote  "
        onSearch={onSearch}
      />
    );
    fireEvent.submit(screen.getByRole('button', { name: /search/i }).closest('form')!);
    expect(onSearch).toHaveBeenCalledWith({
      query: 'engineer',
      location: 'remote',
    });
  });

  it('should not call onSearch when query is empty', () => {
    const onSearch = vi.fn();
    render(<JobSearchForm {...defaultProps} query="" onSearch={onSearch} />);
    fireEvent.submit(screen.getByRole('button', { name: /search/i }).closest('form')!);
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('should not call onSearch when loading', () => {
    const onSearch = vi.fn();
    render(
      <JobSearchForm
        {...defaultProps}
        query="engineer"
        isLoading={true}
        onSearch={onSearch}
      />
    );
    fireEvent.submit(screen.getByRole('button', { name: /searching/i }).closest('form')!);
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('should display the current query value', () => {
    render(<JobSearchForm {...defaultProps} query="react developer" />);
    const input = screen.getByLabelText('Job query') as HTMLInputElement;
    expect(input.value).toBe('react developer');
  });

  it('should display the current location value', () => {
    render(<JobSearchForm {...defaultProps} location="Berlin" />);
    const input = screen.getByLabelText('Job location') as HTMLInputElement;
    expect(input.value).toBe('Berlin');
  });
});
