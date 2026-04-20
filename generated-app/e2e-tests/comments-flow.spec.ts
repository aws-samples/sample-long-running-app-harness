import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:6174';
const PROJECT_ID = '411e733c-c843-4510-b323-c37614a27ca6';

test('can add a comment to an issue', async ({ page }) => {
  // Navigate to the board
  await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
  await page.waitForLoadState('networkidle');

  // Click on the first issue card to open detail panel
  await page.locator('text=EAT-1').first().click();
  await page.waitForTimeout(1000);

  // The detail panel should be visible - look for the issue key in the slide-in panel
  await expect(page.locator('text=EAT-1').last()).toBeVisible({ timeout: 5000 });

  // Scroll to the comments section - find the comment textarea
  const commentInput = page.locator('textarea[placeholder*="Add a comment"]');
  await expect(commentInput).toBeVisible({ timeout: 5000 });

  // Type a comment
  const commentText = `Test comment ${Date.now()}`;
  await commentInput.fill(commentText);

  // The Add Comment button should appear
  const addBtn = page.locator('button').filter({ hasText: 'Add Comment' });
  await expect(addBtn).toBeVisible({ timeout: 3000 });
  await addBtn.click();
  await page.waitForTimeout(2000);

  // The comment should appear
  await expect(page.locator(`text=${commentText}`).first()).toBeVisible({ timeout: 5000 });
});

test('issue detail panel shows status buttons', async ({ page }) => {
  await page.goto(`${BASE}/project/${PROJECT_ID}/board`);
  await page.waitForLoadState('networkidle');

  // Click on the first issue card
  await page.locator('text=EAT-1').first().click();
  await page.waitForTimeout(1000);

  // Should show status buttons
  await expect(page.locator('button').filter({ hasText: 'To Do' }).first()).toBeVisible({ timeout: 5000 });
  await expect(page.locator('button').filter({ hasText: 'In Progress' }).first()).toBeVisible({ timeout: 5000 });
  await expect(page.locator('button').filter({ hasText: 'Done' }).first()).toBeVisible({ timeout: 5000 });
});
