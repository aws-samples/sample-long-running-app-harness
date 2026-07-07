import { test, expect } from '@playwright/test';

const PROJECT_ID = '411e733c-c843-4510-b323-c37614a27ca6';
const BASE = 'http://localhost:6174';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE);
  await page.evaluate((pid) => {
    localStorage.setItem('canopy_theme', 'dark');
    localStorage.setItem('canopy_currentProject', pid);
  }, PROJECT_ID);
});

test('dark mode dashboard', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  const html = page.locator('html');
  await expect(html).toHaveClass(/dark/);
  await page.screenshot({ path: 'screenshots/issue-87/dark-dashboard-e2e.png' });
});

test('dark mode board', async ({ page }) => {
  await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/issue-87/dark-board-e2e.png' });
});

test('dark mode backlog', async ({ page }) => {
  await page.goto(`${BASE}/project/${PROJECT_ID}/backlog`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/issue-87/dark-backlog-e2e.png' });
});

test('dark mode reports', async ({ page }) => {
  await page.goto(`${BASE}/project/${PROJECT_ID}/reports`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/issue-87/dark-reports-e2e.png' });
});

test('dark mode settings', async ({ page }) => {
  await page.goto(`${BASE}/project/${PROJECT_ID}/settings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/issue-87/dark-settings-e2e.png' });
});

test('dark mode create project', async ({ page }) => {
  await page.goto(`${BASE}/projects/new`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/issue-87/dark-create-project-e2e.png' });
});
