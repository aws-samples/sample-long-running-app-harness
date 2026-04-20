import { test, expect } from '@playwright/test';

test('create issue modal in dark mode', async ({ page }) => {
  await page.goto('http://localhost:6174/project/411e733c-c843-4510-b323-c37614a27ca6/board');
  await page.waitForLoadState('networkidle');

  // Enable dark mode
  const darkToggle = page.locator('button[title*="dark mode"], button[title*="light mode"]');
  await darkToggle.click();
  await page.waitForTimeout(300);

  // Open create issue modal
  await page.click('header button:has-text("Create")');
  await page.waitForTimeout(300);

  // Modal should be visible
  const modal = page.locator('text=Create Issue');
  await expect(modal).toBeVisible();

  // Take a screenshot
  await page.screenshot({ path: 'screenshots/issue-1/dark-create-issue.png' });

  // Check the form elements are visible
  await expect(page.locator('text=Summary').first()).toBeVisible();
  await expect(page.locator('text=Priority').first()).toBeVisible();
  await expect(page.locator('label:has-text("Type")').first()).toBeVisible();
});

test('issue detail panel in dark mode', async ({ page }) => {
  await page.goto('http://localhost:6174/project/411e733c-c843-4510-b323-c37614a27ca6/board');
  await page.waitForLoadState('networkidle');

  // Enable dark mode
  const darkToggle = page.locator('button[title*="dark mode"], button[title*="light mode"]');
  await darkToggle.click();
  await page.waitForTimeout(300);

  // Click an issue card
  const issueCard = page.locator('[class*="bg-card-bg"][class*="rounded-lg"]').first();
  await issueCard.click();
  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({ path: 'screenshots/issue-1/dark-issue-detail.png' });

  // Detail panel should show status buttons
  await expect(page.getByRole('button', { name: 'To Do' })).toBeVisible();
});
