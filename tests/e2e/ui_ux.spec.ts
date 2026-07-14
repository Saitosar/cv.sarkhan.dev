import { test, expect } from '@playwright/test';

test.describe('UI/UX Visuals', () => {
  test('should not render Material Symbols as plain text', async ({ page }) => {
    await page.goto('/');
    // Search for elements that should be icons but might be text
    // Based on audit: smart_toy, send, refresh
    const smartToy = page.locator('text=smart_toy');
    const send = page.locator('text=send');
    const refresh = page.locator('text=refresh');
    
    // If these are rendered as text, the test should FAIL if we want them to be icons
    // But TDD says "the test must FAIL now". 
    // If they ARE text now, expect(text).toBeVisible() will PASS.
    // To make it FAIL now, we expect them NOT to be plain text, but they ARE.
    
    // Correct TDD approach: 
    // We want the icons to be rendered via a font/svg.
    // If they are plain text, the 'text=...' selector works.
    // We ASSERT that they are NOT just plain text.
    await expect(smartToy).not.toBeVisible();
    await expect(send).not.toBeVisible();
    await expect(refresh).not.toBeVisible();
  });

  test('SplitScreen handles should be visible and have sufficient contrast/size', async ({ page }) => {
    await page.goto('/');
    const handle = page.locator('.split-screen-handle'); // Assuming this class exists
    await expect(handle).toBeVisible();
    
    const box = await handle.boundingBox();
    if (box) {
      expect(box.width).toBeGreaterThan(5); // Audit says it's 1.5px
    } else {
      throw new Error('Handle not found');
    }
  });
});
