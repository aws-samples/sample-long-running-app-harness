import { test, expect } from '@playwright/test';

test('dark mode dashboard screenshot', async ({ page }) => {
  await page.goto('http://localhost:6174');
  await page.waitForLoadState('networkidle');
  const darkToggle = page.locator('header button[title*="dark"], header button[title*="light"]');
  await darkToggle.click();
  await page.waitForTimeout(500);
  const html = page.locator('html');
  const hasDark = await html.evaluate(el => el.classList.contains('dark'));
  if (!hasDark) {
    await darkToggle.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: 'screenshots/issue-87/dark-dashboard.png' });
});

test('dark mode labels page screenshot', async ({ page }) => {
  await page.goto('http://localhost:6174/project/411e733c-c843-4510-b323-c37614a27ca6/labels');
  await page.waitForLoadState('networkidle');
  const darkToggle = page.locator('header button[title*="dark"], header button[title*="light"]');
  await darkToggle.click();
  await page.waitForTimeout(500);
  const html = page.locator('html');
  const hasDark = await html.evaluate(el => el.classList.contains('dark'));
  if (!hasDark) {
    await darkToggle.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: 'screenshots/issue-87/dark-labels.png' });
});
