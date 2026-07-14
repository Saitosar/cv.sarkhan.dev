import { test, expect } from '@playwright/test';

test.describe('AI Chat', () => {
  test('should return 200 on chat request', async ({ request }) => {
    const response = await request.post('/api/ai/route', {
      data: { message: 'Hello', task: 'analyze' }
    });
    expect(response.status()).toBe(200);
  });
});
