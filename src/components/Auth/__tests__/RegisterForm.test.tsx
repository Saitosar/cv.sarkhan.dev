// src/components/Auth/__tests__/RegisterForm.test.tsx
// RED: Tests for RegisterForm component — implementation does not exist yet
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

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render name input field', async () => {
      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);
      expect(screen.getByLabelText(/name|full name/i)).toBeInTheDocument();
    });

    it('should render email input field', async () => {
      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should render password input field', async () => {
      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should render confirm password input field', async () => {
      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);
      expect(screen.getByLabelText(/confirm password|repeat password/i)).toBeInTheDocument();
    });

    it('should render submit button', async () => {
      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);
      expect(screen.getByRole('button', { name: /create account|sign up|register/i })).toBeInTheDocument();
    });

    it('should render link to login page', async () => {
      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);
      expect(screen.getByRole('link', { name: /sign in|log in|have an account/i })).toBeInTheDocument();
    });

    it('should render OAuth buttons section', async () => {
      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);
      expect(screen.getByText(/or continue with/i)).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('should show error when name is empty on submit', async () => {
      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);
      fireEvent.click(screen.getByRole('button', { name: /create account|sign up|register/i }));
      await waitFor(() => {
        expect(screen.getByText(/name.*required/i)).toBeInTheDocument();
      });
    });

    it('should show error when email is empty on submit', async () => {
      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);
      const nameInput = screen.getByLabelText(/name|full name/i);
      await userEvent.type(nameInput, 'Test User');
      fireEvent.click(screen.getByRole('button', { name: /create account|sign up|register/i }));
      await waitFor(() => {
        expect(screen.getByText(/email.*required/i)).toBeInTheDocument();
      });
    });

    it('should show error when email format is invalid', async () => {
      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);
      const nameInput = screen.getByLabelText(/name|full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'not-an-email');
      fireEvent.click(screen.getByRole('button', { name: /create account|sign up|register/i }));
      await waitFor(() => {
        expect(screen.getByText(/invalid.*email|valid.*email/i)).toBeInTheDocument();
      });
    });

    it('should show error when password is too short', async () => {
      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);
      const nameInput = screen.getByLabelText(/name|full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Ab1!');
      fireEvent.click(screen.getByRole('button', { name: /create account|sign up|register/i }));
      await waitFor(() => {
        expect(screen.getByText(/password.*(short|min|8|characters)/i)).toBeInTheDocument();
      });
    });

    it('should show error when passwords do not match', async () => {
      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);
      const nameInput = screen.getByLabelText(/name|full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmInput = screen.getByLabelText(/confirm password|repeat password/i);
      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Password123!');
      await userEvent.type(confirmInput, 'DifferentPassword123!');
      fireEvent.click(screen.getByRole('button', { name: /create account|sign up|register/i }));
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match|must match/i)).toBeInTheDocument();
      });
    });
  });

  describe('submission', () => {
    it('should call register API on valid form submit', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ user: { id: 'new-user', email: 'test@example.com', name: 'Test User' } }),
      });

      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/name|full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmInput = screen.getByLabelText(/confirm password|repeat password/i);

      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Password123!');
      await userEvent.type(confirmInput, 'Password123!');
      fireEvent.click(screen.getByRole('button', { name: /create account|sign up|register/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/register'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('test@example.com'),
          })
        );
      });
    });

    it('should redirect on successful registration', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ user: { id: 'new-user', email: 'test@example.com', name: 'Test User' } }),
      });

      const mockPush = vi.fn();
      vi.mocked(await import('next/navigation')).useRouter.mockReturnValue({
        push: mockPush,
        replace: vi.fn(),
        back: vi.fn(),
      });

      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/name|full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmInput = screen.getByLabelText(/confirm password|repeat password/i);

      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Password123!');
      await userEvent.type(confirmInput, 'Password123!');
      fireEvent.click(screen.getByRole('button', { name: /create account|sign up|register/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });
  });

  describe('loading state', () => {
    it('should disable submit button while loading', async () => {
      global.fetch = vi.fn(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, status: 201, json: () => Promise.resolve({}) }), 1000))
      );

      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/name|full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmInput = screen.getByLabelText(/confirm password|repeat password/i);

      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Password123!');
      await userEvent.type(confirmInput, 'Password123!');
      fireEvent.click(screen.getByRole('button', { name: /create account|sign up|register/i }));

      expect(screen.getByRole('button', { name: /creating|loading|please wait/i })).toBeDisabled();
    });
  });

  describe('error state', () => {
    it('should display error when email already exists', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: 'Email already exists' }),
      });

      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/name|full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmInput = screen.getByLabelText(/confirm password|repeat password/i);

      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'existing@example.com');
      await userEvent.type(passwordInput, 'Password123!');
      await userEvent.type(confirmInput, 'Password123!');
      fireEvent.click(screen.getByRole('button', { name: /create account|sign up|register/i }));

      await waitFor(() => {
        expect(screen.getByText(/already exists|already registered/i)).toBeInTheDocument();
      });
    });

    it('should display generic error on network failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/name|full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmInput = screen.getByLabelText(/confirm password|repeat password/i);

      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Password123!');
      await userEvent.type(confirmInput, 'Password123!');
      fireEvent.click(screen.getByRole('button', { name: /create account|sign up|register/i }));

      await waitFor(() => {
        expect(screen.getByText(/something went wrong|network error/i)).toBeInTheDocument();
      });
    });

    it('should display validation errors from API', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Password must be at least 8 characters' }),
      });

      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);

      const nameInput = screen.getByLabelText(/name|full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmInput = screen.getByLabelText(/confirm password|repeat password/i);

      await userEvent.type(nameInput, 'Test User');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'Short1!');
      await userEvent.type(confirmInput, 'Short1!');
      fireEvent.click(screen.getByRole('button', { name: /create account|sign up|register/i }));

      await waitFor(() => {
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('password visibility toggle', () => {
    it('should toggle password visibility', async () => {
      const RegisterForm = (await import('../RegisterForm')).default;
      render(<RegisterForm />);
      const toggleButtons = screen.getAllByRole('button', { name: /show|hide|toggle.*password/i });
      expect(toggleButtons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
