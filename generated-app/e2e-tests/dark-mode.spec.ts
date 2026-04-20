import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:6174';

test('dark mode toggle works', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');

  // Initially should be light mode
  const html = page.locator('html');
  await expect(html).not.toHaveClass(/dark/);

  // Click the moon icon to toggle dark mode
  await page.locator('header button[title*="dark"]').click();
  await page.waitForTimeout(500);

  // Should now have dark class
  await expect(html).toHaveClass(/dark/);

  // Background should be dark
  const body = page.locator('body');
  const bgColor = await body.evaluate((el) => getComputedStyle(el).backgroundColor);
  // Dark background should not be white
  expect(bgColor).not.toBe('rgb(250, 249, 246)');

  // Take screenshot in dark mode
  await page.screenshot({ path: 'screenshots/issue-1/dark-mode.png' });

  // Toggle back to light
  await page.locator('header button[title*="light"]').click();
  await page.waitForTimeout(500);
  await expect(html).not.toHaveClass(/dark/);
});
