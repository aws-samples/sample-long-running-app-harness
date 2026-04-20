import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:6174';
const PROJECT_ID = '411e733c-c843-4510-b323-c37614a27ca6';

test('change issue status from detail panel', async ({ page }) => {
  await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
  await page.waitForLoadState('networkidle');

  // Click on EAT-2 to open detail panel
  await page.locator('text=EAT-2').first().click();
  await page.waitForTimeout(1000);

  // Status should be visible
  await expect(page.locator('button').filter({ hasText: 'In Progress' }).first()).toBeVisible({ timeout: 5000 });

  // Click "In Progress" to change status
  await page.locator('button').filter({ hasText: 'In Progress' }).first().click();
  await page.waitForTimeout(2000);

  // Success toast should appear
  await expect(page.locator('text=Status updated')).toBeVisible({ timeout: 5000 });

  // Change back to To Do
  await page.locator('button').filter({ hasText: 'To Do' }).first().click();
  await page.waitForTimeout(2000);
});

test('change issue priority from detail panel', async ({ page }) => {
  await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
  await page.waitForLoadState('networkidle');

  // Click on EAT-2 to open detail panel
  await page.locator('text=EAT-2').first().click();
  await page.waitForTimeout(1000);

  // Priority select should be visible
  const prioritySelect = page.locator('select').first();
  await expect(prioritySelect).toBeVisible({ timeout: 5000 });

  // Change priority
  await prioritySelect.selectOption('High');
  await page.waitForTimeout(1000);

  // Change back
  await prioritySelect.selectOption('Medium');
  await page.waitForTimeout(1000);
});
