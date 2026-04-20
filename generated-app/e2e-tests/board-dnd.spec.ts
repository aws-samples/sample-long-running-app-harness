import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:6174';
const PROJECT_ID = '411e733c-c843-4510-b323-c37614a27ca6';

test('board shows all 4 columns', async ({ page }) => {
  await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
  await page.waitForLoadState('networkidle');

  // Verify all 4 columns
  await expect(page.locator('text=To Do').first()).toBeVisible({ timeout: 10000 });
  await expect(page.locator('text=In Progress').first()).toBeVisible({ timeout: 5000 });
  await expect(page.locator('text=In Review').first()).toBeVisible({ timeout: 5000 });
  await expect(page.locator('text=Done').first()).toBeVisible({ timeout: 5000 });
});

test('board has filter input', async ({ page }) => {
  await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
  await page.waitForLoadState('networkidle');

  const filterInput = page.locator('input[placeholder*="Filter"]');
  await expect(filterInput).toBeVisible({ timeout: 10000 });

  // Type a filter
  await filterInput.fill('EAT-1');
  await page.waitForTimeout(500);

  // Should still see EAT-1
  await expect(page.locator('text=EAT-1').first()).toBeVisible({ timeout: 5000 });
});

test('board has create button', async ({ page }) => {
  await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
  await page.waitForLoadState('networkidle');

  // The board should have its own Create button
  const createBtn = page.locator('main').locator('button').filter({ hasText: 'Create' });
  await expect(createBtn.first()).toBeVisible({ timeout: 10000 });
});
