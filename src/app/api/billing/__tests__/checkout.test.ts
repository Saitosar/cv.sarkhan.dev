// src/app/api/billing/__tests__/checkout.test.ts
// RED: Tests for Stripe Checkout — implementation does not exist yet
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock NextResponse
const mockJson = vi.fn();
vi.mock('next/server', () => ({
  NextResponse: {
    json: (...args: unknown[]) => {
      mockJson(...args);
      const status = (args[1] as { status?: number } | undefined)?.status ?? 200;
      return {
        json: () => Promise.resolve(args[0]),
        status,
        ok: status < 400,
      } as unknown as Response;
    },
  },
}));

// Mock stripe
vi.mock('stripe', () => {
  const mockStripe = {
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
    customers: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
    subscriptions: {
      retrieve: vi.fn(),
      update: vi.fn(),
      cancel: vi.fn(),
    },
  };
  return {
    default: vi.fn(() => mockStripe),
  };
});

// Mock next-auth for session
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
  auth: vi.fn(),
}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    subscription: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('POST /api/billing/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockJson.mockClear();
  });

  describe('authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { auth } = await import('next-auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { POST } = await import('../checkout/route');
      const req = {
        json: () => Promise.resolve({ priceId: 'price_123', plan: 'pro' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });
  });

  describe('validation', () => {
    it('should return 400 when priceId is missing', async () => {
      const { auth } = await import('next-auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 'user-1' } });

      const { POST } = await import('../checkout/route');
      const req = {
        json: () => Promise.resolve({ plan: 'pro' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('priceId');
    });

    it('should return 400 when plan is missing', async () => {
      const { auth } = await import('next-auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 'user-1' } });

      const { POST } = await import('../checkout/route');
      const req = {
        json: () => Promise.resolve({ priceId: 'price_123' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('plan');
    });

    it('should return 400 when plan is invalid', async () => {
      const { auth } = await import('next-auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 'user-1' } });

      const { POST } = await import('../checkout/route');
      const req = {
        json: () => Promise.resolve({ priceId: 'price_123', plan: 'invalid-plan' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('plan');
    });
  });

  describe('Stripe session creation', () => {
    it('should create a Stripe checkout session', async () => {
      const { auth } = await import('next-auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 'user-1', email: 'test@example.com' } });

      const Stripe = await import('stripe');
      const stripe = new Stripe.default();
      (stripe.checkout.sessions.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });

      const { POST } = await import('../checkout/route');
      const req = {
        json: () => Promise.resolve({ priceId: 'price_pro_monthly', plan: 'pro' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(data).toHaveProperty('sessionId', 'cs_test_123');
      expect(data).toHaveProperty('url', 'https://checkout.stripe.com/pay/cs_test_123');
    });

    it('should pass correct line items to Stripe', async () => {
      const { auth } = await import('next-auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 'user-1', email: 'test@example.com' } });

      const Stripe = await import('stripe');
      const stripe = new Stripe.default();
      (stripe.checkout.sessions.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });

      const { POST } = await import('../checkout/route');
      const req = {
        json: () => Promise.resolve({ priceId: 'price_pro_monthly', plan: 'pro' }),
      } as unknown as Request;

      await POST(req);

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: expect.arrayContaining([
            expect.objectContaining({ price: 'price_pro_monthly' }),
          ]),
          mode: 'subscription',
        })
      );
    });

    it('should include success and cancel URLs', async () => {
      const { auth } = await import('next-auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 'user-1', email: 'test@example.com' } });

      const Stripe = await import('stripe');
      const stripe = new Stripe.default();
      (stripe.checkout.sessions.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });

      const { POST } = await import('../checkout/route');
      const req = {
        json: () => Promise.resolve({ priceId: 'price_pro_monthly', plan: 'pro' }),
      } as unknown as Request;

      await POST(req);

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: expect.stringContaining('http'),
          cancel_url: expect.stringContaining('http'),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should return 500 when Stripe session creation fails', async () => {
      const { auth } = await import('next-auth');
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 'user-1', email: 'test@example.com' } });

      const Stripe = await import('stripe');
      const stripe = new Stripe.default();
      (stripe.checkout.sessions.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Stripe API error')
      );

      const { POST } = await import('../checkout/route');
      const req = {
        json: () => Promise.resolve({ priceId: 'price_pro_monthly', plan: 'pro' }),
      } as unknown as Request;

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});

describe('POST /api/billing/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle checkout.session.completed event', async () => {
    const Stripe = await import('stripe');
    const stripe = new Stripe.default();
    (stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          client_reference_id: 'user-1',
          subscription: 'sub_123',
          customer: 'cus_123',
          mode: 'subscription',
        },
      },
    });

    const { prisma } = await import('@/lib/db/prisma');
    (prisma.subscription.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'sub-db-1',
      userId: 'user-1',
      stripeSubscriptionId: 'sub_123',
      status: 'active',
    });

    const { POST } = await import('../checkout/webhook/route');
    const req = {
      text: () => Promise.resolve(JSON.stringify({ id: 'evt_123' })),
      headers: { get: vi.fn(() => 'whsec_test') },
    } as unknown as Request;

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('received', true);
  });

  it('should handle invoice.payment_failed event', async () => {
    const Stripe = await import('stripe');
    const stripe = new Stripe.default();
    (stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockReturnValue({
      type: 'invoice.payment_failed',
      data: {
        object: {
          subscription: 'sub_123',
        },
      },
    });

    const { prisma } = await import('@/lib/db/prisma');
    (prisma.subscription.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'sub-db-1',
      status: 'past_due',
    });

    const { POST } = await import('../checkout/webhook/route');
    const req = {
      text: () => Promise.resolve(JSON.stringify({ id: 'evt_456' })),
      headers: { get: vi.fn(() => 'whsec_test') },
    } as unknown as Request;

    const response = await POST(req);
    expect(response.status).toBe(200);
  });

  it('should return 400 when webhook signature is invalid', async () => {
    const Stripe = await import('stripe');
    const stripe = new Stripe.default();
    (stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature');
    });

    const { POST } = await import('../checkout/webhook/route');
    const req = {
      text: () => Promise.resolve(JSON.stringify({ id: 'evt_789' })),
      headers: { get: vi.fn(() => 'invalid-signature') },
    } as unknown as Request;

    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});
