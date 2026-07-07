import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:6174';
const PROJECT_ID = '411e733c-c843-4510-b323-c37614a27ca6';

test.describe('Dashboard', () => {
  test('loads and shows projects from API', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    // Should show project cards
    const cards = page.locator('text=E2E Attachment');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test('shows statistics cards', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Active Projects')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Total Issues')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Navigation', () => {
  test('sidebar shows project nav items on project page', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Roadmap').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Backlog').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Board').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Reports').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Settings').first()).toBeVisible({ timeout: 10000 });
  });

  test('sidebar navigation works for all views', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
    await page.waitForLoadState('networkidle');

    // Click Backlog in sidebar
    await page.locator('aside button').filter({ hasText: 'Backlog' }).click();
    await page.waitForTimeout(1000);
    await expect(page.locator('main').locator('text=Backlog').first()).toBeVisible({ timeout: 5000 });

    // Click Reports in sidebar
    await page.locator('aside button').filter({ hasText: 'Reports' }).click();
    await page.waitForTimeout(1000);
    await expect(page.locator('main').locator('text=Reports').first()).toBeVisible({ timeout: 5000 });

    // Click Settings in sidebar
    await page.locator('aside button').filter({ hasText: 'Settings' }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByRole('heading', { name: 'Project Settings' })).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Board View', () => {
  test('shows kanban columns', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=To Do').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=In Progress').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=In Review').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Done').first()).toBeVisible({ timeout: 10000 });
  });

  test('shows issue cards on board', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=EAT-1').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Backlog View', () => {
  test('shows issues in backlog', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/backlog`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Backlog').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=EAT-1').first()).toBeVisible({ timeout: 10000 });
  });

  test('has create sprint button', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/backlog`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Create Sprint').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Reports View', () => {
  test('shows charts', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/reports`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Issues by Type').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Issues by Priority').first()).toBeVisible({ timeout: 10000 });
  });

  test('shows stat cards', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/reports`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Total Issues').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Completed').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Settings View', () => {
  test('shows project settings form', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/settings`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Project Settings' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=PROJECT NAME').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=PROJECT KEY').first()).toBeVisible({ timeout: 5000 });
  });

  test('has danger zone with delete button', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/settings`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Danger Zone').first()).toBeVisible({ timeout: 10000 });
    // Click the Danger Zone tab to reveal delete button
    await page.locator('text=Danger Zone').first().click();
    await expect(page.locator('text=Delete Project').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Create Project', () => {
  test('form renders with all fields', async ({ page }) => {
    await page.goto(`${BASE}/projects/new`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Create New Project')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=PROJECT NAME').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=PROJECT KEY').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Create Project').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Roadmap View', () => {
  test('shows roadmap page', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/roadmap`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Roadmap').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Sprints View', () => {
  test('shows sprints page', async ({ page }) => {
    await page.goto(`${BASE}/project/${PROJECT_ID}/sprints`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Active Sprints').first()).toBeVisible({ timeout: 10000 });
  });
});
