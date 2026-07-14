import { test, expect } from '@playwright/test';

test.describe('Auth Routes', () => {
  test('should return 200 for /login', async ({ request }) => {
    const response = await request.get('/login');
    expect(response.status()).toBe(200);
  });

  test('should return 200 for /register', async ({ request }) => {
    const response = await request.get('/register');
    expect(response.status()).toBe(200);
  });
});
