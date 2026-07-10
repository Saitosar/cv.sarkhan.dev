// src/components/Auth/__tests__/OAuthButtons.test.tsx
// RED: Tests for OAuthButtons component — implementation does not exist yet
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

describe('OAuthButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render GitHub OAuth button', async () => {
      const OAuthButtons = (await import('../OAuthButtons')).default;
      render(<OAuthButtons />);
      expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument();
    });

    it('should render Google OAuth button', async () => {
      const OAuthButtons = (await import('../OAuthButtons')).default;
      render(<OAuthButtons />);
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    });

    it('should render GitHub icon', async () => {
      const OAuthButtons = (await import('../OAuthButtons')).default;
      render(<OAuthButtons />);
      const githubButton = screen.getByRole('button', { name: /github/i });
      expect(githubButton.innerHTML).toContain('svg');
    });

    it('should render Google icon', async () => {
      const OAuthButtons = (await import('../OAuthButtons')).default;
      render(<OAuthButtons />);
      const googleButton = screen.getByRole('button', { name: /google/i });
      expect(googleButton.innerHTML).toContain('svg');
    });
  });

  describe('interaction', () => {
    it('should call signIn with github provider on GitHub button click', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

      const OAuthButtons = (await import('../OAuthButtons')).default;
      render(<OAuthButtons />);

      fireEvent.click(screen.getByRole('button', { name: /github/i }));
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('github', expect.any(Object));
      });
    });

    it('should call signIn with google provider on Google button click', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

      const OAuthButtons = (await import('../OAuthButtons')).default;
      render(<OAuthButtons />);

      fireEvent.click(screen.getByRole('button', { name: /google/i }));
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('google', expect.any(Object));
      });
    });

    it('should pass callbackUrl to signIn', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

      const OAuthButtons = (await import('../OAuthButtons')).default;
      render(<OAuthButtons callbackUrl="/workspace" />);

      fireEvent.click(screen.getByRole('button', { name: /github/i }));
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('github', expect.objectContaining({
          callbackUrl: '/workspace',
        }));
      });
    });
  });

  describe('loading state', () => {
    it('should disable GitHub button while loading', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 1000))
      );

      const OAuthButtons = (await import('../OAuthButtons')).default;
      render(<OAuthButtons />);

      fireEvent.click(screen.getByRole('button', { name: /github/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /github/i })).toBeDisabled();
      });
    });

    it('should show loading indicator on clicked button', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 1000))
      );

      const OAuthButtons = (await import('../OAuthButtons')).default;
      render(<OAuthButtons />);

      fireEvent.click(screen.getByRole('button', { name: /github/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /github/i }).querySelector('[class*="spinner"], [class*="loading"]')).toBeTruthy();
      });
    });
  });

  describe('error state', () => {
    it('should display error when signIn fails', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        error: 'OAuthAccountNotLinked',
      });

      const OAuthButtons = (await import('../OAuthButtons')).default;
      render(<OAuthButtons />);

      fireEvent.click(screen.getByRole('button', { name: /github/i }));

      await waitFor(() => {
        expect(screen.getByText(/account.*not.*linked|already.*linked/i)).toBeInTheDocument();
      });
    });

    it('should display generic error on network failure', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      const OAuthButtons = (await import('../OAuthButtons')).default;
      render(<OAuthButtons />);

      fireEvent.click(screen.getByRole('button', { name: /github/i }));

      await waitFor(() => {
        expect(screen.getByText(/something went wrong|failed to sign in/i)).toBeInTheDocument();
      });
    });
  });

  describe('disabled state', () => {
    it('should disable all buttons when disabled prop is true', async () => {
      const OAuthButtons = (await import('../OAuthButtons')).default;
      render(<OAuthButtons disabled />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });
});
