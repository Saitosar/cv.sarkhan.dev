// src/components/Auth/__tests__/LoginForm.test.tsx
// RED: Tests for LoginForm component — implementation does not exist yet
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render email input field', async () => {
      const LoginForm = (await import('../LoginForm')).default;
      render(<LoginForm />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should render password input field', async () => {
      const LoginForm = (await import('../LoginForm')).default;
      render(<LoginForm />);
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should render submit button', async () => {
      const LoginForm = (await import('../LoginForm')).default;
      render(<LoginForm />);
      expect(screen.getByRole('button', { name: /sign in|log in|login/i })).toBeInTheDocument();
    });

    it('should render link to registration page', async () => {
      const LoginForm = (await import('../LoginForm')).default;
      render(<LoginForm />);
      expect(screen.getByRole('link', { name: /register|sign up/i })).toBeInTheDocument();
    });

    it('should render OAuth buttons section', async () => {
      const LoginForm = (await import('../LoginForm')).default;
      render(<LoginForm />);
      expect(screen.getByText(/or continue with/i)).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('should show error when email is empty on submit', async () => {
      const LoginForm = (await import('../LoginForm')).default;
      render(<LoginForm />);
      fireEvent.click(screen.getByRole('button', { name: /sign in|log in|login/i }));
      await waitFor(() => {
        expect(screen.getByText(/email.*required|enter.*email/i)).toBeInTheDocument();
      });
    });

    it('should show error when email format is invalid', async () => {
      const LoginForm = (await import('../LoginForm')).default;
      render(<LoginForm />);
      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'not-an-email');
      fireEvent.click(screen.getByRole('button', { name: /sign in|log in|login/i }));
      await waitFor(() => {
        expect(screen.getByText(/invalid.*email|valid.*email/i)).toBeInTheDocument();
      });
    });

    it('should show error when password is empty on submit', async () => {
      const LoginForm = (await import('../LoginForm')).default;
      render(<LoginForm />);
      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(screen.getByRole('button', { name: /sign in|log in|login/i }));
      await waitFor(() => {
        expect(screen.getByText(/password.*required|enter.*password/i)).toBeInTheDocument();
      });
    });
  });

  describe('submission', () => {
    it('should call signIn with credentials on valid form submit', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, error: undefined });

      const LoginForm = (await import('../LoginForm')).default;
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Password123!');
      fireEvent.click(screen.getByRole('button', { name: /sign in|log in|login/i }));

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', expect.objectContaining({
          email: 'test@example.com',
          password: 'Password123!',
        }));
      });
    });

    it('should redirect on successful login', async () => {
      const { signIn } = await import('next-auth/react');
      const mockPush = vi.fn();
      vi.mocked(await import('next/navigation')).useRouter.mockReturnValue({
        push: mockPush,
        replace: vi.fn(),
        back: vi.fn(),
      });
      (signIn as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, error: undefined });

      const LoginForm = (await import('../LoginForm')).default;
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Password123!');
      fireEvent.click(screen.getByRole('button', { name: /sign in|log in|login/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });
  });

  describe('loading state', () => {
    it('should disable submit button while loading', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 1000))
      );

      const LoginForm = (await import('../LoginForm')).default;
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Password123!');
      fireEvent.click(screen.getByRole('button', { name: /sign in|log in|login/i }));

      expect(screen.getByRole('button', { name: /signing in|loading|please wait/i })).toBeDisabled();
    });

    it('should show loading indicator while submitting', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 1000))
      );

      const LoginForm = (await import('../LoginForm')).default;
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Password123!');
      fireEvent.click(screen.getByRole('button', { name: /sign in|log in|login/i }));

      expect(screen.getByRole('button', { name: /signing in|loading|please wait/i })).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should display error message when signIn returns error', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        error: 'Invalid credentials',
      });

      const LoginForm = (await import('../LoginForm')).default;
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Password123!');
      fireEvent.click(screen.getByRole('button', { name: /sign in|log in|login/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should display generic error on network failure', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      const LoginForm = (await import('../LoginForm')).default;
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Password123!');
      fireEvent.click(screen.getByRole('button', { name: /sign in|log in|login/i }));

      await waitFor(() => {
        expect(screen.getByText(/something went wrong|network error/i)).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        error: 'Invalid credentials',
      });

      const LoginForm = (await import('../LoginForm')).default;
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Password123!');
      fireEvent.click(screen.getByRole('button', { name: /sign in|log in|login/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      await userEvent.type(emailInput, 'new');

      await waitFor(() => {
        expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('password visibility toggle', () => {
    it('should toggle password visibility', async () => {
      const LoginForm = (await import('../LoginForm')).default;
      render(<LoginForm />);
      const toggleButton = screen.getByRole('button', { name: /show|hide|toggle.*password/i });
      expect(toggleButton).toBeInTheDocument();
    });
  });
});
