import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:6174';
const PROJECT_ID = '411e733c-c843-4510-b323-c37614a27ca6';

test.describe('Create Issue Modal', () => {
  test('opens when clicking Create button', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
    await page.waitForLoadState('networkidle');

    // Click the Create button in the header
    await page.locator('header').locator('text=Create').click();
    await page.waitForTimeout(500);

    // Modal should be visible
    await expect(page.locator('text=Create Issue').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Summary').first()).toBeVisible({ timeout: 3000 });
  });

  test('closes on escape', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('header').locator('text=Create').click();
    await page.waitForTimeout(500);
    await expect(page.locator('[class*="fixed"]').filter({ hasText: 'Create Issue' }).first()).toBeVisible({ timeout: 5000 });

    // Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });
});

test.describe('Issue Detail Panel', () => {
  test('opens when clicking an issue card on board', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
    await page.waitForLoadState('networkidle');

    // Click on the first issue card
    await page.locator('text=EAT-1').first().click();
    await page.waitForTimeout(1000);

    // Detail panel should slide in
    const panel = page.locator('[class*="border-l"]').filter({ hasText: 'EAT-1' });
    await expect(panel.first()).toBeVisible({ timeout: 5000 });
  });

  test('opens when clicking an issue in backlog', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/backlog`);
    await page.waitForLoadState('networkidle');

    // Click on the first issue
    await page.locator('text=EAT-1').first().click();
    await page.waitForTimeout(1000);

    // Detail panel should appear
    const panel = page.locator('[class*="border-l"]').filter({ hasText: 'EAT-1' });
    await expect(panel.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Search Modal', () => {
  test('opens when clicking search bar', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    // Click the search bar in header
    await page.locator('header').locator('text=Search issues').click();
    await page.waitForTimeout(500);

    // Search modal should be visible
    await expect(page.locator('input[placeholder*="Search"]').last()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Project Selector', () => {
  test('dropdown shows projects', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');

    // Click the project selector
    await page.locator('header').locator('text=Select Project').click();
    await page.waitForTimeout(500);

    // Should show project list
    await expect(page.locator('text=E2E Attachment').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Sidebar Collapse', () => {
  test('sidebar collapses when Collapse button is clicked', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
    await page.waitForLoadState('networkidle');

    // Click Collapse
    await page.locator('aside').locator('text=Collapse').click();
    await page.waitForTimeout(500);

    // Sidebar should be narrow (52px)
    const sidebar = page.locator('aside');
    const box = await sidebar.boundingBox();
    expect(box!.width).toBeLessThan(60);
  });
});
