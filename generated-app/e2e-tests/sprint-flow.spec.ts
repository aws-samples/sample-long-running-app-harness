import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:6174';
const PROJECT_ID = '411e733c-c843-4510-b323-c37614a27ca6';

test('create sprint from backlog view', async ({ page }) => {
  await page.goto(`${BASE}/project/${PROJECT_ID}/backlog`);
  await page.waitForLoadState('networkidle');

  // Click Create Sprint button
  await page.locator('button').filter({ hasText: 'Create Sprint' }).click();
  await page.waitForTimeout(2000);

  // Success toast should appear
  await expect(page.locator('text=Sprint created')).toBeVisible({ timeout: 5000 });
});

test('backlog shows issues and sprint sections', async ({ page }) => {
  await page.goto(`${BASE}/project/${PROJECT_ID}/backlog`);
  await page.waitForLoadState('networkidle');

  // Should see the Backlog section
  await expect(page.locator('text=Backlog').first()).toBeVisible({ timeout: 10000 });

  // Should see issue rows
  await expect(page.locator('text=EAT-1').first()).toBeVisible({ timeout: 5000 });

  // Should see the Create Issue button
  await expect(page.locator('button').filter({ hasText: 'Create Issue' }).first()).toBeVisible({ timeout: 5000 });
});
