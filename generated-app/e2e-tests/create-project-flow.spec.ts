import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:6174';

test('create project flow - fills form, submits, navigates to board', async ({ page }) => {
  await page.goto(`${BASE}/projects/new`);
  await page.waitForLoadState('networkidle');

  // Fill in project name
  await page.locator('input[placeholder*="My Awesome"]').fill('Test Project from E2E');
  await page.waitForTimeout(300);

  // Key should auto-generate
  const keyInput = page.locator('input[class*="uppercase"]');
  const keyValue = await keyInput.inputValue();
  expect(keyValue.length).toBeGreaterThan(0);

  // Fill description
  await page.locator('textarea[placeholder*="What"]').fill('Created from end-to-end test');

  // Select a color (the color swatches are rounded-lg buttons with background-color)
  const colorSwatches = page.locator('button.rounded-lg[style*="background-color"]');
  const swatchCount = await colorSwatches.count();
  if (swatchCount > 2) {
    await colorSwatches.nth(2).click();
  }

  // Submit
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);

  // Should navigate to the board view
  await expect(page.locator('text=Board').first()).toBeVisible({ timeout: 10000 });
});
