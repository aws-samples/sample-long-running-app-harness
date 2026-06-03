import { test, expect } from '@playwright/test';

test.describe('Right Sidebar Tabs', () => {
  test('right sidebar is visible with all tabs', async ({ page }) => {
    await page.goto('http://localhost:6174');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('[data-testid="right-sidebar"]');
    await expect(sidebar).toBeVisible();

    // Check all tab buttons exist
    await expect(page.locator('[data-testid="right-tab-activity"]')).toBeVisible();
    await expect(page.locator('[data-testid="right-tab-team"]')).toBeVisible();
    await expect(page.locator('[data-testid="right-tab-notes"]')).toBeVisible();
    await expect(page.locator('[data-testid="right-tab-calendar"]')).toBeVisible();
  });

  test('can switch between tabs', async ({ page }) => {
    await page.goto('http://localhost:6174');
    await page.waitForLoadState('networkidle');

    // Default should be Activity tab
    await expect(page.getByRole('heading', { name: 'Recent Activity' })).toBeVisible();

    // Click Team tab
    await page.click('[data-testid="right-tab-team"]');
    await expect(page.getByText('TEAM MEMBERS')).toBeVisible();

    // Click Notes tab
    await page.click('[data-testid="right-tab-notes"]');
    await expect(page.getByText('QUICK NOTES')).toBeVisible();
    await expect(page.locator('[data-testid="notes-input"]')).toBeVisible();

    // Click Calendar tab
    await page.click('[data-testid="right-tab-calendar"]');
    await expect(page.getByRole('heading', { name: 'Upcoming Deadlines' })).toBeVisible();
  });

  test('notes tab allows adding notes', async ({ page }) => {
    await page.goto('http://localhost:6174');
    await page.waitForLoadState('networkidle');

    // Switch to Notes tab
    await page.click('[data-testid="right-tab-notes"]');

    // Type a note
    const input = page.locator('[data-testid="notes-input"]');
    await input.fill('My test note');
    await input.press('Enter');

    // Verify note appears
    await expect(page.getByText('My test note')).toBeVisible();
  });

  test('right sidebar can collapse and expand', async ({ page }) => {
    await page.goto('http://localhost:6174');
    await page.waitForLoadState('networkidle');

    // Verify sidebar is open
    const sidebar = page.locator('[data-testid="right-sidebar"]');
    await expect(sidebar).toBeVisible();

    // Click collapse button
    await page.click('[data-testid="right-sidebar-collapse"]');

    // Verify collapsed state
    const collapsedSidebar = page.locator('[data-testid="right-sidebar-collapsed"]');
    await expect(collapsedSidebar).toBeVisible();

    // Click a tab icon to expand
    await page.click('[data-testid="right-sidebar-collapsed"] [title="Team"]');

    // Verify expanded with Team tab
    await expect(page.locator('[data-testid="right-sidebar"]')).toBeVisible();
    await expect(page.getByText('TEAM MEMBERS')).toBeVisible();
  });
});
