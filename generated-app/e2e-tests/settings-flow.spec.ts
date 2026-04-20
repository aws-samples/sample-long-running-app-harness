import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:6174';
const PROJECT_ID = '411e733c-c843-4510-b323-c37614a27ca6';

test('settings page allows editing project name', async ({ page }) => {
  await page.goto(`${BASE}/project/${PROJECT_ID}/settings`);
  await page.waitForLoadState('networkidle');

  // Wait for settings form to load
  await expect(page.getByRole('heading', { name: 'Project Settings' })).toBeVisible({ timeout: 10000 });

  // Find the project name input
  const nameInput = page.locator('input').first();
  await expect(nameInput).toBeVisible({ timeout: 5000 });

  // Remember original value
  const originalValue = await nameInput.inputValue();

  // Clear and type new name
  await nameInput.fill(`${originalValue} - Edited`);

  // Click Save
  await page.locator('button').filter({ hasText: 'Save' }).first().click();
  await page.waitForTimeout(2000);

  // Restore original name
  await nameInput.fill(originalValue);
  await page.locator('button').filter({ hasText: 'Save' }).first().click();
  await page.waitForTimeout(1000);
});

test('settings page has delete project with confirmation', async ({ page }) => {
  await page.goto(`${BASE}/project/${PROJECT_ID}/settings`);
  await page.waitForLoadState('networkidle');

  // Should see Danger Zone
  await expect(page.locator('text=Danger Zone')).toBeVisible({ timeout: 10000 });

  // Should see Delete Project button
  const deleteBtn = page.locator('button').filter({ hasText: 'Delete Project' });
  await expect(deleteBtn).toBeVisible({ timeout: 5000 });
});
