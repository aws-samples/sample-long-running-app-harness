import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:6174';

test('clicking project card navigates to board', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');

  // Click on a project card
  const projectCard = page.locator('button').filter({ hasText: 'E2E Attachment' }).first();
  await expect(projectCard).toBeVisible({ timeout: 10000 });
  await projectCard.click();
  await page.waitForTimeout(1000);

  // Should be on the board view
  await expect(page.locator('h1').filter({ hasText: 'Board' })).toBeVisible({ timeout: 5000 });
});

test('keyboard shortcut Escape closes modals', async ({ page }) => {
  await page.goto(`${BASE}/project/411e733c-c843-4510-b323-c37614a27ca6/board`);
  await page.waitForLoadState('networkidle');

  // Open create modal
  await page.locator('header').locator('text=Create').click();
  await page.waitForTimeout(300);
  await expect(page.locator('text=Create Issue').first()).toBeVisible();

  // Press Escape to close
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Summary input should not be visible (modal is gone)
  await expect(page.locator('input[placeholder="What needs to be done?"]')).not.toBeVisible({ timeout: 3000 });
});

test('search modal shows results', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');

  // Open search
  await page.locator('text=Search issues').click();
  await page.waitForTimeout(300);

  // Type a search query
  await page.locator('input[placeholder*="Search"]').last().fill('test');
  await page.waitForTimeout(1500); // Wait for debounce + API response

  // Should show results
  await expect(page.locator('text=Issues').last()).toBeVisible({ timeout: 5000 });
});
