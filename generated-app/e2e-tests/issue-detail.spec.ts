import { test, expect } from '@playwright/test';

test('issue detail panel shows enhanced fields', async ({ page }) => {
  await page.goto('http://localhost:6174/project/411e733c-c843-4510-b323-c37614a27ca6/board');
  await page.waitForLoadState('networkidle');

  const firstCard = page.locator('[class*="bg-card-bg rounded-lg p-3"]').first();
  await firstCard.click();

  const panel = page.locator('[class*="animate-slide-in-right"]');
  await expect(panel).toBeVisible({ timeout: 5000 });

  await page.screenshot({ path: 'screenshots/issue-87/issue-detail-enhanced.png', fullPage: false });

  // Verify sidebar fields in the detail panel
  await expect(panel.getByText('Assignee')).toBeVisible();
  await expect(panel.getByText('Reporter')).toBeVisible();
  await expect(panel.getByText('Priority')).toBeVisible();
  await expect(panel.getByText('Story Points')).toBeVisible();
  await expect(panel.getByText('Sprint', { exact: true })).toBeVisible();
  await expect(panel.getByText('Labels', { exact: true })).toBeVisible();

  // Verify activity tabs
  await expect(panel.getByText('Comments')).toBeVisible();
  await expect(panel.getByText('History')).toBeVisible();
});
