import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:6174';
const PROJECT_ID = '411e733c-c843-4510-b323-c37614a27ca6';

test('create issue flow - opens modal, fills form, submits, sees issue', async ({ page }) => {
  await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
  await page.waitForLoadState('networkidle');

  // Click Create button
  await page.locator('header').locator('text=Create').click();
  await page.waitForTimeout(500);

  // Should see modal
  await expect(page.locator('text=Create Issue').first()).toBeVisible({ timeout: 5000 });

  // Fill in summary
  const uniqueSummary = `E2E Test Issue ${Date.now()}`;
  await page.locator('input[placeholder="What needs to be done?"]').fill(uniqueSummary);

  // Select type as Bug
  await page.locator('select').first().selectOption('Bug');

  // Select priority as High
  await page.locator('select').nth(1).selectOption('High');

  // Fill description
  await page.locator('textarea[placeholder*="Add details"]').fill('This is an automated e2e test issue');

  // Submit
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);

  // The toast should show success
  // The modal should close
  // The new issue should appear on the board
  await expect(page.locator(`text=${uniqueSummary}`).first()).toBeVisible({ timeout: 10000 });
});
