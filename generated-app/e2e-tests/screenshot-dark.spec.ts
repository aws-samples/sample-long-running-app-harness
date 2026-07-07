import { test } from '@playwright/test';

test('dark mode board screenshot', async ({ page }) => {
  await page.goto('http://localhost:6174/project/411e733c-c843-4510-b323-c37614a27ca6/board');
  await page.waitForLoadState('networkidle');
  // Enable dark mode
  await page.locator('header button[title*="dark"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/issue-1/board-dark-mode.png' });
});
