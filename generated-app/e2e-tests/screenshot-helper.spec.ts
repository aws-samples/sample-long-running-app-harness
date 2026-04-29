import { test, expect } from '@playwright/test';

test('screenshot board with issue detail panel open', async ({ page }) => {
  // Go to the board page for our test project
  await page.goto('http://localhost:6174/project/2f313916-96af-4d6c-bc25-9ded5401ac3a/board');
  await page.waitForLoadState('networkidle');

  // Wait for issue cards to appear (the "To Do" column should have our issue)
  await page.waitForTimeout(2000);

  // Take board screenshot
  await page.screenshot({ path: 'screenshots/issue-2/board-loaded.png' });

  // Click on the first issue card
  const card = page.locator('[data-testid="issue-card"]').first();
  if (await card.isVisible()) {
    await card.click();
    await page.waitForTimeout(1000);
  } else {
    // Try alternative selector
    const altCard = page.locator('text=Test file upload').first();
    if (await altCard.isVisible()) {
      await altCard.click();
      await page.waitForTimeout(1000);
    }
  }

  await page.screenshot({ path: 'screenshots/issue-2/issue-detail-with-attachments.png' });
});
