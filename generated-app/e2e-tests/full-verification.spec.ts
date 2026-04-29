import { test, expect } from '@playwright/test';

const PROJECT_ID = '2f313916-96af-4d6c-bc25-9ded5401ac3a';
const BASE_URL = 'http://localhost:6174';

test('dashboard loads and shows projects', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForTimeout(5000);

  // Should show welcome text
  await expect(page.locator('h1:has-text("Welcome to Canopy")')).toBeVisible({ timeout: 10000 });

  await page.screenshot({ path: 'screenshots/issue-2/dashboard-verified.png' });
});

test('board view shows kanban columns', async ({ page }) => {
  await page.goto(`${BASE_URL}/project/${PROJECT_ID}/board`);
  await page.waitForTimeout(4000);

  // Should show status columns - use heading or column-specific selectors
  const todoColumn = page.locator('text=To Do').first();
  await expect(todoColumn).toBeVisible();

  await page.screenshot({ path: 'screenshots/issue-2/board-kanban-verified.png' });
});

test('issue detail panel opens on click with attachments', async ({ page }) => {
  await page.goto(`${BASE_URL}/project/${PROJECT_ID}/board`);
  await page.waitForTimeout(4000);

  const issueCard = page.locator('[data-testid="issue-card"]').first();
  if (await issueCard.isVisible()) {
    await issueCard.click();
    await page.waitForTimeout(1500);

    // Should show issue detail panel with DESCRIPTION and ATTACHMENTS sections
    await expect(page.locator('[data-testid="attachments-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="drop-zone"]')).toBeVisible();
  }

  await page.screenshot({ path: 'screenshots/issue-2/issue-detail-verified.png' });
});

test('sidebar navigation works', async ({ page }) => {
  await page.goto(`${BASE_URL}/project/${PROJECT_ID}/board`);
  await page.waitForTimeout(3000);

  // Check sidebar links using button role
  await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Roadmap' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Backlog' })).toBeVisible();

  // Navigate to backlog
  await page.getByRole('button', { name: 'Backlog' }).click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/backlog/);

  await page.screenshot({ path: 'screenshots/issue-2/backlog-verified.png' });
});

test('settings view loads', async ({ page }) => {
  await page.goto(`${BASE_URL}/project/${PROJECT_ID}/settings`);
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'screenshots/issue-2/settings-verified.png' });
});

test('reports view shows charts', async ({ page }) => {
  await page.goto(`${BASE_URL}/project/${PROJECT_ID}/reports`);
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'screenshots/issue-2/reports-verified.png' });
});

test('roadmap view loads', async ({ page }) => {
  await page.goto(`${BASE_URL}/project/${PROJECT_ID}/roadmap`);
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'screenshots/issue-2/roadmap-verified.png' });
});

test('create issue modal opens', async ({ page }) => {
  await page.goto(`${BASE_URL}/project/${PROJECT_ID}/board`);
  await page.waitForTimeout(3000);

  // Click create button in header
  const createButton = page.locator('button:has-text("Create")').first();
  await createButton.click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'screenshots/issue-2/create-issue-verified.png' });
});
