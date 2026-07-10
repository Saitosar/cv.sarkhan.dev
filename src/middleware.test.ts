// src/middleware.test.ts
// RED: Tests for auth middleware — implementation does not exist yet
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/server
vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => ({ status: 200, ok: true })),
    redirect: vi.fn((url: string) => ({
      status: 307,
      headers: new Map([['Location', url]]),
      ok: false,
    })),
    json: vi.fn((body: unknown, init?: { status?: number }) => ({
      json: () => Promise.resolve(body),
      status: init?.status ?? 200,
      ok: (init?.status ?? 200) < 400,
    })),
  },
}));

// Mock next-auth/jwt
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('public routes', () => {
    it('should allow access to login page without token', async () => {
      const { getToken } = await import('next-auth/jwt');
      (getToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { middleware } = await import('@/middleware');
      const req = { nextUrl: { pathname: '/auth/login' }, url: 'http://localhost/auth/login' } as unknown as Request;
      const response = await middleware(req);
      expect(response.status).toBe(200);
    });

    it('should allow access to register page without token', async () => {
      const { getToken } = await import('next-auth/jwt');
      (getToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { middleware } = await import('@/middleware');
      const req = { nextUrl: { pathname: '/auth/register' }, url: 'http://localhost/auth/register' } as unknown as Request;
      const response = await middleware(req);
      expect(response.status).toBe(200);
    });

    it('should allow access to public API routes without token', async () => {
      const { getToken } = await import('next-auth/jwt');
      (getToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { middleware } = await import('@/middleware');
      const req = { nextUrl: { pathname: '/api/health' }, url: 'http://localhost/api/health' } as unknown as Request;
      const response = await middleware(req);
      expect(response.status).toBe(200);
    });

    it('should allow access to static files without token', async () => {
      const { getToken } = await import('next-auth/jwt');
      (getToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { middleware } = await import('@/middleware');
      const req = { nextUrl: { pathname: '/_next/static/chunks/main.js' }, url: 'http://localhost/_next/static/chunks/main.js' } as unknown as Request;
      const response = await middleware(req);
      expect(response.status).toBe(200);
    });

    it('should allow access to favicon without token', async () => {
      const { getToken } = await import('next-auth/jwt');
      (getToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { middleware } = await import('@/middleware');
      const req = { nextUrl: { pathname: '/favicon.ico' }, url: 'http://localhost/favicon.ico' } as unknown as Request;
      const response = await middleware(req);
      expect(response.status).toBe(200);
    });
  });

  describe('protected routes', () => {
    it('should redirect to login when accessing workspace without token', async () => {
      const { getToken } = await import('next-auth/jwt');
      (getToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { middleware } = await import('@/middleware');
      const req = { nextUrl: { pathname: '/workspace' }, url: 'http://localhost/workspace' } as unknown as Request;
      const response = await middleware(req);
      expect(response.status).toBe(307);
    });

    it('should allow access to workspace with valid token', async () => {
      const { getToken } = await import('next-auth/jwt');
      (getToken as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'user-1', email: 'test@example.com' });

      const { middleware } = await import('@/middleware');
      const req = { nextUrl: { pathname: '/workspace' }, url: 'http://localhost/workspace' } as unknown as Request;
      const response = await middleware(req);
      expect(response.status).toBe(200);
    });

    it('should redirect to login when accessing pricing without token', async () => {
      const { getToken } = await import('next-auth/jwt');
      (getToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { middleware } = await import('@/middleware');
      const req = { nextUrl: { pathname: '/pricing' }, url: 'http://localhost/pricing' } as unknown as Request;
      const response = await middleware(req);
      expect(response.status).toBe(307);
    });

    it('should allow access to pricing with valid token', async () => {
      const { getToken } = await import('next-auth/jwt');
      (getToken as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'user-1', email: 'test@example.com' });

      const { middleware } = await import('@/middleware');
      const req = { nextUrl: { pathname: '/pricing' }, url: 'http://localhost/pricing' } as unknown as Request;
      const response = await middleware(req);
      expect(response.status).toBe(200);
    });

    it('should redirect to login when accessing API routes without token', async () => {
      const { getToken } = await import('next-auth/jwt');
      (getToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { middleware } = await import('@/middleware');
      const req = { nextUrl: { pathname: '/api/assess' }, url: 'http://localhost/api/assess' } as unknown as Request;
      const response = await middleware(req);
      expect(response.status).toBe(307);
    });
  });

  describe('redirect behavior', () => {
    it('should include callbackUrl in redirect', async () => {
      const { getToken } = await import('next-auth/jwt');
      (getToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { middleware } = await import('@/middleware');
      const req = { nextUrl: { pathname: '/workspace' }, url: 'http://localhost/workspace' } as unknown as Request;
      const response = await middleware(req);
      const location = response.headers.get('Location');
      expect(location).toContain('/auth/login');
      expect(location).toContain('callbackUrl');
    });

    it('should preserve the original path in callbackUrl', async () => {
      const { getToken } = await import('next-auth/jwt');
      (getToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { middleware } = await import('@/middleware');
      const req = { nextUrl: { pathname: '/workspace' }, url: 'http://localhost/workspace' } as unknown as Request;
      const response = await middleware(req);
      const location = response.headers.get('Location');
      expect(location).toContain(encodeURIComponent('/workspace'));
    });
  });

  describe('config matcher', () => {
    it('should export config with matcher for protected routes', async () => {
      const { config } = await import('@/middleware');
      expect(config).toBeDefined();
      expect(config.matcher).toBeDefined();
      expect(Array.isArray(config.matcher)).toBe(true);
    });
  });
});
