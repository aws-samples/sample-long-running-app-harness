import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:6174';

test.describe('Canopy App', () => {
  test('homepage loads with dashboard', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Welcome to Canopy')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Active Projects')).toBeVisible();
  });

  test('can navigate to create project', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    // Click New Project button
    await page.locator('text=New Project').first().click();
    await expect(page.locator('text=Create New Project')).toBeVisible({ timeout: 5000 });
  });

  test('search modal opens and closes', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    // Click search bar
    await page.locator('text=Search issues').click();
    await expect(page.locator('input[placeholder*="Search"]').last()).toBeVisible({ timeout: 5000 });
    // Close with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('project cards navigate to board', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    // Click first project card (if any)
    const cards = page.locator('button').filter({ hasText: /issues.*Updated/ });
    const count = await cards.count();
    if (count > 0) {
      await cards.first().click();
      await page.waitForTimeout(1000);
      await expect(page.locator('text=Board').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('dark mode toggle works', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    // Toggle dark mode
    await page.locator('header button[title*="dark"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('html')).toHaveClass(/dark/);
    // Toggle back
    await page.locator('header button[title*="light"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});
